import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiDownload, FiPackage, FiHash } from 'react-icons/fi';
import Button from '../components/ui/Button';

const AdminBatchGenerator = () => {
  const [quantity, setQuantity] = useState(50);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!quantity || !batchName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/admin/generate-batch',
        { quantity, batchName },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob', // Important for ZIP download
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${batchName.replace(/\s+/g, '-')}-qrcodes.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Batch generated successfully!');
      setBatchName('');
    } catch (error) {
      console.error('Error generating batch:', error);
      toast.error('Failed to generate batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Batch QR Code Generator</h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Generate New Batch</h2>
              <p className="text-slate-500 text-sm">Create bulk QR codes for printing</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Batch Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g., Holiday-2025-Batch-001"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHash className="text-slate-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Max 1000 per batch</p>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3"
              icon={FiDownload}
            >
              Generate & Download ZIP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminBatchGenerator;
