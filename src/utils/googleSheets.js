import { DEFAULT_COMPANY_SETTINGS } from '../db';
import scriptTemplate from './googleSheetScript.js?raw';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = scriptTemplate;

const STORAGE_KEYS = {
  PROVIDER: 'sai_transport_db_provider', // 'google_sheets' | 'supabase'
  SCRIPT_URL: 'sai_transport_google_sheet_url', // Web App URL (https://script.google.com/macros/s/.../exec)
  SHEET_LINK: 'sai_transport_google_sheet_link', // Direct Google Sheet URL (https://docs.google.com/spreadsheets/d/...)
  LAST_SYNC: 'sai_transport_gsheet_last_sync'
};

/**
 * Extract Google Spreadsheet ID from a standard Google Sheets URL.
 */
export function extractSpreadsheetId(url = '') {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Returns current database provider: 'google_sheets' | 'supabase'
 */
export function getDbProvider() {
  try {
    const configuredUrl = getGoogleSheetsUrl();
    const stored = localStorage.getItem(STORAGE_KEYS.PROVIDER);
    // If user configured a Google Sheets URL and hasn't explicitly set provider to supabase, default to google_sheets
    if (configuredUrl && stored !== 'supabase') {
      return 'google_sheets';
    }
    return stored || (configuredUrl ? 'google_sheets' : 'supabase');
  } catch {
    return 'supabase';
  }
}

/**
 * Sets current database provider.
 */
export function setDbProvider(provider) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  } catch (err) {
    console.warn('Failed to store db provider:', err);
  }
}

/**
 * Get configured Google Apps Script Web App URL.
 */
export function getGoogleSheetsUrl() {
  try {
    return (localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) || '').trim();
  } catch {
    return '';
  }
}

/**
 * Save Google Apps Script Web App URL.
 */
export function setGoogleSheetsUrl(url) {
  try {
    const cleaned = (url || '').trim();
    if (cleaned) {
      localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, cleaned);
      // Auto-set provider to google_sheets when a valid URL is provided
      localStorage.setItem(STORAGE_KEYS.PROVIDER, 'google_sheets');
    } else {
      localStorage.removeItem(STORAGE_KEYS.SCRIPT_URL);
    }
  } catch (err) {
    console.warn('Failed to store google sheet url:', err);
  }
}

/**
 * Get configured Google Spreadsheet direct link.
 */
export function getGoogleSheetLink() {
  try {
    return (localStorage.getItem(STORAGE_KEYS.SHEET_LINK) || '').trim();
  } catch {
    return '';
  }
}

/**
 * Save Google Spreadsheet direct link.
 */
export function setGoogleSheetLink(url) {
  try {
    const cleaned = (url || '').trim();
    if (cleaned) {
      localStorage.setItem(STORAGE_KEYS.SHEET_LINK, cleaned);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SHEET_LINK);
    }
  } catch (err) {
    console.warn('Failed to store google sheet link:', err);
  }
}

/**
 * Returns true if Google Sheets is configured and active.
 */
export function isGoogleSheetsActive() {
  const url = getGoogleSheetsUrl();
  const provider = getDbProvider();
  return Boolean(url && provider === 'google_sheets');
}

/**
 * Returns true if Google Sheets URL is saved in storage.
 */
export function isGoogleSheetsConfigured() {
  return Boolean(getGoogleSheetsUrl());
}

/**
 * Core communication bridge to the deployed Google Apps Script Web App.
 * Uses text/plain POST to avoid preflight CORS OPTIONS blocks, with automatic GET fallback.
 */
async function callAppsScript(action, payload = {}, customUrl = null) {
  const baseUrl = customUrl || getGoogleSheetsUrl();
  if (!baseUrl) {
    throw new Error('Google Sheets Web App URL is not configured. Please paste your link in Settings.');
  }

  const cleanUrl = baseUrl.trim();

  // Try POST first (standard way to send data to Google Apps Script)
  try {
    const bodyData = { action, ...payload };
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        // text/plain avoids CORS preflight OPTIONS request which Google Apps Script doesn't support
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(bodyData),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error || 'Google Sheets script operation failed');
    }
    return json;
  } catch (postErr) {
    // If POST fails (e.g. strict corporate proxy or CORS issue on redirect), attempt GET fallback
    console.warn(`POST to Google Sheets failed for action "${action}", attempting GET fallback:`, postErr);

    try {
      const getUrl = new URL(cleanUrl);
      getUrl.searchParams.set('action', action);
      if (payload && Object.keys(payload).length > 0) {
        getUrl.searchParams.set('data', JSON.stringify(payload));
      }

      const getResponse = await fetch(getUrl.toString(), {
        method: 'GET',
        redirect: 'follow'
      });

      if (!getResponse.ok) {
        throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
      }

      const getJson = await getResponse.json();
      if (!getJson.success) {
        throw new Error(getJson.error || 'Google Sheets script operation failed');
      }
      return getJson;
    } catch (getErr) {
      console.error('Both POST and GET failed for Google Apps Script:', getErr);
      throw postErr;
    }
  }
}

/**
 * Test connectivity with a Google Apps Script Web App URL.
 */
export async function testGoogleSheetsConnection(urlToTest = null) {
  const url = (urlToTest || getGoogleSheetsUrl()).trim();
  if (!url) {
    return { success: false, error: 'No URL provided' };
  }

  // Check if user accidentally pasted the spreadsheet URL instead of the Web App URL
  if (url.includes('docs.google.com/spreadsheets')) {
    const sheetId = extractSpreadsheetId(url);
    return {
      success: false,
      isSpreadsheetUrl: true,
      spreadsheetId: sheetId,
      error: 'This is a Google Spreadsheet link. To connect, please deploy the Google Apps Script in this sheet and paste the Web App URL (ends in /exec).'
    };
  }

  try {
    const res = await callAppsScript('ping', {}, url);
    return {
      success: true,
      message: res.message || 'Connected successfully',
      spreadsheetName: res.spreadsheetName,
      spreadsheetId: res.spreadsheetId,
      spreadsheetUrl: res.spreadsheetUrl
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to connect to Google Sheets Web App'
    };
  }
}

/**
 * Fetch all records (trips, parties, settings) from Google Sheets.
 */
export async function fetchGoogleSheetsData() {
  try {
    const res = await callAppsScript('getData');
    const settingsMap = { ...DEFAULT_COMPANY_SETTINGS, ...(res.settings || {}) };

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch {}

    const normalizedTrips = (res.trips || []).map(t => {
      let remarks = t.remarks || '';
      let commission = Number(t.commission) || 0;
      let height = t.height || '';
      let transactions = Array.isArray(t.transactions) ? t.transactions : [];

      if (remarks.includes('<!--TX_META:')) {
        const match = remarks.match(/<!--TX_META:([\s\S]*?)-->/);
        if (match) {
          try {
            const meta = JSON.parse(match[1]);
            if (meta.commission !== undefined && !commission) {
              commission = Number(meta.commission) || 0;
            }
            if (meta.height && !height) {
              height = meta.height;
            }
            if (Array.isArray(meta.transactions) && transactions.length === 0) {
              transactions = meta.transactions;
            }
          } catch {}
          remarks = remarks.replace(/<!--TX_META:[\s\S]*?-->/g, '').trim();
        }
      }

      return {
        ...t,
        height,
        commission,
        transactions,
        remarks
      };
    });

    return {
      trips: normalizedTrips,
      parties: res.parties || [],
      settings: settingsMap,
      source: 'google_sheets',
      status: 'online',
      spreadsheetName: res.spreadsheetName
    };
  } catch (err) {
    console.error('Failed to fetch from Google Sheets:', err);
    return {
      trips: [],
      parties: [],
      settings: DEFAULT_COMPANY_SETTINGS,
      source: 'google_sheets',
      status: 'error',
      error: err.message
    };
  }
}

/**
 * Save trip record to Google Sheets.
 */
export async function saveTripToGoogleSheets(tripData) {
  let remarksText = (tripData.remarks || '').replace(/<!--TX_META:[\s\S]*?-->/g, '').trim();
  const meta = {
    commission: Number(tripData.commission) || 0,
    height: tripData.height || '',
    transactions: Array.isArray(tripData.transactions) ? tripData.transactions : []
  };
  const combinedRemarks = remarksText 
    ? `${remarksText}\n<!--TX_META:${JSON.stringify(meta)}-->`
    : `<!--TX_META:${JSON.stringify(meta)}-->`;

  const payload = {
    ...tripData,
    height: tripData.height || '',
    commission: Number(tripData.commission) || 0,
    transactions: Array.isArray(tripData.transactions) ? tripData.transactions : [],
    remarks: combinedRemarks
  };

  const res = await callAppsScript('saveTrip', { trip: payload });
  return {
    ...(res.trip || tripData),
    height: tripData.height || '',
    commission: Number(tripData.commission) || 0,
    transactions: Array.isArray(tripData.transactions) ? tripData.transactions : [],
    remarks: remarksText
  };
}

/**
 * Delete trip record from Google Sheets.
 */
export async function deleteTripFromGoogleSheets(id) {
  const res = await callAppsScript('deleteTrip', { id });
  return res.deleted || true;
}

/**
 * Save party record to Google Sheets.
 */
export async function savePartyToGoogleSheets(partyData) {
  const res = await callAppsScript('saveParty', { party: partyData });
  return res.party || partyData;
}

/**
 * Delete party record from Google Sheets.
 */
export async function deletePartyFromGoogleSheets(id) {
  const res = await callAppsScript('deleteParty', { id });
  return res.deleted || true;
}

/**
 * Save company settings to Google Sheets.
 */
export async function saveSettingsToGoogleSheets(settings) {
  const res = await callAppsScript('saveSettings', { settings });
  return res.saved || true;
}

/**
 * Wipe all trips and parties in Google Sheets.
 */
export async function clearGoogleSheetsDatabase() {
  const res = await callAppsScript('clearAll');
  return res.success || true;
}

/**
 * Sync entire dataset (trips, parties, settings) to Google Sheets.
 */
export async function syncAllToGoogleSheets(data, customUrl = null) {
  const res = await callAppsScript('syncAll', { data }, customUrl);
  return res;
}
