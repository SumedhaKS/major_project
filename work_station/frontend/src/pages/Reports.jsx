import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import "../styles/Dashboard.css";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    patientId: "",
    patientName: "",
    xrayId: "",
    hasAnalyzed: "",
    startDate: "",
    endDate: ""
  });

  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      // Build query string
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axios.get(
        `http://localhost:3000/api/v1/patient/report?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReports(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    // Reset to page 1 when filtering and fetch immediately
    const newPage = 1;
    setPagination(prev => ({ ...prev, page: newPage }));
    
    // Fetch immediately with current filters and page 1
    const fetchWithFilters = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        const queryParams = new URLSearchParams({
          page: newPage.toString(),
          limit: pagination.limit.toString()
        });

        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            queryParams.append(key, filters[key]);
          }
        });

        const response = await axios.get(
          `http://localhost:3000/api/v1/patient/report?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setReports(response.data.data || []);
        setPagination(response.data.pagination || { ...pagination, page: newPage });
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWithFilters();
  };

  const handleClearFilters = () => {
    setFilters({
      patientId: "",
      patientName: "",
      xrayId: "",
      hasAnalyzed: "",
      startDate: "",
      endDate: ""
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleRowClick = (xrayId, patientId, patientName) => {
    navigate(`/XrayView/${patientId}/${encodeURIComponent(patientName)}/${xrayId}`);
  };

  const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">🦷 Dental AI</div>
        <nav className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/patient-details">Register Patient</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <div className="logout">
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>X-Ray Reports</h1>
        <p>View and filter all X-ray reports</p>
      </section>

      {/* Filters Section */}
      <section className="patient-search" style={{ marginBottom: "20px" }}>
        <h2>Filters</h2>
        <div className="filters-container" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "15px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Patient ID
            </label>
            <input
              type="text"
              placeholder="e.g., PT000001"
              value={filters.patientId}
              onChange={(e) => handleFilterChange("patientId", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Patient Name
            </label>
            <input
              type="text"
              placeholder="Search by name"
              value={filters.patientName}
              onChange={(e) => handleFilterChange("patientName", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              X-ray ID
            </label>
            <input
              type="text"
              placeholder="e.g., XR000123"
              value={filters.xrayId}
              onChange={(e) => handleFilterChange("xrayId", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Has Analyzed File
            </label>
            <select
              value={filters.hasAnalyzed}
              onChange={(e) => handleFilterChange("hasAnalyzed", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
          <Button onClick={handleClearFilters} style={{ backgroundColor: "#5c6b73" }}>
            Clear Filters
          </Button>
        </div>
      </section>

      {/* Reports Table */}
      <section className="patient-search">
        <h2>Reports ({pagination.total} total)</h2>

        {loading && <p>Loading reports...</p>}

        {error && (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            <p>{error}</p>
            <Button onClick={fetchReports} style={{ marginTop: "10px" }}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {reports.length > 0 ? (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#253237", color: "white" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>X-ray ID</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Patient ID</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Patient Name</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Date Taken</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr
                          key={report.xrayId}
                          onClick={() => handleRowClick(report.xrayId, report.patientId, report.patientName)}
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px solid #ddd"
                          }}
                          onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = "#f5f5f5"}
                          onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = "white"}
                        >
                          <td style={{ padding: "12px" }}>{report.xrayId}</td>
                          <td style={{ padding: "12px" }}>{report.patientId}</td>
                          <td style={{ padding: "12px" }}>{report.patientName}</td>
                          <td style={{ padding: "12px" }}>{formatDate(report.createdAt)}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              backgroundColor: report.hasAnalyzedFile ? "#4CAF50" : "#ff9800",
                              color: "white",
                              fontSize: "12px"
                            }}>
                              {report.hasAnalyzedFile ? "Analyzed" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "20px"
                  }}>
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      style={{
                        backgroundColor: pagination.page === 1 ? "#ccc" : "#253237",
                        cursor: pagination.page === 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      Previous
                    </Button>
                    <span style={{ padding: "0 15px" }}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      style={{
                        backgroundColor: pagination.page === pagination.totalPages ? "#ccc" : "#253237",
                        cursor: pagination.page === pagination.totalPages ? "not-allowed" : "pointer"
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                No reports found. Try adjusting your filters.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

