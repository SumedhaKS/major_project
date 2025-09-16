import { Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">🦷 Dental AI</div>
        <nav className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/patient-details">Patients</Link>
          <Link to="/get-images">Upload Images</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <div className="logout">
          <Button>Logout</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>AI-Powered Dental Diagnostics</h1>
          <p>
            Upload, analyze, and manage patient records instantly. 
            Optimized for clinics and hospitals in remote areas.
          </p>
        </div>
        <div className="hero-image">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/2966/2966484.png" 
            alt="Dental illustration"
          />
        </div>
      </section>

      {/* Patient Search Section */}
      <section className="patient-search">
        <h2>Find Patient</h2>
        <div className="search-box">
          <input type="text" placeholder="Enter Patient ID or Phone" />
          <Button>Search</Button>
        </div>
        <p>Not found? <Link to="/patient-details">Register New Patient</Link></p>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/patient-details"><Button>Register Patient</Button></Link>
          <Link to="/get-images"><Button>Upload Images</Button></Link>
          <Link to="/reports"><Button>View Reports</Button></Link>
        </div>
      </section>
    </div>
  );
}
