import { useState, useRef } from 'react';
import axios from 'axios';

const Songs = ({ space, onUpdate, currentUser, setIsUpdating }) => {
  const [songSource, setSongSource] = useState('url'); // 'url' or 'file'
  const [newSong, setNewSong] = useState({ title: '', artist: '', url: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingSong, setEditingSong] = useState(null);
  const [editSong, setEditSong] = useState({ title: '', artist: '', url: '' });
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit. Please choose a smaller audio file.');
        fileInputRef.current.value = '';
        return;
      }
      
      setNewSong({ ...newSong, file });
      setError('');
    }
  };

  const getEmbedType = (url) => {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    // Check if it's a server-hosted audio file
    if (url.includes('/uploads/songs/') || url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
      return 'audio';
    }
    return 'link';
  };

  const getEmbedUrl = (url, type) => {
    if (type === 'youtube') {
      // Convert YouTube URLs to embed format
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (type === 'spotify') {
      // Convert Spotify URLs to embed format
      if (url.includes('track')) {
        const trackId = url.split('track/')[1]?.split('?')[0];
        return trackId ? `https://open.spotify.com/embed/track/${trackId}` : url;
      }
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (songSource === 'file' && !newSong.file) {
      setError('Please select a music file');
      return;
    }
    
    if (songSource === 'url' && !newSong.url) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsUpdating && setIsUpdating(true);
    setUploading(true);
    setError('');
    
    try {
      let finalUrl = newSong.url;
      
      if (songSource === 'file') {
        // Upload the song file
        const formData = new FormData();
        formData.append('song', newSong.file);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload/song', formData);
        finalUrl = `http://localhost:5000${uploadRes.data.filePath}`;
      }
      
      // Save song info to personal space
      await axios.post(`http://localhost:5000/api/personal-space/${space.coupleId}/songs`, {
        title: newSong.title,
        artist: newSong.artist,
        url: finalUrl,
        addedBy: currentUser || 'You'
      });
      
      // Reset form and update
      setNewSong({ title: '', artist: '', url: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to add song:', error);
      setError('Failed to add song. Please try again.');
    } finally {
      setIsUpdating && setIsUpdating(false);
      setUploading(false);
    }
  };

  const handleDeleteSong = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      setIsUpdating && setIsUpdating(true);
      setDeleting(true);
      try {
        await axios.delete(`http://localhost:5000/api/personal-space/${space.coupleId}/songs/${songId}`);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete song:', error);
        setError('Failed to delete song. Please try again.');
      } finally {
        setIsUpdating && setIsUpdating(false);
        setDeleting(false);
      }
    }
  };

  const handleEditSong = async (songId) => {
    if (!editSong.title || (!editSong.url && songSource === 'url')) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUpdating && setIsUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/personal-space/${space.coupleId}/songs/${songId}`, {
        title: editSong.title,
        artist: editSong.artist,
        url: editSong.url
      });
      setEditingSong(null);
      setEditSong({ title: '', artist: '', url: '' });
      onUpdate();
    } catch (error) {
      console.error('Failed to update song:', error);
      setError('Failed to update song. Please try again.');
    } finally {
      setIsUpdating && setIsUpdating(false);
    }
  };

  const renderSongPlayer = (song) => {
    const embedType = getEmbedType(song.url);
    const embedUrl = getEmbedUrl(song.url, embedType);
    
    switch (embedType) {
      case 'youtube':
        return (
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={song.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
        
      case 'spotify':
        return (
          <iframe
            src={embedUrl}
            title={song.title}
            className="w-full h-80 rounded-lg"
            frameBorder="0"
            allow="encrypted-media"
            allowtransparency="true"
          ></iframe>
        );
        
      case 'audio':
        return (
          <div className="bg-gray-50 p-3 rounded-lg">
            <audio controls className="w-full mt-2" preload="metadata">
              <source src={song.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
        
      default:
        return (
          <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-pink-600 hover:text-pink-800 bg-pink-50 px-4 py-2 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Open External Link
          </a>
        );
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-3 md:mb-0 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Our Music Collection
        </h2>
        <button
          id="add-song-item"
          type="button"
          onClick={() => {
            // Scroll to form
            document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center self-end"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add New Song
        </button>
      </div>
      
      <div className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200 shadow-sm">
        <div className="flex space-x-2 mb-5 border-b pb-3">
          <button 
            onClick={() => setSongSource('url')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${
              songSource === 'url' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            Add Using URL
          </button>
          <button 
            onClick={() => setSongSource('file')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${
              songSource === 'file' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Upload File
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <input
                type="text"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                placeholder="Song Title"
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <input
                type="text"
                value={newSong.artist}
                onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                placeholder="Artist Name"
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            {songSource === 'url' ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <input
                  type="url"
                  value={newSong.url}
                  onChange={(e) => setNewSong({ ...newSong, url: e.target.value })}
                  placeholder="Enter YouTube, Spotify, or direct audio URL"
                  className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition-colors bg-white"
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="audio/*"
                />
                
                {!newSong.file ? (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-pink-600">Click to upload an audio file</p>
                    <p className="mt-1 text-xs text-gray-500">MP3, WAV, OGG up to 10MB</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-pink-600 font-medium">{newSong.file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewSong({ ...newSong, file: null });
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || (!newSong.file && songSource === 'file') || (!newSong.url && songSource === 'url')}
              className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none transition-all flex items-center ${
                uploading || (!newSong.file && songSource === 'file') || (!newSong.url && songSource === 'url') ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Add Music
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {space.songs && space.songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {space.songs.map((song, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-pink-100">
              {editingSong === song._id ? (
                <div className="mb-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Song Title</label>
                    <input
                      type="text"
                      value={editSong.title}
                      onChange={(e) => setEditSong({ ...editSong, title: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Edit song title"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                    <input
                      type="text"
                      value={editSong.artist}
                      onChange={(e) => setEditSong({ ...editSong, artist: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Edit artist name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      type="url"
                      value={editSong.url}
                      onChange={(e) => setEditSong({ ...editSong, url: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Edit song URL"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setEditingSong(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditSong(song._id)}
                      className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">{song.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{song.artist}</p>
                  
                  <div className="mb-4 flex-grow">
                    {renderSongPlayer(song)}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <p>
                      Added by <span className="font-medium">{song.addedBy}</span>
                    </p>
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                      {new Date(song.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-end mt-3 space-x-2">
                    <button
                      onClick={() => {
                        setEditingSong(song._id);
                        setEditSong({
                          title: song.title,
                          artist: song.artist,
                          url: song.url
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSong(song._id)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-800 text-xs flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-gray-700 text-lg mb-2 font-medium">No songs in your collection yet</p>
          <p className="text-gray-600 text-sm text-center mb-4">
            Add your favorite songs to share with your partner
          </p>
          <button
            onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Your First Song
          </button>
        </div>
      )}
    </div>
  );
};

export default Songs;