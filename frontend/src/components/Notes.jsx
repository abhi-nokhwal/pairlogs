import { useState } from 'react';
import axios from 'axios';

const Notes = ({ space, onUpdate }) => {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/personal-space/${space.coupleId}/notes`, {
        content: newNote,
        addedBy: 'partnerOne' // This should be dynamic based on who is logged in
      });
      setNewNote('');
      onUpdate();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Notes</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="w-full p-2 border rounded mb-2 h-32"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Note
        </button>
      </form>

      <div className="space-y-4">
        {space.notes.map((note, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded">
            <p className="whitespace-pre-wrap">{note.content}</p>
            <p className="text-xs text-gray-500 mt-2">Added by: {note.addedBy}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;