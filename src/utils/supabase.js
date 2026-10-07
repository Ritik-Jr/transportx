import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://znczyfkpcpkmhutlmenh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_uNLo2PVuzxyirMCKKKRSEA_m_19YrCQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Determines whether Supabase should be used.
 * Per requirement: "Not for localhost website use this database in production."
 * - Returns FALSE on localhost / 127.0.0.1 (uses local IndexedDB/Dexie)
 * - Returns TRUE in production (GitHub Pages, custom domains, etc.)
 */
export const isSupabaseEnabled = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  return !isLocal && Boolean(supabaseUrl && supabaseKey);
};

// Normalizer: Supabase Row -> App Trip Object
export const mapTripFromSupabase = (row) => ({
  id: row.id,
  lrNo: row.lr_no || row.lrNo || '',
  partyName: row.party_name || row.partyName || '',
  partyPhone: row.party_phone || row.partyPhone || '',
  vehicleNo: row.vehicle_no || row.vehicleNo || '',
  vehicleType: row.vehicle_type || row.vehicleType || '',
  fromCity: row.from_city || row.fromCity || '',
  toCity: row.to_city || row.toCity || '',
  date: row.date || row.trip_date || '',
  material: row.material || '',
  weight: row.weight || '',
  driverName: row.driver_name || row.driverName || '',
  driverMobile: row.driver_mobile || row.driverMobile || '',
  amount: Number(row.amount) || 0,
  advance: Number(row.advance) || 0,
  balance: Number(row.balance) || 0,
  paymentStatus: row.payment_status || row.paymentStatus || 'Pending',
  deliveryStatus: row.delivery_status || row.deliveryStatus || 'Pending',
  dieselExpense: Number(row.diesel_expense || row.dieselExpense) || 0,
  tollExpense: Number(row.toll_expense || row.tollExpense) || 0,
  remarks: row.remarks || '',
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
});

// Converter: App Trip Object -> Supabase Row
export const mapTripToSupabase = (trip) => {
  const payload = {
    lr_no: trip.lrNo || '',
    party_name: trip.partyName || '',
    party_phone: trip.partyPhone || '',
    vehicle_no: trip.vehicleNo || '',
    vehicle_type: trip.vehicleType || '',
    from_city: trip.fromCity || '',
    to_city: trip.toCity || '',
    date: trip.date || '',
    material: trip.material || '',
    weight: trip.weight || '',
    driver_name: trip.driverName || '',
    driver_mobile: trip.driverMobile || '',
    amount: Number(trip.amount) || 0,
    advance: Number(trip.advance) || 0,
    balance: Number(trip.balance) || 0,
    payment_status: trip.paymentStatus || 'Pending',
    delivery_status: trip.deliveryStatus || 'Pending',
    diesel_expense: Number(trip.dieselExpense) || 0,
    toll_expense: Number(trip.tollExpense) || 0,
    remarks: trip.remarks || '',
    updated_at: new Date().toISOString()
  };
  if (trip.id && typeof trip.id === 'number') {
    payload.id = trip.id;
  }
  return payload;
};

// Normalizer: Supabase Row -> App Party Object
export const mapPartyFromSupabase = (row) => ({
  id: row.id,
  name: row.name || '',
  phone: row.phone || '',
  gstin: row.gstin || '',
  city: row.city || '',
  address: row.address || '',
  createdAt: row.created_at || row.createdAt || new Date().toISOString()
});

// Converter: App Party Object -> Supabase Row
export const mapPartyToSupabase = (party) => {
  const payload = {
    name: party.name || '',
    phone: party.phone || '',
    gstin: party.gstin || '',
    city: party.city || '',
    address: party.address || ''
  };
  if (party.id && typeof party.id === 'number') {
    payload.id = party.id;
  }
  return payload;
};
