import { useState, useEffect } from 'react';
import { Eye, FileText, X } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { CompositionPlan, SurgeBunkerProcess, PPTReading, FinishedGood, FuelConsumption } from '../types';

interface ProductionReport {
  id: string;
  serialNo: string;
  productName: string;
  planDate: string;
  closeDate: string;
  planTargetQty: number;
  status: 'open' | 'closed';
  batchCode?: string;
}

export default function ProductionReports() {
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProductionReport | null>(null);
  const [selectedBatchCode, setSelectedBatchCode] = useState('');
  const [costData, setCostData] = useState({
    rmCost: '',
    fuelCost: '',
    pmtCost: '',
  });

  useEffect(() => {
    generateReports();
  }, []);

  const generateReports = () => {
    const plans = storage.getPlans();
    const finishedGoods = storage.getFinishedGoods();
    
    const reportData: ProductionReport[] = plans.map(plan => {
      const finishedGood = finishedGoods.find(fg => fg.serialNo === plan.serialNo);
      const surgeBunkerProcess = storage.getSurgeBunkerProcesses().find(sb => sb.serialNo === plan.serialNo);
      
      return {
        id: plan.id,
        serialNo: plan.serialNo,
        productName: plan.productName,
        planDate: plan.date,
        closeDate: finishedGood?.date || '',
        planTargetQty: plan.targetQty,
        status: finishedGood ? 'closed' : 'open',
        batchCode: surgeBunkerProcess?.batchCode
      };
    });

    setReports(reportData);
  };

  const getProcessDetails = (serialNo: string) => {
    const plan = storage.getPlans().find(p => p.serialNo === serialNo);
    const surgeBunkerProcesses = storage.getSurgeBunkerProcesses().filter(sb => sb.serialNo === serialNo);
    const pptReadings = storage.getPPTReadings().filter(ppt => ppt.serialNo === serialNo);
    const finishedGood = storage.getFinishedGoods().find(fg => fg.serialNo === serialNo);
    const fuelRecords = storage.getFuelConsumption().filter(f => f.serialNo === serialNo);

    return {
      plan,
      surgeBunkerProcesses,
      pptReadings,
      finishedGood,
      fuelRecords
    };
  };

  const getFilteredProcessDetails = (serialNo: string, batchCode: string) => {
    const details = getProcessDetails(serialNo);
    
    return {
      plan: details.plan,
      surgeBunkerProcess: details.surgeBunkerProcesses.find(sb => sb.batchCode === batchCode),
      pptReading: details.pptReadings.find(ppt => ppt.batchCode === batchCode),
      finishedGood: details.finishedGood,
      fuelRecord: details.fuelRecords.find(f => f.batchCode === batchCode)
    };
  };

  const calculateTotalQty = (details: any) => {
    if (details.finishedGood) {
      return details.finishedGood.totalStock || 0;
    }
    if (details.pptReading) {
      return details.pptReading.totalStock || 0;
    }
    if (details.surgeBunkerProcess) {
      return details.surgeBunkerProcess.totalStock || 0;
    }
    return 0;
  };

  const handleViewDetails = (report: ProductionReport) => {
    setSelectedReport(report);
    setSelectedBatchCode(report.batchCode || '');
    setCostData({ rmCost: '', fuelCost: '', pmtCost: '' });
    setShowDetailModal(true);
  };

  const handleSaveCosts = () => {
    if (!selectedReport) return;

    // Save cost data to localStorage or your preferred storage
    const costRecords = storage.getCostRecords() || [];
    const newCostRecord = {
      id: Date.now().toString(),
      serialNo: selectedReport.serialNo,
      batchCode: selectedBatchCode,
      ...costData,
      totalQty: calculateTotalQty(getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode)),
      timestamp: new Date().toISOString()
    };

    const updatedCostRecords = [...costRecords.filter((cr: any) => 
      !(cr.serialNo === selectedReport.serialNo && cr.batchCode === selectedBatchCode)
    ), newCostRecord];

    storage.setCostRecords(updatedCostRecords);
    setShowDetailModal(false);
  };

  const getBatchCodes = (serialNo: string) => {
    const surgeBunkerProcesses = storage.getSurgeBunkerProcesses().filter(sb => sb.serialNo === serialNo);
    return surgeBunkerProcesses.map(sb => sb.batchCode).filter(Boolean) as string[];
  };

  const getStoredCostData = (serialNo: string, batchCode: string) => {
    const costRecords = storage.getCostRecords() || [];
    return costRecords.find((cr: any) => cr.serialNo === serialNo && cr.batchCode === batchCode);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Production Reports</h2>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serial No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Plan Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Close Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Plan Target Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No production reports available
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.serialNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.planDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.closeDate || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.planTargetQty} MT</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Production Details - {selectedReport.serialNo}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Batch Code Filter */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Batch Code
                </label>
                <select
                  value={selectedBatchCode}
                  onChange={(e) => {
                    setSelectedBatchCode(e.target.value);
                    const storedCosts = getStoredCostData(selectedReport.serialNo, e.target.value);
                    if (storedCosts) {
                      setCostData({
                        rmCost: storedCosts.rmCost,
                        fuelCost: storedCosts.fuelCost,
                        pmtCost: storedCosts.pmtCost
                      });
                    } else {
                      setCostData({ rmCost: '', fuelCost: '', pmtCost: '' });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Batches</option>
                  {getBatchCodes(selectedReport.serialNo).map(batchCode => (
                    <option key={batchCode} value={batchCode}>{batchCode}</option>
                  ))}
                </select>
              </div>

              {/* Process Details */}
              <div className="space-y-6">
                {/* Plan Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Composition Plan</h4>
                  {getProcessDetails(selectedReport.serialNo).plan ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Product Name</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).plan?.productName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target Qty</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).plan?.targetQty} MT</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Plan Date</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).plan?.date}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No plan data available</p>
                  )}
                </div>

                {/* Surge Bunker Process */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Surge Bunker Process</h4>
                  {selectedBatchCode ? (
                    getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).surgeBunkerProcess ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Batch Code</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).surgeBunkerProcess?.batchCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Shift</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).surgeBunkerProcess?.shift}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Manager</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).surgeBunkerProcess?.shiftManagerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Stock</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).surgeBunkerProcess?.totalStock.toFixed(2)} MT</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No surge bunker data for selected batch</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      {getProcessDetails(selectedReport.serialNo).surgeBunkerProcesses.map(process => (
                        <div key={process.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm text-gray-600">Batch Code</p>
                            <p className="font-semibold">{process.batchCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Shift</p>
                            <p className="font-semibold">{process.shift}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Manager</p>
                            <p className="font-semibold">{process.shiftManagerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Stock</p>
                            <p className="font-semibold">{process.totalStock.toFixed(2)} MT</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PPT Reading */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">PPT Reading</h4>
                  {selectedBatchCode ? (
                    getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).pptReading ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Batch Code</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).pptReading?.batchCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Shift</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).pptReading?.shift}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Manager</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).pptReading?.shiftManagerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Stock</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).pptReading?.totalStock.toFixed(2)} MT</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No PPT reading data for selected batch</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      {getProcessDetails(selectedReport.serialNo).pptReadings.map(reading => (
                        <div key={reading.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm text-gray-600">Batch Code</p>
                            <p className="font-semibold">{reading.batchCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Shift</p>
                            <p className="font-semibold">{reading.shift}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Manager</p>
                            <p className="font-semibold">{reading.shiftManagerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Stock</p>
                            <p className="font-semibold">{reading.totalStock.toFixed(2)} MT</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Finished Good */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Finished Good</h4>
                  {getProcessDetails(selectedReport.serialNo).finishedGood ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Close Date</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).finishedGood?.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Shift</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).finishedGood?.shift}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Supervisor</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).finishedGood?.supervisorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Stock</p>
                        <p className="font-semibold">{getProcessDetails(selectedReport.serialNo).finishedGood?.totalStock.toFixed(2)} MT</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No finished good data available</p>
                  )}
                </div>

                {/* Fuel Consumption */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Fuel Consumption</h4>
                  {selectedBatchCode ? (
                    getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).fuelRecord ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Batch Code</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).fuelRecord?.batchCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fuel Used</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).fuelRecord?.fuelUsed} L</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Supervisor</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).fuelRecord?.supervisorName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold">{getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode).fuelRecord?.date}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No fuel consumption data for selected batch</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      {getProcessDetails(selectedReport.serialNo).fuelRecords.map(fuel => (
                        <div key={fuel.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm text-gray-600">Batch Code</p>
                            <p className="font-semibold">{fuel.batchCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Fuel Used</p>
                            <p className="font-semibold">{fuel.fuelUsed} L</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Supervisor</p>
                            <p className="font-semibold">{fuel.supervisorName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold">{fuel.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Input Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Calculation</h4>
                {selectedBatchCode ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost of RM
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={costData.rmCost}
                        onChange={(e) => setCostData({ ...costData, rmCost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost of Fuel
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={costData.fuelCost}
                        onChange={(e) => setCostData({ ...costData, fuelCost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total QTY
                      </label>
                      <input
                        type="text"
                        value={`${calculateTotalQty(getFilteredProcessDetails(selectedReport.serialNo, selectedBatchCode)).toFixed(2)} MT`}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost of PMT
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={costData.pmtCost}
                        onChange={(e) => setCostData({ ...costData, pmtCost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Please select a batch code to enter cost data
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                {selectedBatchCode && (
                  <button
                    onClick={handleSaveCosts}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                  >
                    Save Costs
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}