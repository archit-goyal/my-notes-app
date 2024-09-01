// components/Notes.tsx

import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/firebase/firebaseApp';
import RichTextEditor from './RichTextEditor';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isChecklist: boolean;
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
  isChecklist: false
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<NewNote>(defaultNewNote);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

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
      isChecklist: newNote.isChecklist || false,
    };

    await addDoc(collection(db, 'notes'), {
      ...newNoteData,
      createdAt: Date.now(),
    });
    setNewNote(defaultNewNote);  // Reset the form
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

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
      isChecklist: note.isChecklist
    });
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNewNote(defaultNewNote);
  };

  const filteredNotes = notes.filter(note =>
    (note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="max-w-6xl mx-auto p-4 md:ml-64">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-full bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <form onSubmit={editingNote ? (e) => {
        e.preventDefault();
        if (editingNote) updateNote(editingNote.id, newNote);
      } : addNote} className={`mb-8 ${newNote.color} rounded-lg shadow-md overflow-hidden`}>
        <input
          type="text"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({...newNote, title: e.target.value})}
          className="w-full p-3 border-b text-gray-800 bg-transparent focus:outline-none"
        />
        <div className="bg-white">
          <RichTextEditor
            content={newNote.content}
            onChange={(content) => setNewNote({...newNote, content})}
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
          <div>
            {editingNote ? (
              <>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  Update
                </button>
                <button type="button" onClick={cancelEditing} className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                  Cancel
                </button>
              </>
            ) : (
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                Add Note
              </button>
            )}
          </div>
        </div>
      </form>

      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pinnedNotes.map((note) => (
              <NoteItem key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} onTogglePin={togglePin} onEdit={startEditing} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {unpinnedNotes.map((note) => (
          <NoteItem key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} onTogglePin={togglePin} onEdit={startEditing} />
        ))}
      </div>
    </div>
  );
}

function NoteItem({ note, onUpdate, onDelete, onTogglePin, onEdit }: { 
  note: Note, 
  onUpdate: (id: string, data: Partial<NewNote>) => Promise<void>,
  onDelete: (id: string) => Promise<void>,
  onTogglePin: (note: Note) => Promise<void>,
  onEdit: (note: Note) => void
}) {
  return (
    <div className={`${note.color || 'bg-white'} p-4 rounded-lg shadow-md relative group transition-all duration-200 hover:shadow-lg`}>
      {note.title && <h2 className="text-xl font-semibold mb-2 text-gray-800">{note.title}</h2>}
      {note.content && (
        <div 
          className="text-gray-600 mb-4 prose max-w-full" 
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      )}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(note)} className="text-gray-600 hover:text-blue-500 mr-2 focus:outline-none">
          ✏️
        </button>
        <button onClick={() => onTogglePin(note)} className="text-gray-600 hover:text-yellow-500 mr-2 focus:outline-none">
          {note.isPinned ? '📌' : '📍'}
        </button>
        <button onClick={() => onDelete(note.id)} className="text-gray-600 hover:text-red-500 focus:outline-none">
          🗑️
        </button>
      </div>
    </div>
  );
}