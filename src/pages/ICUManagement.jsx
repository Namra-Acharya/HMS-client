import React, { useEffect, useState } from 'react';
import { Plus, Search, Eye, AlertCircle } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail';

function ICUManagement() {
  const { patients, setPatients } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [icuPatients, setICUPatients] = useState([]);

  const totalICUBeds = 10;

  useEffect(() => {
    loadICUPatients();
  }, []);

  useEffect(() => {
    filterICUPatients();
  }, [patients, searchTerm]);

  const loadICUPatients = async () => {
    try {
      const response = await patientAPI.getAll({ admissionType: 'ICU' });
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Failed to load ICU patients:', error);
      const offlinePatients = await offlineDB.getAllPatients();
      setPatients(offlinePatients);
    }
  };

  const filterICUPatients = () => {
    const filtered = patients
      .filter((p) => p.admissionType === 'ICU' && p.status === 'Admitted')
      .filter((p) => (searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true));

    setICUPatients(filtered);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPatient(null);
    loadICUPatients();
  };

  const occupancyPercent = (icuPatients.length / totalICUBeds) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ICU Management</h1>
          <p className="text-gray-600 mt-1">Intensive Care Unit - Critical patients</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add ICU Patient
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search ICU patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* ICU Bed Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm mb-2">Total ICU Beds</p>
          <p className="text-3xl font-bold text-blue-600">{totalICUBeds}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm mb-2">Occupied Beds</p>
          <p className="text-3xl font-bold text-red-600">{icuPatients.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm mb-2">Available Beds</p>
          <p className="text-3xl font-bold text-green-600">{totalICUBeds - icuPatients.length}</p>
        </div>
      </div>

      {/* Occupancy Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">Bed Occupancy</span>
          <span className={`font-bold ${occupancyPercent > 80 ? 'text-red-600' : occupancyPercent > 60 ? 'text-orange-600' : 'text-green-600'}`}>
            {occupancyPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              occupancyPercent > 80 ? 'bg-red-600' : occupancyPercent > 60 ? 'bg-orange-600' : 'bg-green-600'
            }`}
            style={{ width: `${occupancyPercent}%` }}
          ></div>
        </div>
      </div>

      {occupancyPercent > 80 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">High ICU Occupancy</h3>
            <p className="text-sm text-red-800">ICU is running at high capacity. Consider prioritizing critical cases.</p>
          </div>
        </div>
      )}

      {/* ICU Patients */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Critical Patients ({icuPatients.length})</h2>
        </div>
        {icuPatients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Disease/Condition</th>
                  <th>Doctor on Duty</th>
                  <th>Admission Date</th>
                  <th>Days in ICU</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {icuPatients.map((patient) => {
                  const daysInICU = Math.floor(
                    (new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={patient.id}>
                      <td className="font-mono text-xs text-blue-600">{patient.id}</td>
                      <td className="font-medium">{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.disease}</td>
                      <td>{patient.assignedDoctor || 'TBD'}</td>
                      <td className="text-sm">{new Date(patient.admissionDate).toLocaleDateString()}</td>
                      <td className="font-semibold text-red-600">{daysInICU + 1}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowDetail(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No patients in ICU</p>
        )}
      </div>

      {showForm && <PatientForm patient={selectedPatient} admissionType="ICU" onClose={handleFormClose} />}
      {showDetail && selectedPatient && <PatientDetail patient={selectedPatient} onClose={() => setShowDetail(false)} />}
    </div>
  );
}

export default ICUManagement;
