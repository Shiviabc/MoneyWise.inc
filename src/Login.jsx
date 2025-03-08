import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Check if password is provided
    if (password.trim() === "") {
      // Show an alert if the password is empty
      alert("Please enter your password.");
    } else {
      // Perform login logic here
      // For demonstration purposes, we'll assume the login is always successful
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center login-container pt-16">
      <div className="login-box">
        <h2 className="login-title text-white">Login</h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="username" className="block text-xs text-white">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="login-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update state on change
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="login-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update state on change
            />
          </div>
          <button type="button" onClick={handleLogin} className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;