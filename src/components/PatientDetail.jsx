import React, { useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { patientAPI } from '../utils/api';
import useHMSStore from '../store/hmsStore';

function PatientDetail({ patient, onClose }) {
  const { setNotification, updatePatient } = useHMSStore();
  const [loading, setLoading] = useState(false);

  const handleDischarge = async () => {
    if (window.confirm('Are you sure you want to discharge this patient?')) {
      setLoading(true);
      try {
        await patientAPI.discharge(patient.id);
        updatePatient(patient.id, { status: 'Discharged', dischargeDate: new Date().toISOString() });
        setNotification({ type: 'success', message: 'Patient discharged successfully' });
        onClose();
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to discharge patient' });
      } finally {
        setLoading(false);
      }
    }
  };

  const daysAdmitted = Math.floor((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Patient Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6 max-h-96 overflow-y-auto pb-4 sm:pb-6">
          {/* Header with ID and Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Patient ID</p>
              <p className="font-mono font-bold text-blue-600 text-base sm:text-lg">{patient.id}</p>
            </div>
            <span className={`badge ${patient.status === 'Admitted' ? 'badge-success' : 'badge-info'}`}>{patient.status}</span>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique ID</p>
                <p className="font-mono font-semibold text-gray-900">{patient.uniqueId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold text-gray-900">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-semibold text-gray-900">{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-semibold text-gray-900">{patient.contact}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">{patient.address}</p>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Vitals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-semibold text-gray-900">{patient.weight ? `${patient.weight} kg` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Height</p>
                <p className="font-semibold text-gray-900">{patient.height ? `${patient.height} cm` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="font-semibold text-gray-900">{patient.bloodPressure || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Disease/Condition</p>
                <p className="font-semibold text-gray-900">{patient.disease}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Symptoms</p>
                <p className="font-semibold text-gray-900">{patient.symptoms || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{patient.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ward/Room</p>
                <p className="font-semibold text-gray-900">{patient.room}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Type</p>
                <p className="font-semibold text-gray-900">{patient.admissionType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Admitted</p>
                <p className="font-semibold text-gray-900">{daysAdmitted}</p>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Doctor Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Assigned Doctor</p>
                <p className="font-semibold text-gray-900">{patient.assignedDoctor || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Doctor</p>
                <p className="font-semibold text-gray-900">{patient.referenceDoctor || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admission Dates */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Admission Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-semibold text-gray-900">{new Date(patient.admissionDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
              </div>
              {patient.dischargeDate && (
                <div>
                  <p className="text-sm text-gray-600">Discharge Date</p>
                  <p className="font-semibold text-gray-900">{new Date(patient.dischargeDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
          <button className="btn-secondary flex items-center justify-center gap-2">
            <Printer size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button className="btn-secondary flex items-center justify-center gap-2">
            <Download size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          {patient.status === 'Admitted' && (
            <button onClick={handleDischarge} disabled={loading} className="btn-danger w-full sm:w-auto">
              {loading ? 'Discharging...' : 'Discharge Patient'}
            </button>
          )}
          <button onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDetail;
