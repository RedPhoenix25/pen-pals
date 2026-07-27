"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface Chapter {
  _id: string;
  title: string;
  content: string;
  order: number;
  projectId: string;
}

export interface StoryboardEvent {
  _id: string;
  title: string;
  description: string;
  order: number;
  act: string;
  status: string;
  projectId: string;
}

export interface CharacterRelation {
  characterId: string;
  relationshipType: string;
}

export interface Character {
  _id: string;
  name: string;
  role: string;
  traits: string;
  age: string;
  projectId: string;
  relations: CharacterRelation[];
}

export interface ProjectSettings {
  _id: string;
  title: string;
  description: string;
  ownerId: string;
  collaborators: { userId: string; role: string }[];
  wordCountTarget: number;
  acts: string[];
  coverColor: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AppContextType {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  activeChapterId: string | null;
  setActiveChapterId: (id: string | null) => void;
  storyboardEvents: StoryboardEvent[];
  setStoryboardEvents: React.Dispatch<React.SetStateAction<StoryboardEvent[]>>;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  project: ProjectSettings | null;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings | null>>;
  currentWordCount: number;
  setCurrentWordCount: React.Dispatch<React.SetStateAction<number>>;
  activeTab: 'drafts' | 'storyboard' | 'characters';
  setActiveTab: React.Dispatch<React.SetStateAction<'drafts' | 'storyboard' | 'characters'>>;
  currentUser: CurrentUser | null;
  refreshData: (projectId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [storyboardEvents, setStoryboardEvents] = useState<StoryboardEvent[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [project, setProject] = useState<ProjectSettings | null>(null);
  const [currentWordCount, setCurrentWordCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'drafts' | 'storyboard' | 'characters'>('drafts');

  const currentUser: CurrentUser | null = session?.user?.id
    ? {
        id: session.user.id as string,
        name: session.user.name || 'Anonymous',
        email: session.user.email || '',
        image: session.user.image || undefined,
      }
    : null;

  const refreshData = useCallback(async (projectId: string) => {
    try {
      const [chapsRes, eventsRes, charsRes, projRes] = await Promise.all([
        fetch(`/api/chapters?projectId=${projectId}`),
        fetch(`/api/storyboard?projectId=${projectId}`),
        fetch(`/api/characters?projectId=${projectId}`),
        fetch(`/api/projects/${projectId}`)
      ]);

      if (chapsRes.ok) {
        const chaps = await chapsRes.json();
        setChapters(chaps);
        if (chaps.length > 0) {
          setActiveChapterId(prev => prev || chaps[0]._id);
        }
      }
      if (eventsRes.ok) setStoryboardEvents(await eventsRes.json());
      if (charsRes.ok) setCharacters(await charsRes.json());
      if (projRes.ok) {
        setProject(await projRes.json());
      }
    } catch (e) {
      console.error("Failed to fetch app data:", e);
    }
  }, []);

  // Recalculate word count whenever chapters change
  useEffect(() => {
    let totalWords = 0;
    chapters.forEach(chap => {
      const text = chap.content.replace(/<[^>]*>?/gm, ' ');
      const words = text.trim().split(/\s+/);
      if (words.length > 0 && words[0] !== '') {
        totalWords += words.length;
      }
    });
    setCurrentWordCount(totalWords);
  }, [chapters]);

  return (
    <AppContext.Provider
      value={{
        chapters,
        setChapters,
        activeChapterId,
        setActiveChapterId,
        storyboardEvents,
        setStoryboardEvents,
        characters,
        setCharacters,
        project,
        setProject,
        currentWordCount,
        setCurrentWordCount,
        activeTab,
        setActiveTab,
        currentUser,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
