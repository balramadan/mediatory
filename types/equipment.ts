export interface Equipment {
  equipment_id: string;
  name: string;
  quantity: number;
  available_quantity: number;
  status: string;
  createdAt: string;
  category: {
    category_id: number;
    category_name: string;
    description: string | null;
  };
  transactions: any[];
  equipment_returns: any[];
  maintenance: any[];
}
