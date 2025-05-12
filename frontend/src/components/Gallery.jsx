import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import ImageModal from './ImageModal';
import Reactions from './Reactions';

const Gallery = ({ space, onUpdate, currentUser, setIsUpdating }) => {
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
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCaption, setNewCaption] = useState('');
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
      
      // Set both newImage and selectedImage
      setNewImage({ ...newImage, file });
      setSelectedImage(file);
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
    
    setIsUpdating && setIsUpdating(true);
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
      setIsUpdating && setIsUpdating(false);
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setIsUpdating && setIsUpdating(true);
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
        setIsUpdating && setIsUpdating(false);
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

  // Close slideshow mode
  const handleCloseSlideshow = () => {
    setSlideshowMode(false);
  };

  // Open slideshow mode for an image
  const handleOpenSlideshow = (index) => {
    setSlideshowIndex(index);
    setSlideshowMode(true);
  };

  // Update the handleUploadImage to add progress tracking
  const handleUploadImage = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError('Please select an image to upload');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', selectedImage);
    
    setIsUpdating && setIsUpdating(true);
    setUploading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      const response = await axios.post('http://localhost:5000/api/upload/image', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      const imageUrl = `http://localhost:5000${response.data.filePath}`;
      
      // Add to personal space
      await axios.post(`http://localhost:5000/api/personal-space/${space.coupleId}/gallery`, {
        imageUrl,
        caption: newCaption,
        addedBy: currentUser || 'You'
      });
      
      // Reset form
      setSelectedImage(null);
      setNewCaption('');
      setUploadProgress(0);
      
      // Show success message
      const successElement = document.getElementById('upload-success');
      if (successElement) {
        successElement.classList.remove('hidden');
        successElement.classList.add('slide-up');
        setTimeout(() => {
          successElement.classList.add('hidden');
          successElement.classList.remove('slide-up');
        }, 3000);
      }
      
      onUpdate();
    } catch (error) {
      console.error('Failed to upload image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUpdating && setIsUpdating(false);
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-3 md:mb-0 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Our Gallery
        </h2>
        <div className="flex items-center space-x-3">
          {space.gallery?.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenSlideshow(0)}
              className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center self-end"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Slideshow
            </button>
          )}
          <button
            id="add-gallery-item"
            type="button"
            onClick={triggerFileInput}
            className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center self-end"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Add Image
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
          {error}
        </div>
      )}
      
      <div className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Add a New Memory</h3>
        
        <div id="upload-success" className="hidden mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-center">
          Image uploaded successfully!
        </div>
        
        <form onSubmit={handleUploadImage}>
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            
            {selectedImage ? (
              <div className="relative bg-white p-3 rounded-lg border border-pink-200">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500 mb-2">Selected image: <span className="font-medium text-gray-700">{selectedImage.name}</span></div>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-center max-h-64 overflow-hidden rounded-lg mb-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="max-w-full max-h-64 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500 transition-colors bg-white/60"
                onClick={triggerFileInput}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-14 w-14 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-sm font-medium text-pink-600">Click to select an image</p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG or GIF up to 5MB</p>
              </div>
            )}
          </div>
          
          <div className="mb-4 relative">
            <div className="flex">
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Add a caption to your image..."
                className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                id="emoji-button"
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="absolute right-3 top-3 text-gray-500 hover:text-pink-500"
              >
                <span role="img" aria-label="emoji" className="text-xl">😊</span>
              </button>
            </div>
            
            {showEmoji && (
              <div 
                ref={emojiPickerRef}
                className="absolute right-0 top-14 z-10"
                style={{ maxHeight: '350px', overflow: 'hidden' }}
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                  emojiSize={20}
                  emojiButtonSize={30}
                  maxFrequentRows={0}
                />
              </div>
            )}
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}% uploaded</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedImage}
              className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none transition-all flex items-center ${
                uploading || !selectedImage ? 'opacity-50 cursor-not-allowed' : 'hover-float'
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
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {space.gallery && space.gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {space.gallery.map((image, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover-float border border-pink-100"
            >
              {editingCaption === image._id ? (
                <div className="p-3">
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
                      className="absolute top-0 right-0 pr-3 flex items-center text-gray-500 hover:text-pink-500"
                      style={{ height: '100%' }}
                    >
                      <span role="img" aria-label="emoji" className="text-xl">😊</span>
                    </button>
                    {showEmojiForEdit && editingCaption === image._id && (
                      <div 
                        ref={editEmojiPickerRef}
                        className="absolute bottom-12 right-0 z-50"
                        style={{ maxHeight: '250px', overflow: 'hidden', marginTop: '10px' }}
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={(emoji) => {
                            setEditCaption(prev => prev + emoji.native);
                          }}
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
                  <div className="flex space-x-2 justify-end mt-3">
                    <button
                      onClick={() => setEditingCaption(null)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditCaption(image._id)}
                      className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="aspect-w-4 aspect-h-3 cursor-pointer" onClick={() => handleOpenSlideshow(index)}>
                    <img 
                      src={image.imageUrl} 
                      alt={image.caption || 'Gallery image'} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-3">
                    {image.caption && (
                      <p className="text-gray-800 mb-2">{image.caption}</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <p>
                        Added by <span className="font-medium">{image.addedBy}</span>
                      </p>
                      <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                        {new Date(image.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <Reactions 
                        itemId={image._id} 
                        itemType="gallery" 
                        space={space} 
                        onUpdate={onUpdate}
                        currentReactions={image.reactions || []}
                        currentUser={currentUser}
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCaption(image._id);
                            setEditCaption(image.caption || '');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
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
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-700 text-lg mb-2 font-medium">No images yet</p>
          <p className="text-gray-600 text-sm text-center mb-4">
            Upload your first image to start your gallery
          </p>
          <button
            onClick={triggerFileInput}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors hover-float"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Your First Image
          </button>
        </div>
      )}
      
      {/* Fullscreen image modal */}
      {slideshowMode && space.gallery.length > 0 && (
        <ImageModal 
          images={space.gallery} 
          currentIndex={slideshowIndex} 
          onClose={handleCloseSlideshow} 
        />
      )}
    </div>
  );
};

export default Gallery;