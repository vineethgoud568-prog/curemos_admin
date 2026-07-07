'use client';

import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Toolbar button                                                       */
/* ------------------------------------------------------------------ */

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={() => onClick()}
      disabled={disabled}
      title={title}
      className={cn(
        'h-8 w-8 rounded-md p-0 text-slate-600 transition-all',
        'hover:bg-slate-100 hover:text-slate-900',
        isActive && 'bg-slate-200 text-slate-900',
      )}
    >
      {children}
    </Toggle>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar icons (inline SVG, no extra dep)                             */
/* ------------------------------------------------------------------ */

const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

const H1Icon = () => (
  <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8M4 6v12M12 6v12M17 12l2-2v8" />
  </svg>
);

const H2Icon = () => (
  <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8M4 6v12M12 6v12M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
  </svg>
);

const StrikeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 6 3.9h.4M8.7 19.1c2.3.6 4.4 1 6.2.9 2.7 0 5.3-.7 5.3-3.6 0-1.5-1.8-3.3-6-3.9H14" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);

const HighlightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 2.1L21.9 8.5l-1.4 1.4-1.5-1.4L13 14.5v.5h.5l1 1-5.5 5.5-1-1 .5-.5-5-5 5.5-5.5 1 1-.5.5.5.5h.5v-.5L16.9 3.5l-1.4-1.4zM6 16l-1.5 1.5L6 19l1.5-1.5L6 16z" opacity="0.4"/>
    <rect x="2" y="20" width="20" height="2" rx="1" />
  </svg>
);

const BulletListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const OrderedListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
    <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">1.</text>
    <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">2.</text>
    <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">3.</text>
  </svg>
);

const TableIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
);

const DividerIcon = () => <div className="mx-0.5 h-5 w-px bg-slate-200" />;

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '400px',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate max-w-none w-full outline-none',
          'prose-headings:font-bold prose-headings:text-slate-900',
          'prose-p:text-slate-700 prose-p:leading-relaxed',
          'prose-li:text-slate-700',
          'prose-strong:text-slate-900',
          'prose-table:border-collapse prose-td:border prose-td:border-slate-300 prose-td:p-2',
          'prose-th:border prose-th:border-slate-300 prose-th:p-2 prose-th:bg-slate-100 prose-th:font-semibold',
        ),
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when form resets/populates)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== undefined && value !== current) {
      // emitUpdate: false prevents triggering onChange during hydration
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all',
        'focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200',
        className,
      )}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <StrikeIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <HighlightIcon />
        </ToolbarButton>

        <DividerIcon />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <H1Icon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <H2Icon />
        </ToolbarButton>

        <DividerIcon />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <BulletListIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered list"
        >
          <OrderedListIcon />
        </ToolbarButton>

        <DividerIcon />

        {/* Table */}
        <ToolbarButton onClick={insertTable} title="Insert table">
          <TableIcon />
        </ToolbarButton>

        <DividerIcon />

        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <RedoIcon />
        </ToolbarButton>
      </div>

      {/* ── Editor area ── */}
      <div className="relative">
        {/* {editor.isEmpty && (
          <p className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400 select-none">
            {placeholder}
          </p>
        )} */}
        <EditorContent
          editor={editor}
          style={{ minHeight }}
          className="px-4 py-3 text-sm"
        />
      </div>
    </div>
  );
}
