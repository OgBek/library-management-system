import React, { useEffect, useState } from "react";
import axios from "axios";

type Book = {
  name: string;
  title: string;
  author: string;
  isbn: string;
  publish_date: string;
};

export default function BookCRUD() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publish_date: "",
  });

  const rolesStr = sessionStorage.getItem("roles") || "[]";
  let roles: string[] = [];
  try {
    roles = JSON.parse(rolesStr);
  } catch {
    roles = [];
  }
  const isLibrarian = roles.includes("Librarian");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/method/library_management.api.book.get_books",
        { withCredentials: true }
      );
      setBooks(res.data.message);
      setError(null);
    } catch (err: any) {
      setError("Failed to load books. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const createBook = async () => {
    setError(null);
    setSuccess(null);
    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.book.create_book",
        null,
        {
          params: { data: JSON.stringify(form) },
          withCredentials: true,
        }
      );
      setSuccess("Book added successfully.");
      setForm({ title: "", author: "", isbn: "", publish_date: "" });
      fetchBooks();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to create book. Please ensure you have Librarian permissions.";
      setError(msg);
    }
  };

  const updateBook = async () => {
    if (!editingBook) return;
    setError(null);
    setSuccess(null);
    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.book.update_book",
        null,
        {
          params: { book_id: editingBook.name, data: JSON.stringify(form) },
          withCredentials: true,
        }
      );
      setSuccess("Book updated successfully.");
      setEditingBook(null);
      setForm({ title: "", author: "", isbn: "", publish_date: "" });
      fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update book.";
      setError(msg);
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    setError(null);
    setSuccess(null);
    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.book.delete_book",
        null,
        {
          params: { book_id: bookId },
          withCredentials: true,
        }
      );
      setSuccess("Book deleted successfully.");
      fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete book.";
      setError(msg);
    }
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publish_date: book.publish_date || "",
    });
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setForm({ title: "", author: "", isbn: "", publish_date: "" });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Books Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {isLibrarian && (
        <div className="border border-gray-300 rounded p-6 mb-8 shadow-sm">
          <h3 className="text-xl font-medium mb-4">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingBook ? updateBook() : createBook();
            }}
            className="flex flex-col space-y-4"
          >
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={form.isbn}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              name="publish_date"
              placeholder="Publish Date"
              value={form.publish_date}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
              >
                {editingBook ? "Update Book" : "Add Book"}
              </button>
              {editingBook && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <h3 className="text-2xl font-semibold mb-4">Book List</h3>
      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 shadow-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Author</th>
              <th className="border border-gray-300 px-4 py-2 text-left">ISBN</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Publish Date</th>
              {isLibrarian && (
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr
                key={book.name}
                className="hover:bg-gray-50 even:bg-gray-100"
              >
                <td className="border border-gray-300 px-4 py-2">{book.title}</td>
                <td className="border border-gray-300 px-4 py-2">{book.author}</td>
                <td className="border border-gray-300 px-4 py-2">{book.isbn}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {book.publish_date || "-"}
                </td>
                {isLibrarian && (
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(book)}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBook(book.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}