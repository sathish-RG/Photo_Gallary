// src/pages/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserStatus } from '../api/adminApi';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'unbanned' : 'banned'} successfully`);
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error updating status', err);
      toast.error('Failed to update user status');
    }
  };

  const handleViewFiles = (userId) => {
    navigate(`/admin/users/${userId}/files`);
  };

  if (loading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Admin</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className={user.isActive ? '' : 'bg-red-100'}>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.isAdmin ? 'Yes' : 'No'}</td>
              <td className="border px-4 py-2">
                {user.isActive ? 'Active' : 'Banned'}
              </td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleToggleActive(user._id, user.isActive)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {user.isActive ? 'Ban' : 'Unban'}
                </button>
                <button
                  onClick={() => handleViewFiles(user._id)}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  View Files
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
