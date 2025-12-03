import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import AdminAuthModal from "../components/AdminAuthModal";
import axios from "axios";
import "../styles/Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    role: "staff",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showModal, setShowModal] = useState(false);  // MUST be false initially
  const [pendingSignupData, setPendingSignupData] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Store the signup details temporarily
    setPendingSignupData(formData);

    // VERY IMPORTANT: Open modal only here
    setShowModal(true);
  };

  const verifyAdminAndSignup = async (adminPassword) => {
    try {
      // 1️⃣ Verify admin password
      const adminCheck = await axios.post(
        "http://localhost:3000/api/v1/user/verifyAdmin",
        { password: adminPassword }
      );

      if (!adminCheck.data.valid) {
        alert("Invalid admin password");
        return;
      }

      // 🔥 Close modal as soon as admin is verified
      setShowModal(false);

      // 2️⃣ Now do actual signup
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/signup",
        pendingSignupData
      );

      if (res.status === 200) {
        alert("User registered successfully");
        navigate("/");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Sign Up</h2>

        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="doc">Doctor</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            minLength={4}
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit">Sign Up</Button>

        <p>
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </form>

      {/* Modal shows ONLY when showModal === true */}
      <AdminAuthModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={verifyAdminAndSignup}
      />
    </div>
  );
}
