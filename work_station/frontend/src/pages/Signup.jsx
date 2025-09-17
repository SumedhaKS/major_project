import { useState } from "react";
import { data, Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    role: "staff", // default role
    username: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
        username: formData.username,
        password: formData.password,
        role: formData.role
      })

      if (response.status === 200) {
        alert("Registered successfully")
        navigate("/")
      }
    }
    catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          alert("Username already exists");
        }
        else if(error.response.status === 400){
          alert("Invalid input")
        }
        else{
          alert("Something went wrong. Please try again")
        }
      }
      else{
        alert("Server not reachable")
      }

    }

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
            required
          >
            <option value="doc">Doctor</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="username"
            placeholder="example@example.com"
            value={formData.username}
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
            minLength={4}
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
