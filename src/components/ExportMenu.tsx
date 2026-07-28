import { useState, useRef, useEffect } from 'react';
import { Download, FileText, File } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

export function ExportMenu() {
  const { chapters } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setExportError(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getFullText = () => {
    let text = '';
    // Sort chapters by order just in case
    const sorted = [...chapters].sort((a, b) => a.order - b.order);
    sorted.forEach(chap => {
      text += `\n\n${chap.title}\n\n`;
      // Very crude HTML to text conversion for export
      const rawText = chap.content.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<[^>]+>/g, '');
      text += rawText;
    });
    return text.trim();
  };

  const exportDocx = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const sorted = [...chapters].sort((a, b) => a.order - b.order);
      
      const children: Paragraph[] = [];
      sorted.forEach(chap => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: chap.title, bold: true, size: 32 })],
            spacing: { after: 400, before: 400 }
          })
        );
        
        // Split by naive paragraphs
        const paragraphs = chap.content.split('</p>');
        paragraphs.forEach(p => {
          const raw = p.replace(/<[^>]+>/g, '').trim();
          if (raw) {
            children.push(
              new Paragraph({
                children: [new TextRun(raw)],
                spacing: { after: 200 }
              })
            );
          }
        });
      });

      const doc = new Document({
        sections: [{ properties: {}, children }]
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Manuscript.docx';
      a.click();
      window.URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      setExportError('Failed to export DOCX.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPdf = () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const doc = new jsPDF();
      const text = getFullText();
      
      // Split text to fit page width
      const lines = doc.splitTextToSize(text, 180);
      let cursorY = 20;
      
      lines.forEach((line: string) => {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(line, 15, cursorY);
        cursorY += 7;
      });
      
      doc.save('Manuscript.pdf');
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      setExportError('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button 
        className="btn-icon" 
        onClick={() => { setIsOpen(!isOpen); setExportError(null); }}
        title="Export Manuscript"
        style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <Download size={16} /> Export
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 50,
          width: '180px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {exportError && (
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '11px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
              {exportError}
            </div>
          )}
          <button 
            disabled={isExporting}
            onClick={exportDocx}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', opacity: isExporting ? 0.5 : 1 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileText size={16} /> .docx (Word)
          </button>
          
          <button 
            disabled={isExporting}
            onClick={exportPdf}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', opacity: isExporting ? 0.5 : 1 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <File size={16} /> .pdf
          </button>
        </div>
      )}
    </div>
  );
}
