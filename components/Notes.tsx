// components/Notes.tsx

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/firebase/firebaseApp';
import RichTextEditor, { RichTextEditorRef } from './RichTextEditor';
import { FaEdit, FaTrash, FaArchive } from 'react-icons/fa';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: number;
}

type NewNote = Omit<Note, 'id' | 'createdAt'>;

const colorOptions = [
  'bg-white',
  'bg-red-200',
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-indigo-200',
  'bg-purple-200',
];

const defaultNewNote: NewNote = {
  title: '',
  content: '',
  color: 'bg-white',
  isPinned: false,
  isArchived: false
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<NewNote>(defaultNewNote);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const richTextEditorRef = useRef<RichTextEditorRef>(null);
  const editRichTextEditorRef = useRef<RichTextEditorRef>(null);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Note, 'id'>)
      }));
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, []);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.title.trim() === '' && newNote.content.trim() === '') return;

    const newNoteData: NewNote = {
      ...newNote,
      title: newNote.title || '',
      content: newNote.content || '',
      color: newNote.color || 'bg-white',
      isPinned: newNote.isPinned || false,
      isArchived: newNote.isArchived || false,
    };

    await addDoc(collection(db, 'notes'), {
      ...newNoteData,
      createdAt: Date.now(),
    });
    setNewNote(defaultNewNote);
    if (richTextEditorRef.current) {
      richTextEditorRef.current.clearContent();
    }
  };

  const updateNote = async (id: string, data: Partial<NewNote>) => {
    await updateDoc(doc(db, 'notes', id), data);
    setEditingNote(null);
    setNewNote(defaultNewNote);
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, 'notes', id));
  };

  const togglePin = async (note: Note) => {
    await updateNote(note.id, { isPinned: !note.isPinned });
  };

  const toggleArchive = async (note: Note) => {
    await updateNote(note.id, { isArchived: !note.isArchived });
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
      isArchived: note.isArchived
    });
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNewNote(defaultNewNote);
  };

  const filteredNotes = notes.filter(note =>
    !note.isArchived &&
    ((note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false))
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="flex-1 p-4 bg-gray-100">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-full bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <form onSubmit={addNote} className={`mb-8 ${newNote.color} rounded-lg shadow-md overflow-hidden`}>
        <input
          type="text"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({...newNote, title: e.target.value})}
          className="w-full p-3 border-b text-gray-800 bg-transparent focus:outline-none"
        />
        <div className="bg-white">
          <RichTextEditor
            ref={richTextEditorRef}
            content={newNote.content}
            onChange={(content) => setNewNote({...newNote, content})}
            placeholder="Description"
          />
        </div>
        <div className="flex justify-between items-center p-2 bg-opacity-50 bg-gray-100">
          <div className="flex space-x-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewNote({...newNote, color})}
                className={`w-6 h-6 rounded-full ${color} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
            ))}
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
            Add Note
          </button>
        </div>
      </form>

      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-black">Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pinnedNotes.map((note) => (
              <NoteItem key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} onTogglePin={togglePin} onToggleArchive={toggleArchive} onEdit={startEditing} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {unpinnedNotes.map((note) => (
          <NoteItem key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} onTogglePin={togglePin} onToggleArchive={toggleArchive} onEdit={startEditing} />
        ))}
      </div>

      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Note</h2>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Title"
            />
            <RichTextEditor
              ref={editRichTextEditorRef}
              content={newNote.content}
              onChange={(content) => setNewNote({...newNote, content})}
              placeholder="Description"
            />
            <div className="flex justify-end mt-4">
              <button onClick={cancelEditing} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={() => {
                if (editingNote) {
                  updateNote(editingNote.id, newNote);
                }
              }} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteItem({ note, onUpdate, onDelete, onTogglePin, onToggleArchive, onEdit }: { 
  note: Note, 
  onUpdate: (id: string, data: Partial<NewNote>) => Promise<void>,
  onDelete: (id: string) => Promise<void>,
  onTogglePin: (note: Note) => Promise<void>,
  onToggleArchive: (note: Note) => Promise<void>,
  onEdit: (note: Note) => void
}) {
  return (
    <div className={`${note.color || 'bg-white'} p-4 rounded-lg shadow-md relative group transition-all duration-200 hover:shadow-lg overflow-hidden`}>
      {note.title && <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">{note.title}</h2>}
      {note.content && (
        <div 
          className="text-gray-600 mb-4 prose max-w-full overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      )}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
        <button onClick={() => onEdit(note)} className="text-gray-600 hover:text-blue-500 focus:outline-none p-1 rounded-full hover:bg-blue-100">
          <FaEdit size={16} />
        </button>
        <button onClick={() => onTogglePin(note)} className="text-gray-600 hover:text-yellow-500 focus:outline-none p-1 rounded-full hover:bg-yellow-100">
          {note.isPinned ? <BsPinAngleFill size={16} /> : <BsPinAngle size={16} />}
        </button>
        <button onClick={() => onToggleArchive(note)} className="text-gray-600 hover:text-green-500 focus:outline-none p-1 rounded-full hover:bg-green-100">
          <FaArchive size={16} />
        </button>
        <button onClick={() => onDelete(note.id)} className="text-gray-600 hover:text-red-500 focus:outline-none p-1 rounded-full hover:bg-red-100">
          <FaTrash size={16} />
        </button>
      </div>
    </div>
  );
}