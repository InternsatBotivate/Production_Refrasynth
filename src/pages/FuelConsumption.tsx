import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { FuelConsumption, SurgeBunkerProcess } from '../types';

export default function FuelConsumptionPage() {
  const [fuelRecords, setFuelRecords] = useState<FuelConsumption[]>([]);
  const [surgeBunkerProcesses, setSurgeBunkerProcesses] = useState<SurgeBunkerProcess[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    serialNo: '',
    productName: '',
    batchCode: '',
    date: '',
    shift: '',
    fuelUsed: '',
    supervisorName: '',
    remarks: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFuelRecords(storage.getFuelConsumption());
    setSurgeBunkerProcesses(storage.getSurgeBunkerProcesses());
  }, []);

  // Get unique serial numbers from surge bunker processes for dropdown
  const serialNumbers = [...new Set(surgeBunkerProcesses.map(process => process.serialNo))];

  // Get batch codes for selected serial number
  const batchCodes = surgeBunkerProcesses
    .filter(process => process.serialNo === formData.serialNo)
    .map(process => process.batchCode);

  // Get product name when serial number is selected
  const getProductName = (serialNo: string) => {
    const process = surgeBunkerProcesses.find(p => p.serialNo === serialNo);
    return process?.productName || '';
  };

  const handleSerialNoChange = (serialNo: string) => {
    const productName = getProductName(serialNo);
    setFormData({
      ...formData,
      serialNo,
      productName,
      batchCode: '' // Reset batch code when serial number changes
    });
  };

  const handleBatchCodeChange = (batchCode: string) => {
    setFormData({
      ...formData,
      batchCode
    });
  };

  const generateFuelSerialNo = () => {
    const count = fuelRecords.length + 1;
    return `FC-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: FuelConsumption = {
      id: Date.now().toString(),
      fuelSerialNo: generateFuelSerialNo(),
      serialNo: formData.serialNo,
      productName: formData.productName,
      batchCode: formData.batchCode,
      date: formData.date,
      shift: formData.shift,
      fuelUsed: parseFloat(formData.fuelUsed),
      supervisorName: formData.supervisorName,
      remarks: formData.remarks,
    };

    const updatedRecords = [...fuelRecords, newRecord];
    setFuelRecords(updatedRecords);
    storage.setFuelConsumption(updatedRecords);
    setShowModal(false);
    setFormData({
      serialNo: '',
      productName: '',
      batchCode: '',
      date: '',
      shift: '',
      fuelUsed: '',
      supervisorName: '',
      remarks: '',
    });
  };

  // Filter fuel records based on search query
  const filteredRecords = fuelRecords.filter(record =>
    record.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.fuelSerialNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Fuel Consumption</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Record</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Records
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Serial No, Product, Batch Code..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fuel Serial No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Serial No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Batch Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Shift</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fuel Used (L)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supervisor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {fuelRecords.length === 0 ? 'No fuel consumption records yet' : 'No records found'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.fuelSerialNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.serialNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.batchCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.shift}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.fuelUsed} L</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.supervisorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Fuel Record</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              id="fuel-consumption-form"
              onSubmit={handleSubmit}
              className="flex-1 p-6 space-y-4 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial No</label>
                <select
                  value={formData.serialNo}
                  onChange={(e) => handleSerialNoChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Serial No</option>
                  {serialNumbers.map(serialNo => (
                    <option key={serialNo} value={serialNo}>{serialNo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Code</label>
                <select
                  value={formData.batchCode}
                  onChange={(e) => handleBatchCodeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Batch Code</option>
                  {batchCodes.map(batchCode => (
                    <option key={batchCode} value={batchCode}>{batchCode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Shift</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Used (Liters)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fuelUsed}
                  onChange={(e) => setFormData({ ...formData, fuelUsed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Name</label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>
            </form>
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="fuel-consumption-form"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}