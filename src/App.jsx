import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login"; // Adjust the import path if necessary
import Dashboard from "./Dashboard"; // Ensure this path is correct
import TransactionHistory from "./TransactionHistory";
import Navbar from "./Navbar";
import About from "./About.jsx";
import "./App.css";



function App() {
  return (
    <Router>
      <div className="min-h">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
