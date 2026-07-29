"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';
import { Editor } from '../../../components/Editor';
import { KanbanBoard } from '../../../components/KanbanBoard';
import { ProgressBar } from '../../../components/ProgressBar';
import { ExportMenu } from '../../../components/ExportMenu';
import { PanelLeftClose, PanelRightClose, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';
import { ProjectSettingsModal } from '../../../components/ProjectSettingsModal';
import { NotificationBell } from '../../../components/NotificationBell';
import { TutorialProvider, useTutorial } from '../../../components/tutorial/TutorialContext';
import { TutorialOverlay } from '../../../components/tutorial/TutorialOverlay';
import { GraduationCap } from 'lucide-react';

// Floating replay button — always visible in the editor
function TourReplayButton() {
  const { isActive, startTour } = useTutorial();
  if (isActive) return null;
  return (
    <button
      onClick={startTour}
      title="Replay Tour"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(28, 24, 22, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(214, 158, 46, 0.3)',
        borderRadius: '20px',
        color: 'rgba(214, 158, 46, 0.85)',
        padding: '7px 14px 7px 10px',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        letterSpacing: '0.01em',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(214, 158, 46, 0.7)';
        e.currentTarget.style.color = 'rgba(214, 158, 46, 1)';
        e.currentTarget.style.background = 'rgba(40, 33, 22, 0.95)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(214, 158, 46, 0.3)';
        e.currentTarget.style.color = 'rgba(214, 158, 46, 0.85)';
        e.currentTarget.style.background = 'rgba(28, 24, 22, 0.85)';
      }}
    >
      <GraduationCap size={14} />
      Tour
    </button>
  );
}

export default function EditorPage() {
  const params = useParams();
  const { data: session } = useSession();
  const projectId = params.projectId as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { chapters, activeChapterId, activeTab, refreshData, project } = useAppContext();

  const activeChapter = chapters.find(c => c._id === activeChapterId);

  useEffect(() => {
    if (!projectId) return;
    refreshData(projectId);
    const interval = setInterval(() => {
      refreshData(projectId);
    }, 4000);
    return () => clearInterval(interval);
  }, [projectId, refreshData]);
  return (
    <TutorialProvider>
      <main style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <TutorialOverlay />
        <TourReplayButton />

        {/* Sidebar Area */}
        <Sidebar isOpen={isSidebarOpen} projectId={projectId} />

        {/* Main Writing Area */}
        <div 
          style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0 }}
          onClick={() => {
            if (isSidebarOpen) setIsSidebarOpen(false);
          }}
        >

          {/* Top minimal nav */}
          <div style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSidebarOpen(!isSidebarOpen);
                }}
                title="Toggle Planning Area"
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
              </button>
              {!isSidebarOpen && activeTab === 'drafts' && <ProgressBar />}
            </div>

            <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Notification Bell */}
              <div data-tutorial="sidebar-notifications">
                <NotificationBell />
              </div>

              {/* Project Settings */}
              {project && (
                <button
                  className="btn-icon"
                  onClick={() => setShowSettings(true)}
                  title="Project Settings"
                  data-tutorial="sidebar-settings"
                >
                  <Settings size={18} />
                </button>
              )}

              <ExportMenu />
            </div>
          </div>

          {/* Editor Area */}
          <div style={{
            flex: 1,
            minHeight: 0,
            maxWidth: activeTab === 'storyboard' ? '100%' : '800px',
            margin: '0 auto',
            width: '100%',
            padding: activeTab === 'storyboard' ? '60px 0 0 0' : '80px 40px',
            overflow: activeTab === 'storyboard' ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {activeTab === 'storyboard' ? (
              <KanbanBoard />
            ) : (
              <>
                <h1 style={{ fontWeight: 400, color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>
                  {activeChapter ? activeChapter.title : 'No chapter selected'}
                </h1>
                <Editor projectId={projectId} />
              </>
            )}
          </div>
        </div>

        {/* Project Settings Modal */}
        {showSettings && project && (
          <ProjectSettingsModal
            project={project}
            currentUserId={session?.user?.id as string}
            onClose={() => setShowSettings(false)}
            onUpdate={() => {
              refreshData(projectId);
              setShowSettings(false);
            }}
          />
        )}
      </main>
    </TutorialProvider>
  );
}
