import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState(""); 
  const [budgetAmount, setBudgetAmount] = useState("");

  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(storedExpenses);

    // Retrieve the budget from localStorage
    const storedBudget = localStorage.getItem("budget");
    if (storedBudget) {
      setBudget(parseFloat(storedBudget));
    }
  }, []);

  const handleSetBudget = () => {
    if (!isNaN(budgetAmount)) {
      const newBudget = parseFloat(budgetAmount);
      setBudget(newBudget);
      localStorage.setItem("budget", newBudget); // Store the budget in localStorage
      setBudgetAmount("");
    }
  };

  const handleAddExpense = () => {
    if (expenseAmount && expenseDescription && !isNaN(expenseAmount)) {
      const newExpense = {
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        date: new Date(),
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      setExpenseAmount("");
      setExpenseDescription("");
    }
  };

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );
  const amountLeft = budget - totalExpenses;

  return (
    <div className="container mx-auto p-4 pt-16">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-lg text-white">Finance Dashboard</h1>
        <div className="flex items-center space-x-2">
          <i className="fas fa-clock"></i>
        </div>
      </header>
      <div className="space-y-4">
        {/* Expense Tracker */}
        <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm text-white">Expense Tracker</h2>
            <Link to="/transactions" className="text-white text-xs">
              View Transactions
            </Link>
          </div>
          <form className="space-y-2 ">
            <div>
              <label
                htmlFor="expense-amount"
                className="block text-xs text-white"
              >
                Amount
              </label>
              <input
                type="text"
                id="expense-amount"
                className="w-full p-2 bg-gray-700 rounded text-white"
                placeholder="Enter amount "
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="expense-description"
                className="block text-xs text-white"
              >
                Expense
              </label>
              <input
                type="text"
                id="expense-description"
                className="w-full p-2 bg-gray-700 rounded"
                placeholder="for eg-food"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddExpense}
              className="w-full p-2 bg-green-500 rounded text-white"
            >
              Add Expense
            </button>
          </form>
        </div>
        {/* Budget Setter */}
        <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm text-white">Budget Setter</h2>
          </div>
          <form className="space-y-2">
            <div>
              <label
                htmlFor="budget-amount"
                className="block text-xs text-white"
              >
                Set Budget
              </label>
              <input
                type="text"
                id="budget-amount"
                className="w-full p-2 bg-gray-700 rounded"
                placeholder="Enter budget"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSetBudget}
              className="w-full p-2 bg-blue-500 rounded text-white"
            >
              Set Budget
            </button>
          </form>
          <div className="mt-4 text-xs text-white">
            <p>Budget: ₹{budget.toFixed(2)}</p>
            <p>Amount Left: ₹{amountLeft.toFixed(2)}</p>
          </div>
        </div>
        {/* Overall Savings */}
        <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm text-white">Overall Savings</h2>
          </div>
          <div className="text-center text-lg text-white">
            ₹{amountLeft.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;