import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

export default function XrayView() {
  const { id, name, xrayID } = useParams(); // Route params: /XrayView/:id/:name/:xrayID
  const xrayId = xrayID; // Use xrayID from route as xrayId
  const patientId = id; // Use id from route as patientId
  const [xrayData, setXrayData] = useState(null);
  const [loading, setLoading] = useState(true);   // start as true
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 

  useEffect(() => {
    const fetchXray = async () => {
      if (!xrayId) {
        setError("X-ray ID is missing in the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        console.log("Fetching X-ray:", xrayId);

        const response = await axios.get(
          `http://localhost:3000/api/v1/patient/${xrayId}/xrayImg`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("X-ray response:", response);
        setXrayData(response.data);
      } catch (err) {
        console.error("Error fetching X-ray:", err);
        setError("Failed to load X-ray data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchXray();
  }, [xrayId]);

  const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openImageFullscreen = (base64) => {
    const newTab = window.open("", "_blank");
    if (!newTab) {
      alert("Pop-up blocked. Please allow pop-ups for this site to view fullscreen.");
      return;
    }

    newTab.document.write(`
      <html>
        <head>
          <title>Full X-ray - ${xrayId}</title>
          <style>
            body {
              margin: 0;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              cursor: zoom-in;
            }
          </style>
        </head>
        <body>
          <img src="${base64}" alt="X-ray ${xrayId}" />
        </body>
      </html>
    `);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">🦷 Dental AI</div>
      </header>

      <section className="hero">
        <h1>X-Ray Details</h1>
        <p><strong>X-ray ID:</strong> {xrayId}</p>
        <p><strong>Patient ID:</strong> {patientId}</p>
        <p><strong>Patient Name:</strong> {name ? decodeURIComponent(name) : "Unknown"}</p>
        {xrayData && (
          <>
            <p><strong>Date Taken:</strong> {formatDate(xrayData.createdAt)}</p>
          </>
        )}
      </section>

      <section className="patient-search">
        <h2>X-Ray Images</h2>

        {loading && <p>Loading X-ray...</p>}

        {error && (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "10px" }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && xrayData ? (
          <div className="xray-display">
            <div className="xray-images-container">
              {/* Original X-ray */}
              <div className="xray-image-card">
                <h3>Original X-ray</h3>
                {xrayData.file ? (
                  <div className="image-wrapper">
                    <img
                      src={xrayData.file}
                      alt="Original X-ray"
                      className="xray-preview"
                      onClick={() => openImageFullscreen(xrayData.file)}
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        cursor: "pointer",
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <p
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      Click to view fullscreen
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      border: "2px dashed #ccc",
                      borderRadius: "8px",
                      color: "#888",
                    }}
                  >
                    <p>Original image not available</p>
                  </div>
                )}
              </div>

              {/* Analyzed X-ray */}
              <div className="xray-image-card">
                <h3>Analyzed X-ray</h3>
                {xrayData.analyzedFile ? (
                  <div className="image-wrapper">
                    <img
                      src={xrayData.analyzedFile}
                      alt="Analyzed X-ray"
                      className="xray-preview"
                      onClick={() => openImageFullscreen(xrayData.analyzedFile)}
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        cursor: "pointer",
                        border: "2px solid #4CAF50",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <p
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      Click to view fullscreen
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      border: "2px dashed #ccc",
                      borderRadius: "8px",
                      color: "#888",
                    }}
                  >
                    <p>Analyzed image not yet available</p>
                    <small>Analysis may still be in progress</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          !loading && !error && <p>X-ray not found or failed to load.</p>
        )}
      </section>

      {/* if you are not using styled-jsx, make this just <style> or move to CSS */}
      <style jsx>{`
        .xray-display {
          margin-top: 20px;
        }

        .xray-images-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 20px;
        }

        .xray-image-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .xray-image-card h3 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .image-wrapper {
          margin-top: 15px;
        }

        .xray-preview:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }

        @media (max-width: 768px) {
          .xray-images-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
