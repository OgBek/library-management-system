import React, { useEffect, useState } from "react";
import axios from "axios";

type Member = {
  name: string;
  fullname: string;
  membership_id: string;
  email: string;
  phone: string;
};

export default function MemberCRUD() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState({
    fullname: "",
    membership_id: "",
    email: "",
    phone: "",
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
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/method/library_management.api.member.get_members",
        { withCredentials: true }
      );
      setMembers(res.data.message);
    } catch {
      setError("❌ Failed to load members. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const validateClientForm = () => {
    if (!/^\+?\d{7,15}$/.test(form.phone)) {
      setError("📱 Phone number must be 7–15 digits, optionally starting with '+'.");
      return false;
    }
    return true;
  };

  const handleServerError = (err: any) => {
    const fallback = "❌ Failed to process request.";
    const raw = err.response?.data?.message || "";
    const serverMessages = err.response?.data?._server_messages;

    if (serverMessages) {
      try {
        const parsed = JSON.parse(serverMessages)[0];
        const msgObj = JSON.parse(parsed);
        const msg = msgObj.message;

        if (msg.includes("already exists")) {
          if (msg.includes("membership_id")) return setError("⚠️ Membership ID already exists.");
          if (msg.includes("email")) return setError("⚠️ Email already exists.");
        }

        if (msg.includes("valid email")) {
          return setError("✉️ Please enter a valid email address.");
        }

        return setError("❌ " + msg);
      } catch {
        return setError(fallback);
      }
    }

    setError(raw || fallback);
  };

  const createMember = async () => {
    if (!validateClientForm()) return;

    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.member.create_member",
        null,
        {
          params: { data: JSON.stringify(form) },
          withCredentials: true,
        }
      );
      setForm({ fullname: "", membership_id: "", email: "", phone: "" });
      setSuccess("✅ Member created successfully.");
      fetchMembers();
    } catch (err: any) {
      handleServerError(err);
    }
  };

  const updateMember = async () => {
    if (!editingMember) return;
    if (!validateClientForm()) return;

    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.member.update_member",
        null,
        {
          params: {
            member_id: editingMember.name,
            data: JSON.stringify(form),
          },
          withCredentials: true,
        }
      );
      setEditingMember(null);
      setForm({ fullname: "", membership_id: "", email: "", phone: "" });
      setSuccess("✅ Member updated successfully.");
      fetchMembers();
    } catch (err: any) {
      handleServerError(err);
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await axios.post(
        "http://localhost:8000/api/method/library_management.api.member.delete_member",
        null,
        {
          params: { member_id: memberId },
          withCredentials: true,
        }
      );
      setSuccess("🗑️ Member deleted successfully.");
      fetchMembers();
    } catch (err: any) {
      handleServerError(err);
    }
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setForm({
      fullname: member.fullname,
      membership_id: member.membership_id,
      email: member.email,
      phone: member.phone,
    });
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setForm({ fullname: "", membership_id: "", email: "", phone: "" });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">👥 Member Management</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {isLibrarian && (
        <div className="bg-white border p-6 rounded shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingMember ? "Edit Member" : "Add New Member"}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingMember ? updateMember() : createMember();
            }}
            className="space-y-4"
          >
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={form.fullname}
              onChange={handleInputChange}
              required
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              name="membership_id"
              placeholder="Membership ID"
              value={form.membership_id}
              onChange={handleInputChange}
              required
              className="w-full border rounded p-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
              required
              className="w-full border rounded p-2"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone (e.g. +251912345678)"
              value={form.phone}
              onChange={handleInputChange}
              required
              className="w-full border rounded p-2"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {editingMember ? "Update Member" : "Add Member"}
              </button>
              {editingMember && (
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

      <h3 className="text-lg font-semibold mb-2">Member List</h3>
      {loading ? (
        <p>Loading members...</p>
      ) : members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 border">Full Name</th>
                <th className="p-2 border">Membership ID</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                {isLibrarian && <th className="p-2 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.name} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{member.fullname}</td>
                  <td className="p-2 border">{member.membership_id}</td>
                  <td className="p-2 border">{member.email}</td>
                  <td className="p-2 border">{member.phone}</td>
                  {isLibrarian && (
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => startEdit(member)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMember(member.name)}
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