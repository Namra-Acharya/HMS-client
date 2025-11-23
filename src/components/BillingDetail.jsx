import React, { useState, useRef } from 'react';
import { X, Printer, Download, Trash2 } from 'lucide-react';
import { billingAPI } from '../utils/api';
import useHMSStore from '../store/hmsStore';

function BillingDetail({ bill, onClose }) {
  const { updateBillingRecord, setNotification } = useHMSStore();
  const [loading, setLoading] = useState(false);
  const [billStatus, setBillStatus] = useState(bill.status || 'Pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const printRef = useRef();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this billing record? This action cannot be undone.')) {
      setLoading(true);
      try {
        await billingAPI.delete(bill.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete billing record:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusUpdate = async () => {
    if (billStatus === (bill.status || 'Pending')) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await billingAPI.update(bill.id, { status: billStatus });
      if (response.success) {
        updateBillingRecord(bill.id, { status: billStatus });
        setNotification({ type: 'success', message: `Bill status updated to ${billStatus}` });
      }
    } catch (error) {
      console.error('Failed to update bill status:', error);
      setNotification({ type: 'error', message: 'Failed to update bill status' });
      setBillStatus(bill.status || 'Pending');
    } finally {
      setIsUpdating(false);
    }
  };

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
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`Invoice-${bill.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Calculate individual amounts
  const nurseAmount = parseFloat(bill.nurseCharge || 0) * parseInt(bill.totalDays || 1);
  const hospitalAmount = parseFloat(bill.hospitalCharge || 0) * parseInt(bill.totalDays || 1);
  const icuAmount = parseFloat(bill.icuCharge || 0) * parseInt(bill.totalDays || 1);
  const roomAmount = parseFloat(bill.roomCharge || 0) * parseInt(bill.totalDays || 1);
  const visitAmount = parseFloat(bill.visitCharge || 0);
  const doctorAmount = parseFloat(bill.referenceDoctorCharge || 0);

  const subtotal = nurseAmount + hospitalAmount + icuAmount + roomAmount + visitAmount + doctorAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
          {/* Header */}
          <div className="sticky top-0 bg-white flex justify-between items-center p-8 border-b border-gray-200 rounded-t-xl gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">Billing Invoice</h2>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={billStatus}
                onChange={(e) => setBillStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              {billStatus !== (bill.status || 'Pending') && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Invoice Content - Printable */}
          <div
            ref={printRef}
            className="p-8 space-y-6 bg-white"
            style={{
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              color: '#333'
            }}
          >
            {/* Header */}
            <div className="text-center border-b-2 border-gray-300 pb-6">
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0369a1', margin: '0 0 8px 0' }}>
                🏥 HOSPITAL MANAGEMENT SYSTEM
              </h1>
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Professional Hospital Invoice</p>
            </div>

            {/* Invoice Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>INVOICE NUMBER</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: '#0369a1' }}>
                  {bill.id}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>INVOICE DATE</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                  {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                PATIENT INFORMATION
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>Patient Name</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{bill.patientName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>Patient ID</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'monospace', color: '#1f2937' }}>
                    {bill.patientId}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>ADMISSION DATE</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {new Date(bill.admissionDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>DISCHARGE DATE</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {new Date(bill.dischargeDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Days of Stay */}
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', margin: 0 }}>
                Total Days of Stay: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{bill.totalDays}</span> days
              </p>
            </div>

            {/* Itemized Charges */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                ITEMIZED CHARGES
              </h3>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                      Description
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                      Qty
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                      Rate
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nurseAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>Nurse Care Charges</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        {bill.totalDays} days
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        ₹{parseFloat(bill.nurseCharge).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        ₹{nurseAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  {hospitalAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>Hospital Charges</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        {bill.totalDays} days
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        ₹{parseFloat(bill.hospitalCharge).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        ₹{hospitalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  {roomAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>Room & Bed Charges</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        {bill.totalDays} days
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        ₹{parseFloat(bill.roomCharge).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        ₹{roomAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  {icuAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>ICU Charges</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        {bill.totalDays} days
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        ₹{parseFloat(bill.icuCharge).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        ₹{icuAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  {visitAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>Consultation & Visit Charges</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>1</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        ₹{visitAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        ₹{visitAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  {doctorAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>Reference Doctor Charges</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>1</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>
                        ₹{doctorAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        ₹{doctorAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: '#374151' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '16px 12px',
                    backgroundColor: '#0369a1',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{parseFloat(bill.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', textAlign: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '48px' }}>Authorized By</p>
                  <p style={{ borderTop: '1px solid #000', paddingTop: '8px', fontSize: '12px', fontWeight: '600' }}>
                    Hospital Administrator
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '48px' }}>Doctor's Signature</p>
                  <p style={{ borderTop: '1px solid #000', paddingTop: '8px', fontSize: '12px', fontWeight: '600' }}>
                    Attending Physician
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '48px' }}>Patient/Guardian</p>
                  <p style={{ borderTop: '1px solid #000', paddingTop: '8px', fontSize: '12px' }}>
                    Date: {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', borderTop: '2px solid #e5e7eb', paddingTop: '16px', color: '#6b7280', fontSize: '11px' }}>
              <p>This is a computer-generated invoice. No signature is required.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white flex gap-3 justify-end p-8 border-t border-gray-200">
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <Printer size={18} />
              Print
            </button>
            <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              Download PDF
            </button>
            <button onClick={handleDelete} disabled={loading} className="btn-danger flex items-center gap-2">
              <Trash2 size={18} />
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default BillingDetail;
