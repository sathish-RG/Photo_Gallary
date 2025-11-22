import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFolders, createFolder, deleteFolder, verifyFolderPassword } from '../api/folderApi';

/**
 * GalleryDashboard Component
 * Enhanced UI with search, modals, and password protection
 */
const GalleryDashboard = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create folder modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPassword, setNewFolderPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Access password modal state
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [accessPassword, setAccessPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Delete password modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

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

  // Filter folders based on search query
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, searchQuery]);

  /**
   * Handle create folder
   */
  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    // Validate password confirmation if password is provided
    if (newFolderPassword.trim()) {
      if (newFolderPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    try {
      setCreating(true);
      await createFolder(newFolderName.trim(), newFolderPassword.trim() || null);
      toast.success('Album created successfully!');
      setShowCreateModal(false);
      setNewFolderName('');
      setNewFolderPassword('');
      setConfirmPassword('');
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.error || 'Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  /**
   * Handle folder click - check if protected
   */
  const handleFolderClick = (folder) => {
    if (folder.isProtected) {
      setSelectedFolder(folder);
      setShowAccessModal(true);
      setAccessPassword('');
    } else {
      navigate(`/gallery/${folder._id}`);
    }
  };

  /**
   * Verify access password and navigate
   */
  const handleVerifyAccess = async (e) => {
    e.preventDefault();

    if (!accessPassword) {
      toast.error('Please enter a password');
      return;
    }

    try {
      setVerifying(true);
      await verifyFolderPassword(selectedFolder._id, accessPassword);
      toast.success('Access granted!');
      setShowAccessModal(false);
      navigate(`/gallery/${selectedFolder._id}`);
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error(error.response?.data?.error || 'Incorrect password');
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Handle delete folder click
   */
  const handleDeleteClick = (e, folder) => {
    e.stopPropagation();

    if (folder.isProtected) {
      // Show password modal for protected folders
      setFolderToDelete(folder);
      setShowDeleteModal(true);
      setDeletePassword('');
    } else {
      // Show confirmation for unprotected folders
      if (window.confirm(`Are you sure you want to delete "${folder.name}"? This will delete all photos inside.`)) {
        performDelete(folder._id, null);
      }
    }
  };

  /**
   * Handle delete with password verification
   */
  const handleDeleteWithPassword = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error('Please enter a password');
      return;
    }

    await performDelete(folderToDelete._id, deletePassword);
  };

  /**
   * Perform folder deletion
   */
  const performDelete = async (folderId, password) => {
    try {
      setDeleting(true);
      await deleteFolder(folderId, password);
      toast.success('Album deleted successfully!');
      setShowDeleteModal(false);
      setFolderToDelete(null);
      setDeletePassword('');
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error(error.response?.data?.error || 'Failed to delete folder');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Close modals
   */
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewFolderName('');
    setNewFolderPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const closeAccessModal = () => {
    setShowAccessModal(false);
    setSelectedFolder(null);
    setAccessPassword('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFolderToDelete(null);
    setDeletePassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg mb-4">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
            My Photo Albums
          </h1>
          <p className="text-gray-600 text-lg">Organize your photos into albums</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search albums..."
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-lg border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-lg text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Create Album Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg transform hover:scale-105"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Album
          </button>
        </div>

        {/* Folders Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {searchQuery ? `Search Results (${filteredFolders.length})` : `Your Albums (${folders.length})`}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
            </div>
          ) : filteredFolders.length === 0 ? (
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
              <h3 className="mt-4 text-xl font-medium text-gray-600">
                {searchQuery ? 'No albums found' : 'No albums yet'}
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Create your first album to organize your photos!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFolders.map((folder) => (
                <div
                  key={folder._id}
                  className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] border border-pink-100"
                >
                  <div onClick={() => handleFolderClick(folder)} className="block p-6 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg relative">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {folder.isProtected && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                            <svg className="h-3 w-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(folder.createdAt).toLocaleDateString()}
                          {folder.isProtected && <span className="ml-2 text-yellow-600">🔒</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteClick(e, folder)}
                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 transition-colors p-2 rounded-full hover:bg-rose-50 opacity-0 group-hover:opacity-100"
                    title="Delete album"
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

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-pink-100">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Create New Album</h3>
              <p className="text-gray-600">Organize your photos into a new album</p>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Album Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter album name..."
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  autoFocus
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newFolderPassword}
                    onChange={(e) => setNewFolderPassword(e.target.value)}
                    placeholder="Set password to protect..."
                    className="w-full px-4 py-3 pr-12 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                    disabled={creating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {newFolderPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password..."
                      className="w-full px-4 py-3 pr-12 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                      disabled={creating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all shadow-lg"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Password Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-pink-100">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Protected Album</h3>
              <p className="text-gray-600">Enter password to access "{selectedFolder?.name}"</p>
            </div>

            <form onSubmit={handleVerifyAccess} className="space-y-4">
              <input
                type="password"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                autoFocus
                disabled={verifying}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeAccessModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  disabled={verifying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all shadow-lg"
                >
                  {verifying ? 'Verifying...' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Password Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-pink-100">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Protected Album</h3>
              <p className="text-gray-600">Enter password to delete "{folderToDelete?.name}"</p>
              <p className="text-sm text-rose-600 mt-2">⚠️ This will delete all photos inside!</p>
            </div>

            <form onSubmit={handleDeleteWithPassword} className="space-y-4">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password to confirm..."
                className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                autoFocus
                disabled={deleting}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-red-600 disabled:opacity-50 transition-all shadow-lg"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryDashboard;
