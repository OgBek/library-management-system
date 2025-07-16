import React, { useEffect, useState } from "react";
import axios from "axios";

type Loan = {
  loan_id: string;
  book_title: string;
  member_name: string;
  loan_date: string;
  return_date: string;
};

export default function CurrentLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/method/library_management.api.report_api.get_current_loans",
        { withCredentials: true }
      );
      setLoans(res.data.message);
      setError(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to load current loans.";
      setError(typeof msg === "string" ? msg : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-6">📖 Current Loans</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading current loans...</p>
      ) : loans.length === 0 ? (
        <p className="text-gray-600">No current loans.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Book</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Member</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Loan Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan.loan_id}
                  className="hover:bg-gray-50 even:bg-gray-100"
                >
                  <td className="border border-gray-300 px-4 py-2">{loan.book_title}</td>
                  <td className="border border-gray-300 px-4 py-2">{loan.member_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{loan.loan_date}</td>
                  <td className="border border-gray-300 px-4 py-2">{loan.return_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}