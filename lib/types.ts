export type ItemCategory = 'camera' | 'lens' | 'accessory' | 'lighting' | 'other';

export type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type PaymentMethod = 'cash' | 'bank_transfer';

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: ItemCategory;
  daily_rate: number;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  phone_secondary: string | null;
  nic: string | null;
  address: string | null;
  id_photo_url: string | null;
  registered_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  advance_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  item?: Item;
}

export interface BookingWithRelations extends Booking {
  customer: Customer;
  item: Item;
}

export interface AppUser {
  id: string;
  name: string;
  role: 'owner' | 'manager';
  email: string;
}

export interface InsightsSummary {
  revenueThisMonth: number;
  revenueThisWeek: number;
  activeBookings: number;
  itemsCurrentlyOut: number;
  upcomingReturns: BookingWithRelations[];
  recentBookings: BookingWithRelations[];
  monthlyRevenue: { month: string; revenue: number }[];
  topItems: { item: Item; count: number }[];
}
