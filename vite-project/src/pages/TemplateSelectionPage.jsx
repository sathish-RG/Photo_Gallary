import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllTemplates } from '../api/templateApi';
import { toast } from 'react-toastify';

const TemplateSelectionPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Choose a Template
          </h1>
          <p className="text-xl text-gray-600">
            Start with a beautiful design or create your own from scratch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Start from Scratch Option */}
          <div
            onClick={() => handleSelectTemplate(null)}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-pink-500 flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-50 transition-colors">
                <svg className="w-10 h-10 text-gray-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Start from Scratch</h3>
              <p className="text-gray-500">Build your gift card exactly how you want it</p>
            </div>
          </div>

          {/* Template Cards */}
          {templates.map((template) => (
            <div
              key={template._id}
              onClick={() => handleSelectTemplate(template._id)}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-pink-500"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48 overflow-hidden">
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                  {template.name}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    Fully Customizable
                  </span>
                  <span className="text-pink-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    Select →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectionPage;
