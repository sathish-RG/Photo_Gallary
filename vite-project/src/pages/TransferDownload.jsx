import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiClock, FiFile, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { getTransferBySlug, downloadTransferZip } from '../api/transferApi';

const TransferDownload = () => {
  const { slug } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchTransfer();
  }, [slug]);

  const fetchTransfer = async () => {
    try {
      const response = await getTransferBySlug(slug);
      setTransfer(response.data);
    } catch (error) {
      console.error('Error fetching transfer:', error);
      toast.error('Transfer not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    toast.loading('Preparing download...');
    downloadTransferZip(slug);
    setTimeout(() => {
      setDownloading(false);
      toast.dismiss();
      toast.success('Download started!');
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimeRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Transfer Not Found</h2>
          <p className="text-slate-600">This transfer link is invalid or has been deleted.</p>
        </Card>
      </div>
    );
  }

  if (transfer.isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <FiClock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Transfer Expired</h2>
          <p className="text-slate-600">This transfer has expired and is no longer available for download.</p>
        </Card>
      </div>
    );
  }

  if (transfer.limitReached) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Download Limit Reached</h2>
          <p className="text-slate-600">This transfer has reached its maximum download limit.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFile className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Files Shared With You</h1>
            {transfer.sender && (
              <p className="text-slate-600">From: <span className="font-semibold">{transfer.sender}</span></p>
            )}
          </div>

          {transfer.message && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 italic">"{transfer.message}"</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Files</p>
              <p className="text-2xl font-bold text-slate-800">{transfer.filesCount}</p>
            </div>
            <div className="bg-slate-50  rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Total Size</p>
              <p className="text-2xl font-bold text-slate-800">{formatFileSize(transfer.totalSize)}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <FiClock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {formatTimeRemaining(transfer.expiryDate)}
              </p>
              {transfer.maxDownloads && (
                <p className="text-xs text-blue-700">
                  {transfer.maxDownloads - transfer.downloadCount} download{transfer.maxDownloads - transfer.downloadCount !== 1 ? 's' : ''} left
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-slate-800">Files Included:</h3>
            {transfer.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <FiFile className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{file.filename}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.fileSize)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleDownload}
            isLoading={downloading}
            className="w-full flex items-center justify-center gap-2"
          >
            <FiDownload className="w-5 h-5" />
            Download All Files
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default TransferDownload;
