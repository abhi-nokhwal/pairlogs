import { useState, useEffect } from 'react';

const ImageModal = ({ images, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Hide controls after a few seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [index, showControls]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  const nextImage = () => {
    setIsLoading(true);
    setIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevImage = () => {
    setIsLoading(true);
    setIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const currentImage = images[index];
  
  if (!currentImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={() => onClose()}
      onMouseMove={() => setShowControls(true)}
    >
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={onClose}
          className={`text-white bg-black bg-opacity-50 rounded-full p-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div 
        className="w-full h-full flex items-center justify-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous button */}
        <button 
          onClick={prevImage} 
          className={`absolute left-4 z-40 text-white bg-black bg-opacity-50 rounded-full p-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Main image */}
        <div className="relative max-w-full max-h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          )}
          <img
            src={currentImage.imageUrl}
            alt={currentImage.caption || 'Gallery image'}
            className="max-w-full max-h-[85vh] object-contain"
            onLoad={() => setIsLoading(false)}
          />
          
          {/* Caption */}
          {currentImage.caption && (
            <div className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex justify-between items-center">
                <p className="text-lg">{currentImage.caption}</p>
                <span className="text-sm">
                  {index + 1} / {images.length}
                </span>
              </div>
              <p className="text-sm opacity-75">
                Added by {currentImage.addedBy}
              </p>
            </div>
          )}
        </div>
        
        {/* Next button */}
        <button 
          onClick={nextImage} 
          className={`absolute right-4 z-40 text-white bg-black bg-opacity-50 rounded-full p-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageModal; 