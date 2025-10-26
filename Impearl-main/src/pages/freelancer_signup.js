import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./freelancer_signup.css";

// Backend API URL - change this for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function FreelancerSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePicture: null,
    resume: null,
    skills: "",
    experience: "",
  });

  const [profileFileName, setProfileFileName] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture") {
      setFormData((prev) => ({ ...prev, profilePicture: files[0] || null }));
      setProfileFileName(files[0]?.name || "");
    } else if (name === "resume") {
      setFormData((prev) => ({ ...prev, resume: files[0] || null }));
      setResumeFileName(files[0]?.name || "");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData object to handle file uploads
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('skills', formData.skills);
      submitData.append('experience', formData.experience);
      submitData.append('userType', 'freelancer');
      
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      }

      // API call to register freelancer
      const response = await fetch(`${API_URL}/api/register/freelancer`, {
        method: 'POST',
        body: submitData // Don't set Content-Type header, browser will set it with boundary
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Registration submitted successfully!');
        // Redirect to login page
        navigate('/login-form?type=freelancer');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="navbar">
        <a href="/">
          <img src="/impearl_logo.PNG" alt="Impearl Logo" style={{ height: "65px" }} />
        </a>
        <div className="navbar-links">
          <a href="/about">About</a>
          <a href="/signup">Sign Up</a>
          <a href="/login">Login</a>
        </div>
      </div>

      <div className="form-container">
        <h2>Freelancer Registration</h2>
        
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '5px',
            color: '#c33',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Profile Picture *</label>
            <div className="file-upload">
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label 
                htmlFor="profilePicture"
                className={`file-upload-label ${profileFileName ? "has-file" : ""}`}
              >
                <span>Choose Profile Picture</span>
                {profileFileName && <span className="file-name">{profileFileName}</span>}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Resume *</label>
            <div className="file-upload">
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label 
                htmlFor="resume"
                className={`file-upload-label ${resumeFileName ? "has-file" : ""}`}
              >
                <span>Choose Resume (PDF, DOC, DOCX)</span>
                {resumeFileName && <span className="file-name">{resumeFileName}</span>}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Skills/Expertise *</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Web Development, Graphic Design"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Years of Experience *</label>
            <select 
              name="experience" 
              value={formData.experience} 
              onChange={handleChange} 
              required
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="0-1">Less than 1 year</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}