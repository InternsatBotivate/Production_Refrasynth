import { useState, useEffect } from 'react';
import {
  Package,
  ClipboardList,
  Container,
  Gauge,
  CheckCircle,
  Fuel,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../utils/localStorage';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    activePlans: 0,
    pendingSurgeBunker: 0,
    pendingPPT: 0,
    finishedGoods: 0,
    totalFuelUsed: 0,
  });

  useEffect(() => {
    const materials = storage.getMaterials();
    const plans = storage.getPlans();
    const surgeBunker = storage.getSurgeBunkerProcesses();
    const pptReadings = storage.getPPTReadings();
    const finishedGoods = storage.getFinishedGoods();
    const fuelRecords = storage.getFuelConsumption();

    const totalFuel = fuelRecords.reduce((sum: number, record: any) => sum + record.fuelUsed, 0);
    const activePlans = plans.filter((p: any) => p.status === 'open').length;

    setStats({
      totalMaterials: materials.length,
      activePlans,
      pendingSurgeBunker: surgeBunker.length,
      pendingPPT: pptReadings.length,
      finishedGoods: finishedGoods.length,
      totalFuelUsed: totalFuel,
    });
  }, []);

  const cards = [
    {
      title: 'Total Materials',
      value: stats.totalMaterials,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Plans',
      value: stats.activePlans,
      icon: ClipboardList,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Surge Bunker Queue',
      value: stats.pendingSurgeBunker,
      icon: Container,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'PPT Reading Queue',
      value: stats.pendingPPT,
      icon: Gauge,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Finished Goods',
      value: stats.finishedGoods,
      icon: CheckCircle,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Total Fuel Used',
      value: `${stats.totalFuelUsed.toFixed(0)} L`,
      icon: Fuel,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const recentActivity = [
    {
      type: 'info',
      message: 'Production system is running smoothly',
      time: 'Just now',
    },
    {
      type: 'success',
      message: `${stats.finishedGoods} products completed`,
      time: 'Today',
    },
    {
      type: 'warning',
      message: `${stats.pendingSurgeBunker + stats.pendingPPT} items pending processing`,
      time: 'Today',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to your production management system</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${card.color} p-6`}>
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold">{card.value}</p>
                    </div>
                    <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              Production Flow Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Composition Planning</p>
                  <p className="text-sm text-gray-600">{stats.activePlans} active plans</p>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Surge Bunker</p>
                  <p className="text-sm text-gray-600">{stats.pendingSurgeBunker} pending</p>
                </div>
                <span className="px-3 py-1 bg-orange-600 text-white text-sm font-medium rounded-full">
                  {stats.pendingSurgeBunker > 0 ? 'Pending' : 'Clear'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">PPT Reading</p>
                  <p className="text-sm text-gray-600">{stats.pendingPPT} pending</p>
                </div>
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                  {stats.pendingPPT > 0 ? 'Pending' : 'Clear'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Finished Goods</p>
                  <p className="text-sm text-gray-600">{stats.finishedGoods} completed</p>
                </div>
                <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg ${
                    activity.type === 'success'
                      ? 'bg-green-50'
                      : activity.type === 'warning'
                      ? 'bg-orange-50'
                      : 'bg-blue-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-green-100 text-green-600'
                        : activity.type === 'warning'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {activity.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : activity.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Production Overview</h3>
              <p className="text-blue-100">
                Track your materials, monitor production flow, and analyze fuel consumption all in one place.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end space-y-2">
              <div className="text-4xl font-bold">{stats.activePlans + stats.finishedGoods}</div>
              <div className="text-blue-100">Total Productions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
