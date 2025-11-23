import React, { useState } from 'react';
import { X } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';

function PatientForm({ patient, admissionType, onClose }) {
  const [formData, setFormData] = useState(
    patient || {
      name: '',
      age: '',
      gender: 'M',
      contact: '',
      address: '',
      disease: '',
      symptoms: '',
      department: 'General',
      room: 'Ward A',
      assignedDoctor: '',
      referenceDoctor: '',
      admissionType: admissionType || 'IPD',
      weight: '',
      height: '',
      bloodPressure: ''
    }
  );

  const [loading, setLoading] = useState(false);
  const { addPatient, updatePatient, setNotification, doctors } = useHMSStore();

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

  const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'ICU', 'Emergency'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (patient) {
        await patientAPI.update(patient.id, formData);
        updatePatient(patient.id, formData);
        setNotification({ type: 'success', message: 'Patient updated successfully' });
      } else {
        const dataWithDates = {
          ...formData,
          admissionDate: new Date().toISOString()
        };
        const response = await patientAPI.create(dataWithDates);
        if (response.success) {
          const newPatient = { ...response.data, status: 'Admitted' };
          addPatient(newPatient);
          await offlineDB.addPatient(newPatient);
          setNotification({ type: 'success', message: 'Patient admitted successfully', title: `ID: ${response.data.id}` });
        }
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setNotification({ type: 'error', message: 'Failed to save patient record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{patient ? 'Edit Patient' : 'Admit Patient'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter patient name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter age"
                min="0"
                max="120"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
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

            {patient && (
              <div className="form-group">
                <label className="form-label">Unique ID</label>
                <input
                  type="text"
                  value={formData.uniqueId}
                  className="input-field bg-gray-100 cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>
            )}

            <div className="form-group md:col-span-2">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter full address"
                rows="2"
              />
            </div>

            {/* Medical Info */}
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter weight in kg"
                step="0.1"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter height in cm"
                step="0.1"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Pressure</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 120/80"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Disease/Condition</label>
              <input
                type="text"
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Fever, Hypertension"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Symptoms</label>
              <input
                type="text"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., High fever, Cough"
              />
            </div>

            {/* Assignment */}
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
              <label className="form-label">Ward/Room</label>
              <select name="room" value={formData.room} onChange={handleChange} className="input-field">
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Doctor</label>
              <select
                name="assignedDoctor"
                value={formData.assignedDoctor}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reference Doctor</label>
              <select
                name="referenceDoctor"
                value={formData.referenceDoctor}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select a Doctor (Optional)</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
            </div>

            {!patient && (
              <div className="form-group">
                <label className="form-label">Admission Type</label>
                <select
                  name="admissionType"
                  value={formData.admissionType}
                  onChange={handleChange}
                  className="input-field"
                  disabled={admissionType}
                >
                  <option value="OPD">OPD (Outpatient)</option>
                  <option value="IPD">IPD (Inpatient)</option>
                  <option value="ICU">ICU (Critical)</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : patient ? 'Update Patient' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;
