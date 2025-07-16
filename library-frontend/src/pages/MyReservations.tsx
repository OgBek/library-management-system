import React, { useEffect, useState } from "react";
import axios from "axios";

type Reservation = {
  name: string;
  book: string;
  book_title: string;
  reservation_date: string;
};

type Book = {
  name: string;
  title: string;
};

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchBooks();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/method/library_management.api.reservation_api.get_my_reservations",
        { withCredentials: true }
      );
      setReservations(res.data.message);
      setError(null);
    } catch {
      setError("❌ Failed to load your reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/resource/Book?fields=[\"name\",\"title\"]&limit_page_length=100",
        { withCredentials: true }
      );
      setBooks(res.data.data);
    } catch {
      setError("❌ Failed to load book list.");
    }
  };

  const createReservation = async () => {
    if (!selectedBook) {
      setError("⚠️ Please select a book to reserve.");
      return;
    }

    try {
      setCreating(true);
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.reservation_api.create_my_reservation",
        null,
        {
          params: { book_name: selectedBook },
          withCredentials: true,
        }
      );
      setSelectedBook("");
      setSuccess("✅ Reservation created successfully.");
      setError(null);
      fetchReservations();
    } catch (e: any) {
      setSuccess(null);

      // Extract message from standard or _server_messages
      let raw = e.response?.data?.message || "";

      if (!raw && e.response?.data?._server_messages) {
        try {
          const serverMessages = JSON.parse(e.response.data._server_messages);
          const parsed = JSON.parse(serverMessages[0]);
          raw = parsed.message || "";
        } catch {
          raw = "";
        }
      }

      console.error("Backend error message:", raw);

      const friendlyMap: { [key: string]: string } = {
        "already reserved this book today": "⚠️ You already reserved this book today.",
        "currently available": "ℹ️ This book is available. Please make a loan instead.",
        "already borrowed today": "⛔ You already borrowed this book today.",
        "No member record": "❌ Your account is not linked to a member. Please contact the librarian.",
      };

      let matched = false;
      for (const key in friendlyMap) {
        if (raw.toLowerCase().includes(key)) {
          setError(friendlyMap[key]);
          matched = true;
          break;
        }
      }

      if (!matched) {
        setError("❌ Failed to create reservation. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.reservation_api.cancel_my_reservation",
        null,
        {
          params: { reservation_id: id },
          withCredentials: true,
        }
      );
      setSuccess("✅ Reservation cancelled.");
      setError(null);
      fetchReservations();
    } catch {
      setError("❌ Failed to cancel reservation.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📚 My Reservations</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {/* Reservation Form */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
        <select
          className="border rounded px-3 py-2 w-full max-w-md"
          value={selectedBook}
          onChange={(e) => {
            setSelectedBook(e.target.value);
            setError(null);
            setSuccess(null);
          }}
          disabled={creating}
        >
          <option value="">-- Select Book to Reserve --</option>
          {books.map((book) => (
            <option key={book.name} value={book.name}>
              {book.title}
            </option>
          ))}
        </select>
        <button
          onClick={createReservation}
          disabled={creating || !selectedBook}
          className={`px-4 py-2 rounded transition ${
            creating || !selectedBook
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {creating ? "Reserving..." : "Reserve"}
        </button>
      </div>

      {/* Reservation List */}
      {loading ? (
        <p className="text-gray-600">Loading your reservations...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-600">You have no reservations.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 border text-left">Book</th>
                <th className="p-2 border text-left">Date</th>
                <th className="p-2 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.name} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{res.book_title || res.book}</td>
                  <td className="p-2 border">{res.reservation_date}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => cancelReservation(res.name)}
                      className="text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}