import { useParams , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";


export default function PatientView() {
  const { id, name } = useParams();
  const [xRays, setXRays] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const newXrayButton = ()=>{
    navigate(`/get-images/${id}`)
  }

  useEffect(() => {
    const fetchXrays = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/v1/patient/${id}/xrays`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setXRays(response.data.xRays || []);
      } catch (error) {
        console.error("Error fetching patient X-rays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchXrays();
  }, [id]);

  

  const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openImage = (base64) => {
    const newTab = window.open("", "_blank");
    newTab.document.write(`
      <html>
        <head>
          <title>Full X-ray</title>
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
            }
          </style>
        </head>
        <body>
          <img src="${base64}" alt="X-ray" />
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
        <h1>Patient Details</h1>
        <p><strong>ID:</strong> {id}</p>
        <p><strong>Name:</strong> {decodeURIComponent(name)}</p>
        <div className="hero-actions">
          <button onClick={newXrayButton} className="btn-new-xray">
            New Xray
          </button>
        </div>
      </section>

      

      <section className="patient-search">
        <h2>X-Ray Results</h2>
        {loading && <p>Loading X-rays...</p>}

        {!loading && xRays.length > 0 ? (
          <div className="xray-list">
            {xRays.map((x) => (
              <details key={x.xrayId} className="xray-item">
                <summary>
                  <span className="xray-id">{x.xrayId}</span>
                  <span className="xray-date">{formatDate(x.createdAt)}</span>
                </summary>
                <ul className="xray-dropdown">
                  <li onClick={() => openImage(x.file)}>
                    <span>Zray</span>
                    <img src={x.file} alt="Original X-ray" />
                  </li>
                  <li
                    className={!x.analyzedFile ? "disabled" : ""}
                    onClick={() => x.analyzedFile && openImage(x.analyzedFile)}
                  >
                    <span>Analyzed Xray</span>
                    {x.analyzedFile ? (
                      <img src={x.analyzedFile} alt="Analyzed X-ray" />
                    ) : (
                      <em>Not available</em>
                    )}
                  </li>
                </ul>
              </details>
            ))}
          </div>
        ) : (
          !loading && <p>No X-rays found for this patient.</p>
        )}
      </section>
    </div>
  );
}
