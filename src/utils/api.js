import axios from 'axios';
import offlineDB from './offlineDB';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

// Network detection
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  console.log('🌐 Online - syncing offline data');
  syncOfflineData();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('📴 Offline mode activated');
});

// Sync offline data when coming online
async function syncOfflineData() {
  try {
    const pendingSyncs = await offlineDB.getPendingSyncs();
    if (pendingSyncs.length === 0) return;

    for (const sync of pendingSyncs) {
      try {
        await api({
          method: sync.method,
          url: sync.url,
          data: sync.data
        });
      } catch (error) {
        console.error('Sync failed for:', sync, error);
      }
    }

    await offlineDB.clearPendingSyncs();
    console.log('✅ Offline data synced');
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Wrapper for API calls with offline support
const apiCall = async (method, url, data = null) => {
  try {
    if (isOnline) {
      const response = await api({
        method,
        url,
        data
      });
      return response.data;
    } else {
      // Offline mode
      console.log('📴 Operating in offline mode');
      throw new Error('Offline');
    }
  } catch (error) {
    if (!isOnline && data) {
      // Store operation for later sync
      await offlineDB.addPendingSync({ method, url, data });
      console.log('⏳ Operation queued for sync');
      return { success: true, offline: true, message: 'Operation saved offline' };
    }
    throw error;
  }
};

// Patient API
export const patientAPI = {
  create: (data) => apiCall('POST', '/patients', data),
  getAll: (params) =>
    isOnline
      ? api.get('/patients', { params }).then((r) => r.data).catch(() =>
          offlineDB.getAllPatients().then((patients) => ({ success: true, data: patients, offline: true }))
        )
      : offlineDB.getAllPatients().then((patients) => ({ success: true, data: patients })),
  getById: (id) =>
    isOnline
      ? api.get(`/patients/${id}`).then((r) => r.data).catch(() =>
          offlineDB.getPatientById(id).then((patient) => ({ success: true, data: patient, offline: true }))
        )
      : offlineDB.getPatientById(id).then((patient) => ({ success: true, data: patient })),
  update: (id, data) => apiCall('PUT', `/patients/${id}`, data),
  discharge: (id) => apiCall('POST', `/patients/${id}/discharge`, {}),
  delete: (id) => apiCall('DELETE', `/patients/${id}`),
  search: (params) =>
    isOnline
      ? api.get('/patients', { params }).then((r) => r.data).catch(() =>
          offlineDB.getAllPatients().then((patients) => {
            const filtered = patients.filter((p) =>
              params.search ? p.name.toLowerCase().includes(params.search.toLowerCase()) : true
            );
            return { success: true, data: filtered, offline: true };
          })
        )
      : offlineDB.getAllPatients().then((patients) => {
          const filtered = patients.filter((p) =>
            params.search ? p.name.toLowerCase().includes(params.search.toLowerCase()) : true
          );
          return { success: true, data: filtered };
        })
};

// Doctor API
export const doctorAPI = {
  create: (data) => apiCall('POST', '/doctors', data),
  getAll: (params) =>
    isOnline
      ? api.get('/doctors', { params }).then((r) => r.data).catch(() =>
          offlineDB.getAllDoctors().then((doctors) => ({ success: true, data: doctors, offline: true }))
        )
      : offlineDB.getAllDoctors().then((doctors) => ({ success: true, data: doctors })),
  getById: (id) =>
    isOnline
      ? api.get(`/doctors/${id}`).then((r) => r.data).catch(() =>
          offlineDB.getDoctorById(id).then((doctor) => ({ success: true, data: doctor, offline: true }))
        )
      : offlineDB.getDoctorById(id).then((doctor) => ({ success: true, data: doctor })),
  update: (id, data) => apiCall('PUT', `/doctors/${id}`, data),
  delete: (id) => apiCall('DELETE', `/doctors/${id}`)
};

// Nurse API
export const nurseAPI = {
  create: (data) => apiCall('POST', '/nurses', data),
  getAll: (params) =>
    isOnline
      ? api.get('/nurses', { params }).then((r) => r.data).catch(() =>
          offlineDB.getAllNurses().then((nurses) => ({ success: true, data: nurses, offline: true }))
        )
      : offlineDB.getAllNurses().then((nurses) => ({ success: true, data: nurses })),
  getById: (id) =>
    isOnline
      ? api.get(`/nurses/${id}`).then((r) => r.data).catch(() =>
          offlineDB.getNurseById(id).then((nurse) => ({ success: true, data: nurse, offline: true }))
        )
      : offlineDB.getNurseById(id).then((nurse) => ({ success: true, data: nurse })),
  update: (id, data) => apiCall('PUT', `/nurses/${id}`, data),
  delete: (id) => apiCall('DELETE', `/nurses/${id}`)
};

// Work Chart API
export const workChartAPI = {
  create: (data) => apiCall('POST', '/work-chart', data),
  getAll: (params) =>
    isOnline
      ? api.get('/work-chart', { params }).then((r) => r.data).catch(() =>
          offlineDB.getAllWorkCharts().then((charts) => {
            let filtered = charts;
            if (params && params.month) {
              const startDate = new Date(`${params.month}-01`);
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + 1);
              filtered = charts.filter(c => {
                const d = new Date(c.date);
                return d >= startDate && d < endDate;
              });
            }
            if (params && params.nurseId) {
              filtered = filtered.filter(c => c.nurseId === params.nurseId);
            }
            return { success: true, data: filtered, offline: true };
          })
        )
      : offlineDB.getAllWorkCharts().then((charts) => {
          let filtered = charts;
          if (params && params.month) {
            const startDate = new Date(`${params.month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            filtered = charts.filter(c => {
              const d = new Date(c.date);
              return d >= startDate && d < endDate;
            });
          }
          if (params && params.nurseId) {
            filtered = filtered.filter(c => c.nurseId === params.nurseId);
          }
          return { success: true, data: filtered };
        })
};

// Billing API
export const billingAPI = {
  create: (data) => apiCall('POST', '/billing', data),
  getAll: (params) =>
    isOnline
      ? api.get('/billing', { params }).then((r) => r.data).catch(() =>
          offlineDB.getAllBillingRecords().then((records) => ({ success: true, data: records, offline: true }))
        )
      : offlineDB.getAllBillingRecords().then((records) => ({ success: true, data: records })),
  getById: (id) =>
    isOnline
      ? api.get(`/billing/${id}`).then((r) => r.data).catch(() =>
          offlineDB.getBillingById(id).then((record) => ({ success: true, data: record, offline: true }))
        )
      : offlineDB.getBillingById(id).then((record) => ({ success: true, data: record })),
  update: (id, data) => apiCall('PUT', `/billing/${id}`, data),
  delete: (id) => apiCall('DELETE', `/billing/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      if (isOnline) {
        return await api.get('/dashboard/stats').then((r) => r.data);
      }
    } catch (error) {
      console.log('📴 Dashboard stats API failed, using offline data');
    }

    return {
      success: true,
      data: {
        totalOPDPatients: 0,
        totalIPDPatients: 0,
        icuOccupiedBeds: 0,
        admissionsToday: 0,
        dischargesToday: 0,
        totalDoctors: 0,
        totalNurses: 0,
        totalRevenue: 0
      },
      offline: true
    };
  },

  getRecentPatients: async () => {
    try {
      if (isOnline) {
        return await api.get('/dashboard/recent-patients').then((r) => r.data);
      }
    } catch (error) {
      console.log('📴 Recent patients API failed, using offline data');
    }

    const patients = await offlineDB.getAllPatients();
    return {
      success: true,
      data: patients.filter((p) => p.status === 'Admitted').slice(0, 10),
      offline: true
    };
  },

  getDailyReport: async (params) => {
    try {
      if (isOnline) {
        return await api.get('/dashboard/daily-report', { params }).then((r) => r.data);
      }
    } catch (error) {
      console.log('📴 Daily report API failed');
    }

    return { success: true, data: {}, offline: true };
  }
};

// Archive API
export const archiveAPI = {
  getArchives: () =>
    isOnline
      ? api.get('/archives').then((r) => r.data)
      : Promise.resolve({ success: true, data: [] }),

  getMonthlyData: (month) =>
    isOnline
      ? api.get(`/archives/${month}`).then((r) => r.data)
      : Promise.resolve({ success: true, data: {} }),

  archiveMonth: (month, deleteOption = 'manual') =>
    isOnline
      ? api.post('/archives', { month, deleteOption }).then((r) => r.data)
      : Promise.resolve({ success: false, error: 'Offline mode' }),

  generatePDF: (month) => {
    if (isOnline) {
      window.open(`/api/archives/${month}/pdf`, '_blank');
      return Promise.resolve({ success: true });
    }
    return Promise.resolve({ success: false, error: 'Offline mode' });
  },

  deleteMonth: (month) =>
    isOnline
      ? api.delete(`/archives/${month}`).then((r) => r.data)
      : Promise.resolve({ success: false, error: 'Offline mode' })
};

export const checkOnline = () => isOnline;

export default api;
