import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./login_page.css";

// Backend API URL - change this for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LoginForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    setUserType(type || '');
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to login
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: userType // Optional: validates user type
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store JWT token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        alert('Login successful!');
        
        // Redirect based on user type
        if (data.user.userType === 'client') {
          navigate('/client-dashboard');
        } else if (data.user.userType === 'freelancer') {
          navigate('/freelancer-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (userType === 'client') return 'Client Login';
    if (userType === 'freelancer') return 'Freelancer Login';
    return 'Login';
  };

  return (
    <div>

      {/* Login Container */}
      <div className="login-container">
        <div className="login-box">
          <h2 id="loginTitle">{getTitle()}</h2>
          <p className="subtitle">Enter your credentials to continue</p>
          
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
              />
            </div>

            <button 
              onClick={handleSubmit} 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <a href="/login" className="back-link">← Back to selection</a>
        </div>
      </div>
    </div>
  );
}
