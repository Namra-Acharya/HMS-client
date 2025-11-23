import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Eye } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail';

function IPDManagement() {
  const { patients, setPatients, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [ipdPatients, setIPDPatients] = useState([]);

  const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D'];

  useEffect(() => {
    loadIPDPatients();
  }, []);

  useEffect(() => {
    filterIPDPatients();
  }, [patients, searchTerm, filterWard]);

  const loadIPDPatients = async () => {
    try {
      const response = await patientAPI.getAll({ admissionType: 'IPD' });
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Failed to load IPD patients:', error);
      const offlinePatients = await offlineDB.getAllPatients();
      setPatients(offlinePatients);
    }
  };

  const filterIPDPatients = () => {
    let filtered = patients.filter((p) => p.admissionType === 'IPD');

    if (filterWard) {
      filtered = filtered.filter((p) => p.room === filterWard);
    }

    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setIPDPatients(filtered);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPatient(null);
    loadIPDPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IPD Management</h1>
          <p className="text-gray-600 mt-1">Inpatient Department - Extended hospital stay</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Admit IPD Patient
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterWard} onChange={(e) => setFilterWard(e.target.value)} className="input-field">
          <option value="">All Wards</option>
          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </div>

      {/* IPD Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Total IPD Patients</p>
          <p className="text-3xl font-bold text-blue-600">{ipdPatients.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Daily Nurse Charge</p>
          <p className="text-3xl font-bold text-green-600">₹300</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Daily Hospital Charge</p>
          <p className="text-3xl font-bold text-orange-600">₹500</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Room Charge (per day)</p>
          <p className="text-3xl font-bold text-purple-600">₹1000</p>
        </div>
      </div>

      {/* IPD Patients Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">IPD Patients ({ipdPatients.length})</h2>
        </div>
        {ipdPatients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Ward</th>
                  <th>Disease</th>
                  <th>Doctor</th>
                  <th>Admission Date</th>
                  <th>Days Admitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ipdPatients.map((patient) => {
                  const daysAdmitted = Math.floor(
                    (new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={patient.id}>
                      <td className="font-mono text-xs text-blue-600">{patient.id}</td>
                      <td className="font-medium">{patient.name}</td>
                      <td>{patient.room}</td>
                      <td>{patient.disease}</td>
                      <td>{patient.assignedDoctor || 'N/A'}</td>
                      <td className="text-sm">{new Date(patient.admissionDate).toLocaleDateString()}</td>
                      <td className="font-semibold text-gray-900">{daysAdmitted + 1}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowDetail(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded text-blue-600"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowForm(true);
                            }}
                            className="p-2 hover:bg-green-50 rounded text-green-600"
                          >
                            <Edit2 size={18} />
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
          <p className="text-gray-500 text-center py-8">No IPD patients admitted</p>
        )}
      </div>

      {showForm && <PatientForm patient={selectedPatient} admissionType="IPD" onClose={handleFormClose} />}
      {showDetail && selectedPatient && <PatientDetail patient={selectedPatient} onClose={() => setShowDetail(false)} />}
    </div>
  );
}

export default IPDManagement;
