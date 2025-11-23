import React, { useState } from 'react';
import { X } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { nurseAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';

function NurseForm({ nurse, onClose }) {
  const [formData, setFormData] = useState(
    nurse || {
      name: '',
      contact: '',
      email: '',
      department: 'General',
      shift: 'Morning (6AM-2PM)',
      ward: 'Ward A'
    }
  );

  const [loading, setLoading] = useState(false);
  const { addNurse, updateNurse, setNotification } = useHMSStore();

  const departments = [
    'General',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'ENT',
    'Dermatology',
    'Psychiatry',
    'ICU',
    'Emergency'
  ];
  const shifts = ['Morning (6AM-2PM)', 'Afternoon (2PM-10PM)', 'Night (10PM-6AM)'];
  const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'ICU', 'Emergency'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (nurse) {
        await nurseAPI.update(nurse.id, formData);
        updateNurse(nurse.id, formData);
        setNotification({ type: 'success', message: 'Nurse updated successfully' });
      } else {
        const response = await nurseAPI.create(formData);
        if (response.success) {
          const newNurse = { ...formData, id: response.data.id, assignedPatients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          addNurse(newNurse);
          await offlineDB.addNurse(newNurse);
          setNotification({ type: 'success', message: 'Nurse added successfully', title: `ID: ${response.data.id}` });
        }
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setNotification({ type: 'error', message: 'Failed to save nurse' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{nurse ? 'Edit Nurse' : 'Add Nurse'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Nurse name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="10-digit number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="nurse@hospital.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="input-field">
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Shift (Time Schedule)</label>
              <select name="shift" value={formData.shift} onChange={handleChange} className="input-field">
                {shifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Ward</label>
              <select name="ward" value={formData.ward} onChange={handleChange} className="input-field">
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : nurse ? 'Update Nurse' : 'Add Nurse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NurseForm;
