import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

const Sidebar: React.FC = () => {
  const user = sessionStorage.getItem("user");
  const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white shadow-lg fixed flex flex-col justify-between p-6 border-r">
      <div>
        <h2 className="text-2xl font-bold text-blue-700 mb-8">📚 Library System</h2>

        <nav className="space-y-4 text-gray-700 font-medium">
          {user && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 hover:text-blue-600 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5" />
                Dashboard
              </Link>

              {roles.includes("Librarian") && (
                <>
                  <Link
                    to="/books"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    Manage Books
                  </Link>

                  <Link
                    to="/members"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    Manage Members
                  </Link>

                  <Link
                    to="/loans"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                    Track Loans
                  </Link>

                  <Link
                    to="/reservations"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    <BookmarkIcon className="h-5 w-5" />
                    Reservations
                  </Link>

                  <Link
                    to="/reports"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    Reports
                  </Link>
                </>
              )}

              {roles.includes("Member") && (
                <>
                  <Link
                    to="/my-reservations"
                    className="flex items-center gap-3 hover:text-green-600 transition-colors"
                  >
                    <BookmarkIcon className="h-5 w-5" />
                    My Reservations
                  </Link>

                  <Link
                    to="/reports"
                    className="flex items-center gap-3 hover:text-purple-600 transition-colors"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    My Loan History
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>

      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 hover:text-red-800 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
