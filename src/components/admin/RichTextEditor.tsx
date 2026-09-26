import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as ImageExtension } from '@tiptap/extension-image';

const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaAssetId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-media-asset-id'),
        renderHTML: (attributes) => {
          if (!attributes.mediaAssetId) return {};
          return { 'data-media-asset-id': attributes.mediaAssetId };
        }
      }
    };
  }
});
import { Link as LinkExtension } from '@tiptap/extension-link';
import { Table as TableExtension } from '@tiptap/extension-table';
import { TableRow as TableRowExtension } from '@tiptap/extension-table-row';
import { TableCell as TableCellExtension } from '@tiptap/extension-table-cell';
import { TableHeader as TableHeaderExtension } from '@tiptap/extension-table-header';
import { TextAlign as TextAlignExtension } from '@tiptap/extension-text-align';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { TextStyle as TextStyleExtension } from '@tiptap/extension-text-style';
import { Color as ColorExtension } from '@tiptap/extension-color';
import { Highlight as HighlightExtension } from '@tiptap/extension-highlight';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Highlighter,
  Minus,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { MediaPickerModal, MediaAssetItem } from './MediaPickerModal';

export interface RichTextEditorProps {
  initialContent?: any; // Structured Tiptap JSON or string
  onChange: (jsonContent: any, htmlContent: string) => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved' | 'failed';
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onChange,
  saveStatus = 'saved',
  placeholder = 'Write or paste rich content here...'
}) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] }
      }),
      UnderlineExtension,
      HighlightExtension.configure({ multicolor: true }),
      TextStyleExtension,
      ColorExtension,
      TextAlignExtension.configure({
        types: ['heading', 'paragraph']
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline font-medium hover:text-indigo-800'
        }
      }),
      CustomImage.configure({
        allowBase64: false, // Strict Rule: No Base64 binary data in editor document!
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-slate-200'
        }
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full border-collapse border border-slate-300 my-4 text-xs'
        }
      }),
      TableRowExtension,
      TableHeaderExtension.configure({
        HTMLAttributes: {
          class: 'bg-slate-100 border border-slate-300 p-2 font-bold text-left'
        }
      }),
      TableCellExtension.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2'
        }
      })
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      onChange(json, html);
    }
  });

  useEffect(() => {
    if (editor && initialContent) {
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = typeof initialContent === 'string' ? initialContent : JSON.stringify(initialContent);
      if (currentJson !== newJson) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span className="text-xs font-semibold">Initializing Rich Text Editor...</span>
      </div>
    );
  }

  const handleInsertImage = (asset: MediaAssetItem) => {
    if (asset && asset.publicUrl) {
      editor
        .chain()
        .focus()
        .setImage({
          src: asset.publicUrl,
          alt: asset.altText || asset.originalFilename,
          title: asset.title || asset.originalFilename,
          mediaAssetId: asset.id
        } as any)
        .run();
    }
  };

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter target URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Editor Toolbar */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-700 select-none">
        {/* Save Status Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 mr-2 bg-white rounded-lg border border-slate-200 text-[11px] font-bold">
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Saved</span>
            </>
          )}
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span className="text-indigo-700">Saving...</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-700">Unsaved Changes</span>
            </>
          )}
          {saveStatus === 'failed' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-rose-700">Save Failed</span>
            </>
          )}
        </div>

        {/* Formatting Group */}
        <div className="flex items-center gap-0.5 border-r border-slate-300/80 pr-1.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('strike') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('highlight') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings Group */}
        <div className="flex items-center gap-0.5 border-r border-slate-300/80 pr-1.5">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Alignment Group */}
        <div className="flex items-center gap-0.5 border-r border-slate-300/80 pr-1.5">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Blocks & Media Group */}
        <div className="flex items-center gap-0.5 border-r border-slate-300/80 pr-1.5">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSetLink}
            className={`p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors ${
              editor.isActive('link') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
            }`}
            title="Insert / Edit Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Media Library Image Button */}
          <button
            onClick={() => setIsMediaModalOpen(true)}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition-colors flex items-center gap-1 text-xs"
            title="Insert Image from Media Library"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold hidden sm:inline">Media</span>
          </button>
        </div>

        {/* Tables & Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            className="p-1.5 rounded-lg hover:bg-slate-200/80 transition-colors"
            title="Insert 3x3 Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 disabled:opacity-40 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 disabled:opacity-40 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Main Surface */}
      <div className="p-4 min-h-[260px] max-h-[500px] overflow-y-auto prose prose-slate max-w-none text-slate-800 focus:outline-none text-sm">
        <EditorContent editor={editor} />
      </div>

      {/* Media Picker Modal for Editor */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectAsset={handleInsertImage}
        title="Insert Image into Document"
        filterType="image"
      />
    </div>
  );
};
