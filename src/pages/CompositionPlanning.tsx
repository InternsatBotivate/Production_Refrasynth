import { useState, useEffect } from "react";
import { Plus, X, FileText } from "lucide-react";
import { storage } from "../utils/localStorage";
import { CompositionPlan, Material } from "../types";

export default function CompositionPlanning() {
  const [plans, setPlans] = useState<CompositionPlan[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CompositionPlan | null>(
    null
  );
  // Showing only pending plans — History section removed
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    productName: "",
    date: "",
    targetQty: "",
    rm1Name: "",
    rm1Percentage: "",
    rm2Name: "",
    rm2Percentage: "",
    rm3Name: "",
    rm3Percentage: "",
    remarks: "",
  });

  useEffect(() => {
    setPlans(storage.getPlans());
    setMaterials(storage.getMaterials());
  }, []);

  const generateSerialNo = () => {
    const count = plans.length + 1;
    return `CP-${String(count).padStart(3, "0")}`;
  };

  const calculateMT = (targetQty: number, percentage: number) => {
    return (targetQty * percentage) / 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetQty = parseFloat(formData.targetQty);
    const rm1Percentage = parseFloat(formData.rm1Percentage);
    const rm2Percentage = parseFloat(formData.rm2Percentage);
    const rm3Percentage = parseFloat(formData.rm3Percentage);

    const rm1Material = materials.find(
      (m) => m.materialName === formData.rm1Name
    );
    const rm2Material = materials.find(
      (m) => m.materialName === formData.rm2Name
    );
    const rm3Material = materials.find(
      (m) => m.materialName === formData.rm3Name
    );

    const newPlan: CompositionPlan = {
      id: Date.now().toString(),
      serialNo: generateSerialNo(),
      productName: formData.productName,
      date: formData.date,
      targetQty,
      actualQty: 0,
      variance: 0,
      status: "open",
      rm1: {
        name: formData.rm1Name,
        percentage: rm1Percentage,
        mt: calculateMT(targetQty, rm1Percentage),
        loi: rm1Material?.loi,
        unit: rm1Material?.unit,
      },
      rm2: {
        name: formData.rm2Name,
        percentage: rm2Percentage,
        mt: calculateMT(targetQty, rm2Percentage),
        loi: rm2Material?.loi,
        unit: rm2Material?.unit,
      },
      rm3: {
        name: formData.rm3Name,
        percentage: rm3Percentage,
        mt: calculateMT(targetQty, rm3Percentage),
        loi: rm3Material?.loi,
        unit: rm3Material?.unit,
      },
      remarks: formData.remarks,
    };

    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    storage.setPlans(updatedPlans);
    setShowModal(false);
    setFormData({
      productName: "",
      date: "",
      targetQty: "",
      rm1Name: "",
      rm1Percentage: "",
      rm2Name: "",
      rm2Percentage: "",
      rm3Name: "",
      rm3Percentage: "",
      remarks: "",
    });
  };

  const closePlan = (planId: string) => {
    const updatedPlans = plans.map((plan) =>
      plan.id === planId ? { ...plan, status: "closed" as const } : plan
    );
    setPlans(updatedPlans);
    storage.setPlans(updatedPlans);
    setShowReportModal(false);
    setSelectedPlan(null);
  };

  const pendingPlans = plans.filter((p) => p.status === "open");

  const filterPlans = (list: CompositionPlan[]) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((plan) => {
      return (
        plan.serialNo.toLowerCase().includes(q) ||
        plan.productName.toLowerCase().includes(q) ||
        plan.date.toLowerCase().includes(q) ||
        String(plan.targetQty).toLowerCase().includes(q) ||
        plan.rm1.name.toLowerCase().includes(q) ||
        plan.rm2.name.toLowerCase().includes(q) ||
        plan.rm3.name.toLowerCase().includes(q) ||
        plan.remarks.toLowerCase().includes(q)
      );
    });
  };

  const filteredPending = filterPlans(pendingPlans);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between items-start mb-6 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Composition Planning
          </h2>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label htmlFor="plan-search" className="sr-only">Search</label>
            <span className="text-sm text-gray-600 mr-2 hidden sm:inline">Search</span>
            <input
              id="plan-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg shadow-md transition hover:bg-blue-700 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        <div className="flex mb-6 items-center border-b border-gray-200">
          <div className="px-6 py-3 font-medium text-gray-900">Pending ({filteredPending.length})</div>
        </div>

        <div className="overflow-hidden bg-white rounded-xl shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  {/* Pending section header (no Status) and History header (with Status) */}
                  <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Serial No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Product Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 uppercase whitespace-nowrap">Plan Target Qty(MT)</th>
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
                {filteredPending.length === 0 ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No plans available
                    </td>
                  </tr>
                ) : (
                  filteredPending.map((plan) => (
                    <tr
                      key={plan.id}
                      className="transition cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowReportModal(true);
                      }}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{plan.serialNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.targetQty} MT</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm1.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm1.percentage}%</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm1.unit ?? 'MT'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm2.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm2.percentage}%</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm2.unit ?? 'MT'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm3.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm3.percentage}%</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.rm3.unit ?? 'MT'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.remarks}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.actualQty} MT</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{plan.variance} MT</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="mt-2 mb-8 w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex sticky top-0 z-10 justify-between items-center p-6 bg-white rounded-t-2xl border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                New Composition Plan
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 p-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Plan Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Target Qty (MT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetQty}
                  onChange={(e) =>
                    setFormData({ ...formData, targetQty: e.target.value })
                  }
                  className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="pt-4 space-y-4 border-t">
                <h4 className="font-semibold text-gray-900">Materials</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="mb-3 font-medium text-gray-900">RM1</h5>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          Name
                        </label>
                        <select
                          value={formData.rm1Name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rm1Name: e.target.value,
                            })
                          }
                          className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Material</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.materialName}>
                              {m.materialName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rm1Percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rm1Percentage: e.target.value,
                            })
                          }
                          className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          MT
                        </label>
                        <input
                          type="text"
                          value={
                            formData.targetQty && formData.rm1Percentage
                              ? calculateMT(
                                  parseFloat(formData.targetQty),
                                  parseFloat(formData.rm1Percentage)
                                ).toFixed(2)
                              : "0"
                          }
                          className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="mb-3 font-medium text-gray-900">RM2</h5>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          Name
                        </label>
                        <select
                          value={formData.rm2Name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rm2Name: e.target.value,
                            })
                          }
                          className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Material</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.materialName}>
                              {m.materialName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rm2Percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rm2Percentage: e.target.value,
                            })
                          }
                          className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          MT
                        </label>
                        <input
                          type="text"
                          value={
                            formData.targetQty && formData.rm2Percentage
                              ? calculateMT(
                                  parseFloat(formData.targetQty),
                                  parseFloat(formData.rm2Percentage)
                                ).toFixed(2)
                              : "0"
                          }
                          className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="mb-3 font-medium text-gray-900">RM3</h5>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          Name
                        </label>
                        <select
                          value={formData.rm3Name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rm3Name: e.target.value,
                            })
                          }
                          className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Material</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.materialName}>
                              {m.materialName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rm3Percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rm3Percentage: e.target.value,
                            })
                          }
                          className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700">
                          MT
                        </label>
                        <input
                          type="text"
                          value={
                            formData.targetQty && formData.rm3Percentage
                              ? calculateMT(
                                  parseFloat(formData.targetQty),
                                  parseFloat(formData.rm3Percentage)
                                ).toFixed(2)
                              : "0"
                          }
                          className="px-3 py-2 w-full bg-gray-100 rounded-lg border border-gray-300"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="px-3 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* MOVED SUBMIT BUTTON INSIDE THE FORM */}
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
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && selectedPlan && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-start p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="mt-2 mb-8 w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Plan Details - {selectedPlan.serialNo}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedPlan(null);
                }}
                className="p-2 rounded-lg transition hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPlan.productName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPlan.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Qty</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPlan.targetQty} MT
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actual Qty</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPlan.actualQty} MT
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Variance</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPlan.variance} MT
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedPlan.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedPlan.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="mb-4 font-semibold text-gray-900">
                  Material Composition
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="mb-2 font-medium text-gray-900">
                      RM1: {selectedPlan.rm1.name}
                    </h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Percentage</p>
                        <p className="font-semibold">
                          {selectedPlan.rm1.percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">MT</p>
                        <p className="font-semibold">
                          {selectedPlan.rm1.mt.toFixed(2)} MT
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">LOI</p>
                        <p className="font-semibold">{selectedPlan.rm1.loi}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="mb-2 font-medium text-gray-900">
                      RM2: {selectedPlan.rm2.name}
                    </h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Percentage</p>
                        <p className="font-semibold">
                          {selectedPlan.rm2.percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">MT</p>
                        <p className="font-semibold">
                          {selectedPlan.rm2.mt.toFixed(2)} MT
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">LOI</p>
                        <p className="font-semibold">{selectedPlan.rm2.loi}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="mb-2 font-medium text-gray-900">
                      RM3: {selectedPlan.rm3.name}
                    </h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Percentage</p>
                        <p className="font-semibold">
                          {selectedPlan.rm3.percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">MT</p>
                        <p className="font-semibold">
                          {selectedPlan.rm3.mt.toFixed(2)} MT
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">LOI</p>
                        <p className="font-semibold">{selectedPlan.rm3.loi}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPlan.remarks && (
                <div>
                  <p className="mb-1 text-sm text-gray-600">Remarks</p>
                  <p className="text-gray-900">{selectedPlan.remarks}</p>
                </div>
              )}

              <div className="flex pt-4 space-x-3 border-t">
                {selectedPlan.status === "open" && (
                  <button
                    onClick={() => closePlan(selectedPlan.id)}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg transition hover:bg-red-700"
                  >
                    Close Production
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedPlan(null);
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