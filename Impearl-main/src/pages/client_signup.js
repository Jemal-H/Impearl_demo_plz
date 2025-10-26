import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Add this at the top - the backend API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ClientSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    companySize: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to register client - now uses full URL
      const response = await fetch(`${API_URL}/api/register/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: 'client'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Registration submitted successfully!');
        // Redirect to login page
        navigate('/login-form?type=client');
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
      {/* Navbar */}
      <div className="navbar">
        <a href="/">
          <img src="/impearl_logo.PNG" alt="Impearl Logo" style={{ height: '65px' }} />
        </a>
        <div className="navbar-links">
          <a href="/about.html">About</a>
          <a href="/signup.html">Sign Up</a>
          <a href="/login">Login</a>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <h2>Client Registration</h2>
        
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
        
        <div>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          {/* Business Name */}
          <div className="form-group">
            <label htmlFor="businessName">Business Name *</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Business Type */}
          <div className="form-group">
            <label htmlFor="businessType">Business Type *</label>
            <input
              type="text"
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Company Size */}
          <div className="form-group">
            <label>Company Size *</label>
            <div className="size-options">
              {['1-10', '10-50', '50-100', '100+'].map((size) => (
                <div className="size-option" key={size}>
                  <input
                    type="radio"
                    id={`size-${size}`}
                    name="companySize"
                    value={size}
                    checked={formData.companySize === size}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor={`size-${size}`}>{size}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleSubmit} 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
