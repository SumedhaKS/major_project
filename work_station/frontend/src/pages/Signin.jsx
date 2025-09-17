import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Signin.css";

export default function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Doctor", // default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User entered:", formData);
    // later your backend team will add API here
    alert(`Signed in as ${formData.role}`);
  };

  return (
    <div className="signin-container">
      <form onSubmit={handleSubmit} className="signin-form">
        <h2>Sign In</h2>

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

        {/* Role Selection */}
        <div className="form-group">
          <label>Sign in as</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Doctor">Doctor</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {/* Submit */}
        <Button type="submit">Sign In</Button>

        {/* Redirect to Signup */}
        <p>
          Don’t have an account?{" "}
          <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
