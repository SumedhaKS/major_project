import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Signin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "staff", // default role
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("User entered:", formData);

    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
        username: formData.email,
        password: formData.password,
        role: formData.role
      
      })

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token)
        navigate("/dashboard")
      }
    }
    catch(error){
      if(error.response){
        if(error.response.status === 404){
          alert("user not found")
        }

        else if(error.response.status === 400){
          alert("Invalid input")
        }
        else if(error.response.status === 401){
          alert("incorrect password")
        }
        else if(error.response.status === 500){
          alert("internal server error");
        }
      }
      else{
        alert("Server not reachable");
      }
    }
  
  };

  return (
    <div className="signin-container">
      <form onSubmit={handleSubmit} className="signin-form">
        <h2>Sign In</h2>

        {/* Role Selection */}
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            required
            onChange={handleChange}
          >
            <option value="staff">Staff</option>
            <option value="doc">Doctor</option>
          </select>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@example.com"
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



        {/* Submit */}
        <Button type="submit">Sign In</Button>

        {/* Redirect to Signup */}
        <p>
          Don't have an account?{" "}
          <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
   );
  
}
