"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';
import { Editor } from '../../../components/Editor';
import { KanbanBoard } from '../../../components/KanbanBoard';
import { ProgressBar } from '../../../components/ProgressBar';
import { ExportMenu } from '../../../components/ExportMenu';
import { PanelLeftClose, PanelRightClose, Bell, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';
import { ProjectSettingsModal } from '../../../components/ProjectSettingsModal';
import { NotificationBell } from '../../../components/NotificationBell';

export default function EditorPage() {
  const params = useParams();
  const { data: session } = useSession();
  const projectId = params.projectId as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { chapters, activeChapterId, activeTab, refreshData, project } = useAppContext();

  const activeChapter = chapters.find(c => c._id === activeChapterId);

  useEffect(() => {
    if (projectId) refreshData(projectId);
  }, [projectId]);
  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw' }}>

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
            <NotificationBell />

            {/* Project Settings */}
            {project && (
              <button
                className="btn-icon"
                onClick={() => setShowSettings(true)}
                title="Project Settings"
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
  );
}
