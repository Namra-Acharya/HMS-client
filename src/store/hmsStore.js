import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useHMSStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Patients
        patients: [],
        setPatients: (patients) => set({ patients }),
        addPatient: (patient) => set((state) => ({ patients: [patient, ...state.patients] })),
        updatePatient: (id, updates) =>
          set((state) => ({
            patients: state.patients.map((p) => (p.id === id ? { ...p, ...updates } : p))
          })),
        removePatient: (id) =>
          set((state) => ({
            patients: state.patients.filter((p) => p.id !== id)
          })),

        // Doctors
        doctors: [],
        setDoctors: (doctors) => set({ doctors }),
        addDoctor: (doctor) => set((state) => ({ doctors: [doctor, ...state.doctors] })),
        updateDoctor: (id, updates) =>
          set((state) => ({
            doctors: state.doctors.map((d) => (d.id === id ? { ...d, ...updates } : d))
          })),
        removeDoctor: (id) =>
          set((state) => ({
            doctors: state.doctors.filter((d) => d.id !== id)
          })),

        // Nurses
        nurses: [],
        setNurses: (nurses) => set({ nurses }),
        addNurse: (nurse) => set((state) => ({ nurses: [nurse, ...state.nurses] })),
        updateNurse: (id, updates) =>
          set((state) => ({
            nurses: state.nurses.map((n) => (n.id === id ? { ...n, ...updates } : n))
          })),
        removeNurse: (id) =>
          set((state) => ({
            nurses: state.nurses.filter((n) => n.id !== id)
          })),

        // Nurse Work Chart
        workCharts: [],
        setWorkCharts: (charts) => set({ workCharts: charts }),
        addWorkChart: (chart) => set((state) => ({ workCharts: [chart, ...state.workCharts] })),

        // Billing
        billingRecords: [],
        setBillingRecords: (records) => set((state) => {
          const recordsWithStatus = records.map(r => ({ ...r, status: r.status || 'Pending' }));
          const paidTotal = recordsWithStatus
            .filter(b => b.status === 'Paid')
            .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
          return {
            billingRecords: recordsWithStatus,
            dashboardStats: { ...state.dashboardStats, totalRevenue: paidTotal }
          };
        }),
        addBillingRecord: (record) => set((state) => {
          const recordWithStatus = { ...record, status: record.status || 'Pending' };
          const newBillingRecords = [recordWithStatus, ...state.billingRecords];
          const paidTotal = newBillingRecords
            .filter(b => b.status === 'Paid')
            .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
          return {
            billingRecords: newBillingRecords,
            dashboardStats: { ...state.dashboardStats, totalRevenue: paidTotal }
          };
        }),
        updateBillingRecord: (id, updates) =>
          set((state) => {
            const updatedRecords = state.billingRecords.map((b) => (b.id === id ? { ...b, ...updates } : b));
            const paidTotal = updatedRecords
              .filter(b => b.status === 'Paid')
              .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
            return {
              billingRecords: updatedRecords,
              dashboardStats: { ...state.dashboardStats, totalRevenue: paidTotal }
            };
          }),

        // Dashboard
        dashboardStats: {
          totalOPDPatients: 0,
          totalIPDPatients: 0,
          icuOccupiedBeds: 0,
          admissionsToday: 0,
          dischargesToday: 0,
          totalDoctors: 0,
          totalNurses: 0,
          totalRevenue: 0
        },
        setDashboardStats: (stats) => set({ dashboardStats: stats }),

        // UI State
        loading: false,
        setLoading: (loading) => set({ loading }),
        error: null,
        setError: (error) => set({ error }),
        notification: null,
        setNotification: (notification) => set({ notification }),
        isOnline: navigator.onLine,
        setIsOnline: (online) => set({ isOnline: online }),

        // Authentication
        isAuthenticated: false,
        setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated })
      }),
      {
        name: 'hms-store',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
);

export default useHMSStore;
