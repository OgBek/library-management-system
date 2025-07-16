import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50 font-sans">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
          📚 Library Management System
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Welcome! Manage books, loans, and members with ease.
        </p>
      </header>

      <nav className="flex flex-wrap justify-center gap-4 mt-6">
        <Link
          to="/about"
          className="px-5 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-200"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="px-5 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-200"
        >
          Contact
        </Link>
        <Link
          to="/login"
          className="px-5 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition duration-200"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-600 hover:text-white transition duration-200"
        >
          Register
        </Link>
      </nav>
    </div>
  );
};

export default Home;
