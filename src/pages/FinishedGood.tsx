import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { storage } from "../utils/localStorage";
import { PPTReading, FinishedGood, SurgeBunkerProcess } from "../types";

export default function FinishedGoodPage() {
  const [pptReadings, setPPTReadings] = useState<PPTReading[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [surgeBunkerProcesses, setSurgeBunkerProcesses] = useState<SurgeBunkerProcess[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReading, setSelectedReading] = useState<PPTReading | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFinishedGood, setSelectedFinishedGood] =
    useState<FinishedGood | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [formData, setFormData] = useState({
    date: "",
    shift: "",
    supervisorName: "",
  });

  useEffect(() => {
    setPPTReadings(storage.getPPTReadings());
    setFinishedGoods(storage.getFinishedGoods());
    setSurgeBunkerProcesses(storage.getSurgeBunkerProcesses());
  }, []);

  const handleProcess = (reading: PPTReading) => {
    setSelectedReading(reading);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReading) return;

    const newFinishedGood: FinishedGood = {
      id: Date.now().toString(),
      pptReadingId: selectedReading.id,
      serialNo: selectedReading.serialNo,
      productName: selectedReading.productName,
      date: formData.date,
      targetQty: selectedReading.targetQty,
      totalStock: selectedReading.totalStock,
      semiFinishedProductName: selectedReading.semiFinishedProductName,
      semiFinishedProductName2: selectedReading.semiFinishedProductName2,
      shift: formData.shift,
      supervisorName: formData.supervisorName,
      batchCode: selectedReading.batchCode,
    };

    const updatedGoods = [...finishedGoods, newFinishedGood];
    setFinishedGoods(updatedGoods);
    storage.setFinishedGoods(updatedGoods);

    const updatedReadings = pptReadings.filter(
      (r) => r.id !== selectedReading.id
    );
    setPPTReadings(updatedReadings);
    storage.setPPTReadings(updatedReadings);

    setShowModal(false);
    setSelectedReading(null);
    setFormData({
      date: "",
      shift: "",
      supervisorName: "",
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
          Finished Good
        </h2>

        <div className="flex mb-6 space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "pending"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending ({pptReadings.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History ({finishedGoods.length})
          </button>
        </div>

        {activeTab === "pending" ? (
          <div className="overflow-hidden bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Action
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Serial No
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Batch Code
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Target
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      SB Total Stock
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      PPT Total Stock
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Shift
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Manager
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Semi-Finished
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Semi-Finished 2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pptReadings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No pending items
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
                        <tr
                          key={reading.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-3 py-3">
                            <button
                              onClick={() => handleProcess(reading)}
                              className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                            >
                              Process
                            </button>
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {reading.serialNo}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.batchCode || '-'}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.productName}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.date}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.targetQty} MT
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {sbTotalStock.toFixed(2)} MT
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {pptTotalStock.toFixed(2)} MT
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.shift}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.shiftManagerName}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.semiFinishedProductName}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {reading.semiFinishedProductName2}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Serial No
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Batch Code
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Target
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      SB Total Stock
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      PPT Total Stock
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Close Date
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Shift
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      Supervisor
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 uppercase">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {finishedGoods.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No finished goods
                      </td>
                    </tr>
                  ) : (
                    finishedGoods.map((good) => {
                      // Find the corresponding PPT Reading and Surge Bunker process
                      const pptReading = pptReadings.find(r => r.id === good.pptReadingId);
                      const surgeBunkerProcess = surgeBunkerProcesses.find(
                        (process) => process.id === pptReading?.surgeBunkerId
                      );
                      
                      const sbTotalStock = surgeBunkerProcess?.totalStock || 0;
                      const pptTotalStock = good.totalStock || 0;

                      return (
                        <tr key={good.id} className="transition hover:bg-gray-50">
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {good.serialNo}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {good.batchCode || '-'}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {good.productName}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {pptReading?.date || good.date}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {good.targetQty} MT
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {sbTotalStock.toFixed(2)} MT
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {pptTotalStock.toFixed(2)} MT
                          </td>
                          <td className="px-3 py-3 text-gray-700">{good.date}</td>
                          <td className="px-3 py-3 text-gray-700">
                            {good.shift}
                          </td>
                          <td className="px-3 py-3 text-gray-700">
                            {good.supervisorName}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFinishedGood(good);
                                setShowViewModal(true);
                              }}
                              className="px-3 py-1 text-sm text-white bg-green-600 rounded-lg transition hover:bg-green-700"
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

      {showModal && selectedReading && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-start p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Process Finished Good - {selectedReading.serialNo}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              id="finished-good-form"
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 p-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={selectedReading.productName}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={selectedReading.batchCode || '-'}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Target Qty
                  </label>
                  <input
                    type="text"
                    value={`${selectedReading.targetQty} MT`}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Total Stock
                  </label>
                  <input
                    type="text"
                    value={`${selectedReading.totalStock.toFixed(2)} MT`}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Close Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) =>
                    setFormData({ ...formData, supervisorName: e.target.value })
                  }
                  className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </form>
            <div className="p-6 bg-white border-t border-gray-200">
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
                  form="finished-good-form"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedFinishedGood && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-start p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Finished Good Details - {selectedFinishedGood.serialNo}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedFinishedGood(null);
                }}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={selectedFinishedGood.productName}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={selectedFinishedGood.batchCode || '-'}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Target Qty
                  </label>
                  <input
                    type="text"
                    value={`${selectedFinishedGood.targetQty} MT`}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Total Stock
                  </label>
                  <input
                    type="text"
                    value={`${selectedFinishedGood.totalStock.toFixed(2)} MT`}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Close Date
                  </label>
                  <input
                    type="text"
                    value={selectedFinishedGood.date}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Shift
                  </label>
                  <input
                    type="text"
                    value={selectedFinishedGood.shift}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={selectedFinishedGood.supervisorName}
                  className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>

              <div className="flex pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedFinishedGood(null);
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