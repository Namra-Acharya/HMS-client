import Dexie from 'dexie';

export const hmsDB = new Dexie('HospitalManagementSystem');

hmsDB.version(1).stores({
  patients: '&id, admissionDate, status, department',
  doctors: '&id, specialization, department',
  nurses: '&id, shift, ward',
  nurseWorkChart: '&id, nurseId, date',
  billingRecords: '&id, patientId, status, createdAt',
  settings: '&key'
});

// Utility functions for offline operations
export const offlineDB = {
  // Patient operations
  async addPatient(patient) {
    return await hmsDB.patients.add(patient);
  },

  async getAllPatients() {
    return await hmsDB.patients.toArray();
  },

  async getPatientById(id) {
    return await hmsDB.patients.get(id);
  },

  async updatePatient(id, updates) {
    return await hmsDB.patients.update(id, updates);
  },

  async deletePatient(id) {
    return await hmsDB.patients.delete(id);
  },

  async getPatientsByStatus(status) {
    return await hmsDB.patients.where('status').equals(status).toArray();
  },

  async getPatientsByDepartment(department) {
    return await hmsDB.patients.where('department').equals(department).toArray();
  },

  // Doctor operations
  async addDoctor(doctor) {
    return await hmsDB.doctors.add(doctor);
  },

  async getAllDoctors() {
    return await hmsDB.doctors.toArray();
  },

  async getDoctorById(id) {
    return await hmsDB.doctors.get(id);
  },

  async updateDoctor(id, updates) {
    return await hmsDB.doctors.update(id, updates);
  },

  async deleteDoctor(id) {
    return await hmsDB.doctors.delete(id);
  },

  // Nurse operations
  async addNurse(nurse) {
    return await hmsDB.nurses.add(nurse);
  },

  async getAllNurses() {
    return await hmsDB.nurses.toArray();
  },

  async getNurseById(id) {
    return await hmsDB.nurses.get(id);
  },

  async updateNurse(id, updates) {
    return await hmsDB.nurses.update(id, updates);
  },

  async deleteNurse(id) {
    return await hmsDB.nurses.delete(id);
  },

  async getNursesByWard(ward) {
    return await hmsDB.nurses.where('ward').equals(ward).toArray();
  },

  async getNursesByShift(shift) {
    return await hmsDB.nurses.where('shift').equals(shift).toArray();
  },

  // Nurse Work Chart operations
  async addWorkChartEntry(entry) {
    return await hmsDB.nurseWorkChart.add(entry);
  },

  async getWorkChartByDate(date) {
    return await hmsDB.nurseWorkChart.where('date').equals(date).toArray();
  },

  async getWorkChartByNurseId(nurseId) {
    return await hmsDB.nurseWorkChart.where('nurseId').equals(nurseId).toArray();
  },

  async getAllWorkCharts() {
    return await hmsDB.nurseWorkChart.toArray();
  },

  // Billing operations
  async addBillingRecord(record) {
    return await hmsDB.billingRecords.add(record);
  },

  async getAllBillingRecords() {
    return await hmsDB.billingRecords.toArray();
  },

  async getBillingById(id) {
    return await hmsDB.billingRecords.get(id);
  },

  async updateBillingRecord(id, updates) {
    return await hmsDB.billingRecords.update(id, updates);
  },

  async deleteBillingRecord(id) {
    return await hmsDB.billingRecords.delete(id);
  },

  async getBillingByPatientId(patientId) {
    return await hmsDB.billingRecords.where('patientId').equals(patientId).toArray();
  },

  // Settings operations
  async setSetting(key, value) {
    return await hmsDB.settings.put({ key, value });
  },

  async getSetting(key) {
    const setting = await hmsDB.settings.get(key);
    return setting ? setting.value : null;
  },

  // Sync operations
  async getPendingSyncs() {
    const syncs = await hmsDB.settings.get('pending_syncs');
    return syncs ? syncs.value : [];
  },

  async addPendingSync(operation) {
    const syncs = (await this.getPendingSyncs()) || [];
    syncs.push({ ...operation, timestamp: new Date().toISOString() });
    await this.setSetting('pending_syncs', syncs);
  },

  async clearPendingSyncs() {
    await this.setSetting('pending_syncs', []);
  },

  // Clear all data
  async clearAll() {
    await hmsDB.delete();
    await hmsDB.open();
  }
};

export default offlineDB;
