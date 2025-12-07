import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiAlertCircle } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const AdminTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/templates');
      setTemplates(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`http://localhost:5000/api/templates/${templateToDelete._id}`, config);
      toast.success('Template deleted successfully');
      setTemplates(templates.filter(t => t._id !== templateToDelete._id));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Manage Templates</h1>
            <p className="text-slate-500 mt-1">View, edit, or delete gift card templates</p>
          </div>
          <Button
            onClick={() => navigate('/admin/templates/create')}
            icon={FiPlus}
          >
            Create New
          </Button>
        </div>

        {templates.length === 0 ? (
          <EmptyState
            title="No templates found"
            description="Get started by creating your first template."
            icon={FiLayers}
            action={
              <Button onClick={() => navigate('/admin/templates/create')}>
                Create Template
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      alt={template.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}

                  <div
                    className={`w-full h-full absolute inset-0 flex items-center justify-center bg-gradient-to-br ${template.category === 'wedding' ? 'from-pink-400 to-rose-500' :
                      template.category === 'party' ? 'from-purple-500 to-indigo-600' :
                        template.category === 'business' ? 'from-blue-400 to-slate-600' :
                          'from-slate-400 to-slate-600'
                      }`}
                    style={{ display: template.thumbnailUrl ? 'none' : 'flex' }}
                  >
                    <span className="text-white font-bold text-xl drop-shadow-md">{template.name}</span>
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/templates/edit/${template._id}`)}
                      icon={FiEdit2}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(template)}
                      icon={FiTrash2}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{template.description}</p>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Delete Template?</h3>
                  <p className="text-slate-500 text-sm">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <strong>{templateToDelete?.name}</strong>?
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Delete Template
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTemplates;
