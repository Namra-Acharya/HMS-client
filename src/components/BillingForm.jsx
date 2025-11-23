import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { billingAPI, patientAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';

function BillingForm({ onClose }) {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    admissionDate: '',
    dischargeDate: new Date().toISOString().split('T')[0],
    nurseCharge: 300,
    hospitalCharge: 500,
    visitCharge: 500,
    icuCharge: 1000,
    referenceDoctorCharge: 200,
    roomCharge: 1000,
    status: 'Pending'
  });

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [calculatedTotal, setCalculatedTotal] = useState({ totalDays: 0, totalAmount: 0 });
  const { addBillingRecord, setNotification, updatePatient, patients: storePatients } = useHMSStore();

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (storePatients && storePatients.length > 0) {
      setPatients(storePatients);
    }
  }, [storePatients]);

  useEffect(() => {
    if (formData.admissionDate && formData.dischargeDate) {
      calculateTotal();
    }
  }, [formData]);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      const offlinePatients = await offlineDB.getAllPatients();
      setPatients(offlinePatients);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const calculateTotal = () => {
    const admission = new Date(formData.admissionDate);
    const discharge = new Date(formData.dischargeDate);
    let totalDays = Math.ceil((discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));

    // Ensure minimum 1 day
    totalDays = Math.max(totalDays, 1);

    const total =
      formData.nurseCharge * totalDays +
      formData.hospitalCharge * totalDays +
      formData.visitCharge +
      formData.icuCharge * totalDays +
      formData.referenceDoctorCharge +
      formData.roomCharge * totalDays;

    setCalculatedTotal({
      totalDays: totalDays,
      totalAmount: Math.max(total, 0)
    });
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name,
        admissionDate: patient.admissionDate
      }));
      setSearchTerm('');
      setFilteredPatients([]);
    }
  };

  const handlePatientClick = (patient) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      admissionDate: patient.admissionDate
    }));
    setSearchTerm('');
    setFilteredPatients([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name.includes('Charge') ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await billingAPI.create(formData);
      if (response.success) {
        const newBill = {
          ...formData,
          id: response.data.id,
          totalDays: response.data.totalDays,
          totalAmount: response.data.totalAmount,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        addBillingRecord(newBill);
        await offlineDB.addBillingRecord(newBill);

        updatePatient(formData.patientId, { status: 'Discharged' });
        await patientAPI.update(formData.patientId, { status: 'Discharged' });

        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({ type: 'error', message: 'Failed to create bill' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Billing Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pb-6">
          {/* Patient Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Information</h3>
            <div className="space-y-4">
              {/* Search Section */}
              <div>
                <label className="form-label">Search & Select Patient</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>

                {/* Patient List */}
                {searchTerm && filteredPatients.length > 0 && (
                  <div className="mt-2 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientClick(patient)}
                        className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-200 transition-colors"
                      >
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.id} • {patient.department}</p>
                      </button>
                    ))}
                  </div>
                )}
                {searchTerm && filteredPatients.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No matching patients found</p>
                )}
              </div>

              {/* Selected Patient Display */}
              {formData.patientId && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="form-group">
                    <label className="form-label">Selected Patient</label>
                    <input type="text" value={formData.patientName} disabled className="input-field bg-gray-100" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admission Date</label>
                    <input type="date" value={formData.admissionDate} disabled className="input-field bg-gray-100" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discharge Date</label>
                    <input type="date" name="dischargeDate" value={formData.dischargeDate} onChange={handleChange} required className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {formData.patientId && (
            <>
              {/* Charges */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Charges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Nurse Charge (per day)</label>
                    <input
                      type="number"
                      name="nurseCharge"
                      value={formData.nurseCharge}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital Charge (per day)</label>
                    <input
                      type="number"
                      name="hospitalCharge"
                      value={formData.hospitalCharge}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visit Charge (one-time)</label>
                    <input
                      type="number"
                      name="visitCharge"
                      value={formData.visitCharge}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ICU Charge (per day)</label>
                    <input
                      type="number"
                      name="icuCharge"
                      value={formData.icuCharge}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reference Doctor Charge</label>
                    <input
                      type="number"
                      name="referenceDoctorCharge"
                      value={formData.referenceDoctorCharge}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Room Charge (per day)</label>
                    <input
                      type="number"
                      name="roomCharge"
                      value={formData.roomCharge}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Total Days of Stay</p>
                    <p className="text-3xl font-bold text-purple-600">{calculatedTotal.totalDays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Total Amount</p>
                    <p className="text-3xl font-bold text-purple-600">₹{calculatedTotal.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.patientId} className="btn-primary">
              {loading ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillingForm;
