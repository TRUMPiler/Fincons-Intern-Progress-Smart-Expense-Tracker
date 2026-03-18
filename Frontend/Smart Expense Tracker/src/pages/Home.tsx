import type { FC } from "react";
import { useNavigate } from "react-router";
import VideoAnimation from "../assets/Animated_GIF_Budget_Low_Expense_Tracker (1).gif";

const Home: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-indigo-500 dark:bg-black min-h-screen text-white">

      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-5">
        {/* <h1 className="text-2xl font-bold mt-7">Money Mint</h1> */}
{(!sessionStorage.getItem("id")&&
        <div className="flex gap-6 text-lg">
          <button onClick={() => navigate("/login")}>Login</button>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-indigo-600 px-4 py-1 rounded-lg font-semibold"
          >
            Sign Up
          </button>
        </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center gap-6 px-6 py-10">
        <img
          src={VideoAnimation}
          className="max-w-xl w-full rounded-3xl shadow-xl"
        />

        <h1 className="text-4xl font-bold">
          Take Control of Your Finances
        </h1>

        <p className="text-lg text-indigo-100 max-w-xl">
          Track expenses, manage budgets, analyze spending patterns, and
          build better financial habits with Money Mint.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-black dark:bg-white dark:text-black text-white px-6 py-3 text-xl rounded-lg shadow-lg hover:scale-105 transition"
        >
          Let's Get Started
        </button>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white py-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-10">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-4 gap-8 text-center">

          <div className="p-6 shadow-lg rounded-xl bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">💰 Expense Tracking</h3>
            <p className="text-sm">
              Easily record and categorize your daily expenses.
            </p>
          </div>

          <div className="p-6 shadow-lg rounded-xl bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">📊 Analytics</h3>
            <p className="text-sm">
              Visualize your spending using charts and insights.
            </p>
          </div>

          <div className="p-6 shadow-lg rounded-xl bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">🎯 Budget Control</h3>
            <p className="text-sm">
              Set monthly limits and stay within your budget.
            </p>
          </div>

          <div className="p-6 shadow-lg rounded-xl bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">🔔 Smart Alerts</h3>
            <p className="text-sm">
              Get notified when your spending exceeds normal patterns.
            </p>
          </div>

        </div>
      </div>

      {/* Call To Action */}
      <div className="flex flex-col items-center text-center py-16 gap-5 px-6">
        <h2 className="text-3xl font-bold">
          Start Managing Your Money Today
        </h2>

        <p className="text-indigo-100 max-w-lg">
          Join thousands of users who track their finances and build better
          financial habits with Money Mint.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg text-lg font-semibold hover:scale-105 transition"
        >
          Create Free Account
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-indigo-200 text-sm">
        © {new Date().getFullYear()} Money Mint • Personal Finance Tracker
      </div>

    </div>
  );
};

export default Home;