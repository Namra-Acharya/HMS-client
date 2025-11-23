import React, { useState } from 'react';
import { X } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { doctorAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';

function DoctorForm({ doctor, onClose }) {
  const [formData, setFormData] = useState(
    doctor || {
      name: '',
      specialization: '',
      contact: '',
      email: '',
      department: 'General',
      qualifications: '',
      availability: 'Available'
    }
  );

  const [loading, setLoading] = useState(false);
  const { addDoctor, updateDoctor, setNotification } = useHMSStore();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (doctor) {
        await doctorAPI.update(doctor.id, formData);
        updateDoctor(doctor.id, formData);
        await offlineDB.updateDoctor(doctor.id, formData).catch(() => {});
        setNotification({ type: 'success', message: 'Doctor updated successfully' });
      } else {
        const response = await doctorAPI.create(formData);
        if (response.success) {
          const doctorId = response.data.id || response.data._id || Date.now().toString();
          const newDoctor = {
            ...formData,
            id: doctorId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          addDoctor(newDoctor);
          // Add to offline DB with error handling
          try {
            await offlineDB.addDoctor(newDoctor);
          } catch (dbError) {
            console.warn('Failed to save to offline DB:', dbError);
            // Continue even if offline DB fails
          }
          setNotification({ type: 'success', message: 'Doctor added successfully', title: `ID: ${doctorId}` });
        }
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setNotification({ type: 'error', message: 'Failed to save doctor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay overflow-y-auto">
      <div className="modal-content max-w-5xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{doctor ? 'Edit Doctor' : 'Add Doctor'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Dr. John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Cardiologist, Surgeon"
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
              <label className="form-label">Availability</label>
              <select name="availability" value={formData.availability} onChange={handleChange} className="input-field">
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Off-Duty">Off-Duty</option>
              </select>
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
                placeholder="doctor@hospital.com"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Qualifications</label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., MBBS, MD, Certificate in..."
                rows="3"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : doctor ? 'Update Doctor' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorForm;
