import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { doctorAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import DoctorForm from '../components/DoctorForm';

function DoctorManagement() {
  const { doctors, setDoctors, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const departments = ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'ENT', 'Dermatology'];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filterDepartment]);

  const loadDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      if (response.success) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
      const offlineDoctors = await offlineDB.getAllDoctors();
      setDoctors(offlineDoctors);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (filterDepartment) {
      filtered = filtered.filter((d) => d.department === filterDepartment);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorAPI.delete(id);
        setNotification({ type: 'success', message: 'Doctor deleted successfully' });
        loadDoctors();
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete doctor' });
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDoctor(null);
    loadDoctors();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="input-field">
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor, index) => (
          <div key={doctor.id || `doctor-${index}`} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dr. {doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              </div>
              <span className={`badge ${doctor.availability === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                {doctor.availability}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-700 mb-4 pb-4 border-b border-gray-200">
              <p>
                <strong>Department:</strong> {doctor.department}
              </p>
              <p>
                <strong>Contact:</strong> {doctor.contact}
              </p>
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p>
                <strong>Qualifications:</strong> {doctor.qualifications}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setShowForm(true);
                }}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button onClick={() => handleDelete(doctor.id)} className="flex-1 btn-danger flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && <p className="text-gray-500 text-center py-8">No doctors found</p>}

      {showForm && <DoctorForm doctor={selectedDoctor} onClose={handleFormClose} />}
    </div>
  );
}

export default DoctorManagement;
