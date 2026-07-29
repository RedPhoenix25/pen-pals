"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
};

const TOUR_STEPS: TutorialStep[] = [
  {
    id: "editor-collaborators",
    title: "Live Co-Authors",
    description: "See exactly who is online and writing alongside you in real-time.",
    position: "bottom",
  },
  {
    id: "sidebar-settings",
    title: "Invite Collaborators",
    description: "Click the gear icon to manage your project settings and invite new co-authors via email.",
    position: "bottom",
  },
  {
    id: "sidebar-notifications",
    title: "Stay Updated",
    description: "Accept invites to join other projects or see when a co-author mentions you here.",
    position: "bottom",
  },
  {
    id: "editor-content",
    title: "The Writing Canvas",
    description: "Your minimalist workspace. The editor gets out of your way so you can focus purely on the story.",
    position: "bottom",
  },
  {
    id: "sidebar-chapters",
    title: "Chapters & Structure",
    description: "Open the panel on the left to manage chapters, characters, and your storyboard. Use the icon in the top-left to open it.",
    position: "right",
  },
];

type TutorialContextType = {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Check on mount if we should auto-start
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("penpals_has_seen_tour");
    if (!hasSeenTour) {
      // Small delay to let the DOM paint fully before calculating positions
      setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 1000);
    }
  }, []);

  const startTour = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    localStorage.setItem("penpals_has_seen_tour", "true");
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      skipTour(); // End of tour
    }
  };

  const skipTour = () => {
    setIsActive(false);
    localStorage.setItem("penpals_has_seen_tour", "true");
  };

  const currentStep = isActive ? TOUR_STEPS[currentStepIndex] : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        startTour,
        nextStep,
        skipTour,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
