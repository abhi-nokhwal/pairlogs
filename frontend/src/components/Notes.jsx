import { useState } from 'react';
import axios from 'axios';

const Notes = ({ space, onUpdate, currentUser }) => {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      setError('Please enter a note');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post(`http://localhost:5000/api/personal-space/${space.coupleId}/notes`, {
        content: newNote,
        addedBy: currentUser || 'You'
      });
      setNewNote('');
      onUpdate();
    } catch (error) {
      console.error('Failed to add note:', error);
      setError('Failed to add note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setDeleting(true);
      try {
        await axios.delete(`http://localhost:5000/api/personal-space/${space.coupleId}/notes/${noteId}`);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete note:', error);
        setError('Failed to delete note. Please try again.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/personal-space/${space.coupleId}/notes/${noteId}`, {
        content: editContent
      });
      setEditingNote(null);
      setEditContent('');
      onUpdate();
    } catch (error) {
      console.error('Failed to update note:', error);
      setError('Failed to update note. Please try again.');
    }
  };

  const getRandomBorderColor = (index) => {
    const colors = ['border-pink-500', 'border-purple-500', 'border-blue-500', 'border-indigo-500', 'border-teal-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-3 md:mb-0 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Our Notes
        </h2>
        <button
          id="add-note-item"
          type="button" 
          onClick={() => {
            // Scroll to form
            document.querySelector('textarea')?.focus();
          }}
          className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center self-end"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add New Note
        </button>
      </div>
      
      <div className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Add a New Note</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a message to your partner..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newNote.trim()}
              className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none transition-all flex items-center ${
                submitting || !newNote.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Save Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {space.notes && space.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {space.notes.map((note, index) => (
            <div key={index} className={`bg-white p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 ${getRandomBorderColor(index)}`}>
              {editingNote === note._id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none mb-3"
                    placeholder="Edit your note..."
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditNote(note._id)}
                      className="px-3 py-1 rounded-lg bg-pink-500 text-white text-sm hover:bg-pink-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="prose max-w-none mb-3">
                    <p className="whitespace-pre-wrap text-gray-800">{note.content}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <p>
                      Added by <span className="font-medium">{note.addedBy}</span>
                    </p>
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                      {new Date(note.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-end mt-3 space-x-2">
                    <button
                      onClick={() => {
                        setEditingNote(note._id);
                        setEditContent(note.content);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-800 text-xs flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-700 text-lg mb-2 font-medium">No notes yet</p>
          <p className="text-gray-600 text-sm text-center mb-4">
            Start sharing thoughts, reminders, or sweet messages
          </p>
          <button
            onClick={() => document.querySelector('textarea')?.focus()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Your First Note
          </button>
        </div>
      )}
    </div>
  );
};

export default Notes;