import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiCopy, FiTrash2, FiClock, FiDownload, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { getUserTransfers, deleteTransfer } from '../api/transferApi';

const MyTransfers = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await getUserTransfers();
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transfer? This will also delete all files.')) {
      return;
    }

    try {
      await deleteTransfer(id);
      setTransfers((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transfer deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete transfer');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredTransfers = transfers.filter((transfer) => {
    if (filter === 'active') return !transfer.isExpired;
    if (filter === 'expired') return transfer.isExpired;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Transfers</h1>
          <p className="text-slate-600">Manage your file transfers</p>
        </div>
        <Button onClick={() => navigate('/send-files')} className="flex items-center gap-2">
          <FiSend className="w-5 h-5" />
          Send Files
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <FiFilter className="w-5 h-5 text-slate-400" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All ({transfers.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Active ({transfers.filter((t) => !t.isExpired).length})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'expired'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Expired ({transfers.filter((t) => t.isExpired).length})
            </button>
          </div>
        </div>
      </Card>

      {filteredTransfers.length === 0 ? (
        <EmptyState
          title="No transfers found"
          description="Send files to get started"
          icon={FiSend}
          action={{
            label: 'Send Files',
            onClick: () => navigate('/send-files'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">
                      {transfer.filesCount} File{transfer.filesCount > 1 ? 's' : ''} - {formatFileSize(transfer.totalSize)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${transfer.isExpired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                        }`}
                    >
                      {transfer.isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  {transfer.message && (
                    <p className="text-slate-600 mb-3 italic">"{transfer.message}"</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>Created {formatDate(transfer.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>Expires {formatDate(transfer.expiryDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiDownload className="w-4 h-4" />
                      <span>{transfer.downloadCount} downloads</span>
                    </div>
                  </div>

                  {!transfer.isExpired && (
                    <div className="mt-3 bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={transfer.shareLink}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-slate-600 focus:outline-none"
                      />
                      <Button
                        onClick={() => copyLink(transfer.shareLink)}
                        variant="secondary"
                        className="flex-shrink-0"
                      >
                        <FiCopy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleDelete(transfer.id)}
                  variant="danger"
                  className="ml-4"
                >
                  <FiTrash2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTransfers;
