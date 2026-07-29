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

      sorted.forEach((chap, idx) => {
        // Chapter Title
        children.push(
          new Paragraph({
            children: [new TextRun({ text: chap.title, bold: true, size: 40 })],
            spacing: { before: 800, after: 400 },
            alignment: 'center',
            pageBreakBefore: idx !== 0,
          })
        );

        // A decorative line or sub-spacing could go here, but for simplicity we'll just parse the content

        // Parse HTML to get formatting
        const div = document.createElement('div');
        div.innerHTML = chap.content;

        div.childNodes.forEach(node => {
          const el = node as HTMLElement;
          const tag = el.tagName?.toLowerCase();
          const text = (el.textContent || '').trim();

          if (!text && tag !== 'hr') return;

          if (tag === 'hr') {
            children.push(
              new Paragraph({
                text: '***',
                alignment: 'center',
                spacing: { before: 240, after: 240 },
              })
            );
            return;
          }

          if (tag === 'h2') {
            children.push(
              new Paragraph({
                children: [new TextRun({ text, bold: true, size: 32 })],
                spacing: { before: 400, after: 200 },
              })
            );
            return;
          }

          if (tag === 'h3') {
            children.push(
              new Paragraph({
                children: [new TextRun({ text, bold: true, italics: true, size: 28 })],
                spacing: { before: 300, after: 150 },
              })
            );
            return;
          }

          if (tag === 'blockquote') {
            children.push(
              new Paragraph({
                children: [new TextRun({ text, italics: true, size: 24 })],
                indent: { left: 720 }, // half an inch
                spacing: { before: 120, after: 120 },
              })
            );
            return;
          }

          // Regular paragraph (could contain inline formatting, but for docx export, we'll keep it simple for now)
          const isBold = !!el.querySelector('strong') || tag === 'strong';
          const isItalic = !!el.querySelector('em') || tag === 'em';

          children.push(
            new Paragraph({
              children: [new TextRun({ text, bold: isBold, italics: isItalic, size: 24 })], // 12pt
              spacing: { after: 240 },
              indent: { firstLine: 360 }, // quarter inch indent for paragraphs (book style)
            })
          );
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
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN_LEFT = 25;
      const MARGIN_RIGHT = 25;
      const MARGIN_TOP = 30;
      const MARGIN_BOTTOM = 25;
      const TEXT_WIDTH = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;

      let y = MARGIN_TOP;
      let isFirstPage = true;

      const addPage = () => {
        doc.addPage();
        y = MARGIN_TOP;
      };

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > PAGE_H - MARGIN_BOTTOM) {
          addPage();
        }
      };

      // Parse HTML content into structured segments
      const parseContent = (html: string): { type: 'p' | 'h2' | 'h3' | 'blockquote' | 'hr'; text: string; bold?: boolean; italic?: boolean }[] => {
        const segments: { type: 'p' | 'h2' | 'h3' | 'blockquote' | 'hr'; text: string; bold?: boolean; italic?: boolean }[] = [];
        const div = document.createElement('div');
        div.innerHTML = html;

        div.childNodes.forEach((node) => {
          const el = node as HTMLElement;
          const tag = el.tagName?.toLowerCase();
          const text = (el.textContent || '').trim();

          if (tag === 'hr') {
            segments.push({ type: 'hr', text: '' });
          } else if (tag === 'h2') {
            if (text) segments.push({ type: 'h2', text, bold: true });
          } else if (tag === 'h3') {
            if (text) segments.push({ type: 'h3', text, bold: true });
          } else if (tag === 'blockquote') {
            if (text) segments.push({ type: 'blockquote', text });
          } else if (text) {
            const isBold = !!el.querySelector('strong') || tag === 'strong';
            const isItalic = !!el.querySelector('em') || tag === 'em';
            segments.push({ type: 'p', text, bold: isBold, italic: isItalic });
          }
        });

        return segments;
      };

      const sorted = [...chapters].sort((a, b) => a.order - b.order);

      sorted.forEach((chap) => {
        // Chapter page break (every chapter starts fresh unless it's the first one)
        if (!isFirstPage) {
          addPage();
        }
        isFirstPage = false;

        // Chapter title — large, centered, with plenty of space
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(chap.title, TEXT_WIDTH);
        checkPageBreak(titleLines.length * 9 + 20);
        // Vertical center the title on the top quarter of the page
        y += 10;
        titleLines.forEach((line: string) => {
          doc.text(line, PAGE_W / 2, y, { align: 'center' });
          y += 9;
        });

        // Decorative separator under title
        y += 6;
        doc.setDrawColor(120, 100, 80);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_LEFT + TEXT_WIDTH / 2 - 20, y, MARGIN_LEFT + TEXT_WIDTH / 2 + 20, y);
        y += 14;

        // Body content
        const segments = parseContent(chap.content);

        segments.forEach((seg) => {
          if (seg.type === 'hr') {
            checkPageBreak(10);
            y += 4;
            doc.setDrawColor(120, 100, 80);
            doc.setLineWidth(0.2);
            doc.line(MARGIN_LEFT + TEXT_WIDTH / 2 - 15, y, MARGIN_LEFT + TEXT_WIDTH / 2 + 15, y);
            y += 6;
            return;
          }

          if (seg.type === 'h2') {
            checkPageBreak(16);
            y += 6;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(seg.text, TEXT_WIDTH);
            lines.forEach((line: string) => {
              checkPageBreak(7);
              doc.text(line, MARGIN_LEFT, y);
              y += 7;
            });
            y += 4;
            return;
          }

          if (seg.type === 'h3') {
            checkPageBreak(12);
            y += 4;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bolditalic');
            const lines = doc.splitTextToSize(seg.text, TEXT_WIDTH);
            lines.forEach((line: string) => {
              checkPageBreak(6);
              doc.text(line, MARGIN_LEFT, y);
              y += 6;
            });
            y += 3;
            return;
          }

          if (seg.type === 'blockquote') {
            checkPageBreak(8);
            y += 2;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            // Indent blockquote
            const bqWidth = TEXT_WIDTH - 20;
            const lines = doc.splitTextToSize(seg.text, bqWidth);
            // Draw left border
            const startY = y;
            lines.forEach((line: string) => {
              checkPageBreak(6);
              doc.text(line, MARGIN_LEFT + 10, y);
              y += 6;
            });
            doc.setDrawColor(160, 130, 90);
            doc.setLineWidth(0.5);
            doc.line(MARGIN_LEFT + 3, startY - 4, MARGIN_LEFT + 3, y);
            y += 4;
            return;
          }

          // Regular paragraph
          doc.setFontSize(11.5);
          const fontStyle = seg.bold && seg.italic ? 'bolditalic' : seg.bold ? 'bold' : seg.italic ? 'italic' : 'normal';
          doc.setFont('helvetica', fontStyle);
          const lines = doc.splitTextToSize(seg.text, TEXT_WIDTH);
          lines.forEach((line: string) => {
            checkPageBreak(6.5);
            doc.text(line, MARGIN_LEFT, y);
            y += 6.5;
          });
          y += 3; // paragraph gap
        });
      });

      // Page numbers
      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 130, 110);
        doc.text(`${i}`, PAGE_W / 2, PAGE_H - 12, { align: 'center' });
        doc.setTextColor(0, 0, 0); // reset
      }

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
