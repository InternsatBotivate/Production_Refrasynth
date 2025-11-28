export const storage = {
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem('user');
  },
  getMaterials: () => {
    const materials = localStorage.getItem('materials');
    return materials ? JSON.parse(materials) : [];
  },
  setMaterials: (materials: any[]) => {
    localStorage.setItem('materials', JSON.stringify(materials));
  },
  getPlans: () => {
    const plans = localStorage.getItem('plans');
    return plans ? JSON.parse(plans) : [];
  },
  setPlans: (plans: any[]) => {
    localStorage.setItem('plans', JSON.stringify(plans));
  },
  getSurgeBunkerProcesses: () => {
    const processes = localStorage.getItem('surgeBunkerProcesses');
    return processes ? JSON.parse(processes) : [];
  },
  setSurgeBunkerProcesses: (processes: any[]) => {
    localStorage.setItem('surgeBunkerProcesses', JSON.stringify(processes));
  },
  getPPTReadings: () => {
    const readings = localStorage.getItem('pptReadings');
    return readings ? JSON.parse(readings) : [];
  },
  setPPTReadings: (readings: any[]) => {
    localStorage.setItem('pptReadings', JSON.stringify(readings));
  },
  getFinishedGoods: () => {
    const goods = localStorage.getItem('finishedGoods');
    return goods ? JSON.parse(goods) : [];
  },
  setFinishedGoods: (goods: any[]) => {
    localStorage.setItem('finishedGoods', JSON.stringify(goods));
  },
  getFuelConsumption: () => {
    const fuel = localStorage.getItem('fuelConsumption');
    return fuel ? JSON.parse(fuel) : [];
  },
  setFuelConsumption: (fuel: any[]) => {
    localStorage.setItem('fuelConsumption', JSON.stringify(fuel));
  },
};
