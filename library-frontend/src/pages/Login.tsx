import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Clear previous session
      await axios.post("http://localhost:8000/api/method/logout", null, {
        withCredentials: true,
      });

      // Login request
      await axios.post(
        "http://localhost:8000/api/method/login",
        { usr: email, pwd: password },
        { withCredentials: true }
      );

      // Fetch user info
      const userInfoRes = await axios.get(
        "http://localhost:8000/api/method/library_management.api.auth.get_user_info",
        { withCredentials: true }
      );

      const { email: userEmail, roles } = userInfoRes.data.message;

      // Save session info
      sessionStorage.setItem("user", userEmail);
      sessionStorage.setItem("roles", JSON.stringify(roles));

      setSuccess("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Invalid login or session issue. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>

      {/* Success message */}
      {success && (
        <p className="mt-4 text-green-600 text-center font-medium">{success}</p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
      )}
    </div>
  );
}
