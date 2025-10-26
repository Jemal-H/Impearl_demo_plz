import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './client_dashboard.css';

// Backend API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    businessName: '',
    businessType: '',
    companySize: '',
    address: '',
    bio: '',
    profilePicture: null
  });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from database
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/client/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.user);
        setTempBio(data.user.bio || '');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/client/update-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          profilePicture: data.profilePicture
        }));
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture');
    }
  };

  const handleBioSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/client/update-bio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio: tempBio })
      });

      if (response.ok) {
        setUserData(prev => ({ ...prev, bio: tempBio }));
        setIsEditingBio(false);
        alert('Bio updated successfully!');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio');
    }
  };

  const getInitials = () => {
    return userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <div className="navbar">
        <a href="/">
          <img src="/impearl_logo.PNG" alt="Impearl Logo" style={{ height: '65px' }} />
        </a>
        <div className="navbar-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/orders">Orders</a>
          <button onClick={() => {
            localStorage.clear();
            navigate('/login');
          }} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-picture-container">
            <input
              type="file"
              id="profilePictureInput"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profilePictureInput" className="profile-picture">
              {userData.profilePicture ? (
                <img src={`${API_URL}/${userData.profilePicture}`} alt="Profile" />
              ) : (
                <div className="profile-initials">{getInitials()}</div>
              )}
              <div className="profile-picture-overlay">
                <span>Change Photo</span>
              </div>
            </label>
          </div>

          <h2 className="profile-name">{userData.name || 'Your Name'}</h2>

          <div className="profile-info">
            <div className="info-item">
              <span className="info-icon"></span>
              <span>Located in {userData.address || 'Not specified'}</span>
            </div>

            <div className="info-item">
              <span className="info-icon"></span>
              <span>Joined in {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="info-item">
              <span className="info-icon"></span>
              <span>{userData.businessName || 'Business Name'}</span>
            </div>

            <div className="info-item">
              <span className="info-icon"></span>
              <span>{userData.businessType || 'Business Type'}</span>
            </div>

            <div className="info-item">
              <span className="info-icon"></span>
              <span>Company Size: {userData.companySize || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bio-card">
          <h3>About Your Company</h3>
          {isEditingBio ? (
            <div className="bio-edit">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="Tell us about your company and what you're looking for..."
                rows="8"
                className="bio-textarea"
              />
              <div className="bio-actions">
                <button onClick={handleBioSave} className="btn-save">Save</button>
                <button 
                  onClick={() => {
                    setIsEditingBio(false);
                    setTempBio(userData.bio || '');
                  }} 
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bio-display">
              <p>{userData.bio || 'Click edit to add information about your company and what you\'re looking for.'}</p>
              <button onClick={() => setIsEditingBio(true)} className="btn-edit">Edit Bio</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}