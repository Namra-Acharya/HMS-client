import React, { useEffect, useState } from 'react';
import { FileDown, Calendar } from 'lucide-react';
import useHMSStore from '../store/hmsStore';
import { archiveAPI } from '../utils/api';

function MonthlyArchives() {
  const { setNotification } = useHMSStore();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingMonth, setGeneratingMonth] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const currentDate = new Date().toISOString().slice(0, 7);
    setGeneratingMonth(currentDate);
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      setLoading(true);
      const response = await archiveAPI.getArchives();
      if (response.success && response.data) {
        setArchives(response.data.sort((a, b) => b.month.localeCompare(a.month)));
      }
    } catch (error) {
      console.error('Failed to load archives:', error);
      setNotification({ type: 'error', message: 'Failed to load archives' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArchive = async () => {
    if (!generatingMonth) {
      setNotification({ type: 'error', message: 'Please select a month' });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await archiveAPI.generatePDF(generatingMonth);
      if (response.success) {
        setNotification({ type: 'success', message: 'Archive generated successfully' });
        setGeneratingMonth('');
        await loadArchives();
      }
    } catch (error) {
      console.error('Error generating archive:', error);
      setNotification({ type: 'error', message: 'Failed to generate archive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = (month) => {
    archiveAPI.generatePDF(month);
  };

  const getMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monthly Archives</h1>
        <p className="text-gray-600 mt-2">Generate and download monthly reports</p>
      </div>

      {/* Generate Archive Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Archive</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="month"
              value={generatingMonth}
              onChange={(e) => setGeneratingMonth(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <button
            onClick={handleGenerateArchive}
            disabled={isGenerating}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 whitespace-nowrap"
          >
            <FileDown size={18} />
            Generate PDF
          </button>
        </div>
      </div>

      {/* Archives List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Archives</h2>
        
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Loading archives...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No archives available yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Month</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Patients</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Revenue</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {archives.map((archive, index) => (
                  <tr key={archive._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {getMonthLabel(archive.month)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{archive.patientCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₹{(archive.billingTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadPDF(archive.month)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <FileDown size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyArchives;
