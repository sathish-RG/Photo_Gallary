import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiX, FiFile, FiCopy, FiCheck, FiFolder, FiImage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { createTransfer, createTransferFromMedia } from '../api/transferApi';
import { getFolders } from '../api/folderApi';
import { getMedia } from '../api/mediaApi';

const SendFiles = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'albums'

  // Upload tab state
  const [files, setFiles] = useState([]);

  // Albums tab state
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderPhotos, setFolderPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Common state
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [uploading, setUploading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTab === 'albums') {
      fetchFolders();
    }
  }, [activeTab]);

  const fetchFolders = async () => {
    setLoadingFolders(true);
    try {
      const response = await getFolders();
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load albums');
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchFolderPhotos = async (folderId) => {
    setLoadingPhotos(true);
    try {
      const response = await getMedia(folderId);
      setFolderPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setSelectedPhotos([]);
    fetchFolderPhotos(folder._id);
  };

  const togglePhotoSelection = (photo) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.find((p) => p._id === photo._id);
      if (isSelected) {
        return prev.filter((p) => p._id !== photo._id);
      } else {
        return [...prev, photo];
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    maxSize: 100 * 1024 * 1024,
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === 'upload' && files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (activeTab === 'albums' && selectedPhotos.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploading(true);

    try {
      let response;

      if (activeTab === 'upload') {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('message', message);
        formData.append('recipientEmail', recipientEmail);
        formData.append('expiryDays', expiryDays);
        response = await createTransfer(formData);
      } else {
        response = await createTransferFromMedia({
          mediaIds: selectedPhotos.map((p) => p._id),
          message,
          recipientEmail,
          expiryDays,
        });
      }

      setShareLink(response.data.shareLink);
      toast.success('Files ready to share!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to create transfer');
    } finally {
      setUploading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFiles([]);
    setSelectedPhotos([]);
    setSelectedFolder(null);
    setMessage('');
    setRecipientEmail('');
    setExpiryDays(7);
    setShareLink('');
  };

  const totalSize = activeTab === 'upload'
    ? files.reduce((sum, file) => sum + file.size, 0)
    : selectedPhotos.reduce((sum, photo) => sum + (photo.fileSize || 0), 0);

  if (shareLink) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Files Ready to Share!</h2>
            <p className="text-slate-600">Share this link with your recipient</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
              />
              <Button onClick={copyLink} variant="secondary">
                {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={resetForm} variant="secondary" className="flex-1">
              Send More Files
            </Button>
            <Button onClick={() => navigate('/transfers')} className="flex-1">
              View My Transfers
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Send Files</h1>
        <p className="text-slate-600">Upload new files or share from your albums</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'upload'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
        >
          <FiUploadCloud className="w-5 h-5 inline mr-2" />
          Upload Files
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'albums'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
        >
          <FiFolder className="w-5 h-5 inline mr-2" />
          Select from Albums
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <Card className="p-6 mb-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                }`}
            >
              <input {...getInputProps()} />
              <FiUploadCloud className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700 mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-slate-500">or click to browse (max 100MB per file)</p>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Selected Files ({files.length}) - {formatFileSize(totalSize)}
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FiFile className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{file.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <FiX className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Albums Tab */}
        {activeTab === 'albums' && (
          <Card className="p-6 mb-6">
            {!selectedFolder ? (
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Select an Album</h3>
                {loadingFolders ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {folders.map((folder) => (
                      <button
                        key={folder._id}
                        type="button"
                        onClick={() => handleFolderClick(folder)}
                        className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
                      >
                        <FiFolder className="w-6 h-6 text-primary" />
                        <span className="font-medium text-slate-800">{folder.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">
                    {selectedFolder.name} - Select Photos
                  </h3>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedFolder(null);
                      setSelectedPhotos([]);
                    }}
                    variant="secondary"
                    className="text-sm"
                  >
                    Change Album
                  </Button>
                </div>

                {loadingPhotos ? (
                  <div className="grid grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 mb-3">
                      {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {folderPhotos.map((photo) => {
                        const isSelected = selectedPhotos.find((p) => p._id === photo._id);
                        return (
                          <div
                            key={photo._id}
                            onClick={() => togglePhotoSelection(photo)}
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${isSelected ? 'border-primary' : 'border-transparent'
                              }`}
                          >
                            <img
                              src={photo.filePath}
                              alt={photo.caption || 'Photo'}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <FiCheck className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Transfer Details */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Transfer Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for the recipient..."
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recipient Email (Optional)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expires After
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          isLoading={uploading}
          disabled={(activeTab === 'upload' && files.length === 0) || (activeTab === 'albums' && selectedPhotos.length === 0)}
          className="w-full"
        >
          {uploading ? 'Creating Transfer...' : 'Create Transfer Link'}
        </Button>
      </form>
    </div>
  );
};

export default SendFiles;
