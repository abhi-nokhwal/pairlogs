import React, { useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      await axios.post("http://localhost:5000/api/images/upload", formData);
      alert("Image uploaded successfully!");
      setImage(null);
      setCaption("");
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div className="mb-8 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Upload Image with Caption</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-2 block"
        />
        <input
          type="text"
          placeholder="Enter a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border px-3 py-1 rounded w-full mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Upload
        </button>
      </form>
    </div>
  );
};

export default ImageUpload;
