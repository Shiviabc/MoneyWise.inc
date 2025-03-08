import React from "react";
import { Link } from "react-router-dom";

function TransactionHistory() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  return (
    <div className="container mx-auto p-4 pt-16">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-lg text-white">Transaction History</h1>
        <Link to="/dashboard" className="text-white text-s">
          Back to Dashboard
        </Link>
      </header>
      <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md mx-auto">
        <ul className="space-y-2 text-s text-white">
          {expenses.map((expense, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-700 p-2 rounded"
            >
              <div>
                <p className="font-semibold">{expense.description}</p>
                <p className="text-gray-400">
                  {new Date(expense.date).toLocaleDateString("en-IN")}{" "}
                  {new Date(expense.date).toLocaleTimeString()}
                </p>
              </div>
              <p className="text-red-500">-${expense.amount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TransactionHistory;
