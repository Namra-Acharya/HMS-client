import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { workChartAPI, nurseAPI } from '../utils/api';
import offlineDB from '../utils/offlineDB';

function NurseWorkChart({ onClose }) {
  const { nurses, setNurses, addWorkChart } = useHMSStore();
  const [formData, setFormData] = useState({
    nurseId: '',
    nurseName: '',
    ward: '',
    shift: '',
    date: new Date().toISOString().split('T')[0],
    tasks: '',
    doctorObservations: ''
  });

  const [loading, setLoading] = useState(false);
  const [workCharts, setWorkCharts] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterNurse, setFilterNurse] = useState('');

  const shifts = ['Morning (6AM-2PM)', 'Afternoon (2PM-10PM)', 'Night (10PM-6AM)'];

  useEffect(() => {
    loadNursesAndCharts();
  }, [filterMonth, filterNurse]);

  const loadNursesAndCharts = async () => {
    try {
      const nursesResponse = await nurseAPI.getAll();
      if (nursesResponse.success) {
        setNurses(nursesResponse.data);
      }

      const params = { month: filterMonth };
      if (filterNurse) {
        params.nurseId = filterNurse;
      }

      const chartsResponse = await workChartAPI.getAll(params);
      if (chartsResponse.success) {
        setWorkCharts(chartsResponse.data);
      }
    } catch (error) {
      try {
        const offlineNurses = await offlineDB.getAllNurses();
        const offlineCharts = await offlineDB.getAllWorkCharts();
        setNurses(offlineNurses);

        const startDate = new Date(`${filterMonth}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const filtered = offlineCharts.filter(chart => {
          const chartDate = new Date(chart.date);
          const dateMatch = chartDate >= startDate && chartDate < endDate;
          const nurseMatch = !filterNurse || chart.nurseId === filterNurse;
          return dateMatch && nurseMatch;
        });

        setWorkCharts(filtered);
      } catch (err) {
        setNurses([]);
        setWorkCharts([]);
      }
    }
  };

  const handleNurseChange = (e) => {
    const nurseId = e.target.value;
    const nurse = nurses.find((n) => n.id === nurseId);
    if (nurse) {
      setFormData((prev) => ({
        ...prev,
        nurseId: nurse.id,
        nurseName: nurse.name,
        ward: nurse.ward,
        shift: nurse.shift
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await workChartAPI.create(formData);
      if (response.success) {
        const newChart = { ...formData, id: response.data.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        addWorkChart(newChart);
        await offlineDB.addWorkChartEntry(newChart);

        setFormData({
          nurseId: '',
          nurseName: '',
          ward: '',
          shift: '',
          date: new Date().toISOString().split('T')[0],
          tasks: '',
          doctorObservations: ''
        });
        loadNursesAndCharts();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl my-8">
        <div className="sticky top-0 bg-white flex justify-between items-center p-8 border-b border-gray-200 rounded-t-xl">
          <h2 className="text-3xl font-bold text-gray-900">Nurse Work Chart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form - Left Side */}
            <div className="lg:col-span-1">
              <form onSubmit={handleSubmit} className="space-y-5 bg-gradient-to-b from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900">New Work Chart Entry</h3>

                <div className="border-b border-blue-200 pb-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">View Monthly Data</p>
                  <div className="form-group mb-3">
                    <label className="form-label text-xs">Month</label>
                    <input
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Filter by Nurse</label>
                    <select
                      value={filterNurse}
                      onChange={(e) => setFilterNurse(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Nurses</option>
                      {nurses.map((nurse) => (
                        <option key={nurse.id} value={nurse.id}>
                          {nurse.name} - {nurse.ward}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Select Nurse</label>
                  <select name="nurseId" value={formData.nurseId} onChange={handleNurseChange} required className="input-field">
                    <option value="">Choose a nurse</option>
                    {nurses.map((nurse) => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} - {nurse.ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ward</label>
                  <input type="text" value={formData.ward} disabled className="input-field bg-gray-100" />
                </div>

                <div className="form-group">
                  <label className="form-label">Shift</label>
                  <input type="text" value={formData.shift} disabled className="input-field bg-gray-100" />
                </div>

                <div className="form-group">
                  <label className="form-label">Tasks & Activities</label>
                  <textarea
                    name="tasks"
                    value={formData.tasks}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Describe nurse duties and tasks for the shift"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor Observations</label>
                  <textarea
                    name="doctorObservations"
                    value={formData.doctorObservations}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Doctor's notes and observations"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-gray-300">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : 'Add Entry'}
                  </button>
                </div>
              </form>
            </div>

            {/* Work Charts List - Right Side */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-b from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Work Chart Records</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">{filterMonth}</span>
                    {filterNurse && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        {nurses.find(n => n.id === filterNurse)?.name || 'Selected Nurse'}
                      </span>
                    )}
                    <span className="text-gray-700 font-semibold">
                      Total: {workCharts.length} entries
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto flex-1">
                  {workCharts.length > 0 ? (
                    workCharts.map((chart, index) => {
                      const chartDate = new Date(chart.date);
                      return (
                        <div
                          key={chart.id || index}
                          className="bg-white rounded-lg p-4 hover:shadow-md transition-all border-l-4 border-green-500 hover:border-green-600"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{chart.nurseName}</p>
                              <p className="text-xs text-gray-600 mt-1">{chart.ward} • {chart.shift}</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                              {chartDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          {chart.tasks && (
                            <div className="mb-2 pb-2 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1">📋 Tasks:</p>
                              <p className="text-sm text-gray-700 line-clamp-2">{chart.tasks}</p>
                            </div>
                          )}
                          {chart.doctorObservations && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">👨‍⚕️ Doctor Notes:</p>
                              <p className="text-sm text-gray-700 line-clamp-2">{chart.doctorObservations}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-gray-500 flex items-center justify-center h-full">
                      <div>
                        <p className="text-lg font-semibold mb-2">📭 No work charts recorded</p>
                        <p className="text-sm">for {filterMonth}{filterNurse ? ' - selected nurse' : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NurseWorkChart;
