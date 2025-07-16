import React, { useEffect, useState } from "react";
import axios from "axios";

type Reservation = {
  name: string;
  book: string;
  book_title?: string;
  member: string;
  member_fullname?: string;
  reservation_date: string;
};

type Book = {
  name: string;
  title: string;
};

type Member = {
  name: string;
  fullname: string;
};

export default function ReservationCRUD() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ book: "", member: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");
  const isLibrarian = roles.includes("Librarian");

  useEffect(() => {
    fetchBooks();
    fetchMembers();
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/method/library_management.api.reservation.get_reservations",
        { withCredentials: true }
      );
      setReservations(res.data.message);
      setError(null);
    } catch {
      setError("❌ Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/resource/Book?fields=[\"name\",\"title\"]",
        { withCredentials: true }
      );
      setBooks(res.data.data);
    } catch {
      setError("❌ Failed to load books.");
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/resource/Member?fields=[\"name\",\"fullname\"]",
        { withCredentials: true }
      );
      setMembers(res.data.data);
    } catch {
      setError("❌ Failed to load members.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitReservation = async () => {
    try {
      const endpoint = editingId ? "update_reservation" : "create_reservation";
      const params = editingId
        ? { reservation_id: editingId, data: JSON.stringify(form) }
        : { data: JSON.stringify(form) };

      await axios.post(
        `http://localhost:8000/api/method/library_management.api.reservation.${endpoint}`,
        null,
        { params, withCredentials: true }
      );

      setForm({ book: "", member: "" });
      setEditingId(null);
      setSuccess(editingId ? "✅ Reservation updated successfully." : "✅ Reservation created successfully.");
      setError(null);
      fetchReservations();
    } catch (err: any) {
      setSuccess(null);

      let raw = err.response?.data?.message || "";
      if (!raw && err.response?.data?._server_messages) {
        try {
          const serverMessages = JSON.parse(err.response.data._server_messages);
          const parsed = JSON.parse(serverMessages[0]);
          raw = parsed.message || "";
        } catch {
          raw = "";
        }
      }

      const friendlyMap: { [key: string]: string } = {
        "already reserved this book today": "⚠️ This member already reserved this book today.",
        "currently available": "ℹ️ This book is currently available. No need to reserve it.",
        "already borrowed today": "⛔ The member already borrowed this book today.",
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
        setError("❌ Action failed. Please check your inputs or try again.");
      }
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.reservation.delete_reservation",
        null,
        {
          params: { reservation_id: id },
          withCredentials: true,
        }
      );
      setSuccess("✅ Reservation deleted.");
      setError(null);
      fetchReservations();
    } catch {
      setError("❌ Failed to delete reservation.");
    }
  };

  const startEdit = (res: Reservation) => {
    setForm({ book: res.book, member: res.member });
    setEditingId(res.name);
    setSuccess(null);
    setError(null);
  };

  const cancelEdit = () => {
    setForm({ book: "", member: "" });
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  if (!isLibrarian)
    return <p className="text-red-600 text-center mt-6">Unauthorized. Only librarians can handle reservations.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">📚 Handle Reservations</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitReservation();
        }}
        className="bg-white shadow rounded p-4 mb-6 border"
      >
        <h3 className="text-lg font-semibold mb-3">{editingId ? "Edit Reservation" : "Add Reservation"}</h3>

        <select
          name="book"
          value={form.book}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-3"
        >
          <option value="">📖 Select Book</option>
          {books.map((b) => (
            <option key={b.name} value={b.name}>
              {b.title}
            </option>
          ))}
        </select>

        <select
          name="member"
          value={form.member}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">👤 Select Member</option>
          {members.map((m) => (
            <option key={m.name} value={m.name}>
              {m.fullname}
            </option>
          ))}
        </select>

        <div className="flex items-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            {editingId ? "Update" : "Reserve"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-xl font-semibold mb-2">📄 All Reservations</h3>
      {loading ? (
        <p>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Book</th>
                <th className="border px-4 py-2 text-left">Member</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.name} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{res.book_title || res.book}</td>
                  <td className="border px-4 py-2">{res.member_fullname || res.member}</td>
                  <td className="border px-4 py-2">{res.reservation_date}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => startEdit(res)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReservation(res.name)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
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