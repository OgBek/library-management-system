import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = sessionStorage.getItem("user");
  const roles = sessionStorage.getItem("roles");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  let rolesArray: string[] = [];
  if (roles) {
    try {
      rolesArray = JSON.parse(roles);
    } catch {
      rolesArray = [];
    }
  }

  const isLibrarian = rolesArray.includes("Librarian");
  const isMember = rolesArray.includes("Member");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📚 Library Dashboard
            </h1>
            <p className="text-gray-600">Welcome, <strong>{user}</strong></p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLibrarian && (
            <>
              <DashboardCard
                icon={<BookOpenIcon className="h-6 w-6" />}
                title="Manage Books"
                link="/books"
                color="bg-blue-500"
              />
              <DashboardCard
                icon={<UserGroupIcon className="h-6 w-6" />}
                title="Manage Members"
                link="/members"
                color="bg-green-500"
              />
              <DashboardCard
                icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
                title="Track Loans"
                link="/loans"
                color="bg-yellow-500"
              />
              <DashboardCard
                icon={<BookmarkIcon className="h-6 w-6" />}
                title="Handle Reservations"
                link="/reservations"
                color="bg-purple-500"
              />
              <DashboardCard
                icon={<ChartBarIcon className="h-6 w-6" />}
                title="Reports"
                link="/reports"
                color="bg-indigo-500"
              />
            </>
          )}

          {isMember && (
            <>
              <DashboardCard
                icon={<BookmarkIcon className="h-6 w-6" />}
                title="My Reservations"
                link="/my-reservations"
                color="bg-teal-500"
              />
              <DashboardCard
                icon={<ChartBarIcon className="h-6 w-6" />}
                title="My Loan History"
                link="/reports"
                color="bg-orange-500"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  link,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  link: string;
  color: string;
}) {
  return (
    <a
      href={link}
      className={`flex items-center space-x-4 p-5 rounded-lg shadow-md text-white ${color} hover:brightness-110 transition`}
    >
      <div className="bg-white bg-opacity-20 rounded-full p-2">{icon}</div>
      <span className="text-lg font-medium">{title}</span>
    </a>
  );
}
