"use client";

import { BookOpen, Users, LayoutTemplate, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAppContext, Character } from '@/context/AppContext';
import { CharacterProfileModal } from './CharacterProfileModal';

export function Sidebar({ isOpen, projectId }: { isOpen: boolean; projectId: string }) {
  const { 
    chapters, setChapters, activeChapterId, setActiveChapterId,

    characters, setCharacters,
    activeTab, setActiveTab
  } = useAppContext();

  // Temporary local state for adding new items (we'll connect to DB later)
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState('');
  
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);


  
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newChapterTitle, content: '<p></p>', order: chapters.length, projectId })
      });
      if (res.ok) {
        const newChap = await res.json();
        setChapters(prev => [...prev, newChap]);
        setActiveChapterId(newChap._id);
        setIsAddingChapter(false);
        setNewChapterTitle('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenameChapter = async (id: string) => {
    if (!editChapterTitle.trim()) {
      setEditingChapterId(null);
      return;
    }
    
    setChapters(chapters.map(c => c._id === id ? { ...c, title: editChapterTitle } : c));
    setEditingChapterId(null);
    
    await fetch(`/api/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editChapterTitle })
    });
  };

  const handleDeleteChapter = (id: string) => {
    setChapterToDelete(id);
  };

  const confirmDelete = async () => {
    if (!chapterToDelete) return;
    const id = chapterToDelete;
    
    setChapters(chapters.filter(c => c._id !== id));
    if (activeChapterId === id) {
      setActiveChapterId(null);
    }
    setChapterToDelete(null);
    
    await fetch(`/api/chapters/${id}`, {
      method: 'DELETE'
    });
  };


  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) return;
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCharacterName, role: '', traits: '', projectId })
    });
    if (res.ok) {
      setCharacters([await res.json(), ...characters]);
      setIsAddingCharacter(false);
      setNewCharacterName('');
    }
  };

  return (
    <div style={{
      width: '300px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 5,
      opacity: isOpen ? 1 : 0,
    }}>
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 16px 16px 60px',
        gap: '12px'
      }}>
        <TabButton active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')} icon={<BookOpen size={16} />} label="Drafts" />
        <TabButton active={activeTab === 'storyboard'} onClick={() => setActiveTab('storyboard')} icon={<LayoutTemplate size={16} />} label="Storyboard" />
        <TabButton active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} icon={<Users size={16} />} label="Characters" />
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {activeTab === 'drafts' && (
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Chapters</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chapters.map(chap => (
                <li 
                  key={chap._id}
                  onClick={() => setActiveChapterId(chap._id)}
                  style={{ 
                    padding: '8px 12px', 
                    background: activeChapterId === chap._id ? 'var(--accent-color)' : 'transparent', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    color: activeChapterId === chap._id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  className="chapter-item"
                >
                  {editingChapterId === chap._id ? (
                    <input 
                      autoFocus
                      value={editChapterTitle}
                      onChange={e => setEditChapterTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameChapter(chap._id)}
                      onBlur={() => handleRenameChapter(chap._id)}
                      className="minimal-input"
                      style={{ flex: 1, padding: '2px 4px', fontSize: '14px' }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chap.title}</span>
                  )}
                  
                  {activeChapterId === chap._id && editingChapterId !== chap._id && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingChapterId(chap._id); setEditChapterTitle(chap.title); }} 
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}
                        title="Rename"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chap._id); }} 
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
              
              {isAddingChapter ? (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input 
                    autoFocus
                    value={newChapterTitle}
                    onChange={e => setNewChapterTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddChapter()}
                    placeholder="Chapter Title..."
                    className="minimal-input"
                  />
                  <button onClick={handleAddChapter} className="btn-icon"><Plus size={14} /></button>
                </div>
              ) : (
                <li onClick={() => setIsAddingChapter(true)} style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.7 }}>
                  + New Chapter
                </li>
              )}
            </ul>
          </div>
        )}
        
        {activeTab === 'storyboard' && (
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Plot Points</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '24px' }}>
              The Storyboard Kanban is currently active in the main window.
            </p>
          </div>
        )}

        {activeTab === 'characters' && (
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Cast</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {characters.map(char => (
                <div 
                  key={char._id} 
                  onClick={() => setSelectedCharacter(char)}
                  style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <h4 style={{ margin: 0, fontSize: '14px' }}>{char.name}</h4>
                  {char.role && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{char.role}</div>}
                </div>
              ))}
            </div>

            {isAddingCharacter ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input 
                  autoFocus
                  value={newCharacterName}
                  onChange={e => setNewCharacterName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCharacter()}
                  placeholder="Character name..."
                  className="minimal-input"
                />
                <button onClick={handleAddCharacter} className="btn-icon"><Plus size={14} /></button>
              </div>
            ) : (
              <div onClick={() => setIsAddingCharacter(true)} style={{ marginTop: '12px', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.7, fontSize: '14px' }}>
                + Add Character
              </div>
            )}
          </div>
        )}
      </div>

      {/* Themed Confirmation Modal */}
      {chapterToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            maxWidth: '320px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Delete Chapter?</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              Are you sure you want to delete this chapter? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setChapterToDelete(null)}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border-color)', 
                  background: 'transparent', 
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: '#ef4444', 
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Profile Modal */}
      {selectedCharacter && (
        <CharacterProfileModal 
          character={selectedCharacter} 
          onClose={() => setSelectedCharacter(null)} 
        />
      )}

    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      style={{
        background: 'transparent',
        border: 'none',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        backgroundColor: active ? 'var(--accent-color)' : 'transparent',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icon}
    </button>
  );
}
