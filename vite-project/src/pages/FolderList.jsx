import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFolders, createFolder, deleteFolder } from '../api/folderApi';

/**
 * FolderList Component
 * Displays user's folders and allows creating new folders
 */
const FolderList = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await getFolders();
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      setCreating(true);
      await createFolder(newFolderName.trim());
      toast.success('Folder created successfully!');
      setNewFolderName('');
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.error || 'Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete "${folderName}"?`)) {
      return;
    }

    try {
      await deleteFolder(folderId);
      toast.success('Folder deleted successfully!');
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error(error.response?.data?.error || 'Failed to delete folder');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg mb-4">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
            My Folders
          </h1>
          <p className="text-gray-600 text-lg">Organize your photos into albums</p>
        </div>

        {/* Create Folder Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-10 border border-pink-100">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">
            Create New Folder
          </h2>

          <form onSubmit={handleCreateFolder} className="flex gap-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="flex-1 px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        {/* Folders Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Your Folders ({folders.length})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-pink-100">
              <svg
                className="mx-auto h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-600">No folders yet</h3>
              <p className="mt-2 text-gray-500">Create your first folder to organize your photos!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <div
                  key={folder._id}
                  className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] border border-pink-100"
                >
                  <Link to={`/gallery?folderId=${folder._id}`} className="block p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteFolder(folder._id, folder.name)}
                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 transition-colors p-2 rounded-full hover:bg-rose-50 opacity-0 group-hover:opacity-100"
                    title="Delete folder"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderList;
