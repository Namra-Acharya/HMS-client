import React, { useEffect, useState } from 'react';
import { Search, Eye, Download, FileText, Trash2 as TrashIcon } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { patientAPI, billingAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import PatientDetail from '../components/PatientDetail';
import BillingDetail from '../components/BillingDetail';

function DischargedPatients() {
  const { patients, setPatients, billingRecords, setBillingRecords, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dischargedPatients, setDischargedPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showBillingDetail, setShowBillingDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const discharged = patients.filter(p => p.status === 'Discharged' || p.status === 'Transferred');
    setDischargedPatients(discharged);
    filterPatients(discharged);
  }, [patients]);

  useEffect(() => {
    filterPatients(dischargedPatients);
  }, [searchTerm, dischargedPatients]);

  const loadData = async () => {
    try {
      const patientResponse = await patientAPI.getAll();
      const billResponse = await billingAPI.getAll();

      if (patientResponse.success) {
        setPatients(patientResponse.data);
      }
      if (billResponse.success) {
        setBillingRecords(billResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      const offlinePatients = await offlineDB.getAllPatients();
      const offlineBills = await offlineDB.getAllBillingRecords();
      setPatients(offlinePatients);
      setBillingRecords(offlineBills);
    }
  };

  const filterPatients = (patientsToFilter) => {
    let filtered = patientsToFilter;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  };

  const getPatientBill = (patientId) => {
    return billingRecords.find(b => b.patientId === patientId);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient record? This will also delete all related billing records and work charts.')) {
      try {
        await patientAPI.delete(patientId);
        setNotification({ type: 'success', message: 'Patient and related records deleted successfully' });
        loadData();
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete patient' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Discharged Patients</h1>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Discharged Patients Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Discharged Patient Records ({filteredPatients.length})</h2>
        </div>
        {filteredPatients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Discharge Date</th>
                  <th>Status</th>
                  <th>Bill Status</th>
                  <th>Bill Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const bill = getPatientBill(patient.id);
                  return (
                    <tr key={patient.id}>
                      <td className="font-mono text-xs text-blue-600">{patient.id}</td>
                      <td className="font-medium">{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.department}</td>
                      <td>{patient.assignedDoctor || 'N/A'}</td>
                      <td className="text-sm">{patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          patient.status === 'Discharged'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td>
                        {bill ? (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            bill.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bill.status || 'Pending'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">No Bill</span>
                        )}
                      </td>
                      <td className="font-bold">
                        {bill ? `₹${bill.totalAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientDetail(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded text-blue-600"
                            title="View Patient Details"
                          >
                            <Eye size={18} />
                          </button>
                          {bill && (
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowBillingDetail(true);
                              }}
                              className="p-2 hover:bg-green-50 rounded text-green-600"
                              title="View Bill"
                            >
                              <FileText size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="p-2 hover:bg-red-50 rounded text-red-600"
                            title="Delete Patient Record"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No discharged patients found</p>
        )}
      </div>

      {/* Modals */}
      {showPatientDetail && selectedPatient && (
        <PatientDetail patient={selectedPatient} onClose={() => setShowPatientDetail(false)} />
      )}
      {showBillingDetail && selectedBill && (
        <BillingDetail bill={selectedBill} onClose={() => setShowBillingDetail(false)} />
      )}
    </div>
  );
}

export default DischargedPatients;
