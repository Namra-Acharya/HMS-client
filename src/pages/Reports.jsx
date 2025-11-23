import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { dashboardAPI, patientAPI, billingAPI } from '../utils/api';

function Reports() {
  const { setNotification } = useHMSStore();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState(null);
  const [patients, setPatients] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [reportDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const reportResponse = await dashboardAPI.getDailyReport({ date: reportDate });
      const patientResponse = await patientAPI.getAll();
      const billingResponse = await billingAPI.getAll();

      if (reportResponse.success) {
        setDailyReport(reportResponse.data);
      }
      if (patientResponse.success) {
        setPatients(patientResponse.data);
      }
      if (billingResponse.success) {
        setBillingRecords(billingResponse.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setNotification({ type: 'error', message: 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  };

  const getAdmissionsForDate = () => {
    return patients.filter(
      (p) => new Date(p.admissionDate).toISOString().split('T')[0] === reportDate && p.status !== 'Discharged'
    ).length;
  };

  const getDischargesForDate = () => {
    return patients.filter((p) => p.dischargeDate && new Date(p.dischargeDate).toISOString().split('T')[0] === reportDate).length;
  };

  const getRevenueForDate = () => {
    return billingRecords
      .filter((b) => new Date(b.createdAt).toISOString().split('T')[0] === reportDate && b.status === 'Paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  };

  const ReportCard = ({ icon: Icon, label, value, color }) => (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Reports</h1>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-600" />
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="input-field max-w-xs"
          />
          <button onClick={loadReports} className="btn-primary">
            Load Report
          </button>
        </div>
      </div>

      {/* Daily Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard icon={Users} label="Admissions" value={getAdmissionsForDate()} color="bg-blue-500" />
        <ReportCard icon={Users} label="Discharges" value={getDischargesForDate()} color="bg-green-500" />
        <ReportCard icon={DollarSign} label="Revenue" value={`₹${getRevenueForDate().toLocaleString('en-IN')}`} color="bg-emerald-500" />
        <ReportCard icon={TrendingUp} label="Active Patients" value={patients.filter((p) => p.status === 'Admitted').length} color="bg-purple-500" />
      </div>

      {/* Department-wise Report */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Patients by Department</h2>
        </div>
        <div className="space-y-3">
          {Array.from(
            new Set(patients.filter((p) => p.status === 'Admitted').map((p) => p.department))
          ).map((dept) => {
            const count = patients.filter((p) => p.status === 'Admitted' && p.department === dept).length;
            return (
              <div key={dept} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0">
                <span className="font-medium text-gray-900">{dept}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(count / 50) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-900 min-w-10 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admission Type Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900">Admission Type Distribution</h2>
          </div>
          <div className="space-y-3">
            {['OPD', 'IPD', 'ICU', 'Emergency'].map((type) => {
              const count = patients.filter((p) => p.admissionType === type && p.status === 'Admitted').length;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-700">{type}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900">Revenue Summary</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Pending Bills</span>
              <span className="font-bold text-orange-600">
                ₹{billingRecords.filter((b) => b.status === 'Pending').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Paid Bills</span>
              <span className="font-bold text-green-600">
                ₹{billingRecords.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-900 font-semibold">Total Revenue</span>
              <span className="font-bold text-blue-600">
                ₹{(billingRecords.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0) + billingRecords.filter((b) => b.status === 'Pending').reduce((sum, b) => sum + b.totalAmount, 0)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
