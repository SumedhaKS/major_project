import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    role: "Doctor", // default role
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("User registered with:", formData);
    // Later: backend team will handle API call
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Sign Up</h2>

        {/* Role */}
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Doctor">Doctor</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Confirm Password */}
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

        {/* Submit Button */}
        <Button type="submit">Sign Up</Button>

        {/* Redirect to Sign In */}
        <p>
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
