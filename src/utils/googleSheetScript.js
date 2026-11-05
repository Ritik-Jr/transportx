/* eslint-disable */
/**
 * TransportX - Google Sheets Real-Time Database Bridge
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Spreadsheet (or create a new one at https://sheets.new).
 * 2. In Google Sheets menu, click "Extensions" > "Apps Script".
 * 3. Delete any code in Code.gs, paste this entire file, and click "Save" (Ctrl+S).
 * 4. Click "Deploy" (top right) > "New deployment".
 * 5. Select type: "Web app" (click the gear icon if needed).
 * 6. Set Description: "TransportX Database".
 * 7. Set "Execute as": "Me (your email)".
 * 8. Set "Who has access": "Anyone".
 * 9. Click "Deploy", authorize permissions when prompted.
 * 10. Copy the "Web app URL" (ends in /exec) and paste it into TransportX Settings.
 */

function doGet(e) {
  return handleRequest(e ? e.parameter : {});
}

function doPost(e) {
  var params = {};
  if (e && e.postData && e.postData.contents) {
    try {
      params = JSON.parse(e.postData.contents);
    } catch (err) {
      params = e.parameter || {};
    }
  } else if (e && e.parameter) {
    params = e.parameter;
  }
  return handleRequest(params);
}

function handleRequest(params) {
  params = params || {};
  var action = params.action || 'getData';
  var response = { success: false };

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("No active spreadsheet found. Make sure this script is attached to a Google Sheet (Extensions > Apps Script).");
    }

    ensureSheetsAndHeaders(ss);

    if (action === 'ping') {
      response = {
        success: true,
        message: 'TransportX Google Sheets Database Connected Successfully!',
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      };
    } else if (action === 'getData') {
      response = {
        success: true,
        trips: getTrips(ss),
        parties: getParties(ss),
        settings: getSettings(ss),
        spreadsheetName: ss.getName()
      };
    } else if (action === 'saveTrip') {
      var trip = params.trip || params.data || {};
      if (typeof trip === 'string') trip = JSON.parse(trip);
      response = {
        success: true,
        trip: saveTrip(ss, trip)
      };
    } else if (action === 'deleteTrip') {
      var tripId = params.id !== undefined ? params.id : params.lrNo;
      response = {
        success: true,
        deleted: deleteTrip(ss, tripId)
      };
    } else if (action === 'saveParty') {
      var party = params.party || params.data || {};
      if (typeof party === 'string') party = JSON.parse(party);
      response = {
        success: true,
        party: saveParty(ss, party)
      };
    } else if (action === 'deleteParty') {
      var partyId = params.id !== undefined ? params.id : params.name;
      response = {
        success: true,
        deleted: deleteParty(ss, partyId)
      };
    } else if (action === 'saveSettings') {
      var settings = params.settings || params.data || {};
      if (typeof settings === 'string') settings = JSON.parse(settings);
      response = {
        success: true,
        saved: saveSettings(ss, settings)
      };
    } else if (action === 'clearAll') {
      clearAllData(ss);
      response = { success: true, message: 'Trips and parties cleared' };
    } else if (action === 'syncAll') {
      var allData = params.data || params;
      if (typeof allData === 'string') allData = JSON.parse(allData);
      response = syncAll(ss, allData);
    } else {
      response = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    response = { success: false, error: err.toString(), stack: err.stack };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

var TRIP_HEADERS = [
  "ID", "LR No", "Date", "Party Name", "Party Phone", "Vehicle No", "Vehicle Type",
  "From Location", "To Location", "Driver Name", "Driver Mobile", "Material", "Weight",
  "Total Amount (₹)", "Advance Paid (₹)", "Balance Due (₹)", "Payment Status",
  "Delivery Status", "Diesel Expense (₹)", "Toll Expense (₹)", "Remarks",
  "Created At", "Updated At"
];

var PARTY_HEADERS = [
  "ID", "Party Name", "Phone", "City", "GSTIN", "Office Address", "Created At"
];

var SETTINGS_HEADERS = [
  "Key", "Value", "Updated At"
];

function ensureSheetsAndHeaders(ss) {
  var setupSheet = function(name, headers) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#f8fafc");
      sheet.setFrozenRows(1);
      for (var col = 1; col <= headers.length; col++) {
        sheet.autoResizeColumn(col);
      }
    }
    return sheet;
  };

  setupSheet("Trips", TRIP_HEADERS);
  setupSheet("Parties", PARTY_HEADERS);
  setupSheet("Settings", SETTINGS_HEADERS);

  // Remove default blank "Sheet1" if custom sheets exist
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (_) {}
  }
}

function getTrips(ss) {
  var sheet = ss.getSheetByName("Trips");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var trips = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue; // Skip empty row

    var rawRemarks = String(row[20] || '');
    var commission = 0;
    var height = '';
    var transactions = [];
    if (rawRemarks.indexOf('<!--TX_META:') !== -1) {
      var match = rawRemarks.match(/<!--TX_META:([\s\S]*?)-->/);
      if (match) {
        try {
          var meta = JSON.parse(match[1]);
          if (meta.commission) commission = Number(meta.commission) || 0;
          if (meta.height) height = meta.height;
          if (meta.transactions && Array.isArray(meta.transactions)) transactions = meta.transactions;
        } catch(e) {}
        rawRemarks = rawRemarks.replace(/<!--TX_META:[\s\S]*?-->/g, '').trim();
      }
    }

    trips.push({
      id: Number(row[0]) || row[0],
      lrNo: String(row[1] || ''),
      date: formatDate(row[2]),
      partyName: String(row[3] || ''),
      partyPhone: String(row[4] || ''),
      vehicleNo: String(row[5] || ''),
      vehicleType: String(row[6] || '14 Wheeler'),
      fromCity: String(row[7] || ''),
      toCity: String(row[8] || ''),
      driverName: String(row[9] || ''),
      driverMobile: String(row[10] || ''),
      material: String(row[11] || ''),
      weight: String(row[12] || ''),
      height: height,
      amount: Number(row[13]) || 0,
      advance: Number(row[14]) || 0,
      balance: Number(row[15]) || 0,
      commission: commission,
      transactions: transactions,
      paymentStatus: String(row[16] || 'Pending'),
      deliveryStatus: String(row[17] || 'Booked'),
      dieselExpense: Number(row[18]) || 0,
      tollExpense: Number(row[19]) || 0,
      remarks: rawRemarks,
      createdAt: row[21] ? new Date(row[21]).toISOString() : new Date().toISOString(),
      updatedAt: row[22] ? new Date(row[22]).toISOString() : new Date().toISOString()
    });
  }

  // Sort newest first
  trips.sort(function(a, b) {
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

  return trips;
}

function saveTrip(ss, trip) {
  var sheet = ss.getSheetByName("Trips");
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var nowIso = new Date().toISOString();

  var tripId = trip.id;
  if (!tripId) {
    // Generate new unique numeric timestamp ID
    tripId = Date.now();
    trip.id = tripId;
  }

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(tripId) || (trip.lrNo && String(data[i][1]).toUpperCase() === String(trip.lrNo).toUpperCase())) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowValues = [
    tripId,
    trip.lrNo || '',
    formatDate(trip.date),
    trip.partyName || '',
    trip.partyPhone || '',
    trip.vehicleNo || '',
    trip.vehicleType || '14 Wheeler',
    trip.fromCity || '',
    trip.toCity || '',
    trip.driverName || '',
    trip.driverMobile || '',
    trip.material || '',
    trip.weight || '',
    Number(trip.amount) || 0,
    Number(trip.advance) || 0,
    Number(trip.balance) || 0,
    trip.paymentStatus || 'Pending',
    trip.deliveryStatus || 'Booked',
    Number(trip.dieselExpense) || 0,
    Number(trip.tollExpense) || 0,
    trip.remarks || '',
    trip.createdAt || nowIso,
    nowIso
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  // Auto-register party in Parties sheet if not present
  if (trip.partyName) {
    ensurePartyExists(ss, trip.partyName, trip.partyPhone, trip.toCity);
  }

  return trip;
}

function deleteTrip(ss, tripId) {
  var sheet = ss.getSheetByName("Trips");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(tripId) || String(data[i][1]).toUpperCase() === String(tripId).toUpperCase()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function getParties(ss) {
  var sheet = ss.getSheetByName("Parties");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var parties = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;

    parties.push({
      id: Number(row[0]) || row[0],
      name: String(row[1] || ''),
      phone: String(row[2] || ''),
      city: String(row[3] || ''),
      gstin: String(row[4] || ''),
      address: String(row[5] || ''),
      createdAt: row[6] ? new Date(row[6]).toISOString() : new Date().toISOString()
    });
  }

  parties.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  return parties;
}

function saveParty(ss, party) {
  var sheet = ss.getSheetByName("Parties");
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var nowIso = new Date().toISOString();

  var partyId = party.id;
  if (!partyId) {
    partyId = Date.now();
    party.id = partyId;
  }

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(partyId) || (party.name && String(data[i][1]).toLowerCase() === String(party.name).toLowerCase())) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowValues = [
    partyId,
    party.name || '',
    party.phone || '',
    party.city || '',
    party.gstin || '',
    party.address || '',
    party.createdAt || nowIso
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return party;
}

function ensurePartyExists(ss, name, phone, city) {
  if (!name || !name.trim()) return;
  var sheet = ss.getSheetByName("Parties");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase().trim() === name.toLowerCase().trim()) {
      return; // already exists
    }
  }
  saveParty(ss, {
    id: Date.now(),
    name: name.trim(),
    phone: phone || '',
    city: city || '',
    gstin: '',
    address: '',
    createdAt: new Date().toISOString()
  });
}

function deleteParty(ss, partyId) {
  var sheet = ss.getSheetByName("Parties");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(partyId) || String(data[i][1]).toLowerCase() === String(partyId).toLowerCase()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function getSettings(ss) {
  var sheet = ss.getSheetByName("Settings");
  if (!sheet || sheet.getLastRow() <= 1) return {};

  var data = sheet.getDataRange().getValues();
  var settings = {};

  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0] || '').trim();
    var val = data[i][1];
    if (key) {
      settings[key] = val;
    }
  }
  return settings;
}

function saveSettings(ss, settings) {
  var sheet = ss.getSheetByName("Settings");
  var data = sheet.getDataRange().getValues();
  var existingKeys = {};
  for (var i = 1; i < data.length; i++) {
    var k = String(data[i][0] || '').trim();
    if (k) existingKeys[k] = i + 1;
  }

  var nowIso = new Date().toISOString();
  for (var key in settings) {
    if (!settings.hasOwnProperty(key)) continue;
    var val = typeof settings[key] === 'object' ? JSON.stringify(settings[key]) : String(settings[key]);
    if (existingKeys[key]) {
      sheet.getRange(existingKeys[key], 2, 1, 2).setValues([[val, nowIso]]);
    } else {
      sheet.appendRow([key, val, nowIso]);
    }
  }
  return true;
}

function clearAllData(ss) {
  var tripsSheet = ss.getSheetByName("Trips");
  if (tripsSheet && tripsSheet.getLastRow() > 1) {
    tripsSheet.deleteRows(2, tripsSheet.getLastRow() - 1);
  }
  var partiesSheet = ss.getSheetByName("Parties");
  if (partiesSheet && partiesSheet.getLastRow() > 1) {
    partiesSheet.deleteRows(2, partiesSheet.getLastRow() - 1);
  }
}

function syncAll(ss, data) {
  ensureSheetsAndHeaders(ss);
  if (data.trips && Array.isArray(data.trips)) {
    for (var i = 0; i < data.trips.length; i++) {
      saveTrip(ss, data.trips[i]);
    }
  }
  if (data.parties && Array.isArray(data.parties)) {
    for (var j = 0; j < data.parties.length; j++) {
      saveParty(ss, data.parties[j]);
    }
  }
  if (data.settings && typeof data.settings === 'object') {
    saveSettings(ss, data.settings);
  }
  return { success: true, countTrips: (data.trips || []).length, countParties: (data.parties || []).length };
}

function formatDate(val) {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, '0');
    var d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(val);
}
