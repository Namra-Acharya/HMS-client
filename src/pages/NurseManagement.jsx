import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { nurseAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';
import NurseForm from '../components/NurseForm';
import NurseWorkChart from '../components/NurseWorkChart';

function NurseManagement() {
  const { nurses, setNurses, setNotification } = useHMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showWorkChart, setShowWorkChart] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [filteredNurses, setFilteredNurses] = useState([]);

  const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'ICU', 'Emergency'];
  const shifts = ['Morning (6AM-2PM)', 'Afternoon (2PM-10PM)', 'Night (10PM-6AM)'];

  useEffect(() => {
    loadNurses();
  }, []);

  useEffect(() => {
    filterNurses();
  }, [nurses, searchTerm, filterWard]);

  const loadNurses = async () => {
    try {
      const response = await nurseAPI.getAll();
      if (response.success) {
        setNurses(response.data);
      }
    } catch (error) {
      console.error('Failed to load nurses:', error);
      const offlineNurses = await offlineDB.getAllNurses();
      setNurses(offlineNurses);
    }
  };

  const filterNurses = () => {
    let filtered = nurses;

    if (filterWard) {
      filtered = filtered.filter((n) => n.ward === filterWard);
    }

    if (searchTerm) {
      filtered = filtered.filter((n) => n.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredNurses(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this nurse?')) {
      try {
        await nurseAPI.delete(id);
        setNotification({ type: 'success', message: 'Nurse deleted successfully' });
        loadNurses();
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete nurse' });
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedNurse(null);
    loadNurses();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nurse Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowWorkChart(true)} className="btn-secondary flex items-center gap-2">
            <Calendar size={20} />
            Work Chart
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Nurse
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by nurse name..."
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

      {/* Nurses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNurses.map((nurse) => (
          <div key={nurse.id} className="card">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-900">{nurse.name}</h3>
              <p className="text-sm text-gray-600">{nurse.ward}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-700 mb-4 pb-4 border-b border-gray-200">
              <p>
                <strong>Shift:</strong> {nurse.shift}
              </p>
              <p>
                <strong>Contact:</strong> {nurse.contact}
              </p>
              <p>
                <strong>Email:</strong> {nurse.email}
              </p>
              <p>
                <strong>Assigned Patients:</strong>{' '}
                {nurse.assignedPatients ? (typeof nurse.assignedPatients === 'string' ? JSON.parse(nurse.assignedPatients).length : nurse.assignedPatients.length) : 0}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedNurse(nurse);
                  setShowForm(true);
                }}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button onClick={() => handleDelete(nurse.id)} className="flex-1 btn-danger flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNurses.length === 0 && <p className="text-gray-500 text-center py-8">No nurses found</p>}

      {showForm && <NurseForm nurse={selectedNurse} onClose={handleFormClose} />}
      {showWorkChart && <NurseWorkChart onClose={() => setShowWorkChart(false)} />}
    </div>
  );
}

export default NurseManagement;
