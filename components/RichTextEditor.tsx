// components/RichTextEditor.tsx

import React, { forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Placeholder from '@tiptap/extension-placeholder';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListUl, FaListOl } from 'react-icons/fa';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface RichTextEditorRef {
  clearContent: () => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ content, onChange, placeholder = 'Start typing...' }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    clearContent: () => {
      editor?.commands.setContent('');
    },
  }));

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      <div className="menu-bar bg-gray-200 p-2 flex space-x-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`menu-item ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
        >
          <FaBold className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`menu-item ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
        >
          <FaItalic className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`menu-item ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
        >
          <FaUnderline className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`menu-item ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
        >
          <FaStrikethrough className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`menu-item ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
        >
          <FaListUl className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`menu-item ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
        >
          <FaListOl className="text-gray-700" />
        </button>
      </div>
      <EditorContent editor={editor} className="prose max-w-full p-2 text-gray-800" />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;