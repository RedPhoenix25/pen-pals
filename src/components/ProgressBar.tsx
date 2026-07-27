import { useAppContext } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import { Edit3, CheckCircle2 } from 'lucide-react';

export function ProgressBar() {
  const { currentWordCount, project, setProject } = useAppContext();
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  // Update input when project loads
  useEffect(() => {
    if (project) {
      setTargetInput(project.wordCountTarget.toString());
    }
  }, [project]);

  if (!project) return null;

  const target = project.wordCountTarget;
  const progressPercentage = Math.min(100, Math.round((currentWordCount / target) * 100)) || 0;
  const isComplete = progressPercentage >= 100;

  const handleSaveTarget = async () => {
    const num = parseInt(targetInput, 10);
    if (!isNaN(num) && num > 0) {
      setProject({ ...project, wordCountTarget: num });
      setIsEditingTarget(false);
      
      await fetch(`/api/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordCountTarget: num })
      });
    } else {
      // Revert if invalid
      setTargetInput(target.toString());
      setIsEditingTarget(false);
    }
  };

  return (
    <div style={{
      width: '180px', // slightly narrower for top bar
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '8px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      opacity: 0.8,
      transition: 'opacity 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
    onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: 'var(--text-secondary)' }}>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Daily Writing Goal</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-primary)' }}>{currentWordCount.toLocaleString()}</span> / 
          
          {isEditingTarget ? (
            <input 
              autoFocus
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveTarget()}
              onBlur={handleSaveTarget}
              style={{ width: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--text-secondary)', color: 'var(--text-primary)', padding: '0', fontSize: '10px', textAlign: 'right', outline: 'none' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setIsEditingTarget(true)} title="Edit Target">
              <span>{target.toLocaleString()}</span>
              <Edit3 size={10} style={{ opacity: 0.6 }} />
            </div>
          )}
        </div>
      </div>

      {/* Thin Bar */}
      <div style={{ width: '100%', height: '2px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressPercentage}%`,
          background: isComplete ? '#4ade80' : 'var(--text-secondary)',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
    </div>
  );
}
