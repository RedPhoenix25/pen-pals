"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X, GripVertical, Edit2, GripHorizontal } from 'lucide-react';
import { useAppContext, StoryboardEvent } from '@/context/AppContext';
import { CustomSelect } from './CustomSelect';

const STATUSES = ['Idea', 'Planning', 'Executed'] as const;

type Status = typeof STATUSES[number];

const STATUS_COLORS: Record<Status, string> = {
  Idea: '#78716c',
  Planning: '#a8a29e',
  Executed: '#57534e',
};

/* ── Individual Card ─────────────────────────────────────── */
function KanbanCard({
  event,
  onEditClick,
}: {
  event: StoryboardEvent;
  onEditClick: (event: StoryboardEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: event._id,
      data: { type: 'Card', event },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      onClick={() => onEditClick(event)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'grab', color: 'var(--text-secondary)', paddingTop: 2, flexShrink: 0 }}
        >
          <GripVertical size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500, wordBreak: 'break-word' }}>
            {event.title}
          </p>
          {event.description && (
            <p style={{ 
              margin: '6px 0 0', 
              fontSize: 11, 
              color: 'var(--text-secondary)', 
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {event.description}
            </p>
          )}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              display: 'inline-block',
              border: `1px solid ${STATUS_COLORS[event.status as Status] ?? 'var(--border-color)'}`,
              color: STATUS_COLORS[event.status as Status] ?? 'var(--text-secondary)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 9,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              {event.status}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick(event);
          }}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            padding: 2, 
            flexShrink: 0,
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
        >
          <Edit2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Act Column ──────────────────────────────────────────── */
function ActColumn({
  act,
  events,
  onEditClick,
  onAdd,
  onDeleteAct,
  onEditActName
}: {
  act: string;
  events: StoryboardEvent[];
  onEditClick: (event: StoryboardEvent) => void;
  onAdd: (act: string, title: string, status: string) => void;
  onDeleteAct: (act: string) => void;
  onEditActName: (oldName: string, newName: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string>('Idea');

  const [editingAct, setEditingAct] = useState(false);
  const [editedActName, setEditedActName] = useState(act);
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: act,
      data: { type: 'Column', act },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 10,
    padding: 16,
    minWidth: 280,
    width: 300,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  };

  const handleAdd = () => {
    if (!title.trim()) { setAdding(false); return; }
    onAdd(act, title.trim(), status);
    setTitle('');
    setStatus('Idea');
    setAdding(false);
  };

  const handleSaveAct = () => {
    onEditActName(act, editedActName);
    setEditingAct(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', color: 'var(--text-secondary)', display: 'flex' }}
          >
            <GripHorizontal size={14} />
          </div>
          {editingAct ? (
            <input
              autoFocus
              value={editedActName}
              onChange={e => setEditedActName(e.target.value)}
              onBlur={handleSaveAct}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveAct(); if (e.key === 'Escape') { setEditingAct(false); setEditedActName(act); } }}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', border: '1px solid var(--accent-color)', outline: 'none', borderRadius: 4, padding: '2px 4px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '130px' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                onDoubleClick={() => setEditingAct(true)}
                title="Double click to edit"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'text' }}
              >
                {act}
              </span>
              <button
                onClick={() => setEditingAct(true)}
                title="Edit name"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.5, transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--accent-color)', padding: '2px 6px', borderRadius: 10 }}>
            {events.length}
          </span>
        </div>
        <button
          onClick={() => onDeleteAct(act)}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.6, transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          <X size={14} />
        </button>
      </div>

      <SortableContext items={events.map(e => e._id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100, overflowY: 'auto' }}>
          {events.map(event => (
            <KanbanCard
              key={event._id}
              event={event}
              onEditClick={onEditClick}
            />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Plot point title..."
            className="minimal-input"
            style={{ fontSize: 12 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Status</label>
            <CustomSelect
              value={status}
              onChange={(val) => setStatus(val as Status)}
              options={STATUSES.map(s => ({ value: s, label: s }))}
              style={{ fontSize: 11 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={handleAdd} style={{ background: 'var(--accent-color)', border: 'none', color: 'var(--text-primary)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
              Add
            </button>
            <button onClick={() => setAdding(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: 12, padding: '6px 0', marginTop: 4,
            opacity: 0.8, transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
        >
          <Plus size={13} />
          Add plot point
        </button>
      )}
    </div>
  );
}

/* ── Edit Event Modal ────────────────────────────────────── */
interface EditEventModalProps {
  event: StoryboardEvent;
  acts: string[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<StoryboardEvent>) => void;
  onDelete: (id: string) => void;
}

function EditEventModal({ event, acts, onClose, onSave, onDelete }: EditEventModalProps) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [act, setAct] = useState(event.act);
  const [status, setStatus] = useState(event.status);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(event._id, { title: title.trim(), description: description.trim(), act, status });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '450px' }}>
        <h3 style={{ margin: '0 0 18px 0', fontSize: 15, fontFamily: 'Lora, serif', fontWeight: 500, color: 'var(--text-primary)' }}>
          Edit Plot Point
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="minimal-input"
              style={{ fontSize: 13, padding: '6px 0' }}
              placeholder="Plot point title..."
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Describe this scene or plot point..."
              style={{ 
                background: 'transparent', 
                border: '1px solid var(--border-color)', 
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 12,
                padding: 10,
                height: 120,
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Act</label>
              <CustomSelect
                value={act}
                onChange={setAct}
                options={acts.map(a => ({ value: a, label: a }))}
                style={{ fontSize: 12 }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Status</label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val as Status)}
                options={STATUSES.map(s => ({ value: s, label: s }))}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button 
            onClick={() => onDelete(event._id)}
            style={{ 
              background: 'transparent', 
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              color: '#ef4444',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'}
          >
            Delete
          </button>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={onClose}
              style={{ 
                background: 'transparent', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-secondary)',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              style={{ 
                background: 'var(--text-primary)', 
                border: 'none', 
                color: 'var(--bg-primary)',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Board ──────────────────────────────────────────── */
export function KanbanBoard() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { storyboardEvents, setStoryboardEvents, project, setProject } = useAppContext();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'Column' | 'Card' | null>(null);
  const [editingEvent, setEditingEvent] = useState<StoryboardEvent | null>(null);
  const [deleteConfirmAct, setDeleteConfirmAct] = useState<string | null>(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const acts = project?.acts && project.acts.length > 0 ? project.acts : ['Prologue', 'Act 1', 'Epilogue'];

  const handleEditActName = async (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim() || acts.includes(newName.trim()) || !project) return;
    
    const finalNewName = newName.trim();
    
    // 1. Update Project acts
    const newActs = acts.map(a => a === oldName ? finalNewName : a);
    setProject({ ...project, acts: newActs });

    // 2. Update events
    const updatedEvents = storyboardEvents.map(e => e.act === oldName ? { ...e, act: finalNewName } : e);
    setStoryboardEvents(updatedEvents);

    // 3. API calls
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acts: newActs }),
    });

    const eventsToUpdate = storyboardEvents.filter(e => e.act === oldName);
    await Promise.all(
      eventsToUpdate.map(evt => 
        fetch(`/api/storyboard/${evt._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ act: finalNewName }),
        })
      )
    );
  };

  const handleAddCol = async () => {
    if (!newColName.trim() || !project) return;
    const name = newColName.trim();
    if (acts.includes(name)) {
      setAddingCol(false);
      setNewColName('');
      return; // prevent duplicate column names
    }

    const newActs = [...acts, name];
    setProject({ ...project, acts: newActs });
    setAddingCol(false);
    setNewColName('');

    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acts: newActs }),
    });
  };

  const executeDeleteAct = async () => {
    if (!deleteConfirmAct || !project) return;
    const targetAct = deleteConfirmAct;
    
    // 1. Remove from acts array
    const newActs = acts.filter(a => a !== targetAct);
    setProject({ ...project, acts: newActs });
    setDeleteConfirmAct(null);

    // 2. Delete all events in this act
    const eventsToDelete = storyboardEvents.filter(e => e.act === targetAct);
    const updatedEvents = storyboardEvents.filter(e => e.act !== targetAct);
    setStoryboardEvents(updatedEvents);

    // Backend calls
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acts: newActs }),
    });

    await Promise.all(eventsToDelete.map(evt => 
      fetch(`/api/storyboard/${evt._id}`, { method: 'DELETE' })
    ));
  };

  const handleAdd = async (act: string, title: string, status: string) => {
    const columnEvents = storyboardEvents.filter(e => e.act === act);
    const order = columnEvents.length;

    const res = await fetch('/api/storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: '', act, status, order, projectId }),
    });
    if (res.ok) {
      const newEvent = await res.json();
      setStoryboardEvents(prev => [...prev, newEvent]);
    }
  };

  const handleSaveEdit = async (id: string, updates: Partial<StoryboardEvent>) => {
    const activeEvent = storyboardEvents.find(e => e._id === id);
    if (!activeEvent) return;

    let updatedEvents = [...storyboardEvents];
    
    if (updates.act && updates.act !== activeEvent.act) {
      const sourceEvents = storyboardEvents.filter(e => e.act === activeEvent.act && e._id !== id).sort((a, b) => a.order - b.order);
      const targetEvents = storyboardEvents.filter(e => e.act === updates.act).sort((a, b) => a.order - b.order);
      
      sourceEvents.forEach((evt, idx) => { evt.order = idx; });
      const newOrder = targetEvents.length;
      
      updatedEvents = storyboardEvents.map(e => {
        if (e._id === id) return { ...e, ...updates, order: newOrder } as StoryboardEvent;
        const sourceMatch = sourceEvents.find(s => s._id === e._id);
        if (sourceMatch) return { ...e, order: sourceMatch.order };
        return e;
      });

      setStoryboardEvents(updatedEvents);

      await fetch(`/api/storyboard/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, order: newOrder }),
      });

      await Promise.all(
        sourceEvents.map(evt => 
          fetch(`/api/storyboard/${evt._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: evt.order }),
          })
        )
      );
    } else {
      updatedEvents = storyboardEvents.map(e => e._id === id ? { ...e, ...updates } as StoryboardEvent : e);
      setStoryboardEvents(updatedEvents);

      await fetch(`/api/storyboard/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }

    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    const activeEvent = storyboardEvents.find(e => e._id === id);
    if (!activeEvent) return;

    const columnEvents = storyboardEvents.filter(e => e.act === activeEvent.act && e._id !== id).sort((a, b) => a.order - b.order);
    columnEvents.forEach((evt, idx) => { evt.order = idx; });

    const updatedEvents = storyboardEvents.filter(e => e._id !== id).map(e => {
      const match = columnEvents.find(c => c._id === e._id);
      return match ? { ...e, order: match.order } : e;
    });

    setStoryboardEvents(updatedEvents);
    setEditingEvent(null);

    await Promise.all([
      fetch(`/api/storyboard/${id}`, { method: 'DELETE' }),
      ...columnEvents.map(evt => 
        fetch(`/api/storyboard/${evt._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: evt.order }),
        })
      )
    ]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    setActiveId(active.id as string);
    setActiveType(type as 'Column' | 'Card');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);
    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    const type = active.data.current?.type;

    if (type === 'Column') {
      if (activeIdStr !== overIdStr && project) {
        const oldIndex = acts.indexOf(activeIdStr);
        const newIndex = acts.indexOf(overIdStr);
        
        const newActs = [...acts];
        const [moved] = newActs.splice(oldIndex, 1);
        newActs.splice(newIndex, 0, moved);
        
        setProject({ ...project, acts: newActs });
        
        await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acts: newActs }),
        });
      }
      return;
    }

    // Card Reordering
    const activeEvent = storyboardEvents.find(e => e._id === activeIdStr);
    if (!activeEvent) return;

    let targetAct = activeEvent.act;
    const overEvent = storyboardEvents.find(e => e._id === overIdStr);
    
    if (overEvent) {
      targetAct = overEvent.act;
    } else if (acts.includes(overIdStr)) {
      targetAct = overIdStr;
    }

    const sourceEvents = storyboardEvents.filter(e => e.act === activeEvent.act).sort((a, b) => a.order - b.order);
    const targetEvents = storyboardEvents.filter(e => e.act === targetAct).sort((a, b) => a.order - b.order);

    const activeIndexInSource = sourceEvents.findIndex(e => e._id === activeIdStr);
    let updatedEvents = [...storyboardEvents];

    if (activeEvent.act === targetAct) {
      const overIndexInTarget = targetEvents.findIndex(e => e._id === overIdStr);
      if (activeIndexInSource !== overIndexInTarget && overIndexInTarget !== -1) {
        const newTargetEvents = [...targetEvents];
        const [movedItem] = newTargetEvents.splice(activeIndexInSource, 1);
        newTargetEvents.splice(overIndexInTarget, 0, movedItem);

        newTargetEvents.forEach((evt, idx) => { evt.order = idx; });

        updatedEvents = storyboardEvents.map(e => {
          const match = newTargetEvents.find(ne => ne._id === e._id);
          return match ? { ...e, order: match.order } : e;
        });

        setStoryboardEvents(updatedEvents);

        await Promise.all(
          newTargetEvents.map(evt =>
            fetch(`/api/storyboard/${evt._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: evt.order }),
            })
          )
        );
      }
    } else {
      let insertIndex = targetEvents.length;
      if (overEvent) {
        const overIndex = targetEvents.findIndex(e => e._id === overIdStr);
        insertIndex = overIndex === -1 ? targetEvents.length : overIndex;
      }

      const newSourceEvents = sourceEvents.filter(e => e._id !== activeIdStr);
      const newTargetEvents = [...targetEvents];
      const movedItem = { ...activeEvent, act: targetAct };
      newTargetEvents.splice(insertIndex, 0, movedItem);

      newSourceEvents.forEach((evt, idx) => { evt.order = idx; });
      newTargetEvents.forEach((evt, idx) => { evt.order = idx; });

      updatedEvents = storyboardEvents.map(e => {
        if (e._id === activeIdStr) return { ...e, act: targetAct, order: movedItem.order };
        const sourceMatch = newSourceEvents.find(ne => ne._id === e._id);
        if (sourceMatch) return { ...e, order: sourceMatch.order };
        const targetMatch = newTargetEvents.find(ne => ne._id === e._id);
        if (targetMatch) return { ...e, order: targetMatch.order };
        return e;
      });

      setStoryboardEvents(updatedEvents);

      await Promise.all([
        fetch(`/api/storyboard/${activeIdStr}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ act: targetAct, order: movedItem.order }),
        }),
        ...newSourceEvents.map(evt =>
          fetch(`/api/storyboard/${evt._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: evt.order }),
          })
        ),
        ...newTargetEvents.filter(evt => evt._id !== activeIdStr).map(evt =>
          fetch(`/api/storyboard/${evt._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: evt.order }),
          })
        )
      ]);
    }
  };

  const activeCardEvent = activeType === 'Card' && activeId ? storyboardEvents.find(e => e._id === activeId) : null;
  const activeColumnId = activeType === 'Column' && activeId ? activeId : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-scroll" style={{ padding: '24px', boxSizing: 'border-box', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <SortableContext items={acts} strategy={horizontalListSortingStrategy}>
            {acts.map(act => (
              <ActColumn
                key={act}
                act={act}
                events={storyboardEvents.filter(e => e.act === act).sort((a, b) => a.order - b.order)}
                onEditClick={setEditingEvent}
                onAdd={handleAdd}
                onDeleteAct={setDeleteConfirmAct}
                onEditActName={handleEditActName}
              />
            ))}
          </SortableContext>

          {/* Add Column Button */}
          <div style={{ flexShrink: 0, width: 300, minWidth: 280 }}>
            {addingCol ? (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <input
                  autoFocus
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCol(); if (e.key === 'Escape') setAddingCol(false); }}
                  placeholder="Plot card name..."
                  className="minimal-input"
                  style={{ fontSize: 13 }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button onClick={handleAddCol} style={{ background: 'var(--accent-color)', border: 'none', color: 'var(--text-primary)', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
                    Add
                  </button>
                  <button onClick={() => setAddingCol(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCol(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'transparent', border: '1px dashed var(--border-color)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontSize: 13, padding: '16px', borderRadius: 10, width: '100%',
                  opacity: 0.8, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Plus size={16} />
                Add Plot Card
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCardEvent ? (
            <div className="kanban-card" style={{ opacity: 0.9, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', transform: 'rotate(2deg)' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{activeCardEvent.title}</p>
            </div>
          ) : activeColumnId ? (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-color)',
              borderRadius: 10,
              padding: 16,
              width: 300,
              opacity: 0.9,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              transform: 'rotate(2deg)'
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                {activeColumnId}
              </span>
            </div>
          ) : null}
        </DragOverlay>

        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            acts={acts}
            onClose={() => setEditingEvent(null)}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
          />
        )}
      </DndContext>

      {/* Delete Confirmation Modal */}
      {deleteConfirmAct && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-primary)', fontWeight: 600 }}>Delete Plot Card?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirmAct}</strong>?<br/>
              <span style={{ color: '#ef4444' }}>All plot plans inside this card will be permanently deleted.</span>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteConfirmAct(null)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-secondary)',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteAct}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  color: '#ef4444',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}