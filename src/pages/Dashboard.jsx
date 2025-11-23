import React, { useEffect } from 'react';
import { Users, Bed, Activity, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { dashboardAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';

function Dashboard() {
  const { dashboardStats, setDashboardStats, patients, setPatients, loading, setLoading } = useHMSStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await dashboardAPI.getStats();
      if (statsResponse.success) {
        setDashboardStats(statsResponse.data);
      }

      const patientResponse = await dashboardAPI.getRecentPatients();
      if (patientResponse.success) {
        setPatients(patientResponse.data);
      }
    } catch (error) {
      // Silently fail and load from offline storage
      const offlinePatients = await offlineDB.getAllPatients();
      setPatients(offlinePatients);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor, trend }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 sm:p-3 rounded-lg ${bgColor}`}>
          <Icon size={20} className={`sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        {trend && <span className="text-success text-xs font-semibold">{trend}</span>}
      </div>
      <p className="text-medical-600 text-xs sm:text-sm font-medium mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-medical-900">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="page-title">Hospital Dashboard</h1>
        <button onClick={loadDashboardData} className="btn-primary w-full sm:w-auto">
          Refresh
        </button>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          icon={Users}
          label="OPD Patients"
          value={dashboardStats.totalOPDPatients}
          bgColor="bg-primary-50"
          iconColor="text-primary-700"
        />
        <StatCard
          icon={Users}
          label="IPD Patients"
          value={dashboardStats.totalIPDPatients}
          bgColor="bg-secondary-50"
          iconColor="text-secondary-700"
        />
        <StatCard
          icon={Bed}
          label="ICU Beds Occupied"
          value={dashboardStats.icuOccupiedBeds}
          bgColor="bg-red-50"
          iconColor="text-danger"
        />
        <StatCard
          icon={Activity}
          label="Admissions Today"
          value={dashboardStats.admissionsToday}
          bgColor="bg-amber-50"
          iconColor="text-warning"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <StatCard
          icon={TrendingUp}
          label="Discharges Today"
          value={dashboardStats.dischargesToday}
          bgColor="bg-emerald-50"
          iconColor="text-success"
        />
        <StatCard
          icon={AlertCircle}
          label="Active Doctors"
          value={dashboardStats.totalDoctors}
          bgColor="bg-primary-50"
          iconColor="text-primary-700"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue (Paid)"
          value={`₹${dashboardStats.totalRevenue?.toLocaleString('en-IN') || 0}`}
          bgColor="bg-green-50"
          iconColor="text-success"
        />
      </div>

      {/* Recent Patients */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Recent Admissions</h2>
        </div>
        {patients.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Admission Date</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id}>
                    <td className="font-mono text-xs text-primary-600">{patient.id}</td>
                    <td className="font-medium text-medical-900">{patient.name}</td>
                    <td className="text-medical-700">{patient.department}</td>
                    <td>
                      <span
                        className={`badge ${
                          patient.admissionType === 'OPD'
                            ? 'badge-info'
                            : patient.admissionType === 'IPD'
                              ? 'badge-success'
                              : 'badge-warning'
                        }`}
                      >
                        {patient.admissionType}
                      </span>
                    </td>
                    <td className="text-medical-700">{patient.assignedDoctor || 'N/A'}</td>
                    <td>
                      <span className="badge badge-success">{patient.status}</span>
                    </td>
                    <td className="text-sm text-medical-600">{new Date(patient.admissionDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-medical-500 text-center py-8">No recent admissions</p>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <a
            href="/patients"
            className="card cursor-pointer text-center p-4 sm:p-6 md:p-8 group"
          >
            <div className="bg-primary-50 group-hover:bg-primary-100 rounded-lg p-3 mx-auto w-fit mb-3 sm:mb-4 transition-colors">
              <Users size={24} className="sm:w-8 sm:h-8 text-primary-700" />
            </div>
            <h3 className="font-semibold text-medical-900 text-sm sm:text-base">Manage Patients</h3>
            <p className="text-xs sm:text-sm text-medical-600 mt-2">Add & view patient records</p>
          </a>
          <a
            href="/doctors"
            className="card cursor-pointer text-center p-4 sm:p-6 md:p-8 group"
          >
            <div className="bg-secondary-50 group-hover:bg-secondary-100 rounded-lg p-3 mx-auto w-fit mb-3 sm:mb-4 transition-colors">
              <Users size={24} className="sm:w-8 sm:h-8 text-secondary-700" />
            </div>
            <h3 className="font-semibold text-medical-900 text-sm sm:text-base">Manage Doctors</h3>
            <p className="text-xs sm:text-sm text-medical-600 mt-2">Manage doctor assignments</p>
          </a>
          <a
            href="/billing"
            className="card cursor-pointer text-center p-4 sm:p-6 md:p-8 group"
          >
            <div className="bg-emerald-50 group-hover:bg-emerald-100 rounded-lg p-3 mx-auto w-fit mb-3 sm:mb-4 transition-colors">
              <DollarSign size={24} className="sm:w-8 sm:h-8 text-success" />
            </div>
            <h3 className="font-semibold text-medical-900 text-sm sm:text-base">Generate Bill</h3>
            <p className="text-xs sm:text-sm text-medical-600 mt-2">Create discharge bills</p>
          </a>
          <a
            href="/reports"
            className="card cursor-pointer text-center p-4 sm:p-6 md:p-8 group"
          >
            <div className="bg-primary-50 group-hover:bg-primary-100 rounded-lg p-3 mx-auto w-fit mb-3 sm:mb-4 transition-colors">
              <TrendingUp size={24} className="sm:w-8 sm:h-8 text-primary-700" />
            </div>
            <h3 className="font-semibold text-medical-900 text-sm sm:text-base">View Reports</h3>
            <p className="text-xs sm:text-sm text-medical-600 mt-2">Hospital statistics & analytics</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
