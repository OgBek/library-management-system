import React, { useEffect, useState } from "react";
import axios from "axios";

type Loan = {
  loan_id: string;
  book_title: string;
  member_name: string;
  loan_date: string;
  return_date: string;
};

export default function OverdueLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverdueLoans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/method/library_management.api.report_api.get_overdue_loans",
        { withCredentials: true }
      );
      setLoans(res.data.message);
      setError(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load overdue loans.";
      setError(typeof msg === "string" ? msg : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-6">Overdue Loans</h2>

      {error && <p className="mb-4 text-red-600 font-medium">{error}</p>}

      {loading ? (
        <p className="text-gray-600">Loading overdue loans...</p>
      ) : loans.length === 0 ? (
        <p className="text-gray-600">No overdue loans.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
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
                <tr key={loan.loan_id} className="hover:bg-gray-50">
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
