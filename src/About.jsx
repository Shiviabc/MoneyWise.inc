// About.js
import React from "react";

function About() {
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-lg text-white">About Us</h1>
      <p className="text-white">
        Welcome to <strong>MoneyWise.inc</strong>! We help you manage your finances effectively.
      </p>
      <h2 className="text-md text-white mt-4">Our Mission</h2>
      <p className="text-white">
        Our mission is to empower individuals to take control of their financial future through effective budgeting and expense tracking.
      </p>
      <h2 className="text-md text-white mt-4">Features</h2>
      <ul className="text-white list-disc list-inside">
        <li>Track your expenses easily</li>
        <li>Set and manage your budget</li>
        <li>View your overall savings</li>
        <li>Access your financial data anytime, anywhere</li>
      </ul>
      <h2 className="text-md text-white mt-4">Get Started</h2>
      <p className="text-white">
        Join us today and take the first step towards better financial management!
      </p>
    </div>
  );
}

export default About;