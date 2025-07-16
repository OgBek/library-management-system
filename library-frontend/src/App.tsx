import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookCrud from "./pages/BookCRUD";
import MemberCRUD from "./pages/MemberCRUD";
import LoanCRUD from "./pages/LoanCRUD";
import ReservationCRUD from "./pages/ReservationCRUD";
import MyReservations from "./pages/MyReservations";
import CurrentLoans from "./pages/CurrentLoans";
import OverdueLoans from "./pages/ OverdueLoans";
import Reports from "./pages/Reports";
import Layout from "./pages/Layout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Layout Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<BookCrud />} />
          <Route path="/members" element={<MemberCRUD />} />
          <Route path="/loans" element={<LoanCRUD />} />
          <Route path="/reservations" element={<ReservationCRUD />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/current-loans" element={<CurrentLoans />} />
          <Route path="/overdue-loans" element={<OverdueLoans />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
