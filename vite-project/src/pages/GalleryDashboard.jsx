import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiFolder, FiLock, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { createFolder, getFolders, verifyFolderPassword, deleteFolder } from '../api/folderApi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

/**
 * GalleryDashboard Component
 * Main dashboard for viewing and managing photo albums
 */
const GalleryDashboard = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPassword, setNewFolderPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Selected folder states
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);

  // Loading states
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await getFolders();
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handle create folder
   */
  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (!newFolderName.trim()) {
      toast.error('Please enter an album name');
      return;
    }

    if (newFolderPassword && newFolderPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setCreating(true);
      await createFolder(newFolderName, newFolderPassword);
      toast.success('Album created successfully!');
      closeCreateModal();
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
      closeDeleteModal();
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
    <div>
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Albums</h1>
          <p className="text-slate-500">Manage and organize your photo collections</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <FiPlus className="w-5 h-5" />
          Create Album
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search albums..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Folders Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredFolders.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No albums found' : 'No albums yet'}
            description={searchQuery ? 'Try adjusting your search terms' : 'Create your first album to get started!'}
            actionLabel={!searchQuery && "Create Album"}
            onAction={!searchQuery ? () => setShowCreateModal(true) : undefined}
            icon={FiFolder}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFolders.map((folder) => (
              <Card
                key={folder._id}
                className="group cursor-pointer relative"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  {/* Folder Icon / Preview */}
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <FiFolder className="w-10 h-10" />
                  </div>

                  {folder.isProtected && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-600 p-1.5 rounded-full">
                      <FiLock className="w-4 h-4" />
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                    <button
                      onClick={(e) => handleDeleteClick(e, folder)}
                      className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                      title="Delete album"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                    {folder.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeIn">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Album</h3>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Album Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter album name..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password (Optional)</label>
                <input
                  type="password"
                  value={newFolderPassword}
                  onChange={(e) => setNewFolderPassword(e.target.value)}
                  placeholder="Set password to protect..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={creating}
                />
              </div>

              {newFolderPassword && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    disabled={creating}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeCreateModal}
                  className="flex-1"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={creating}
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Password Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-600">
                <FiLock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Protected Album</h3>
              <p className="text-slate-500 text-sm mt-1">Enter password to access "{selectedFolder?.name}"</p>
            </div>

            <form onSubmit={handleVerifyAccess} className="space-y-4">
              <input
                type="password"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
                disabled={verifying}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeAccessModal}
                  className="flex-1"
                  disabled={verifying}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={verifying}
                >
                  Unlock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Password Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                <FiTrash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Delete Protected Album</h3>
              <p className="text-slate-500 text-sm mt-1">Enter password to delete "{folderToDelete?.name}"</p>
            </div>

            <form onSubmit={handleDeleteWithPassword} className="space-y-4">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password to confirm..."
                className="w-full px-4 py-2 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                autoFocus
                disabled={deleting}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDeleteModal}
                  className="flex-1"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  className="flex-1"
                  isLoading={deleting}
                >
                  Delete
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryDashboard;
