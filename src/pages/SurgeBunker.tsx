import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { storage } from "../utils/localStorage";
import { CompositionPlan, SurgeBunkerProcess, Material } from "../types";

export default function SurgeBunker() {
  const [plans, setPlans] = useState<CompositionPlan[]>([]);
  const [processes, setProcesses] = useState<SurgeBunkerProcess[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CompositionPlan | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<SurgeBunkerProcess | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [formData, setFormData] = useState({
    shift: "",
    shiftManagerName: "",
    rm1Name: "",
    rm2Name: "",
    rm3Name: "",
    rm1OpenStock: "",
    rm1ChargedQty: "",
    rm1CloseStock: "",
    rm2OpenStock: "",
    rm2ChargedQty: "",
    rm2CloseStock: "",
    rm3OpenStock: "",
    rm3ChargedQty: "",
    rm3CloseStock: "",
    semiFinishedProductName: "",
  });

  useEffect(() => {
    setPlans(
      storage.getPlans().filter((p: CompositionPlan) => p.status === "open")
    );
    setProcesses(storage.getSurgeBunkerProcesses());
    setMaterials(storage.getMaterials());
  }, []);

  const handleProcess = (plan: CompositionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      shift: "",
      shiftManagerName: "",
      rm1Name: plan.rm1?.name || "",
      rm2Name: plan.rm2?.name || "",
      rm3Name: plan.rm3?.name || "",
      rm1OpenStock: "",
      rm1ChargedQty: "",
      rm1CloseStock: "",
      rm2OpenStock: "",
      rm2ChargedQty: "",
      rm2CloseStock: "",
      rm3OpenStock: "",
      rm3ChargedQty: "",
      rm3CloseStock: "",
      semiFinishedProductName: "",
    });
    setShowModal(true);
  };

  const calculateTotal = (open: string | number, charged: string | number, close: string | number) => {
    const openVal = typeof open === 'string' ? parseFloat(open) || 0 : open || 0;
    const chargedVal = typeof charged === 'string' ? parseFloat(charged) || 0 : charged || 0;
    const closeVal = typeof close === 'string' ? parseFloat(close) || 0 : close || 0;
    return openVal + chargedVal - closeVal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    const rm1Total = calculateTotal(formData.rm1OpenStock, formData.rm1ChargedQty, formData.rm1CloseStock);
    const rm2Total = calculateTotal(formData.rm2OpenStock, formData.rm2ChargedQty, formData.rm2CloseStock);
    const rm3Total = calculateTotal(formData.rm3OpenStock, formData.rm3ChargedQty, formData.rm3CloseStock);
    const totalStock = rm1Total + rm2Total + rm3Total;

    const batchIndex = processes.filter((p) => p.serialNo === selectedPlan.serialNo).length + 1;
    const batchCode = `BHC-${String(batchIndex).padStart(3, '0')}`;

    const newProcess: SurgeBunkerProcess = {
      id: Date.now().toString(),
      planId: selectedPlan.id,
      serialNo: selectedPlan.serialNo,
      productName: selectedPlan.productName,
      date: selectedPlan.date,
      targetQty: selectedPlan.targetQty,
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
      totalStock,
      semiFinishedProductName: formData.semiFinishedProductName,
      batchCode,
      rm1Name: formData.rm1Name || selectedPlan.rm1?.name,
      rm2Name: formData.rm2Name || selectedPlan.rm2?.name,
      rm3Name: formData.rm3Name || selectedPlan.rm3?.name,
    };

    const updatedProcesses = [...processes, newProcess];
    setProcesses(updatedProcesses);
    storage.setSurgeBunkerProcesses(updatedProcesses);

    // Do not auto-close the plan here so multiple batches can be created
    // Leave plans unchanged; user can close plans separately if needed.

    setShowModal(false);
    setSelectedPlan(null);
    setFormData({
      shift: "",
      shiftManagerName: "",
      rm1Name: "",
      rm2Name: "",
      rm3Name: "",
      rm1OpenStock: "",
      rm1ChargedQty: "",
      rm1CloseStock: "",
      rm2OpenStock: "",
      rm2ChargedQty: "",
      rm2CloseStock: "",
      rm3OpenStock: "",
      rm3ChargedQty: "",
      rm3CloseStock: "",
      semiFinishedProductName: "",
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
          Surge Bunker
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
            Pending ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History ({processes.length})
          </button>
        </div>

        {activeTab === "pending" ? (
          <div className="overflow-hidden bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Action</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Serial No</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Product Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Target Qty (MT)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Raw Material 1</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Percentage 1</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Unit1</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Raw Material 2</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Percentage 2</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Unit2</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Raw Material 3</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Percentage 3</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Unit3</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Remarks</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Actual Qty</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan={18} className="px-4 py-8 text-center text-gray-500">
                        No pending plans
                      </td>
                    </tr>
                  ) : (
                    plans.map((plan) => (
                      <tr key={plan.id} className="transition hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleProcess(plan)}
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                          >
                            Process
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{plan.serialNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.targetQty} MT</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm1?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm1?.percentage}%</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm1?.unit || ''}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm2?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm2?.percentage}%</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm2?.unit || ''}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm3?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm3?.percentage}%</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm3?.unit || ''}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.remarks || ''}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.actualQty ? `${plan.actualQty} MT` : '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.variance ? `${plan.variance}` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Serial No</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Batch Code</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Product</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Target Qty</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Shift</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Manager</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Total Stock</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Semi-Finished</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No processed items
                      </td>
                    </tr>
                  ) : (
                    processes.map((process) => (
                      <tr
                        key={process.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{process.serialNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.batchCode || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.targetQty} MT</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.shift}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.shiftManagerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{
                          // Prefer the PPT reading's totalStock if a reading exists for this process
                          (() => {
                            try {
                              const readings = storage.getPPTReadings();
                              const reading = readings.find((r: any) => r.surgeBunkerId === process.id);
                              const ts = reading ? reading.totalStock : process.totalStock;
                              return `${ts.toFixed(2)} MT`;
                            } catch (e) {
                              return `${process.totalStock.toFixed(2)} MT`;
                            }
                          })()
                        }</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{process.semiFinishedProductName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProcess(process);
                              setShowViewModal(true);
                            }}
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-lg transition hover:bg-green-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedPlan && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-start p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="mt-2 mb-8 w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Process - {selectedPlan.serialNo}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.productName}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Date
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.date}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Shift Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.shiftManagerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shiftManagerName: e.target.value,
                      })
                    }
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    RM1 Stock Details
                  </h4>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm text-gray-700">Raw Material</label>
                    <select
                      value={formData.rm1Name}
                      onChange={(e) => setFormData({ ...formData, rm1Name: e.target.value })}
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select RM1</option>
                      {selectedPlan.rm1?.name && !materials.find((m) => m.materialName === selectedPlan.rm1?.name) && (
                        <option value={selectedPlan.rm1?.name}>{selectedPlan.rm1?.name}</option>
                      )}
                      {materials.map((m) => (
                        <option key={m.id} value={m.materialName}>
                          {m.materialName}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Unit: {materials.find((m) => m.materialName === formData.rm1Name)?.unit || selectedPlan.rm1?.unit || '-'}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Open Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm1OpenStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm1OpenStock: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Charged Qty
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm1ChargedQty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm1ChargedQty: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Close Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm1CloseStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm1CloseStock: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                        <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Total
                      </label>
                          <input
                            type="text"
                            value={calculateTotal(
                              formData.rm1OpenStock,
                              formData.rm1ChargedQty,
                              formData.rm1CloseStock
                            ).toFixed(2)}
                            className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                            readOnly
                          />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    RM2 Stock Details
                  </h4>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm text-gray-700">Raw Material</label>
                    <select
                      value={formData.rm2Name}
                      onChange={(e) => setFormData({ ...formData, rm2Name: e.target.value })}
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select RM2</option>
                      {selectedPlan.rm2?.name && !materials.find((m) => m.materialName === selectedPlan.rm2?.name) && (
                        <option value={selectedPlan.rm2?.name}>{selectedPlan.rm2?.name}</option>
                      )}
                      {materials.map((m) => (
                        <option key={m.id} value={m.materialName}>
                          {m.materialName}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Unit: {materials.find((m) => m.materialName === formData.rm2Name)?.unit || selectedPlan.rm2?.unit || '-'}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Open Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm2OpenStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm2OpenStock: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Charged Qty
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm2ChargedQty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm2ChargedQty: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Close Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm2CloseStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm2CloseStock: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Total
                      </label>
                      <input
                        type="text"
                        value={calculateTotal(
                          formData.rm2OpenStock,
                          formData.rm2ChargedQty,
                          formData.rm2CloseStock
                        ).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    RM3 Stock Details
                  </h4>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm text-gray-700">Raw Material</label>
                    <select
                      value={formData.rm3Name}
                      onChange={(e) => setFormData({ ...formData, rm3Name: e.target.value })}
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select RM3</option>
                      {selectedPlan.rm3?.name && !materials.find((m) => m.materialName === selectedPlan.rm3?.name) && (
                        <option value={selectedPlan.rm3?.name}>{selectedPlan.rm3?.name}</option>
                      )}
                      {materials.map((m) => (
                        <option key={m.id} value={m.materialName}>
                          {m.materialName}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Unit: {materials.find((m) => m.materialName === formData.rm3Name)?.unit || selectedPlan.rm3?.unit || '-'}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Open Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm3OpenStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm3OpenStock: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Charged Qty
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm3ChargedQty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm3ChargedQty: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Close Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rm3CloseStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rm3CloseStock: e.target.value,
                          })
                        }
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Total
                      </label>
                      <input
                        type="text"
                        value={calculateTotal(
                          formData.rm3OpenStock,
                          formData.rm3ChargedQty,
                          formData.rm3CloseStock
                        ).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Semi-Finished Product Name
                </label>
                <input
                  type="text"
                  value={formData.semiFinishedProductName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semiFinishedProductName: e.target.value,
                    })
                  }
                  className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="sticky bottom-0 z-10 p-6 -mx-6 -mb-6 bg-white rounded-b-2xl border-t border-gray-200">
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
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedProcess && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-start p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="mt-2 mb-8 w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                View Process - {selectedProcess.serialNo}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProcess(null);
                }}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Batch Code</label>
                  <input type="text" value={selectedProcess.batchCode || '-'} className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300" readOnly />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">RM Used</label>
                  <div className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300">
                    <div className="text-sm text-gray-700">{selectedProcess.rm1Name || '-'} / {selectedProcess.rm2Name || '-'} / {selectedProcess.rm3Name || '-'}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={selectedProcess.productName}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Date
                  </label>
                  <input
                    type="text"
                    value={selectedProcess.date}
                    className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <input
                    type="text"
                    value={selectedProcess.shift}
                    className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Shift Manager Name
                  </label>
                  <input
                    type="text"
                    value={selectedProcess.shiftManagerName}
                    className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    RM1 Stock Details — {selectedProcess.rm1Name || '-'} {materials.find((m) => m.materialName === selectedProcess.rm1Name) ? `(${materials.find((m) => m.materialName === selectedProcess.rm1Name)?.unit})` : ''}
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Open Stock
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm1Stock.openStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Charged Qty
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm1Stock.chargedQty}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Close Stock
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm1Stock.closeStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Total
                      </label>
                      <input
                        type="text"
                        value={calculateTotal(
                          selectedProcess.rm1Stock.openStock,
                          selectedProcess.rm1Stock.chargedQty,
                          selectedProcess.rm1Stock.closeStock
                        ).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    RM2 Stock Details — {selectedProcess.rm2Name || '-'} {materials.find((m) => m.materialName === selectedProcess.rm2Name) ? `(${materials.find((m) => m.materialName === selectedProcess.rm2Name)?.unit})` : ''}
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Open Stock
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm2Stock.openStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Charged Qty
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm2Stock.chargedQty}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Close Stock
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm2Stock.closeStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Total
                      </label>
                      <input
                        type="text"
                        value={calculateTotal(
                          selectedProcess.rm2Stock.openStock,
                          selectedProcess.rm2Stock.chargedQty,
                          selectedProcess.rm2Stock.closeStock
                        ).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    RM3 Stock Details — {selectedProcess.rm3Name || '-'} {materials.find((m) => m.materialName === selectedProcess.rm3Name) ? `(${materials.find((m) => m.materialName === selectedProcess.rm3Name)?.unit})` : ''}
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Open Stock
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm3Stock.openStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Charged Qty
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm3Stock.chargedQty}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Close Stock
                      </label>
                      <input
                        type="number"
                        value={selectedProcess.rm3Stock.closeStock}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Total
                      </label>
                      <input
                        type="text"
                        value={calculateTotal(
                          selectedProcess.rm3Stock.openStock,
                          selectedProcess.rm3Stock.chargedQty,
                          selectedProcess.rm3Stock.closeStock
                        ).toFixed(2)}
                        className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Semi-Finished Product Name
                </label>
                <input
                  type="text"
                  value={selectedProcess.semiFinishedProductName}
                  className="px-4 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>

              <div className="flex pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedProcess(null);
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
