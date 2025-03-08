import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("budget");
    localStorage.removeItem("expenses");
    navigate("/Login"); // Corrected navigation path
  };

  return (
    <nav className="bg-gray-800 p-4 fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-white text-lg">MoneyWise.inc</span>
        <div className="flex space-x-4">
          <Link to="/About" className="text-gray-400 hover:text-white">
            About Us
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;