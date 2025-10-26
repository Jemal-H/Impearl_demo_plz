import React from "react";
import { Link } from "react-router-dom";
import "./signup_login.css";

export default function Login() {
  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display =
      sidebar.style.display === "flex" ? "none" : "flex";
  };
  return (
    <div>

      <h3 className="signin-title">Login as:</h3>
      <header id="login">
        <section className="user-choice">
          <div className="choice-container">
            <Link to="/login_page?type=client" className="choice-button">
            <img src="./client_icon.png" style={{ height: "65px" }} />
            <span>Client</span>
            </Link>
            
            <Link to="/login_page?type=freelancer" className="choice-button">
            <img src="./freelancer_icon.png" style={{ height: "65px" }} />
            <span>Freelancer</span>
            </Link>


          </div>
        </section>
      </header>
    </div>
  );
}
