import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus, FiTrash2, FiDownload, FiDollarSign, FiFileText,
  FiCalendar, FiX, FiEdit2, FiEye
} from 'react-icons/fi';
import { getClients } from '../api/clientApi';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDF
} from '../api/invoiceApi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const BillingTab = () => {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }]);
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        getClients(),
        getInvoices(),
      ]);
      setClients(clientsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setSelectedClient(invoice.client._id || invoice.client);
      setItems(invoice.items);
      setStatus(invoice.status);
      setDueDate(new Date(invoice.dueDate).toISOString().split('T')[0]);
    } else {
      setEditingInvoice(null);
      setSelectedClient('');
      setItems([{ desc: '', qty: 1, price: 0 }]);
      setStatus('pending');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setSelectedClient('');
    setItems([{ desc: '', qty: 1, price: 0 }]);
    setStatus('pending');
    setDueDate('');
  };

  const handleAddItem = () => {
    setItems([...items, { desc: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'desc' ? value : parseFloat(value) || 0;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (items.some(item => !item.desc.trim())) {
      toast.error('All items must have a description');
      return;
    }

    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      setSubmitting(true);
      const invoiceData = {
        client: selectedClient,
        items,
        status,
        dueDate,
      };

      if (editingInvoice) {
        await updateInvoice(editingInvoice._id, invoiceData);
        toast.success('Invoice updated successfully!');
      } else {
        await createInvoice(invoiceData);
        toast.success('Invoice created successfully!');
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-gen' });
      await generateInvoicePDF(invoiceId);
      toast.success('PDF downloaded successfully!', { id: 'pdf-gen' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-gen' });
    }
  };

  const handleDeleteInvoice = async (invoiceId, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    try {
      await deleteInvoice(invoiceId);
      toast.success('Invoice deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const getClientName = (clientData) => {
    if (typeof clientData === 'object' && clientData.name) {
      return clientData.name;
    }
    const client = clients.find(c => c._id === clientData);
    return client ? client.name : 'Unknown';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
          <p className="text-slate-500">Create and manage invoices for your clients</p>
        </div>
        <Button onClick={() => handleOpenModal()} disabled={clients.length === 0}>
          <FiPlus className="w-5 h-5" />
          Create Invoice
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card hoverEffect={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-800">{invoices.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </Card>

        <Card hoverEffect={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {invoices.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card hoverEffect={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <Card>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description={clients.length === 0
            ? "Add clients first before creating invoices"
            : "Create your first invoice to get started!"}
          actionLabel={clients.length > 0 ? "Create Invoice" : undefined}
          onAction={clients.length > 0 ? () => handleOpenModal() : undefined}
          icon={FiFileText}
        />
      ) : (
        <Card hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Invoice #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Due Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700">{getClientName(invoice.client)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        ${invoice.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {invoice.status === 'paid' ? '✓ Paid' : '⏱ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 text-sm">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPDF(invoice._id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(invoice)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit invoice"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice._id, invoice.invoiceNumber)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete invoice"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                  disabled={submitting}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Line Items <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAddItem}
                    disabled={submitting}
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <Card key={index} hoverEffect={false}>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-6">
                            <input
                              type="text"
                              value={item.desc}
                              onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                              placeholder="Description (e.g., Wedding Shoot)"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              required
                              disabled={submitting}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                              placeholder="Qty"
                              min="1"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              required
                              disabled={submitting}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              placeholder="Price"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              required
                              disabled={submitting}
                            />
                          </div>
                          <div className="md:col-span-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                              ${(item.qty * item.price).toFixed(2)}
                            </span>
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                disabled={submitting}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-end">
                <div className="bg-slate-50 px-6 py-4 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Total Amount</div>
                  <div className="text-3xl font-bold text-primary">
                    ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                    disabled={submitting}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={submitting}
                >
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTab;
