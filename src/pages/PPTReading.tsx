import { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { SurgeBunkerProcess, PPTReading, Material } from '../types';

export default function PPTReadingPage() {
  const [surgeBunkerProcesses, setSurgeBunkerProcesses] = useState<SurgeBunkerProcess[]>([]);
  const [pptReadings, setPPTReadings] = useState<PPTReading[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<SurgeBunkerProcess | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReading, setSelectedReading] = useState<PPTReading | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [formData, setFormData] = useState({
    shift: '',
    shiftManagerName: '',
    rm1OpenStock: '',
    rm1ChargedQty: '',
    rm1CloseStock: '',
    rm2OpenStock: '',
    rm2ChargedQty: '',
    rm2CloseStock: '',
    rm3OpenStock: '',
    rm3ChargedQty: '',
    rm3CloseStock: '',
    semiFinishedProductName2: '',
  });

  useEffect(() => {
    setSurgeBunkerProcesses(storage.getSurgeBunkerProcesses());
    setPPTReadings(storage.getPPTReadings());
    setMaterials(storage.getMaterials());
  }, [pptReadings]);

  const calculateTotal = (open: string | number, charged: string | number, close: string | number) => {
    const openVal = typeof open === 'string' ? parseFloat(open) || 0 : open || 0;
    const chargedVal = typeof charged === 'string' ? parseFloat(charged) || 0 : charged || 0;
    const closeVal = typeof close === 'string' ? parseFloat(close) || 0 : close || 0;
    return openVal + chargedVal - closeVal;
  };

  const handleProcess = (process: SurgeBunkerProcess) => {
    setSelectedProcess(process);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess) return;

    const newReading: PPTReading = {
      id: Date.now().toString(),
      surgeBunkerId: selectedProcess.id,
      serialNo: selectedProcess.serialNo,
      productName: selectedProcess.productName,
      date: selectedProcess.date,
      targetQty: selectedProcess.targetQty,
      totalStock: selectedProcess.totalStock,
      semiFinishedProductName: selectedProcess.semiFinishedProductName,
      shift: formData.shift,
      shiftManagerName: formData.shiftManagerName,
      rm1Stock: {
        openStock: parseFloat(formData.rm1OpenStock),
        chargedQty: parseFloat(formData.rm1ChargedQty),
        closeStock: parseFloat(formData.rm1CloseStock),
      },
      rm2Stock: {
        openStock: parseFloat(formData.rm2OpenStock),
        chargedQty: parseFloat(formData.rm2ChargedQty),
        closeStock: parseFloat(formData.rm2CloseStock),
      },
      rm3Stock: {
        openStock: parseFloat(formData.rm3OpenStock),
        chargedQty: parseFloat(formData.rm3ChargedQty),
        closeStock: parseFloat(formData.rm3CloseStock),
      },
      semiFinishedProductName2: formData.semiFinishedProductName2,
      batchCode: selectedProcess.batchCode,
      rm1Name: selectedProcess.rm1Name,
      rm2Name: selectedProcess.rm2Name,
      rm3Name: selectedProcess.rm3Name,
    };

    const updatedReadings = [...pptReadings, newReading];
    setPPTReadings(updatedReadings);
    storage.setPPTReadings(updatedReadings);

    const updatedProcesses = surgeBunkerProcesses.filter(
      (p) => p.id !== selectedProcess.id
    );
    setSurgeBunkerProcesses(updatedProcesses);
    storage.setSurgeBunkerProcesses(updatedProcesses);

    setShowModal(false);
    setSelectedProcess(null);
    setFormData({
      shift: '',
      shiftManagerName: '',
      rm1OpenStock: '',
      rm1ChargedQty: '',
      rm1CloseStock: '',
      rm2OpenStock: '',
      rm2ChargedQty: '',
      rm2CloseStock: '',
      rm3OpenStock: '',
      rm3ChargedQty: '',
      rm3CloseStock: '',
      semiFinishedProductName2: '',
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">PPT Reading</h2>

        <div className="mb-6 flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({surgeBunkerProcesses.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History ({pptReadings.length})
          </button>
        </div>

        {activeTab === 'pending' ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serial No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batch Code</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Target</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Shift</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Manager</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Stock</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Semi-Finished</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {surgeBunkerProcesses.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No pending items
                      </td>
                    </tr>
                  ) : (
                    surgeBunkerProcesses.map((process) => (
                      <tr key={process.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleProcess(process)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                          >
                            Process
                          </button>
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-900">{process.serialNo}</td>
                        <td className="px-3 py-3 text-gray-700">{process.batchCode || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{process.productName}</td>
                        <td className="px-3 py-3 text-gray-700">{process.date}</td>
                        <td className="px-3 py-3 text-gray-700">{process.targetQty} MT</td>
                        <td className="px-3 py-3 text-gray-700">{process.shift}</td>
                        <td className="px-3 py-3 text-gray-700">{process.shiftManagerName}</td>
                        <td className="px-3 py-3 text-gray-700">{process.totalStock.toFixed(2)} MT</td>
                        <td className="px-3 py-3 text-gray-700">{process.semiFinishedProductName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serial No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batch Code</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Target</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SB Total Stock</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PPT Total Stock</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Shift</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Manager</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Semi-Finished</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Semi-Finished 2</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pptReadings.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        No processed items
                      </td>
                    </tr>
                  ) : (
                    pptReadings.map((reading) => {
                      // Find the corresponding Surge Bunker process to get SB Total Stock
                      const surgeBunkerProcess = surgeBunkerProcesses.find(
                        (process) => process.id === reading.surgeBunkerId
                      );
                      
                      const sbTotalStock = surgeBunkerProcess?.totalStock || 0;
                      const pptTotalStock = reading.totalStock || 0;

                      return (
                        <tr key={reading.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-3 font-medium text-gray-900">{reading.serialNo}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.batchCode || '-'}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.productName}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.date}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.targetQty} MT</td>
                          <td className="px-3 py-3 text-gray-700">{sbTotalStock.toFixed(2)} MT</td>
                          <td className="px-3 py-3 text-gray-700">{pptTotalStock.toFixed(2)} MT</td>
                          <td className="px-3 py-3 text-gray-700">{reading.shift}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.shiftManagerName}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.semiFinishedProductName}</td>
                          <td className="px-3 py-3 text-gray-700">{reading.semiFinishedProductName2}</td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReading(reading);
                                setShowViewModal(true);
                              }}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">PPT Reading - {selectedProcess.serialNo}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              id="ppt-reading-form"
              onSubmit={handleSubmit}
              className="flex-1 p-6 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={selectedProcess.productName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="text"
                    value={selectedProcess.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Target Qty</label>
                  <input
                    type="text"
                    value={`${selectedProcess.targetQty} MT`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Manager Name</label>
                  <input
                    type="text"
                    value={formData.shiftManagerName}
                    onChange={(e) => setFormData({ ...formData, shiftManagerName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">RM1 Stock Details</h4>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm text-gray-700">Raw Material</label>
                    <select
                      value={formData.rm1Name || selectedProcess.rm1Name}
                      onChange={(e) => setFormData({ ...formData, rm1Name: e.target.value })}
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select RM1</option>
                      {selectedProcess.rm1Name && !materials.find((m) => m.materialName === selectedProcess.rm1Name) && (
                        <option value={selectedProcess.rm1Name}>{selectedProcess.rm1Name}</option>
                      )}
                      {materials.map((m) => (
                        <option key={m.id} value={m.materialName}>{m.materialName}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Unit: {materials.find((m) => m.materialName === (formData.rm1Name || selectedProcess.rm1Name))?.unit || '-'}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Open Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm1OpenStock}
                        onChange={(e) => setFormData({ ...formData, rm1OpenStock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Charged Qty</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm1ChargedQty}
                        onChange={(e) => setFormData({ ...formData, rm1ChargedQty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Close Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm1CloseStock}
                        onChange={(e) => setFormData({ ...formData, rm1CloseStock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        value={calculateTotal(formData.rm1OpenStock, formData.rm1ChargedQty, formData.rm1CloseStock).toFixed(2)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">RM2 Stock Details</h4>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm text-gray-700">Raw Material</label>
                    <select
                      value={formData.rm2Name || selectedProcess.rm2Name}
                      onChange={(e) => setFormData({ ...formData, rm2Name: e.target.value })}
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select RM2</option>
                      {selectedProcess.rm2Name && !materials.find((m) => m.materialName === selectedProcess.rm2Name) && (
                        <option value={selectedProcess.rm2Name}>{selectedProcess.rm2Name}</option>
                      )}
                      {materials.map((m) => (
                        <option key={m.id} value={m.materialName}>{m.materialName}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Unit: {materials.find((m) => m.materialName === (formData.rm2Name || selectedProcess.rm2Name))?.unit || '-'}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Open Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm2OpenStock}
                        onChange={(e) => setFormData({ ...formData, rm2OpenStock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Charged Qty</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm2ChargedQty}
                        onChange={(e) => setFormData({ ...formData, rm2ChargedQty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Close Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm2CloseStock}
                        onChange={(e) => setFormData({ ...formData, rm2CloseStock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        value={calculateTotal(formData.rm2OpenStock, formData.rm2ChargedQty, formData.rm2CloseStock).toFixed(2)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">RM3 Stock Details</h4>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm text-gray-700">Raw Material</label>
                    <select
                      value={formData.rm3Name || selectedProcess.rm3Name}
                      onChange={(e) => setFormData({ ...formData, rm3Name: e.target.value })}
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select RM3</option>
                      {selectedProcess.rm3Name && !materials.find((m) => m.materialName === selectedProcess.rm3Name) && (
                        <option value={selectedProcess.rm3Name}>{selectedProcess.rm3Name}</option>
                      )}
                      {materials.map((m) => (
                        <option key={m.id} value={m.materialName}>{m.materialName}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Unit: {materials.find((m) => m.materialName === (formData.rm3Name || selectedProcess.rm3Name))?.unit || '-'}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Open Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm3OpenStock}
                        onChange={(e) => setFormData({ ...formData, rm3OpenStock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Charged Qty</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm3ChargedQty}
                        onChange={(e) => setFormData({ ...formData, rm3ChargedQty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Close Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm3CloseStock}
                        onChange={(e) => setFormData({ ...formData, rm3CloseStock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        value={calculateTotal(formData.rm3OpenStock, formData.rm3ChargedQty, formData.rm3CloseStock).toFixed(2)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semi-Finished Product Name 2</label>
                <input
                  type="text"
                  value={formData.semiFinishedProductName2}
                  onChange={(e) => setFormData({ ...formData, semiFinishedProductName2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
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
                  form="ppt-reading-form"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Reading Details - {selectedReading.serialNo}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReading(null);
                }}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Product Name</label>
                  <input
                    type="text"
                    value={selectedReading.productName}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Date</label>
                  <input
                    type="text"
                    value={selectedReading.date}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Shift</label>
                  <input
                    type="text"
                    value={selectedReading.shift}
                    className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Shift Manager Name</label>
                  <input
                    type="text"
                    value={selectedReading.shiftManagerName}
                    className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">RM1 Stock Details — {selectedReading.rm1Name || '-'} {materials.find((m) => m.materialName === selectedReading.rm1Name) ? `(${materials.find((m) => m.materialName === selectedReading.rm1Name)?.unit})` : ''}</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Open Stock</label>
                      <input
                        type="number"
                        value={selectedReading.rm1Stock.openStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Charged Qty</label>
                      <input
                        type="number"
                        value={selectedReading.rm1Stock.chargedQty}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Close Stock</label>
                      <input
                        type="number"
                        value={selectedReading.rm1Stock.closeStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Total</label>
                      <input
                        type="text"
                        value={(selectedReading.rm1Stock.openStock + selectedReading.rm1Stock.chargedQty - selectedReading.rm1Stock.closeStock).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">RM2 Stock Details — {selectedReading.rm2Name || '-'} {materials.find((m) => m.materialName === selectedReading.rm2Name) ? `(${materials.find((m) => m.materialName === selectedReading.rm2Name)?.unit})` : ''}</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Open Stock</label>
                      <input
                        type="number"
                        value={selectedReading.rm2Stock.openStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Charged Qty</label>
                      <input
                        type="number"
                        value={selectedReading.rm2Stock.chargedQty}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Close Stock</label>
                      <input
                        type="number"
                        value={selectedReading.rm2Stock.closeStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Total</label>
                      <input
                        type="text"
                        value={(selectedReading.rm2Stock.openStock + selectedReading.rm2Stock.chargedQty - selectedReading.rm2Stock.closeStock).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">RM3 Stock Details — {selectedReading.rm3Name || '-'} {materials.find((m) => m.materialName === selectedReading.rm3Name) ? `(${materials.find((m) => m.materialName === selectedReading.rm3Name)?.unit})` : ''}</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Open Stock</label>
                      <input
                        type="number"
                        value={selectedReading.rm3Stock.openStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Charged Qty</label>
                      <input
                        type="number"
                        value={selectedReading.rm3Stock.chargedQty}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Close Stock</label>
                      <input
                        type="number"
                        value={selectedReading.rm3Stock.closeStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">Total</label>
                      <input
                        type="text"
                        value={(selectedReading.rm3Stock.openStock + selectedReading.rm3Stock.chargedQty - selectedReading.rm3Stock.closeStock).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Semi-Finished Product 1</label>
                  <input
                    type="text"
                    value={selectedReading.semiFinishedProductName}
                    className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Semi-Finished Product 2</label>
                  <input
                    type="text"
                    value={selectedReading.semiFinishedProductName2}
                    className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReading(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}