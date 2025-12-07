import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTemplates } from '../api/templateApi';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEye, FiCheck, FiLayers } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const TemplateSelectionPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getAllTemplates();
        setTemplates(response.data.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectTemplate = (templateId) => {
    if (templateId) {
      navigate(`/gallery/${folderId}/create-gift-card?templateId=${templateId}`);
    } else {
      navigate(`/gallery/${folderId}/create-gift-card`);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      party: 'bg-purple-500',
      wedding: 'bg-pink-500',
      retro: 'bg-amber-500',
      modern: 'bg-blue-500',
      elegant: 'bg-rose-500',
      birthday: 'bg-green-500',
      anniversary: 'bg-red-500',
      minimal: 'bg-slate-500',
      other: 'bg-indigo-500'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-slate-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-slate-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Template
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start with a stunning pre-designed template or create your own masterpiece from scratch
          </p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Start from Scratch Option */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => handleSelectTemplate(null)}
            className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <FiPlus className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Start from Scratch</h3>
              <p className="text-slate-600 mb-6">Build your gift card exactly how you want it with complete creative freedom</p>
              <Button
                variant="ghost"
                className="text-primary group-hover:text-primary-hover"
              >
                Create Now
              </Button>
            </div>
          </motion.div>

          {/* Template Cards */}
          {templates.map((template, index) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredTemplate(template._id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
            >
              {/* Thumbnail */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
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
                      template.category === 'retro' ? 'from-amber-400 to-orange-500' :
                        template.category === 'modern' ? 'from-blue-400 to-cyan-500' :
                          template.category === 'elegant' ? 'from-rose-400 to-slate-600' :
                            'from-slate-400 to-slate-600'
                    } transform group-hover:scale-105 transition-transform duration-500`}
                  style={{ display: template.thumbnailUrl ? 'none' : 'flex' }}
                >
                  <span className="text-white font-bold text-2xl drop-shadow-md px-4 text-center">{template.name}</span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`${getCategoryColor(template.category)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide`}>
                    {template.category}
                  </span>
                </div>

                {/* Hover Overlay with Buttons */}
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-300 ${hoveredTemplate === template._id ? 'opacity-100' : 'opacity-0'}`}>
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast('Preview feature coming soon!', { icon: '👁️' });
                    }}
                    icon={FiEye}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSelectTemplate(template._id)}
                    icon={FiCheck}
                  >
                    Use Template
                  </Button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {template.description || 'A beautiful template for your gift card'}
                </p>

                {/* Features */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FiLayers className="w-4 h-4" />
                    Fully Customizable
                  </div>
                  <div className="text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                    Select →
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="mt-12">
            <EmptyState
              title="No Templates Available"
              description="Run the seeder script to populate templates"
              icon={FiLayers}
              action={
                <code className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm font-mono mt-4 block">
                  node server/seedTemplates.js
                </code>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelectionPage;
