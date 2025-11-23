import React, { useEffect, useState } from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import { archiveAPI } from '../utils/api';

function ArchiveDetail({ month, onClose, onDelete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyData();
  }, [month]);

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      const response = await archiveAPI.getMonthlyData(month);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    archiveAPI.generatePDF(month);
  };

  const handleDeleteArchive = () => {
    if (window.confirm(`Are you sure you want to delete the archive for ${month}? This will remove all associated data from the database. The PDF will be deleted as well. This action cannot be undone.`)) {
      if (onDelete) {
        onDelete(month);
        onClose();
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading monthly data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center p-8 border-b-4 border-blue-800 rounded-t-xl">
            <div>
              <h2 className="text-3xl font-bold text-white">Archive Report</h2>
              <p className="text-blue-100 mt-1">{month}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 text-center p-6 rounded-lg">
                <p className="text-gray-600 text-xs font-semibold mb-3 uppercase">Total Patients</p>
                <p className="text-4xl font-bold text-blue-600">{data.patientCount || 0}</p>
              </div>
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 text-center p-6 rounded-lg">
                <p className="text-gray-600 text-xs font-semibold mb-3 uppercase">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{((data.billingTotal || 0) / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-gray-600 mt-1">₹{(data.billingTotal || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 text-center p-6 rounded-lg">
                <p className="text-gray-600 text-xs font-semibold mb-3 uppercase">Billing Records</p>
                <p className="text-4xl font-bold text-purple-600">{(data.billings || []).length}</p>
              </div>
              <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600 text-center p-6 rounded-lg">
                <p className="text-gray-600 text-xs font-semibold mb-3 uppercase">Work Chart Entries</p>
                <p className="text-4xl font-bold text-orange-600">{(data.workCharts || []).length}</p>
              </div>
            </div>

            {/* Patients Section */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">👥</span> Patient Records ({data.patientCount || 0})
              </h3>
              {data.patients && data.patients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left">Patient Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Department</th>
                        <th>Admission Date</th>
                        <th>Discharge Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.patients.map((patient, idx) => (
                        <tr key={patient._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="font-medium">{patient.name}</td>
                          <td className="text-center">{patient.age}</td>
                          <td className="text-center">{patient.gender}</td>
                          <td>{patient.department}</td>
                          <td>{new Date(patient.admissionDate).toLocaleDateString('en-IN')}</td>
                          <td>
                            {patient.dischargeDate
                              ? new Date(patient.dischargeDate).toLocaleDateString('en-IN')
                              : 'N/A'}
                          </td>
                          <td>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${patient.status === 'Discharged' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {patient.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No patient records</p>
              )}
            </div>

            {/* Work Chart Section */}
            {data.workCharts && data.workCharts.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span> Nurse Work Chart ({data.workCharts.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left">Date</th>
                        <th>Nurse Name</th>
                        <th>Ward</th>
                        <th>Shift</th>
                        <th className="text-left">Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.workCharts.slice(0, 50).map((chart, idx) => (
                        <tr key={chart._id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="font-medium">{new Date(chart.date).toLocaleDateString('en-IN')}</td>
                          <td>{chart.nurseName}</td>
                          <td>{chart.ward}</td>
                          <td>{chart.shift}</td>
                          <td className="text-gray-700 max-w-xs truncate">{(chart.tasks || 'N/A').substring(0, 50)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.workCharts.length > 50 && (
                  <p className="text-gray-600 text-sm mt-2">... and {data.workCharts.length - 50} more entries</p>
                )}
              </div>
            )}

            {/* Billing Section */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span> Billing Records ({data.billings?.length || 0})
              </h3>
              {data.billings && data.billings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left">Patient Name</th>
                        <th>Admission Date</th>
                        <th>Discharge Date</th>
                        <th className="text-center">Days</th>
                        <th className="text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.billings.map((billing, idx) => (
                        <tr key={billing._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="font-medium">{billing.patientName}</td>
                          <td>{new Date(billing.admissionDate).toLocaleDateString('en-IN')}</td>
                          <td>{new Date(billing.dischargeDate).toLocaleDateString('en-IN')}</td>
                          <td className="text-center font-semibold">{billing.totalDays}</td>
                          <td className="font-bold text-green-600 text-right">₹{billing.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No billing records</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 flex gap-3 justify-between p-8 border-t-2 border-gray-200 rounded-b-xl">
            <button onClick={handleDeleteArchive} className="btn-danger flex items-center gap-2">
              <Trash2 size={18} />
              Delete Archive
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
              <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Download size={18} />
                Download PDF Archive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArchiveDetail;
