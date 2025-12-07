import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiFolder, FiTrash2, FiPlus } from 'react-icons/fi';
import { getFolders, createFolder, deleteFolder } from '../api/folderApi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

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

  const handleDeleteFolder = async (e, folderId, folderName) => {
    e.preventDefault(); // Prevent navigation
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4 text-primary">
            <FiFolder className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            My Folders
          </h1>
          <p className="text-slate-500 text-lg">Organize your photos into albums</p>
        </div>

        {/* Create Folder Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-slate-200 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Create New Folder
          </h2>

          <form onSubmit={handleCreateFolder} className="flex gap-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              disabled={creating}
            />
            <Button
              type="submit"
              isLoading={creating}
              className="px-8"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create
            </Button>
          </form>
        </div>

        {/* Folders Grid */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Your Folders ({folders.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <EmptyState
              title="No folders yet"
              description="Create your first folder to organize your photos!"
              icon={FiFolder}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <Link key={folder._id} to={`/gallery?folderId=${folder._id}`}>
                  <Card className="group relative hover:border-primary/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FiFolder className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteFolder(e, folder._id, folder.name)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                      title="Delete folder"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderList;
