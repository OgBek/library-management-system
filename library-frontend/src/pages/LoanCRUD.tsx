import React, { useEffect, useState } from "react";
import axios from "axios";

type Loan = {
  name: string;
  book: string;
  member: string;
  loan_date: string;
  return_date: string;
};

type Member = {
  name: string;
  fullname: string;
};

type Book = {
  name: string;
  title: string;
};

export default function LoanCRUD() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [form, setForm] = useState({
    book: "",
    member: "",
    loan_date: "",
    return_date: "",
  });

  const rolesStr = sessionStorage.getItem("roles") || "[]";
  let roles: string[] = [];
  try {
    roles = JSON.parse(rolesStr);
  } catch {
    roles = [];
  }
  const isLibrarian = roles.includes("Librarian");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const [loansRes, membersRes, booksRes] = await Promise.all([
        axios.get("http://localhost:8000/api/method/library_management.api.loan.get_loans", { withCredentials: true }),
        axios.get("http://localhost:8000/api/method/library_management.api.member.get_members", { withCredentials: true }),
        axios.get("http://localhost:8000/api/method/library_management.api.book.get_books", { withCredentials: true }),
      ]);
      setLoans(loansRes.data.message);
      setMembers(membersRes.data.message);
      setBooks(booksRes.data.message);
    } catch {
      setError("❌ Could not fetch data. Please check your connection or permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    const { book, member, loan_date, return_date } = form;
    if (!book || !member || !loan_date || !return_date) {
      setError("⚠️ All fields are required.");
      return false;
    }
    if (loan_date > return_date) {
      setError("⚠️ Loan date cannot be after return date.");
      return false;
    }
    return true;
  };

  const handleBackendError = (err: any, action: "create" | "update") => {
    // Try to parse _server_messages from Frappe
    let detailedMsg: string | null = null;
    try {
      const serverMessages = JSON.parse(err.response?.data?._server_messages || "[]");
      if (Array.isArray(serverMessages) && serverMessages.length > 0) {
        const parsed = JSON.parse(serverMessages[0]);
        detailedMsg = parsed.message || null;
      }
    } catch {
      // fallback silently
    }

    const fallbackMsg = err.response?.data?.message || `❌ Failed to ${action} loan.`;
    setError(detailedMsg || `❌ ${fallbackMsg}`);
  };

  const createLoan = async () => {
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:8000/api/method/library_management.api.loan.create_loan", null, {
        params: { data: JSON.stringify(form) },
        withCredentials: true,
      });
      setSuccess("✅ Loan created successfully.");
      setForm({ book: "", member: "", loan_date: "", return_date: "" });
      fetchLoans();
    } catch (err: any) {
      handleBackendError(err, "create");
    }
  };

  const updateLoan = async () => {
    if (!editingLoan) return;
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:8000/api/method/library_management.api.loan.update_loan", null, {
        params: { loan_id: editingLoan.name, data: JSON.stringify(form) },
        withCredentials: true,
      });
      setSuccess("✅ Loan updated successfully.");
      setEditingLoan(null);
      setForm({ book: "", member: "", loan_date: "", return_date: "" });
      fetchLoans();
    } catch (err: any) {
      handleBackendError(err, "update");
    }
  };

  const deleteLoan = async (loanId: string) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;
    setError(null);
    setSuccess(null);
    try {
      await axios.post("http://localhost:8000/api/method/library_management.api.loan.delete_loan", null, {
        params: { loan_id: loanId },
        withCredentials: true,
      });
      setSuccess("🗑️ Loan deleted successfully.");
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || "❌ Failed to delete loan.");
    }
  };

  const startEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setForm({
      book: loan.book,
      member: loan.member,
      loan_date: loan.loan_date,
      return_date: loan.return_date || "",
    });
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingLoan(null);
    setForm({ book: "", member: "", loan_date: "", return_date: "" });
    setError(null);
    setSuccess(null);
  };

  const getMemberName = (id: string) => members.find((m) => m.name === id)?.fullname || id;
  const getBookTitle = (id: string) => books.find((b) => b.name === id)?.title || id;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📚 Loan Management</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {isLibrarian && (
        <div className="bg-white border rounded p-6 mb-6 shadow">
          <h3 className="text-xl font-semibold mb-4">{editingLoan ? "Edit Loan" : "Add New Loan"}</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingLoan ? updateLoan() : createLoan();
            }}
            className="space-y-4"
          >
            <select
              name="member"
              value={form.member}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.fullname}
                </option>
              ))}
            </select>

            <select
              name="book"
              value={form.book}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Book --</option>
              {books.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.title}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="loan_date"
              value={form.loan_date}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />

            <input
              type="date"
              name="return_date"
              value={form.return_date}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {editingLoan ? "Update Loan" : "Add Loan"}
              </button>
              {editingLoan && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">Loan List</h3>
      {loading ? (
        <p>Loading loans...</p>
      ) : loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 border">Member</th>
                <th className="p-2 border">Book</th>
                <th className="p-2 border">Loan Date</th>
                <th className="p-2 border">Return Date</th>
                {isLibrarian && <th className="p-2 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.name} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{getMemberName(loan.member)}</td>
                  <td className="p-2 border">{getBookTitle(loan.book)}</td>
                  <td className="p-2 border">{loan.loan_date}</td>
                  <td className="p-2 border">{loan.return_date}</td>
                  {isLibrarian && (
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => startEdit(loan)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLoan(loan.name)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}