import React, { useEffect, useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail';

function OPDManagement() {
  const { patients, setPatients, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [opdPatients, setOPDPatients] = useState([]);

  useEffect(() => {
    loadOPDPatients();
  }, []);

  useEffect(() => {
    filterOPDPatients();
  }, [patients, searchTerm]);

  const loadOPDPatients = async () => {
    try {
      const response = await patientAPI.getAll({ admissionType: 'OPD' });
      if (response.success) {
        const opdData = response.data.filter((p) => p.admissionType === 'OPD');
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Failed to load OPD patients:', error);
      const offlinePatients = await offlineDB.getAllPatients();
      setPatients(offlinePatients);
    }
  };

  const filterOPDPatients = () => {
    const filtered = patients
      .filter((p) => p.admissionType === 'OPD')
      .filter((p) => (searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true));

    setOPDPatients(filtered);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPatient(null);
    loadOPDPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OPD Management</h1>
          <p className="text-gray-600 mt-1">Outpatient Department - Same-day treatment</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Register OPD Patient
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search OPD patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* OPD Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Total OPD Patients Today</p>
          <p className="text-3xl font-bold text-blue-600">{opdPatients.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Visit Charges</p>
          <p className="text-3xl font-bold text-green-600">₹500</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm mb-2">Reference Doctor Charge</p>
          <p className="text-3xl font-bold text-purple-600">₹200</p>
        </div>
      </div>

      {/* OPD Patients Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">OPD Patients ({opdPatients.length})</h2>
        </div>
        {opdPatients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Contact</th>
                  <th>Symptoms</th>
                  <th>Doctor</th>
                  <th>Visit Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opdPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="font-mono text-xs text-blue-600">{patient.id}</td>
                    <td className="font-medium">{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.contact}</td>
                    <td className="text-sm text-gray-600">{patient.symptoms}</td>
                    <td>{patient.assignedDoctor || 'Pending'}</td>
                    <td className="text-sm">{new Date(patient.admissionDate).toLocaleTimeString()}</td>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No OPD patients registered today</p>
        )}
      </div>

      {showForm && <PatientForm patient={selectedPatient} admissionType="OPD" onClose={handleFormClose} />}
      {showDetail && selectedPatient && <PatientDetail patient={selectedPatient} onClose={() => setShowDetail(false)} />}
    </div>
  );
}

export default OPDManagement;
