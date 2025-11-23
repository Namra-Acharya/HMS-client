import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail';

function PatientManagement() {
  const { patients, setPatients, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterStatus]);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      const offlinePatients = await offlineDB.getAllPatients();
      setPatients(offlinePatients);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (filterStatus && filterStatus !== 'All') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await patientAPI.delete(id);
        setNotification({ type: 'success', message: 'Patient deleted successfully' });
        loadPatients();
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete patient' });
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPatient(null);
    loadPatients();
  };

  const handleStatusChange = async (patientId, newStatus) => {
    try {
      await patientAPI.update(patientId, { status: newStatus });
      setNotification({ type: 'success', message: `Patient status updated to ${newStatus}` });
      loadPatients();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update patient status' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="page-title">Patient Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Patient
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-3 sm:gap-4 md:flex-row md:gap-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
          <option value="All">All Patients</option>
          <option value="Admitted">Admitted</option>
          <option value="Discharged">Discharged</option>
          <option value="Referred">Referred</option>
        </select>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">All Patients ({filteredPatients.length})</h2>
        </div>
        {filteredPatients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Admission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="font-mono text-xs text-blue-600">{patient.id}</td>
                    <td className="font-medium">{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.contact}</td>
                    <td>{patient.department}</td>
                    <td>{patient.assignedDoctor || 'N/A'}</td>
                    <td>
                      <select
                        value={patient.status}
                        onChange={(e) => handleStatusChange(patient.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ${
                          patient.status === 'Admitted'
                            ? 'bg-green-100 text-green-800'
                            : patient.status === 'Discharged'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="Admitted">Admitted</option>
                        <option value="Discharged">Discharged</option>
                        <option value="Referred">Referred</option>
                      </select>
                    </td>
                    <td className="text-sm">{new Date(patient.admissionDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowDetail(true);
                          }}
                          className="p-1.5 sm:p-2 hover:bg-blue-50 rounded text-blue-600"
                          title="View Details"
                        >
                          <Eye size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowForm(true);
                          }}
                          className="p-1.5 sm:p-2 hover:bg-green-50 rounded text-green-600"
                          title="Edit"
                        >
                          <Edit2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="p-1.5 sm:p-2 hover:bg-red-50 rounded text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No patients found</p>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <PatientForm patient={selectedPatient} onClose={handleFormClose} />
      )}
      {showDetail && selectedPatient && (
        <PatientDetail patient={selectedPatient} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

export default PatientManagement;
