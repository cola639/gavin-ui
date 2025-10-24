export type OrderStatus = 'Completed' | 'Processing' | 'Rejected';
export type OrderType = 'Electric' | 'Book' | 'Medicine' | 'Mobile' | 'Watch';

export interface OrderRow {
  id: string;
  name: string;
  address: string;
  date: string; // ISO string or display
  type: OrderType;
  status: OrderStatus;
}
