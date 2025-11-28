export interface User {
  id: string;
  role: 'admin' | 'user';
}

export interface Material {
  id: string;
  serialNo: string;
  materialName: string;
  unit: string;
  loi: number;
  remarks: string;
}

export interface RawMaterial {
  name: string;
  percentage: number;
  mt: number;
  loi?: number;
  unit?: string;
}

export interface CompositionPlan {
  id: string;
  serialNo: string;
  productName: string;
  date: string;
  targetQty: number;
  actualQty: number;
  variance: number;
  status: 'open' | 'closed';
  rm1: RawMaterial;
  rm2: RawMaterial;
  rm3: RawMaterial;
  remarks: string;
}

export interface StockDetail {
  openStock: number;
  chargedQty: number;
  closeStock: number;
}

export interface SurgeBunkerProcess {
  id: string;
  planId: string;
  serialNo: string;
  productName: string;
  date: string;
  targetQty: number;
  shift: string;
  shiftManagerName: string;
  rm1Stock: StockDetail;
  rm2Stock: StockDetail;
  rm3Stock: StockDetail;
  totalStock: number;
  semiFinishedProductName: string;
  batchCode?: string;
  rm1Name?: string;
  rm2Name?: string;
  rm3Name?: string;
}

export interface PPTReading {
  id: string;
  surgeBunkerId: string;
  serialNo: string;
  productName: string;
  date: string;
  targetQty: number;
  totalStock: number;
  semiFinishedProductName: string;
  shift: string;
  shiftManagerName: string;
  rm1Stock: StockDetail;
  rm2Stock: StockDetail;
  rm3Stock: StockDetail;
  semiFinishedProductName2: string;
  batchCode?: string;
  rm1Name?: string;
  rm2Name?: string;
  rm3Name?: string;
}

export interface FinishedGood {
  id: string;
  pptReadingId: string;
  serialNo: string;
  productName: string;
  date: string;
  targetQty: number;
  totalStock: number;
  semiFinishedProductName: string;
  semiFinishedProductName2: string;
  shift: string;
  supervisorName: string;
}

export interface FuelConsumption {
  id: string;
  serialNo: string;
  date: string;
  shift: string;
  fuelUsed: number;
  supervisorName: string;
  remarks: string;
}
