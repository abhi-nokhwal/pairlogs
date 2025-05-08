import React, { useEffect, useState } from "react";
import axios from "axios";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/images");
        setImages(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching images:", err);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Loading gallery...</div>
    );

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {images.length === 0 ? (
        <p className="text-center col-span-full text-gray-500">
          No images found.
        </p>
      ) : (
        images.map((img) => (
          <div
            key={img._id}
            className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={img.url}
              alt={img.caption}
              className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="p-2 text-center text-sm text-gray-700">
              {img.caption}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Gallery;
