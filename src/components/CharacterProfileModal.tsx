import { useState } from 'react';
import { Character, useAppContext } from '@/context/AppContext';
import { X, Save, Trash2, Plus, Minus } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface Props {
  character: Character | null;
  onClose: () => void;
}

export function CharacterProfileModal({ character, onClose }: Props) {
  const { characters, setCharacters } = useAppContext();
  
  const [name, setName] = useState(character?.name || '');
  const [role, setRole] = useState(character?.role || '');
  const [traits, setTraits] = useState(character?.traits || '');
  const [age, setAge] = useState(character?.age || '');
  const [relations, setRelations] = useState(character?.relations || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!character) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const updatedChar = { ...character, name, role, traits, age, relations };
    
    // Optimistic update
    setCharacters(characters.map(c => c._id === character._id ? updatedChar : c));
    
    try {
      await fetch(`/api/characters/${character._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedChar)
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setCharacters(characters.filter(c => c._id !== character._id));
    await fetch(`/api/characters/${character._id}`, { method: 'DELETE' });
    setShowConfirmDelete(false);
    onClose();
  };

  const addRelation = () => {
    setRelations([...relations, { characterId: '', relationshipType: '' }]);
  };

  const updateRelation = (index: number, field: 'characterId' | 'relationshipType', value: string) => {
    const newRelations = [...relations];
    newRelations[index][field] = value;
    setRelations(newRelations);
  };

  const removeRelation = (index: number) => {
    const newRelations = [...relations];
    newRelations.splice(index, 1);
    setRelations(newRelations);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        width: '500px',
        maxHeight: '85vh',
        overflowY: 'auto',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>Character Profile</h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="minimal-input" style={{ fontSize: '16px', fontWeight: 500 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Age/Birthdate</label>
              <input value={age} onChange={e => setAge(e.target.value)} className="minimal-input" placeholder="e.g. 24" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Role in Story</label>
            <input value={role} onChange={e => setRole(e.target.value)} className="minimal-input" placeholder="e.g. Protagonist, Mentor" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Personality Traits</label>
            <textarea 
              value={traits} 
              onChange={e => setTraits(e.target.value)} 
              className="minimal-input" 
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="Ambitious, introverted, secretly loves cats..."
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Relationships</label>
              <button onClick={addRelation} className="btn-icon" style={{ padding: '4px' }} title="Add Relationship"><Plus size={14} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {relations.length === 0 && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No relationships added.</div>}
              {relations.map((rel, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CustomSelect
                    value={rel.characterId}
                    onChange={val => updateRelation(idx, 'characterId', val)}
                    options={[
                      { value: "", label: "Select Character..." },
                      ...characters.filter(c => c._id !== character._id).map(c => ({ value: c._id, label: c.name }))
                    ]}
                    style={{ flex: 1 }}
                  />
                  <input 
                    value={rel.relationshipType}
                    onChange={e => updateRelation(idx, 'relationshipType', e.target.value)}
                    placeholder="e.g. Brother, Enemy"
                    style={{ flex: 1, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px' }}
                  />
                  <button onClick={() => removeRelation(idx)} className="btn-icon" style={{ padding: '4px', color: '#ef4444' }}><Minus size={14} /></button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleDelete} className="btn-icon" style={{ color: '#ef4444', padding: '8px 12px' }} title="Delete Character">
            <Trash2 size={16} />
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={isSaving} style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>

      {/* Themed Confirmation Modal */}
      {showConfirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
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
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Delete Character?</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              Are you sure you want to delete this character? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
