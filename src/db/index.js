import { 
  supabase, 
  isSupabaseEnabled, 
  checkSupabaseSchema,
  mapTripFromSupabase, 
  mapTripToSupabase, 
  mapPartyFromSupabase, 
  mapPartyToSupabase,
  SUPABASE_SCHEMA_SQL,
  SUPABASE_FIX_RLS_SQL,
  isRlsError
} from '../utils/supabase';

export { SUPABASE_SCHEMA_SQL, SUPABASE_FIX_RLS_SQL, isRlsError };

// Cleanup any old local IndexedDB database and dummy localStorage flags from previous versions
export async function purgeLocalBrowserStorage() {
  try {
    if (typeof window !== 'undefined' && window.indexedDB) {
      window.indexedDB.deleteDatabase('SaiTransportDB');
    }
    localStorage.removeItem('sai_transport_db_initialized_v2');
    localStorage.removeItem('sai_transport_db_initialized');
    localStorage.removeItem('sai_transport_emergency_backup_v1');
    localStorage.removeItem('sai_transport_dummy_deleted');
    sessionStorage.removeItem('transportx_demo_mode');
  } catch (err) {
    console.warn('Storage purge notice:', err);
  }
}

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
  masterPassword: '000000',
  passwordHint: '000000',
};

/**
 * Fetch all records directly from Supabase Cloud Database.
 * No dummy data. No local storage data.
 */
export async function fetchAppData() {
  await purgeLocalBrowserStorage();

  const schemaCheck = await checkSupabaseSchema();
  if (schemaCheck.status === 'needs_schema') {
    return {
      trips: [],
      parties: [],
      settings: DEFAULT_COMPANY_SETTINGS,
      source: 'supabase',
      status: 'needs_schema'
    };
  }

  try {
    const [tripsRes, partiesRes, settingsRes] = await Promise.all([
      supabase.from('trips').select('*').order('id', { ascending: false }),
      supabase.from('parties').select('*').order('name', { ascending: true }),
      supabase.from('settings').select('*')
    ]);

    if (tripsRes.error || partiesRes.error) {
      console.warn('Supabase query error:', tripsRes.error || partiesRes.error);
      const queryErr = tripsRes.error || partiesRes.error;
      const isRls = isRlsError(queryErr);
      return {
        trips: [],
        parties: [],
        settings: DEFAULT_COMPANY_SETTINGS,
        source: 'supabase',
        status: isRls ? 'rls_blocked' : 'error',
        error: queryErr?.message
      };
    }

    const loadedTrips = (tripsRes.data || []).map(mapTripFromSupabase);
    const loadedParties = (partiesRes.data || []).map(mapPartyFromSupabase);
    const settingsMap = { ...DEFAULT_COMPANY_SETTINGS };

    if (!settingsRes.error && settingsRes.data) {
      settingsRes.data.forEach(item => {
        settingsMap[item.key] = item.value;
      });
    }

    return {
      trips: loadedTrips,
      parties: loadedParties,
      settings: settingsMap,
      source: 'supabase',
      status: schemaCheck.status === 'rls_blocked' ? 'rls_blocked' : 'online'
    };
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return {
      trips: [],
      parties: [],
      settings: DEFAULT_COMPANY_SETTINGS,
      source: 'supabase',
      status: isRlsError(err) ? 'rls_blocked' : 'error',
      error: err.message
    };
  }
}

/**
 * Save trip directly to Supabase cloud database.
 */
export async function saveTripRecord(tripData) {
  const payload = mapTripToSupabase(tripData);

  if (tripData.id && typeof tripData.id === 'number') {
    const { data, error } = await supabase
      .from('trips')
      .update(payload)
      .eq('id', tripData.id)
      .select()
      .single();

    if (error) throw error;
    return mapTripFromSupabase(data);
  } else {
    delete payload.id;
    const { data, error } = await supabase
      .from('trips')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return mapTripFromSupabase(data);
  }
}

/**
 * Delete trip directly from Supabase cloud database.
 */
export async function deleteTripRecord(id) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Save party directly to Supabase cloud database.
 */
export async function savePartyRecord(partyData) {
  const payload = mapPartyToSupabase(partyData);

  if (partyData.id && typeof partyData.id === 'number') {
    const { data, error } = await supabase
      .from('parties')
      .update(payload)
      .eq('id', partyData.id)
      .select()
      .single();

    if (error) throw error;
    return mapPartyFromSupabase(data);
  } else {
    delete payload.id;
    const { data, error } = await supabase
      .from('parties')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return mapPartyFromSupabase(data);
  }
}

/**
 * Delete party directly from Supabase cloud database.
 */
export async function deletePartyRecord(id) {
  const { error } = await supabase
    .from('parties')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Save company settings directly to Supabase cloud database.
 */
export async function saveCompanySettings(newSettings) {
  const records = Object.entries(newSettings).map(([key, value]) => ({
    key,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value)
  }));

  const { error } = await supabase
    .from('settings')
    .upsert(records);

  if (error) throw error;
  return true;
}

/**
 * Wipe all data directly from Supabase cloud database.
 */
export async function clearAllDatabaseData() {
  const { error: tErr } = await supabase.from('trips').delete().neq('id', 0);
  const { error: pErr } = await supabase.from('parties').delete().neq('id', 0);
  if (tErr) console.warn('Wipe trips error:', tErr);
  if (pErr) console.warn('Wipe parties error:', pErr);
  return true;
}

/**
 * Export in-memory trips to Excel CSV format.
 */
export function exportTripsToCsv(trips = []) {
  if (!trips || trips.length === 0) {
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
  a.download = `transportx-cloud-trips-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Export trips, parties, and settings to JSON file.
 */
export function exportDatabaseToJson(trips = [], parties = [], settings = DEFAULT_COMPANY_SETTINGS) {
  const backupData = {
    appName: 'Sai Transport',
    version: '2.0.0-cloud',
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
  a.download = `transportx-cloud-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Restore JSON records directly to Supabase cloud database.
 */
export async function restoreDatabaseFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const tripsData = parsed.data ? parsed.data.trips : parsed.trips;
    const partiesData = parsed.data ? parsed.data.parties : parsed.parties;
    const settingsData = parsed.data ? parsed.data.settings : parsed.settings;

    if (Array.isArray(partiesData) && partiesData.length > 0) {
      const pRows = partiesData.map(mapPartyToSupabase).map(p => { delete p.id; return p; });
      await supabase.from('parties').insert(pRows);
    }

    if (Array.isArray(tripsData) && tripsData.length > 0) {
      const tRows = tripsData.map(mapTripToSupabase).map(t => { delete t.id; return t; });
      await supabase.from('trips').insert(tRows);
    }

    if (settingsData && typeof settingsData === 'object') {
      await saveCompanySettings(settingsData);
    }

    return { success: true, count: tripsData ? tripsData.length : 0 };
  } catch (error) {
    console.error('Failed to restore backup to Supabase:', error);
    return { success: false, error: error.message };
  }
}
