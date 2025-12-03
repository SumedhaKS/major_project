import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/RegisterPatient.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function RegisterPatient() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",   //default 
    phone: "",
    address: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:3000/api/v1/patient/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 200) {
        const pID = response.data.patient.patientId
        console.log(pID);
        alert(`PID: ${pID} registered successfully! `);
        // patientID.createContext(response.data.patient)
        navigate(`/get-images/${pID}`);
      }
      if(response.status === 201){
        alert("Patient with same phone number exists")
      }


    }
    catch (error) {
        if(error.response){
          if(error.response.status === 400){
            alert("Insufficient data");
          }
        }
        else{
          alert("Server is unreachable")
        }
    }

  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register Patient</h2>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit">Register</Button>

        <p className="back-link">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </p>
      </form>
    </div>
  );
}
