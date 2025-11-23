import React, { useEffect, useState } from 'react';
import { Plus, Search, Eye, Download, Printer, Trash2 as TrashIcon } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { billingAPI, patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import BillingForm from '../components/BillingForm';
import BillingDetail from '../components/BillingDetail';

function BillingManagement() {
  const { billingRecords, setBillingRecords, patients, setPatients, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Total');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filteredBills, setFilteredBills] = useState([]);

  useEffect(() => {
    loadBillingData();
  }, []);

  useEffect(() => {
    filterBills();
  }, [billingRecords, searchTerm, filterStatus]);

  const loadBillingData = async () => {
    try {
      const billResponse = await billingAPI.getAll();
      const patientResponse = await patientAPI.getAll();

      if (billResponse.success) {
        setBillingRecords(billResponse.data);
      }
      if (patientResponse.success) {
        setPatients(patientResponse.data);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
      const offlineBills = await offlineDB.getAllBillingRecords();
      const offlinePatients = await offlineDB.getAllPatients();
      setBillingRecords(offlineBills);
      setPatients(offlinePatients);
    }
  };

  const filterBills = () => {
    let filtered = billingRecords;

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.patientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'Total') {
      filtered = filtered.filter((b) => (b.status || 'Pending') === filterStatus);
    }

    setFilteredBills(filtered);
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this billing record?')) {
      try {
        await billingAPI.delete(billId);
        setNotification({ type: 'success', message: 'Billing record deleted successfully' });
        loadBillingData();
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete billing record' });
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="page-title">Billing Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Create Bill
        </button>
      </div>


      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('Total')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'Total'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Total ({billingRecords.length})
          </button>
          <button
            onClick={() => setFilterStatus('Paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'Paid'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid ({billingRecords.filter(b => (b.status || 'Pending') === 'Paid').length})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'Pending'
                ? 'bg-warning text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({billingRecords.filter(b => (b.status || 'Pending') === 'Pending').length})
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Bills Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Billing Records ({filteredBills.length})</h2>
        </div>
        {filteredBills.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Admission Date</th>
                  <th>Discharge Date</th>
                  <th>Days</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="font-mono text-xs text-blue-600">{bill.id}</td>
                    <td className="font-medium">{bill.patientName}</td>
                    <td className="font-mono text-xs">{bill.patientId}</td>
                    <td className="text-sm">{new Date(bill.admissionDate).toLocaleDateString()}</td>
                    <td className="text-sm">{new Date(bill.dischargeDate).toLocaleDateString()}</td>
                    <td className="font-semibold">{bill.totalDays}</td>
                    <td className="font-bold text-gray-900">₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (bill.status || 'Pending') === 'Paid'
                          ? 'bg-success bg-opacity-20 text-success'
                          : 'bg-warning bg-opacity-20 text-warning'
                      }`}>
                        {bill.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowDetail(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded text-blue-600"
                          title="View Bill"
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-green-50 rounded text-green-600" title="Print Bill">
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-600"
                          title="Delete Bill"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No billing records found</p>
        )}
      </div>

      {showForm && <BillingForm onClose={() => { setShowForm(false); loadBillingData(); }} />}
      {showDetail && selectedBill && <BillingDetail bill={selectedBill} onClose={() => setShowDetail(false)} />}
    </div>
  );
}

export default BillingManagement;
