import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./signup_login.css";


export default function Signup() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div>

      <div className="sidebar" id="sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
        <a href="#" onClick={toggleSidebar}>Close ×</a>
        <a href="/about.html" onClick={toggleSidebar}>About</a>
      </div>


      <h3 className="signin-title">Sign up as:</h3>

      <header id="signup">
        <section className="user-choice">
          <div className="choice-container">
            <Link to="/client_signup" className="choice-button">
              <img src="/client_icon.png" style={{ height: '65px' }} alt="Client" />
              <span>Client</span>
            </Link>

            <Link to="/freelancer_signup" className="choice-button">
              <img src="/freelancer_icon.png" style={{ height: '65px' }} alt="Freelancer" />
              <span>Freelancer</span>
            </Link>
          </div>
        </section>
      </header>
    </div>
  );
}