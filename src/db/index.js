import Dexie from 'dexie';
import { 
  supabase, 
  isSupabaseEnabled, 
  mapTripFromSupabase, 
  mapTripToSupabase, 
  mapPartyFromSupabase, 
  mapPartyToSupabase 
} from '../utils/supabase';

// Initialize Dexie IndexedDB
export const db = new Dexie('SaiTransportDB');

db.version(1).stores({
  trips: '++id, lrNo, partyName, vehicleNo, fromCity, toCity, date, paymentStatus, deliveryStatus, driverName, createdAt',
  parties: '++id, name, phone, gstin, city, createdAt',
  settings: 'key, value',
});

// Default sample data for first launch
export const INITIAL_PARTIES = [
  {
    name: 'Shree Balaji Logistics',
    phone: '9822012345',
    gstin: '27AABCS1429B1Z1',
    city: 'Pune',
    address: 'Plot 45, Transport Nagar, Nigdi, Pune',
    createdAt: new Date().toISOString()
  },
  {
    name: 'Radhe Krishna Agro Foods',
    phone: '9893054321',
    gstin: '24AAACR1290M1Z8',
    city: 'Surat',
    address: 'Ring Road Market, Surat, Gujarat',
    createdAt: new Date().toISOString()
  },
  {
    name: 'Om Sai Infrastructure Ltd',
    phone: '9425098765',
    gstin: '23AABCO9912K1Z4',
    city: 'Indore',
    address: 'Dewas Naka, Indore, MP',
    createdAt: new Date().toISOString()
  },
  {
    name: 'Mahalaxmi Steel Traders',
    phone: '9764022334',
    gstin: '27AABCM8821C1Z3',
    city: 'Mumbai',
    address: 'Iron Market, Carnac Bunder, Mumbai',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TRIPS = [
  {
    lrNo: 'ST-1001',
    partyName: 'Mahalaxmi Steel Traders',
    partyPhone: '9764022334',
    vehicleNo: 'MH 12 QW 4489',
    vehicleType: '14 Wheeler (Taurus)',
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
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    lrNo: 'ST-1002',
    partyName: 'Radhe Krishna Agro Foods',
    partyPhone: '9893054321',
    vehicleNo: 'MH 14 AB 9122',
    vehicleType: '10 Wheeler Open',
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
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    lrNo: 'ST-1003',
    partyName: 'Om Sai Infrastructure Ltd',
    partyPhone: '9425098765',
    vehicleNo: 'MH 12 RN 7731',
    vehicleType: '12 Wheeler Trailer',
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
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    lrNo: 'ST-1004',
    partyName: 'Shree Balaji Logistics',
    partyPhone: '9822012345',
    vehicleNo: 'MH 04 FK 3020',
    vehicleType: '16 Wheeler Container',
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
    tollExpense: 3600,
    remarks: 'Loading today evening. Advance promised upon dispatch.',
    createdAt: new Date().toISOString()
  },
  {
    lrNo: 'ST-1005',
    partyName: 'Mahalaxmi Steel Traders',
    partyPhone: '9764022334',
    vehicleNo: 'MH 12 QW 4489',
    vehicleType: '14 Wheeler (Taurus)',
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
    createdAt: new Date().toISOString()
  },
  {
    lrNo: 'ST-1006',
    partyName: 'Radhe Krishna Agro Foods',
    partyPhone: '9893054321',
    vehicleNo: 'MH 14 AB 9122',
    vehicleType: '10 Wheeler Open',
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

// Seed Database if empty
export async function seedDatabaseIfEmpty() {
  try {
    const tripCount = await db.trips.count();
    if (tripCount === 0) {
      await db.trips.bulkAdd(INITIAL_TRIPS);
    }

    const partyCount = await db.parties.count();
    if (partyCount === 0) {
      await db.parties.bulkAdd(INITIAL_PARTIES);
    }

    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      for (const [key, value] of Object.entries(DEFAULT_COMPANY_SETTINGS)) {
        await db.settings.put({ key, value });
      }
    }

    // Mirror to localStorage
    await backupToLocalStorage();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
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
 * - Production: Queries Supabase. Automatically caches into IndexedDB for offline resilience.
 * - Localhost: Queries local IndexedDB (zero external network calls for dev).
 */
export async function fetchAppData() {
  if (isSupabaseEnabled()) {
    try {
      const [tripsRes, partiesRes, settingsRes] = await Promise.all([
        supabase.from('trips').select('*').order('id', { ascending: false }),
        supabase.from('parties').select('*').order('id', { ascending: false }),
        supabase.from('settings').select('*')
      ]);

      const tripsError = tripsRes.error;
      const partiesError = partiesRes.error;
      const settingsError = settingsRes.error;

      if (!tripsError && !partiesError) {
        let loadedTrips = (tripsRes.data || []).map(mapTripFromSupabase);
        let loadedParties = (partiesRes.data || []).map(mapPartyFromSupabase);

        // If Supabase is empty, initialize with initial demo records
        if (loadedTrips.length === 0 && loadedParties.length === 0) {
          try {
            const partyInserts = INITIAL_PARTIES.map(mapPartyToSupabase);
            const { data: pData } = await supabase.from('parties').insert(partyInserts).select();
            if (pData) loadedParties = pData.map(mapPartyFromSupabase);

            const tripInserts = INITIAL_TRIPS.map(mapTripToSupabase);
            const { data: tData } = await supabase.from('trips').insert(tripInserts).select();
            if (tData) loadedTrips = tData.map(mapTripFromSupabase);

            const settingsInserts = Object.entries(DEFAULT_COMPANY_SETTINGS).map(([key, value]) => ({ 
              key, 
              value: typeof value === 'object' ? JSON.stringify(value) : String(value) 
            }));
            await supabase.from('settings').upsert(settingsInserts);
          } catch (seedErr) {
            console.warn('Supabase auto-seed notice:', seedErr);
          }
        }

        const settingsMap = { ...DEFAULT_COMPANY_SETTINGS };
        if (!settingsError && settingsRes.data) {
          settingsRes.data.forEach(item => {
            settingsMap[item.key] = item.value;
          });
        }

        // Cache to local IndexedDB & localStorage for offline resilience
        try {
          await db.trips.clear();
          if (loadedTrips.length > 0) await db.trips.bulkAdd(loadedTrips);
          await db.parties.clear();
          if (loadedParties.length > 0) await db.parties.bulkAdd(loadedParties);
          await db.settings.clear();
          for (const [key, value] of Object.entries(settingsMap)) {
            await db.settings.put({ key, value });
          }
          await backupToLocalStorage();
        } catch (_) {}

        return {
          trips: loadedTrips,
          parties: loadedParties,
          settings: settingsMap,
          source: 'supabase',
          status: 'online'
        };
      } else {
        console.warn('Supabase schema notice (fallback to local DB):', tripsError?.message || partiesError?.message);
      }
    } catch (err) {
      console.warn('Supabase connection notice (fallback to local DB):', err);
    }
  }

  // Localhost (or offline fallback)
  await seedDatabaseIfEmpty();
  const loadedTrips = await db.trips.toArray();
  const loadedParties = await db.parties.toArray();
  const loadedSettings = await db.settings.toArray();

  const settingsMap = { ...DEFAULT_COMPANY_SETTINGS };
  loadedSettings.forEach(item => {
    settingsMap[item.key] = item.value;
  });

  return {
    trips: loadedTrips,
    parties: loadedParties,
    settings: settingsMap,
    source: isSupabaseEnabled() ? 'fallback_local' : 'localhost_indexeddb',
    status: isSupabaseEnabled() ? 'needs_schema' : 'local'
  };
}

export async function saveTripRecord(tripData) {
  let savedTrip = { ...tripData };
  if (isSupabaseEnabled()) {
    try {
      if (tripData.id) {
        const payload = mapTripToSupabase(tripData);
        const { data, error } = await supabase.from('trips').update(payload).eq('id', tripData.id).select().single();
        if (!error && data) {
          savedTrip = mapTripFromSupabase(data);
        }
      } else {
        const payload = mapTripToSupabase(tripData);
        delete payload.id;
        const { data, error } = await supabase.from('trips').insert([payload]).select().single();
        if (!error && data) {
          savedTrip = mapTripFromSupabase(data);
        }
      }
    } catch (err) {
      console.warn('Supabase trip write notice (using local DB):', err);
    }
  }

  // Mirror to Dexie & localStorage
  if (savedTrip.id) {
    await db.trips.put(savedTrip);
  } else {
    const id = await db.trips.add(savedTrip);
    savedTrip = { ...savedTrip, id };
  }
  await backupToLocalStorage();
  return savedTrip;
}

export async function deleteTripRecord(id) {
  if (isSupabaseEnabled()) {
    try {
      await supabase.from('trips').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase trip delete notice:', err);
    }
  }
  await db.trips.delete(id);
  await backupToLocalStorage();
}

export async function savePartyRecord(partyData) {
  let savedParty = { ...partyData };
  if (isSupabaseEnabled()) {
    try {
      if (partyData.id) {
        const payload = mapPartyToSupabase(partyData);
        const { data, error } = await supabase.from('parties').update(payload).eq('id', partyData.id).select().single();
        if (!error && data) {
          savedParty = mapPartyFromSupabase(data);
        }
      } else {
        const payload = mapPartyToSupabase(partyData);
        delete payload.id;
        const { data, error } = await supabase.from('parties').insert([payload]).select().single();
        if (!error && data) {
          savedParty = mapPartyFromSupabase(data);
        }
      }
    } catch (err) {
      console.warn('Supabase party write notice (using local DB):', err);
    }
  }

  // Mirror to Dexie & localStorage
  if (savedParty.id) {
    await db.parties.put(savedParty);
  } else {
    const id = await db.parties.add(savedParty);
    savedParty = { ...savedParty, id };
  }
  await backupToLocalStorage();
  return savedParty;
}

export async function deletePartyRecord(id) {
  if (isSupabaseEnabled()) {
    try {
      await supabase.from('parties').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase party delete notice:', err);
    }
  }
  await db.parties.delete(id);
  await backupToLocalStorage();
}

export async function saveCompanySettings(newSettings) {
  if (isSupabaseEnabled()) {
    try {
      const records = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
      await supabase.from('settings').upsert(records);
    } catch (err) {
      console.warn('Supabase settings update notice:', err);
    }
  }

  for (const [key, value] of Object.entries(newSettings)) {
    await db.settings.put({ key, value });
  }
  await backupToLocalStorage();
}

export async function clearAllDatabaseData() {
  if (isSupabaseEnabled()) {
    try {
      await supabase.from('trips').delete().neq('id', 0);
      await supabase.from('parties').delete().neq('id', 0);
    } catch (err) {
      console.warn('Supabase clear notice:', err);
    }
  }
  await db.trips.clear();
  await db.parties.clear();
  await backupToLocalStorage();
}

export async function resetDemoDatabaseData() {
  if (isSupabaseEnabled()) {
    try {
      await supabase.from('trips').delete().neq('id', 0);
      await supabase.from('parties').delete().neq('id', 0);
      const partyInserts = INITIAL_PARTIES.map(mapPartyToSupabase);
      await supabase.from('parties').insert(partyInserts);
      const tripInserts = INITIAL_TRIPS.map(mapTripToSupabase);
      await supabase.from('trips').insert(tripInserts);
    } catch (err) {
      console.warn('Supabase reset demo notice:', err);
    }
  }
  await db.trips.clear();
  await db.parties.clear();
  await db.trips.bulkAdd(INITIAL_TRIPS);
  await db.parties.bulkAdd(INITIAL_PARTIES);
  await backupToLocalStorage();
}


// Restore from localStorage emergency mirror if needed
export async function restoreFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_BACKUP_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.trips && data.trips.length > 0) {
      await db.trips.clear();
      await db.trips.bulkAdd(data.trips);
    }
    if (data.parties && data.parties.length > 0) {
      await db.parties.clear();
      await db.parties.bulkAdd(data.parties);
    }
    if (data.settings && data.settings.length > 0) {
      await db.settings.clear();
      await db.settings.bulkAdd(data.settings);
    }
    return true;
  } catch (e) {
    console.error('Error restoring from localStorage:', e);
    return false;
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
  const settings = await db.settings.toArray();

  let sql = `-- =========================================================\n`;
  sql += `-- SAI TRANSPORT - SQLITE DATABASE DUMP\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Compatible with SQLite 3 / DB Browser / DBeaver\n`;
  sql += `-- =========================================================\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  // Schema for trips
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
  sql += `  diesel_expense REAL DEFAULT 0,\n`;
  sql += `  toll_expense REAL DEFAULT 0,\n`;
  sql += `  remarks TEXT,\n`;
  sql += `  created_at TEXT\n`;
  sql += `);\n\n`;

  // Schema for parties
  sql += `CREATE TABLE IF NOT EXISTS parties (\n`;
  sql += `  id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
  sql += `  name TEXT NOT NULL UNIQUE,\n`;
  sql += `  phone TEXT,\n`;
  sql += `  gstin TEXT,\n`;
  sql += `  city TEXT,\n`;
  sql += `  address TEXT,\n`;
  sql += `  created_at TEXT\n`;
  sql += `);\n\n`;

  // Schema for settings
  sql += `CREATE TABLE IF NOT EXISTS settings (\n`;
  sql += `  key TEXT PRIMARY KEY,\n`;
  sql += `  value TEXT\n`;
  sql += `);\n\n`;

  // Inserts for trips
  sql += `-- INSERT TRIPS DATA\n`;
  for (const t of trips) {
    const esc = (v) => (v === undefined || v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
    sql += `INSERT INTO trips (lr_no, party_name, party_phone, vehicle_no, vehicle_type, from_city, to_city, trip_date, material, weight, driver_name, driver_mobile, amount, advance, balance, payment_status, delivery_status, diesel_expense, toll_expense, remarks, created_at) VALUES (${esc(t.lrNo)}, ${esc(t.partyName)}, ${esc(t.partyPhone)}, ${esc(t.vehicleNo)}, ${esc(t.vehicleType)}, ${esc(t.fromCity)}, ${esc(t.toCity)}, ${esc(t.date)}, ${esc(t.material)}, ${esc(t.weight)}, ${esc(t.driverName)}, ${esc(t.driverMobile)}, ${Number(t.amount) || 0}, ${Number(t.advance) || 0}, ${Number(t.balance) || 0}, ${esc(t.paymentStatus)}, ${esc(t.deliveryStatus)}, ${Number(t.dieselExpense) || 0}, ${Number(t.tollExpense) || 0}, ${esc(t.remarks)}, ${esc(t.createdAt)});\n`;
  }

  // Inserts for parties
  sql += `\n-- INSERT PARTIES DATA\n`;
  for (const p of parties) {
    const esc = (v) => (v === undefined || v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
    sql += `INSERT OR REPLACE INTO parties (name, phone, gstin, city, address, created_at) VALUES (${esc(p.name)}, ${esc(p.phone)}, ${esc(p.gstin)}, ${esc(p.city)}, ${esc(p.address)}, ${esc(p.createdAt)});\n`;
  }

  // Inserts for settings
  sql += `\n-- INSERT SETTINGS\n`;
  for (const s of settings) {
    const esc = (v) => (v === undefined || v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
    sql += `INSERT OR REPLACE INTO settings (key, value) VALUES (${esc(s.key)}, ${esc(s.value)});\n`;
  }

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
    'Diesel (₹)',
    'Toll (₹)',
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
    t.dieselExpense || 0,
    t.tollExpense || 0,
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
      // Remove auto id if present or clean up
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
