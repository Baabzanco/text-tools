import React from 'react';
import DOMPurify from 'dompurify';
import { generateHTML } from '@tiptap/html';
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

interface Props {
  content: any; // Can be JSONContent object or raw HTML string
  className?: string;
}

export const RichTextRenderer: React.FC<Props> = ({ content, className = '' }) => {
  if (!content) return null;

  let rawHtml = '';

  if (typeof content === 'string') {
    if (content.trim().startsWith('{')) {
      try {
        const json = JSON.parse(content);
        rawHtml = convertJsonToHtml(json);
      } catch {
        rawHtml = content;
      }
    } else {
      rawHtml = content;
    }
  } else if (typeof content === 'object') {
    rawHtml = convertJsonToHtml(content);
  }

  // Strict Security Sanitization with DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'span', 'strong', 'em', 'u', 's', 'mark', 'code', 'pre',
      'blockquote', 'ul', 'ol', 'li', 'hr', 'br',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'title', 'class', 'style', 'rel', 'data-media-asset-id'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|\/):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i
  });

  return (
    <div
      className={`prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

function convertJsonToHtml(jsonContent: any): string {
  try {
    return generateHTML(jsonContent, [
      StarterKit,
      UnderlineExtension,
      HighlightExtension,
      TextStyleExtension,
      ColorExtension,
      TextAlignExtension.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ HTMLAttributes: { class: 'text-indigo-600 underline hover:text-indigo-800' } }),
      CustomImage.configure({ HTMLAttributes: { class: 'rounded-2xl my-6 max-w-full shadow-md border border-slate-200' } }),
      TableExtension,
      TableRowExtension,
      TableHeaderExtension,
      TableCellExtension
    ]);
  } catch {
    return '<p>Error rendering document content.</p>';
  }
}
