import { useState, useRef } from 'react';
import axios from 'axios';

const Songs = ({ space, onUpdate }) => {
  const [songSource, setSongSource] = useState('url'); // 'url' or 'file'
  const [newSong, setNewSong] = useState({ title: '', artist: '', url: '', file: null });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSong({ ...newSong, file });
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
      alert('Please select a music file');
      return;
    }
    
    setUploading(true);
    
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
        addedBy: 'partnerOne' // This should be dynamic based on who is logged in
      });
      
      // Reset form and update
      setNewSong({ title: '', artist: '', url: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to add song:', error);
      alert('Failed to add song. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderSongPlayer = (song) => {
    const embedType = getEmbedType(song.url);
    const embedUrl = getEmbedUrl(song.url, embedType);
    
    switch (embedType) {
      case 'youtube':
        return (
          <iframe
            src={embedUrl}
            title={song.title}
            className="w-full h-56 rounded"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
        
      case 'spotify':
        return (
          <iframe
            src={embedUrl}
            title={song.title}
            className="w-full h-80 rounded"
            frameBorder="0"
            allow="encrypted-media"
            allowtransparency="true"
          ></iframe>
        );
        
      case 'audio':
        return (
          <audio controls className="w-full mt-2" preload="metadata">
            <source src={song.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
        
      default:
        return (
          <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Listen
          </a>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Songs</h2>
      
      <div className="flex mb-4 border-b pb-2">
        <button 
          onClick={() => setSongSource('url')}
          className={`mr-4 px-3 py-1 rounded ${songSource === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Add Using URL
        </button>
        <button 
          onClick={() => setSongSource('file')}
          className={`px-3 py-1 rounded ${songSource === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Upload File
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            value={newSong.title}
            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
            placeholder="Song Title"
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            value={newSong.artist}
            onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
            placeholder="Artist"
            className="w-full p-2 border rounded mb-2"
            required
          />
          
          {songSource === 'url' ? (
            <input
              type="text"
              value={newSong.url}
              onChange={(e) => setNewSong({ ...newSong, url: e.target.value })}
              placeholder="Song URL (YouTube, Spotify, SoundCloud, or direct audio link)"
              className="w-full p-2 border rounded"
              required
            />
          ) : (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept="audio/*"
              required
            />
          )}
          
          {songSource === 'url' && newSong.url && (
            <p className="mt-2 text-sm text-gray-600">
              Supported sources: YouTube, Spotify, SoundCloud, or direct audio links
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Adding...' : 'Add Song'}
        </button>
      </form>

      <div className="space-y-6">
        {space.songs && space.songs.length > 0 ? (
          space.songs.map((song, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-md">
              <h3 className="font-bold text-lg">{song.title}</h3>
              <p className="text-gray-600 mb-2">{song.artist}</p>
              {renderSongPlayer(song)}
              <p className="text-xs text-gray-500 mt-2">Added by: {song.addedBy}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No songs yet. Add your first song!</p>
        )}
      </div>
    </div>
  );
};

export default Songs;