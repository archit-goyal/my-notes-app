// components/Notes.tsx

import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/firebase/firebaseApp';

interface Note {
  id: string;
  heading: string;
  description: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ heading: '', description: '' });
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note));
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, []);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.heading.trim() === '' || newNote.description.trim() === '') return;

    await addDoc(collection(db, 'notes'), newNote);
    setNewNote({ heading: '', description: '' });
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, 'notes', id));
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewNote({ heading: note.heading, description: note.description });
  };

  const updateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    await updateDoc(doc(db, 'notes', editingNote.id), newNote);
    setEditingNote(null);
    setNewNote({ heading: '', description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">My Notes</h1>
      
      <form onSubmit={editingNote ? updateNote : addNote} className="mb-8">
        <input
          type="text"
          placeholder="Note Heading"
          value={newNote.heading}
          onChange={(e) => setNewNote({...newNote, heading: e.target.value})}
          className="w-full p-2 mb-2 border rounded text-gray-800 bg-white"
        />
        <textarea
          placeholder="Note Description"
          value={newNote.description}
          onChange={(e) => setNewNote({...newNote, description: e.target.value})}
          className="w-full p-2 mb-2 border rounded text-gray-800 bg-white"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          {editingNote ? 'Update Note' : 'Add Note'}
        </button>
        {editingNote && (
          <button
            type="button"
            onClick={() => {
              setEditingNote(null);
              setNewNote({ heading: '', description: '' });
            }}
            className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{note.heading}</h2>
            <p className="text-gray-600 mb-4">{note.description}</p>
            <div className="flex justify-end">
              <button
                onClick={() => startEditing(note)}
                className="text-blue-500 mr-2 hover:text-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}