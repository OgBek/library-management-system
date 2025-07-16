import React, { useEffect, useState } from "react";
import axios from "axios";

type Loan = {
  loan_id: string;
  book_title: string;
  member_name?: string;
  loan_date: string;
  return_date: string;
};

export default function Reports() {
  const [currentLoans, setCurrentLoans] = useState<Loan[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  const [memberLoans, setMemberLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = sessionStorage.getItem("user");
  const rolesRaw = sessionStorage.getItem("roles");
  const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];

  const isLibrarian = roles.includes("Librarian");
  const isMember = roles.includes("Member");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (isLibrarian) {
          const [currentRes, overdueRes] = await Promise.all([
            axios.get("http://localhost:8000/api/method/library_management.api.report_api.get_current_loans", {
              withCredentials: true,
            }),
            axios.get("http://localhost:8000/api/method/library_management.api.report_api.get_overdue_loans", {
              withCredentials: true,
            }),
          ]);
          setCurrentLoans(currentRes.data.message || []);
          setOverdueLoans(overdueRes.data.message || []);
        }

        if (isMember && user) {
          const memberRes = await axios.get(
            `http://localhost:8000/api/method/library_management.api.report_api.get_member_loans?email=${user}`,
            { withCredentials: true }
          );
          setMemberLoans(memberRes.data.message || []);
        }
      } catch {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLibrarian, isMember, user]);

  const downloadCSV = (data: Loan[], filename: string) => {
    const headers = ["Loan ID", "Book Title", "Loan Date", "Return Date"];
    const rows = data.map((row) =>
      [row.loan_id, row.book_title, row.loan_date, row.return_date].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">📊 Reports</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          {/* Librarian Reports */}
          {isLibrarian && (
            <>
              <ReportSection
                title="📋 Current Loans Report"
                data={currentLoans}
                filename="current_loans_report.csv"
                includeMember
                emptyMessage="No current loans."
              />
              <ReportSection
                title="⚠️ Overdue Loans Report"
                data={overdueLoans}
                filename="overdue_loans_report.csv"
                includeMember
                emptyMessage="No overdue loans."
              />
            </>
          )}

          {/* Member Loan History */}
          {isMember && (
            <ReportSection
              title="📖 My Loan History"
              data={memberLoans}
              filename="my_loan_history.csv"
              includeMember={false}
              emptyMessage="You have no past loans."
            />
          )}
        </>
      )}
    </div>
  );
}

// Reusable section component
function ReportSection({
  title,
  data,
  filename,
  includeMember,
  emptyMessage,
}: {
  title: string;
  data: Loan[];
  filename: string;
  includeMember?: boolean;
  emptyMessage: string;
}) {
  const downloadCSV = () => {
    const headers = ["Loan ID", "Book Title", ...(includeMember ? ["Member Name"] : []), "Loan Date", "Return Date"];
    const rows = data.map((row) => {
      const values = [
        row.loan_id,
        row.book_title,
        ...(includeMember ? [row.member_name || ""] : []),
        row.loan_date,
        row.return_date,
      ];
      return values.join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={downloadCSV}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
        >
          Download CSV
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-600">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Loan ID</th>
                <th className="px-3 py-2 border">Book Title</th>
                {includeMember && <th className="px-3 py-2 border">Member Name</th>}
                <th className="px-3 py-2 border">Loan Date</th>
                <th className="px-3 py-2 border">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((loan) => (
                <tr key={loan.loan_id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border">{loan.loan_id}</td>
                  <td className="px-3 py-2 border">{loan.book_title}</td>
                  {includeMember && (
                    <td className="px-3 py-2 border">{loan.member_name || "—"}</td>
                  )}
                  <td className="px-3 py-2 border">{loan.loan_date}</td>
                  <td className="px-3 py-2 border">{loan.return_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}