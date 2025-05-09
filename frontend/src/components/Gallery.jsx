import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Gallery = ({ space, onUpdate, currentUser }) => {
  const [newImage, setNewImage] = useState({ file: null, caption: '' });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingCaption, setEditingCaption] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showEmojiForEdit, setShowEmojiForEdit] = useState(false);
  const fileInputRef = useRef(null);
  const captionRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const editEmojiPickerRef = useRef(null);

  useEffect(() => {
    // Close emoji picker when clicking outside
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && 
          event.target.id !== 'emoji-button') {
        setShowEmoji(false);
      }
      
      if (editEmojiPickerRef.current && !editEmojiPickerRef.current.contains(event.target) && 
          event.target.id !== 'emoji-edit-button') {
        setShowEmojiForEdit(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit. Please choose a smaller image.');
        fileInputRef.current.value = '';
        return;
      }
      
      setNewImage({ ...newImage, file });
      setError('');
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (editingCaption !== null) {
      setEditCaption(editCaption + emoji.native);
    } else {
      setNewImage({ ...newImage, caption: newImage.caption + emoji.native });
    }
    setShowEmoji(false);
    setShowEmojiForEdit(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newImage.file) {
      setError('Please select an image');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // First upload the image file
      const formData = new FormData();
      formData.append('image', newImage.file);
      
      const uploadRes = await axios.post('http://localhost:5000/api/upload/image', formData);
      
      // Then save the image info to the personal space
      await axios.post(`http://localhost:5000/api/personal-space/${space.coupleId}/gallery`, {
        imageUrl: `http://localhost:5000${uploadRes.data.filePath}`,
        caption: newImage.caption,
        addedBy: currentUser || 'You'
      });
      
      // Reset form and update gallery
      setNewImage({ file: null, caption: '' });
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to add image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setDeleting(true);
      try {
        await axios.delete(`http://localhost:5000/api/personal-space/${space.coupleId}/gallery/${imageId}`);
        // Reset any editing states
        setEditingCaption(null);
        setEditCaption('');
        setShowEmojiForEdit(false);
        setShowEmoji(false);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete image:', error);
        setError('Failed to delete image. Please try again.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleEditCaption = async (imageId) => {
    if (!editCaption.trim()) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/personal-space/${space.coupleId}/gallery/${imageId}`, {
        caption: editCaption
      });
      setEditingCaption(null);
      setEditCaption('');
      setShowEmojiForEdit(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update caption:', error);
      setError('Failed to update caption. Please try again.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-3 md:mb-0 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Our Gallery
        </h2>
        
        <button
          id="add-gallery-item"
          type="button"
          onClick={() => {
            setNewImage({ file: null, caption: '' });
            setPreview(null);
            setError('');
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Scroll to form
            document.getElementById('gallery-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center self-end"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add New Memory
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
          {error}
        </div>
      )}
      
      <form id="gallery-form" onSubmit={handleSubmit} className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200 shadow-sm">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Upload a Memory
          </label>
          
          <div 
            className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition-colors mb-4 bg-white"
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            
            {!preview ? (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-pink-600">Click to upload an image</p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="mx-auto h-48 object-contain rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setNewImage({ ...newImage, file: null });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </span>
            </div>
            <input
              type="text"
              value={newImage.caption}
              onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
              placeholder="Add a caption for this memory..."
              className="w-full pl-10 pr-12 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              ref={captionRef}
            />
            <button
              id="emoji-button"
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-pink-500"
            >
              <span role="img" aria-label="emoji" className="text-xl">😊</span>
            </button>
            {showEmoji && !editingCaption && (
              <div 
                ref={emojiPickerRef}
                className="absolute right-0 bottom-full mb-2 z-50"
                style={{ maxHeight: '250px', overflow: 'hidden' }}
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                  emojiSize={18}
                  emojiButtonSize={28}
                  maxFrequentRows={0}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !newImage.file}
            className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none transition-all flex items-center ${
              uploading || !newImage.file ? 'opacity-50 cursor-not-allowed' : ''
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
                Add to Gallery
              </>
            )}
          </button>
        </div>
      </form>

      {/* Fullscreen image view */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.caption} 
              className="max-h-[80vh] mx-auto object-contain"
            />
            <div className="bg-white p-4 mt-4 rounded-lg">
              <p className="font-medium text-lg text-gray-800 mb-2">{selectedImage.caption}</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Added by <span className="font-medium">{selectedImage.addedBy}</span> on {new Date(selectedImage.addedAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => downloadImage(selectedImage.imageUrl, `memory-${selectedImage._id}.jpg`)}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {space.gallery && space.gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {space.gallery.map((image, index) => (
            <div 
              key={index} 
              className={`relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden transform hover:scale-[1.02] ${
                index % 3 === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="p-3">
                <div 
                  className="relative overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption}
                    className="w-full h-48 md:h-52 object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                    <span className="text-white font-medium">Click to view</span>
                  </div>
                </div>
                <div className="pt-3">
                  {editingCaption === image._id ? (
                    <div className="mb-2 relative">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Edit caption..."
                      />
                      <button
                        id="emoji-edit-button"
                        type="button"
                        onClick={() => setShowEmojiForEdit(!showEmojiForEdit)}
                        className="absolute right-0 top-0 pr-3 flex items-center text-gray-500 hover:text-pink-500"
                      >
                        <span role="img" aria-label="emoji" className="text-xl">😊</span>
                      </button>
                      {showEmojiForEdit && editingCaption === image._id && (
                        <div 
                          ref={editEmojiPickerRef}
                          className="absolute right-0 bottom-10 z-50"
                          style={{ maxHeight: '250px', overflow: 'hidden', marginTop: '10px' }}
                        >
                          <Picker
                            data={data}
                            onEmojiSelect={handleEmojiSelect}
                            theme="light"
                            previewPosition="none"
                            skinTonePosition="none"
                            emojiSize={18}
                            emojiButtonSize={28}
                            maxFrequentRows={0}
                          />
                        </div>
                      )}
                      <div className="flex justify-end mt-2 space-x-5 pt-5">
                        <button
                          onClick={() => {
                            setEditingCaption(null);
                            setEditCaption('');
                            setShowEmojiForEdit(false);
                          }}
                          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditCaption(image._id)}
                          className="px-5 py-2 rounded-lg bg-pink-500 text-white text-sm hover:bg-pink-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-800 break-words">{image.caption}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Added by <span className="font-medium">{image.addedBy}</span>
                    </p>
                    <span className="text-xs bg-pink-100 text-pink-800 px-1 py-1 rounded-full">
                      {new Date(image.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-end mt-2 space-x-2">
                    {editingCaption !== image._id && (
                      <button
                        onClick={() => {
                          setEditingCaption(image._id);
                          setEditCaption(image.caption);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image._id)}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-700 text-lg mb-2 font-medium">No images yet</p>
          <p className="text-gray-600 text-sm text-center">
            Upload your first image to start building memories together
          </p>
          <button
            onClick={triggerFileInput}
            className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Your First Memory
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;