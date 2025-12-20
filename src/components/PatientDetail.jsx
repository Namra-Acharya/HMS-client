import React, { useState, useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { patientAPI } from '../utils/api';
import useHMSStore from '../store/hmsStore';

function PatientDetail({ patient, onClose }) {
  const { setNotification, updatePatient } = useHMSStore();
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

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

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=600');
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    try {
      const element = printRef.current;
      const originalDisplay = element.style.display;

      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '-9999px';

      await new Promise(resolve => setTimeout(resolve, 100));

      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      element.style.display = originalDisplay;
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Patient-${patient.id}.pdf`);
      setNotification({ type: 'success', message: 'Patient details downloaded successfully' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({ type: 'error', message: 'Failed to download patient details' });
    }
  };

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
          {/* Modal Display - Scrollable */}
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

        {/* PDF Printable Content */}
        <div
          ref={printRef}
          style={{
            display: 'none',
            padding: '30px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#ffffff',
            width: '210mm',
            height: '297mm',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{ position: 'relative', marginBottom: '20px', borderBottom: '2px solid #0369a1', paddingBottom: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ margin: '0 0 5px 0', color: '#0369a1', fontSize: '24px', fontWeight: 'bold' }}>
                🏥 HOSPITAL MANAGEMENT SYSTEM
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>Patient Record Document</p>
            </div>
            <div style={{ position: 'absolute', top: '0', right: '0', fontSize: '12px', color: '#666' }}>
              <p style={{ margin: '0' }}>
                {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Info Grid - Two Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            {/* Left Column - Patient Info Card */}
            <div style={{ backgroundColor: '#f0f7ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Personal Information
              </h3>
              <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Patient ID:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937', fontFamily: 'monospace' }}>{patient.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Name:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Unique ID:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.uniqueId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Age:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.age} years</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Gender:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Contact:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.contact}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Address:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937', textAlign: 'right', maxWidth: '60%' }}>
                    {patient.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Vitals Card */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#059669', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Vitals & Status
              </h3>
              <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Weight:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {patient.weight ? `${patient.weight} kg` : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Height:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {patient.height ? `${patient.height} cm` : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Blood Pressure:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.bloodPressure || 'N/A'}</span>
                </div>
                <div style={{ borderTop: '1px solid #d1fae5', paddingTop: '8px', marginTop: '8px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Status:</span>
                  <span style={{ fontWeight: 'bold', color: '#059669', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                    {patient.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Days Admitted:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '12px' }}>{daysAdmitted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical & Doctor Info - Two Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            {/* Medical Card */}
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#d97706', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Medical Information
              </h3>
              <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Disease/Condition:</span>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginTop: '2px' }}>{patient.disease}</div>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Symptoms:</span>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginTop: '2px' }}>{patient.symptoms || 'N/A'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Department:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Admission Type:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.admissionType}</span>
                </div>
              </div>
            </div>

            {/* Doctor Card */}
            <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#7c3aed', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Doctor Assignment
              </h3>
              <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Assigned Doctor:</span>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginTop: '2px' }}>
                    {patient.assignedDoctor || 'Not assigned'}
                  </div>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Reference Doctor:</span>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginTop: '2px' }}>
                    {patient.referenceDoctor || 'N/A'}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Ward/Room:</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{patient.room}</span>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
          <button onClick={handlePrint} className="btn-secondary flex items-center justify-center gap-2">
            <Printer size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary flex items-center justify-center gap-2">
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
