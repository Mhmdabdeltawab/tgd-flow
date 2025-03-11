export interface Warehouse {
  id: string;
  name: string;
  country: string;
  port?: string;
  operatorId: string;
  operatorName: string;
  capacity?: number;
  wasteTypes: string[];
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Terminal {
  id: string;
  name: string;
  country: string;
  port: string;
  wasteTypes?: string[];
  capacity?: number;
  storageTankCount: number;
  actualQuantity: number;
  expectedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorageTank {
  id: string;
  name: string;
  terminalId: string;
  operatorId: string;
  operatorName: string;
  capacity?: number;
  wasteTypes: string[];
  actualQuantity: number;
  expectedQuantity: number;
  createdAt: string;
  updatedAt: string;
}