import { useState } from "react";
import Button from "../components/Button";
import "../styles/UploadImages.css";
import axios from "axios";

export default function UploadImages() {
  const [image, setImage] = useState(null);
  const [analyzedImage, setAnalyzedImage] = useState(null);
  const [patientID, setPatientID] = useState("");

  /*
    patientID to be added to req.query.patientID
    token to req.header.authorization
    image 
  */




  const handleFiles = (files) => {
    // const newFiles = Array.from(files);
    // setImages((prev) => [...prev, ...newFiles]);

    const file = files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(`http://localhost:3000/api/v1/model/predict?patientId=${patientID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      )

      const analyzedUrl = URL.createObjectURL(response.data)
      setAnalyzedImage(analyzedUrl);

      alert("Image analyzed successfully");
    }
    catch (error) {
      console.error('Upload failed: ', error);
      alert("Failed to upload or analyze image")
    }
  };

  return (
    <div className="upload-container">

      <div className="patient-id">
        <label >PatientID: </label>
        <input type="text" placeholder="PT000001" value={patientID} onChange={(e) => setPatientID(e.target.value)} />
      </div>
      <h2>Upload Patient Image</h2>
      <p className="subtitle">Drag & drop dental X-ray</p>

      {/* Drag & Drop Zone */}
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>📂 Drag & Drop Image Here</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview Section */}
      {image && analyzedImage && (
        <div className="preview-section">
          <div className="preview-item">
            <h3>Original Image</h3>
            <img
              src={URL.createObjectURL(image)}
              alt="original"
              className="preview-img"
            />
          </div>
          <div className="preview-item">
            <h3>Analyzed Image</h3>
            <img
              src={analyzedImage}
              alt="analyzed"
              className="preview-img"
            />
          </div>
        </div>
      )}


      {/* Upload Button */}
      <Button onClick={handleUpload}>Upload</Button>
    </div >
  );
}
