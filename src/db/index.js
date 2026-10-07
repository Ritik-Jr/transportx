import Dexie from 'dexie';
import { 
  supabase, 
  isSupabaseEnabled, 
  checkSupabaseSchema,
  mapTripFromSupabase, 
  mapTripToSupabase, 
  mapPartyFromSupabase, 
  mapPartyToSupabase 
} from '../utils/supabase';

// Initialize Dexie IndexedDB
export const db = new Dexie('SaiTransportDB');

db.version(2).stores({
  trips: '++id, lrNo, partyName, vehicleNo, fromCity, toCity, date, paymentStatus, deliveryStatus, driverName, isDummy, createdAt',
  parties: '++id, name, phone, gstin, city, isDummy, createdAt',
  settings: 'key, value',
});

// Default sample data for first launch - marked as isDummy: true
export const INITIAL_PARTIES = [
  {
    name: 'Shree Balaji Logistics',
    phone: '9822012345',
    gstin: '27AABCS1429B1Z1',
    city: 'Pune',
    address: 'Plot 45, Transport Nagar, Nigdi, Pune',
    isDummy: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Radhe Krishna Agro Foods',
    phone: '9893054321',
    gstin: '24AAACR1290M1Z8',
    city: 'Surat',
    address: 'Ring Road Market, Surat, Gujarat',
    isDummy: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Om Sai Infrastructure Ltd',
    phone: '9425098765',
    gstin: '23AABCO9912K1Z4',
    city: 'Indore',
    address: 'Dewas Naka, Indore, MP',
    isDummy: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Mahalaxmi Steel Traders',
    phone: '9764022334',
    gstin: '27AABCM8821C1Z3',
    city: 'Mumbai',
    address: 'Iron Market, Carnac Bunder, Mumbai',
    isDummy: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TRIPS = [
  {
    lrNo: 'ST-1001',
    partyName: 'Mahalaxmi Steel Traders',
    partyPhone: '9764022334',
    vehicleNo: 'MH 12 QW 4489',
    vehicleType: '14 Wheeler',
    fromCity: 'Mumbai',
    toCity: 'Pune',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    material: 'TMT Steel Bars',
    weight: '26.4 MT',
    driverName: 'Rameshwar Yadav',
    driverMobile: '9821456789',
    amount: 38000,
    advance: 25000,
    balance: 13000,
    paymentStatus: 'Partial',
    deliveryStatus: 'Delivered',
    dieselExpense: 14000,
    tollExpense: 1800,
    remarks: 'Unloaded safely at Bhosari yard. Balance due in 7 days.',
    isDummy: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    lrNo: 'ST-1002',
    partyName: 'Radhe Krishna Agro Foods',
    partyPhone: '9893054321',
    vehicleNo: 'MH 14 AB 9122',
    vehicleType: '10 Wheeler',
    fromCity: 'Surat',
    toCity: 'Indore',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    material: 'Sugar Bags',
    weight: '18 MT (360 Bags)',
    driverName: 'Suraj Pal Singh',
    driverMobile: '9923487123',
    amount: 45000,
    advance: 45000,
    balance: 0,
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    dieselExpense: 17500,
    tollExpense: 2200,
    remarks: 'Full payment received in cash advance.',
    isDummy: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    lrNo: 'ST-1003',
    partyName: 'Om Sai Infrastructure Ltd',
    partyPhone: '9425098765',
    vehicleNo: 'MH 12 RN 7731',
    vehicleType: '12 Wheeler',
    fromCity: 'Pune',
    toCity: 'Nagpur',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    material: 'Heavy Machinery Equipment',
    weight: '22 MT',
    driverName: 'Kailash Patil',
    driverMobile: '9765412390',
    amount: 62000,
    advance: 20000,
    balance: 42000,
    paymentStatus: 'Partial',
    deliveryStatus: 'In Transit',
    dieselExpense: 23000,
    tollExpense: 3100,
    remarks: 'En route, reached Jalna bypass. Expected delivery tomorrow morning.',
    isDummy: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    lrNo: 'ST-1004',
    partyName: 'Shree Balaji Logistics',
    partyPhone: '9822012345',
    vehicleNo: 'MH 04 FK 3020',
    vehicleType: '16 Wheeler',
    fromCity: 'Vapi',
    toCity: 'Hyderabad',
    date: new Date().toISOString().split('T')[0],
    material: 'FMCG Goods Cartons',
    weight: '20 MT',
    driverName: 'Baldev Singh',
    driverMobile: '9819076543',
    amount: 74000,
    advance: 0,
    balance: 74000,
    paymentStatus: 'Pending',
    deliveryStatus: 'Booked',
    dieselExpense: 26000,
    tollExpense: 3800,
    remarks: 'Advance pending on loading dispatch.',
    isDummy: true,
    createdAt: new Date().toISOString()
  },
  {
    lrNo: 'ST-1005',
    partyName: 'Mahalaxmi Steel Traders',
    partyPhone: '9764022334',
    vehicleNo: 'MH 12 QW 4489',
    vehicleType: '14 Wheeler',
    fromCity: 'Pune',
    toCity: 'Surat',
    date: new Date().toISOString().split('T')[0],
    material: 'Coil & Plates',
    weight: '24 MT',
    driverName: 'Rameshwar Yadav',
    driverMobile: '9821456789',
    amount: 32000,
    advance: 32000,
    balance: 0,
    paymentStatus: 'Paid',
    deliveryStatus: 'In Transit',
    dieselExpense: 11000,
    tollExpense: 1500,
    remarks: 'Loaded this morning, full payment received.',
    isDummy: true,
    createdAt: new Date().toISOString()
  },
  {
    lrNo: 'ST-1006',
    partyName: 'Radhe Krishna Agro Foods',
    partyPhone: '9893054321',
    vehicleNo: 'MH 14 AB 9122',
    vehicleType: '10 Wheeler',
    fromCity: 'Ahmedabad',
    toCity: 'Pune',
    date: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0],
    material: 'Wheat Grain Bags',
    weight: '21 MT',
    driverName: 'Suraj Pal Singh',
    driverMobile: '9923487123',
    amount: 51000,
    advance: 35000,
    balance: 16000,
    paymentStatus: 'Partial',
    deliveryStatus: 'Delivered',
    dieselExpense: 18000,
    tollExpense: 2400,
    remarks: 'Completed last month.',
    isDummy: true,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
  }
];

export const MASTER_OVERRIDE_PASSWORD = '400242';

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: 'SAI TRANSPORT',
  tagline: 'Leading Fleet & All India Truck Transport Service',
  ownerName: 'Sai Transport Services',
  phone: '+91 98220 99887 / 94220 11223',
  email: 'saitransport.fleet@gmail.com',
  gstin: '27AAAAA0000A1Z5',
  address: 'Shop No. 12, New Transport Nagar, Nigdi, Pune, Maharashtra - 411044',
  terms: '1. Goods carried at owner\'s risk. 2. Demurrage charged after 24 hrs of arrival. 3. All disputes subject to local jurisdiction.',
  currency: '₹',
  masterPassword: '116600',
  passwordHint: '116600',
};

// Mirror key for emergency localStorage backup
const LS_BACKUP_KEY = 'sai_transport_emergency_backup_v1';

// Key tracking if user/client has already initialized database
export const SEED_FLAG_KEY = 'sai_transport_db_initialized_v2';
export const DUMMY_DELETED_KEY = 'sai_transport_dummy_deleted';

/**
 * Robust helper: checks whether a trip or party is dummy sample data or real user data.
 * All actual user records have isDummy: false.
 */
export function isDummyRecord(item) {
  if (!item) return false;
  if (item.isDummy === true || item.isDemo === true) return true;
  if (item.isDummy === false || item.isDemo === false) return false;

  // Fallback signature detection for initial seed records
  const dummyLrs = ['ST-1001', 'ST-1002', 'ST-1003', 'ST-1004', 'ST-1005', 'ST-1006'];
  if (item.lrNo && dummyLrs.includes(item.lrNo.trim())) {
    return true;
  }
  const dummyParties = [
    'Shree Balaji Logistics',
    'Radhe Krishna Agro Foods',
    'Om Sai Infrastructure Ltd',
    'Mahalaxmi Steel Traders'
  ];
  if (item.name && dummyParties.includes(item.name.trim())) {
    return true;
  }
  return false;
}

// Seed Database if empty (runs ONLY on pristine first launch, never after deletion)
export async function seedDatabaseIfEmpty() {
  try {
    // If dummy data was deleted or initialized, NEVER restore deleted dummy data on reload!
    if (
      localStorage.getItem(SEED_FLAG_KEY) === 'true' || 
      localStorage.getItem(DUMMY_DELETED_KEY) === 'true'
    ) {
      return;
    }

    const tripCount = await db.trips.count();
    const partyCount = await db.parties.count();
    const settingsCount = await db.settings.count();

    if (settingsCount === 0) {
      for (const [key, value] of Object.entries(DEFAULT_COMPANY_SETTINGS)) {
        await db.settings.put({ key, value });
      }
    }

    // Only populate demo sample records on the very first run
    if (tripCount === 0 && partyCount === 0) {
      await db.trips.bulkAdd(INITIAL_TRIPS);
      await db.parties.bulkAdd(INITIAL_PARTIES);
    }

    localStorage.setItem(SEED_FLAG_KEY, 'true');
    await backupToLocalStorage();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Instant local cache loader: reads from IndexedDB in < 10ms with zero network lag
export async function loadLocalCache() {
  await seedDatabaseIfEmpty();
  const trips = await db.trips.toArray();
  const parties = await db.parties.toArray();
  const settingsRows = await db.settings.toArray();
  const settings = { ...DEFAULT_COMPANY_SETTINGS };
  settingsRows.forEach(s => { settings[s.key] = s.value; });
  return { trips, parties, settings };
}

// Mirror entire DB state to localStorage for dual-redundancy
export async function backupToLocalStorage() {
  try {
    const trips = await db.trips.toArray();
    const parties = await db.parties.toArray();
    const settings = await db.settings.toArray();
    const snapshot = {
      timestamp: new Date().toISOString(),
      trips,
      parties,
      settings,
    };
    localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(snapshot));
    return true;
  } catch (e) {
    console.warn('LocalStorage backup warning:', e);
    return false;
  }
}

/**
 * Unified data fetcher:
 * - Checks Supabase schema status without blocking UI.
 * - If Supabase tables are ready, fetches and updates local cache.
 * - If Supabase tables are missing (e.g. PGRST205), seamlessly returns local data instantly.
 */
export async function fetchAppData() {
  if (isSupabaseEnabled()) {
    const hasSchema = await checkSupabaseSchema();
    if (hasSchema) {
      try {
        const [tripsRes, partiesRes, settingsRes] = await Promise.all([
          supabase.from('trips').select('*').order('id', { ascending: false }),
          supabase.from('parties').select('*').order('id', { ascending: false }),
          supabase.from('settings').select('*')
        ]);

        if (!tripsRes.error && !partiesRes.error) {
          const loadedTrips = (tripsRes.data || []).map(mapTripFromSupabase);
          const loadedParties = (partiesRes.data || []).map(mapPartyFromSupabase);
          const settingsMap = { ...DEFAULT_COMPANY_SETTINGS };
          if (settingsRes.data) {
            settingsRes.data.forEach(item => {
              settingsMap[item.key] = item.value;
            });
          }

          // Cache to local IndexedDB
          try {
            await db.trips.clear();
            if (loadedTrips.length > 0) await db.trips.bulkAdd(loadedTrips);
            await db.parties.clear();
            if (loadedParties.length > 0) await db.parties.bulkAdd(loadedParties);
            await backupToLocalStorage();
          } catch (_) {}

          return {
            trips: loadedTrips,
            parties: loadedParties,
            settings: settingsMap,
            source: 'supabase',
            status: 'online'
          };
        }
      } catch (err) {
        console.warn('Supabase query notice:', err);
      }
    }
  }

  // Local IndexedDB fallback (< 10ms)
  const local = await loadLocalCache();
  return {
    trips: local.trips,
    parties: local.parties,
    settings: local.settings,
    source: isSupabaseEnabled() ? 'fallback_local' : 'localhost_indexeddb',
    status: isSupabaseEnabled() ? 'needs_schema' : 'local'
  };
}

export async function saveTripRecord(tripData) {
  // Real user created trip is NEVER dummy data
  let savedTrip = { 
    ...tripData, 
    isDummy: tripData.isDummy ?? false 
  };

  // 1. Immediately persist to Dexie IndexedDB (< 5ms)
  if (savedTrip.id && typeof savedTrip.id === 'number') {
    await db.trips.put(savedTrip);
  } else {
    const newId = await db.trips.add(savedTrip);
    savedTrip = { ...savedTrip, id: newId };
  }
  await backupToLocalStorage();

  // 2. Background sync to Supabase only if schema is ready
  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        const payload = mapTripToSupabase(savedTrip);
        if (tripData.id && typeof tripData.id === 'number') {
          await supabase.from('trips').update(payload).eq('id', tripData.id);
        } else {
          delete payload.id;
          await supabase.from('trips').insert([payload]);
        }
      } catch (err) {
        console.warn('Background Supabase trip sync notice:', err);
      }
    }).catch(console.warn);
  }

  return savedTrip;
}

export async function deleteTripRecord(id) {
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  const numericId = Number(id);
  if (!isNaN(numericId)) {
    await db.trips.delete(numericId);
  }
  await db.trips.delete(id);
  await backupToLocalStorage();

  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        await supabase.from('trips').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase trip delete notice:', err);
      }
    }).catch(console.warn);
  }
}

export async function savePartyRecord(partyData) {
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  let savedParty = { 
    ...partyData, 
    isDummy: partyData.isDummy ?? false 
  };

  // 1. Persist to Dexie IndexedDB
  if (savedParty.id && typeof savedParty.id === 'number') {
    await db.parties.put(savedParty);
  } else {
    const newId = await db.parties.add(savedParty);
    savedParty = { ...savedParty, id: newId };
  }
  await backupToLocalStorage();

  // 2. Background sync to Supabase
  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        const payload = mapPartyToSupabase(savedParty);
        if (partyData.id && typeof partyData.id === 'number') {
          await supabase.from('parties').update(payload).eq('id', partyData.id);
        } else {
          delete payload.id;
          await supabase.from('parties').insert([payload]);
        }
      } catch (err) {
        console.warn('Background Supabase party sync notice:', err);
      }
    }).catch(console.warn);
  }

  return savedParty;
}

export async function deletePartyRecord(id) {
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  const numericId = Number(id);
  if (!isNaN(numericId)) {
    await db.parties.delete(numericId);
  }
  await db.parties.delete(id);
  await backupToLocalStorage();

  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        await supabase.from('parties').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase party delete notice:', err);
      }
    }).catch(console.warn);
  }
}

export async function saveCompanySettings(newSettings) {
  for (const [key, value] of Object.entries(newSettings)) {
    await db.settings.put({ key, value });
  }
  await backupToLocalStorage();

  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        const records = Object.entries(newSettings).map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        }));
        await supabase.from('settings').upsert(records);
      } catch (err) {
        console.warn('Supabase settings update notice:', err);
      }
    }).catch(console.warn);
  }
}

/**
 * DELETE ONLY DUMMY DATA:
 * Removes only sample records that are marked as dummy.
 * Actual user-created trips and parties are 100% PRESERVED!
 */
export async function deleteDummyRecordsOnly() {
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  localStorage.setItem(DUMMY_DELETED_KEY, 'true');

  const allTrips = await db.trips.toArray();
  const allParties = await db.parties.toArray();

  const dummyTrips = allTrips.filter(isDummyRecord);
  const dummyParties = allParties.filter(isDummyRecord);

  // Delete only dummy trips from Dexie
  for (const t of dummyTrips) {
    if (t.id) await db.trips.delete(t.id);
  }
  // Delete only dummy parties from Dexie
  for (const p of dummyParties) {
    if (p.id) await db.parties.delete(p.id);
  }

  await backupToLocalStorage();

  // Also remove from Supabase if schema is ready
  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        const dummyLrNos = dummyTrips.map(t => t.lrNo).filter(Boolean);
        if (dummyLrNos.length > 0) {
          await supabase.from('trips').delete().in('lr_no', dummyLrNos);
        }
        const dummyPartyNames = dummyParties.map(p => p.name).filter(Boolean);
        if (dummyPartyNames.length > 0) {
          await supabase.from('parties').delete().in('name', dummyPartyNames);
        }
      } catch (err) {
        console.warn('Supabase dummy delete notice:', err);
      }
    }).catch(console.warn);
  }

  return {
    deletedTripsCount: dummyTrips.length,
    deletedPartiesCount: dummyParties.length
  };
}

export async function clearAllDatabaseData() {
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  localStorage.setItem(DUMMY_DELETED_KEY, 'true');
  await db.trips.clear();
  await db.parties.clear();
  await backupToLocalStorage();

  if (isSupabaseEnabled()) {
    checkSupabaseSchema().then(async (ready) => {
      if (!ready) return;
      try {
        await supabase.from('trips').delete().neq('id', 0);
        await supabase.from('parties').delete().neq('id', 0);
      } catch (err) {
        console.warn('Supabase clear notice:', err);
      }
    }).catch(console.warn);
  }
}

// 1-Click JSON Backup Exporter
export async function exportDatabaseToJson() {
  const trips = await db.trips.toArray();
  const parties = await db.parties.toArray();
  const settings = await db.settings.toArray();

  const backupData = {
    appName: 'Sai Transport',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    recordCounts: {
      trips: trips.length,
      parties: parties.length,
    },
    data: {
      trips,
      parties,
      settings,
    }
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `transportx-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

// 1-Click SQLite SQL script exporter
export async function exportDatabaseToSqlite() {
  const trips = await db.trips.toArray();
  const parties = await db.parties.toArray();

  let sql = `-- =========================================================\n`;
  sql += `-- SAI TRANSPORT - SQLITE DATABASE DUMP\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Compatible with SQLite 3 / DB Browser / DBeaver\n`;
  sql += `-- =========================================================\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS trips (\n`;
  sql += `  id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
  sql += `  lr_no TEXT,\n`;
  sql += `  party_name TEXT NOT NULL,\n`;
  sql += `  party_phone TEXT,\n`;
  sql += `  vehicle_no TEXT NOT NULL,\n`;
  sql += `  vehicle_type TEXT,\n`;
  sql += `  from_city TEXT NOT NULL,\n`;
  sql += `  to_city TEXT NOT NULL,\n`;
  sql += `  trip_date TEXT NOT NULL,\n`;
  sql += `  material TEXT,\n`;
  sql += `  weight TEXT,\n`;
  sql += `  driver_name TEXT,\n`;
  sql += `  driver_mobile TEXT,\n`;
  sql += `  amount REAL DEFAULT 0,\n`;
  sql += `  advance REAL DEFAULT 0,\n`;
  sql += `  balance REAL DEFAULT 0,\n`;
  sql += `  payment_status TEXT,\n`;
  sql += `  delivery_status TEXT,\n`;
  sql += `  remarks TEXT,\n`;
  sql += `  is_dummy INTEGER DEFAULT 0,\n`;
  sql += `  created_at TEXT\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS parties (\n`;
  sql += `  id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
  sql += `  name TEXT NOT NULL UNIQUE,\n`;
  sql += `  phone TEXT,\n`;
  sql += `  gstin TEXT,\n`;
  sql += `  city TEXT,\n`;
  sql += `  address TEXT,\n`;
  sql += `  is_dummy INTEGER DEFAULT 0,\n`;
  sql += `  created_at TEXT\n`;
  sql += `);\n\n`;

  const esc = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  trips.forEach(t => {
    sql += `INSERT INTO trips (lr_no, party_name, party_phone, vehicle_no, vehicle_type, from_city, to_city, trip_date, material, weight, driver_name, driver_mobile, amount, advance, balance, payment_status, delivery_status, remarks, is_dummy, created_at) VALUES (${esc(t.lrNo)}, ${esc(t.partyName)}, ${esc(t.partyPhone)}, ${esc(t.vehicleNo)}, ${esc(t.vehicleType)}, ${esc(t.fromCity)}, ${esc(t.toCity)}, ${esc(t.date)}, ${esc(t.material)}, ${esc(t.weight)}, ${esc(t.driverName)}, ${esc(t.driverMobile)}, ${Number(t.amount) || 0}, ${Number(t.advance) || 0}, ${Number(t.balance) || 0}, ${esc(t.paymentStatus)}, ${esc(t.deliveryStatus)}, ${esc(t.remarks)}, ${t.isDummy ? 1 : 0}, ${esc(t.createdAt)});\n`;
  });

  parties.forEach(p => {
    sql += `INSERT INTO parties (name, phone, gstin, city, address, is_dummy, created_at) VALUES (${esc(p.name)}, ${esc(p.phone)}, ${esc(p.gstin)}, ${esc(p.city)}, ${esc(p.address)}, ${p.isDummy ? 1 : 0}, ${esc(p.createdAt)});\n`;
  });

  sql += `\nCOMMIT;\n`;

  const blob = new Blob([sql], { type: 'application/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `transportx-sqlite-dump-${dateStr}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

// 1-Click Excel CSV Exporter for trips
export async function exportTripsToCsv() {
  const trips = await db.trips.toArray();
  if (trips.length === 0) {
    alert('No trip records to export.');
    return false;
  }

  const headers = [
    'LR No',
    'Date',
    'Party Name',
    'Party Phone',
    'Vehicle No',
    'Vehicle Type',
    'From Location',
    'To Location',
    'Driver Name',
    'Driver Mobile',
    'Material',
    'Weight',
    'Total Amount (₹)',
    'Advance Paid (₹)',
    'Balance Due (₹)',
    'Payment Status',
    'Delivery Status',
    'Remarks'
  ];

  const rows = trips.map(t => [
    t.lrNo || '',
    t.date || '',
    `"${(t.partyName || '').replace(/"/g, '""')}"`,
    t.partyPhone || '',
    t.vehicleNo || '',
    t.vehicleType || '',
    `"${(t.fromCity || '').replace(/"/g, '""')}"`,
    `"${(t.toCity || '').replace(/"/g, '""')}"`,
    `"${(t.driverName || '').replace(/"/g, '""')}"`,
    t.driverMobile || '',
    `"${(t.material || '').replace(/"/g, '""')}"`,
    t.weight || '',
    t.amount || 0,
    t.advance || 0,
    t.balance || 0,
    t.paymentStatus || '',
    t.deliveryStatus || '',
    `"${(t.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `transportx-logbook-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

// Restore database from uploaded JSON file
export async function restoreDatabaseFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data && !parsed.trips) {
      throw new Error('Invalid backup file format. Missing data fields.');
    }

    const tripsData = parsed.data ? parsed.data.trips : parsed.trips;
    const partiesData = parsed.data ? parsed.data.parties : parsed.parties;
    const settingsData = parsed.data ? parsed.data.settings : parsed.settings;

    if (Array.isArray(tripsData)) {
      await db.trips.clear();
      const cleanedTrips = tripsData.map(t => {
        const copy = { ...t };
        delete copy.id;
        return copy;
      });
      await db.trips.bulkAdd(cleanedTrips);
    }

    if (Array.isArray(partiesData)) {
      await db.parties.clear();
      const cleanedParties = partiesData.map(p => {
        const copy = { ...p };
        delete copy.id;
        return copy;
      });
      await db.parties.bulkAdd(cleanedParties);
    }

    if (Array.isArray(settingsData)) {
      await db.settings.clear();
      await db.settings.bulkAdd(settingsData);
    }

    await backupToLocalStorage();
    return { success: true, count: tripsData ? tripsData.length : 0 };
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return { success: false, error: error.message };
  }
}

