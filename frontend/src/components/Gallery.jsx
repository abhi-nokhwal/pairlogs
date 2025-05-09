import { useState, useRef } from 'react';
import axios from 'axios';

const Gallery = ({ space, onUpdate }) => {
  const [newImage, setNewImage] = useState({ file: null, caption: '' });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage({ ...newImage, file });
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newImage.file) {
      alert('Please select an image');
      return;
    }
    
    setUploading(true);
    
    try {
      // First upload the image file
      const formData = new FormData();
      formData.append('image', newImage.file);
      
      const uploadRes = await axios.post('http://localhost:5000/api/upload/image', formData);
      
      // Then save the image info to the personal space
      await axios.post(`http://localhost:5000/api/personal-space/${space.coupleId}/gallery`, {
        imageUrl: `http://localhost:5000${uploadRes.data.filePath}`,
        caption: newImage.caption,
        addedBy: 'partnerOne' // This should be dynamic based on who is logged in
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
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gallery</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Upload an Image</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full p-2 border rounded mb-2"
            accept="image/*"
          />
          
          {preview && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-40 h-40 object-cover rounded"
              />
            </div>
          )}
          
          <input
            type="text"
            value={newImage.caption}
            onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
            placeholder="Caption"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Add Image'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {space.gallery && space.gallery.length > 0 ? (
          space.gallery.map((image, index) => (
            <div key={index} className="relative bg-white p-2 rounded shadow-md">
              <img
                src={image.imageUrl}
                alt={image.caption}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
              <p className="text-xs text-gray-500">Added by: {image.addedBy}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No images yet. Add your first image!</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;