import React from "react";

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-sans leading-relaxed text-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">About Us</h2>
      <p className="text-lg mb-6">
        The Library Management System is a full-stack web application built to help you manage books, members, and loans efficiently.
      </p>
      <p className="text-lg mb-6">
        This project is part of a final-year academic challenge to demonstrate backend mastery with Frappe and frontend skills with React &amp; TypeScript.
      </p>
      <p className="text-lg">
        We aim to make book tracking easy for librarians and users, with powerful features like authentication, reservations, overdue alerts, and real-time API access.
      </p>
    </div>
  );
};

export default About;
