import { useState } from "react";
import Button from "../components/Button";
import "../styles/UploadImages.css";

export default function UploadImages() {
  const [images, setImages] = useState([]);

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setImages((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    console.log("Uploading images:", images);
    alert(`${images.length} image(s) uploaded successfully!`);
  };

  return (
    <div className="upload-container">
      <h2>Upload Patient Images</h2>
      <p className="subtitle">Drag & drop dental X-rays or intraoral images below</p>

      {/* Drag & Drop Zone */}
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>📂 Drag & Drop Images Here</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview Section */}
      {images.length > 0 && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="preview-grid">
            {images.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt={`preview-${index}`}
                className="preview-img"
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}
