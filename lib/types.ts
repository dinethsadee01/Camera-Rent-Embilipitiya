export type ItemCategory = 'camera' | 'lens' | 'accessory' | 'lighting' | 'drone' | 'stabilizer' | 'support' | 'other';

export type DiscountType = 'percentage' | 'fixed';

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
  serial_number: string | null;
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
  /** Object path inside the private `id-photos` bucket — not a usable URL on its own. Resolve with useSignedPhotoUrl(). */
  id_photo_path: string | null;
  registered_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  item_id: string | null;
  custom_name: string | null;
  quantity: number;
  daily_rate: number;
  is_free: boolean;
  item?: Item;
}

export interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  advance_amount: number;
  discount_type: DiscountType | null;
  discount_value: number | null;
  discount_amount: number;
  pickup_time: string | null;
  return_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  booking_items?: BookingItem[];
}

export interface BookingWithRelations extends Booking {
  customer: Customer;
  booking_items: BookingItem[];
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
  discountsThisMonth: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topItems: { item: Item; count: number }[];
}
