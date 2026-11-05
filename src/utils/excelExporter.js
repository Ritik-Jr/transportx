import { formatDate } from './dateFormatter';

export const EXCEL_COLUMNS = [
  // Identity & Route
  { id: 'lrNo', label: 'LR / Bilty No.', category: 'Trip Identity', default: true, type: 'string' },
  { id: 'date', label: 'Booking Date', category: 'Trip Identity', default: true, type: 'date' },
  { id: 'fromCity', label: 'From (Origin)', category: 'Route', default: true, type: 'string' },
  { id: 'toCity', label: 'To (Destination)', category: 'Route', default: true, type: 'string' },
  
  // Party Details
  { id: 'partyName', label: 'Party / Consignor', category: 'Party Details', default: true, type: 'string' },
  { id: 'partyPhone', label: 'Party Phone', category: 'Party Details', default: false, type: 'string' },
  
  // Vehicle & Driver
  { id: 'vehicleNo', label: 'Truck Number', category: 'Fleet & Driver', default: true, type: 'string' },
  { id: 'vehicleType', label: 'Vehicle Type', category: 'Fleet & Driver', default: true, type: 'string' },
  { id: 'driverName', label: 'Driver Name', category: 'Fleet & Driver', default: true, type: 'string' },
  { id: 'driverMobile', label: 'Driver Phone', category: 'Fleet & Driver', default: false, type: 'string' },
  
  // Cargo Specifications
  { id: 'material', label: 'Cargo / Material', category: 'Cargo Specs', default: true, type: 'string' },
  { id: 'weight', label: 'Weight / Quantity', category: 'Cargo Specs', default: true, type: 'string' },
  { id: 'height', label: 'Cargo Height', category: 'Cargo Specs', default: true, type: 'string' },
  
  // Financial Figures
  { id: 'amount', label: 'Total Freight (₹)', category: 'Financials & Tally', default: true, type: 'number' },
  { id: 'advance', label: 'Advance Paid (₹)', category: 'Financials & Tally', default: true, type: 'number' },
  { id: 'balance', label: 'Balance Due (₹)', category: 'Financials & Tally', default: true, type: 'number' },
  { id: 'commission', label: 'Commission (₹)', category: 'Financials & Tally', default: false, type: 'number' },
  { id: 'totalExpenses', label: 'Total Expenses (₹)', category: 'Financials & Tally', default: true, type: 'number' },
  { id: 'netProfit', label: 'Net Profit / Margin (₹)', category: 'Financials & Tally', default: true, type: 'number' },
  
  // Status & Logs
  { id: 'paymentStatus', label: 'Payment Status', category: 'Status & Logs', default: true, type: 'string' },
  { id: 'deliveryStatus', label: 'Delivery Status', category: 'Status & Logs', default: false, type: 'string' },
  { id: 'transactionsSummary', label: 'Expenses Log Summary', category: 'Status & Logs', default: false, type: 'string' },
  { id: 'remarks', label: 'Remarks / Notes', category: 'Status & Logs', default: false, type: 'string' }
];

export function extractTripValue(trip, columnId) {
  const freight = Number(trip.amount) || 0;
  const advance = Number(trip.advance) || 0;
  const balance = Number(trip.balance) || 0;
  const commission = Number(trip.commission) || 0;

  // Compute expenses from transactions
  let expenses = 0;
  if (Array.isArray(trip.transactions) && trip.transactions.length > 0) {
    trip.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        expenses += Number(tx.amount) || 0;
      }
    });
  } else {
    expenses = commission + (Number(trip.dieselExpense) || 0) + (Number(trip.tollExpense) || 0);
  }

  const netProfit = freight - expenses;

  switch (columnId) {
    case 'lrNo':
      return trip.lrNo || '';
    case 'date':
      return formatDate(trip.date);
    case 'fromCity':
      return trip.fromCity || '';
    case 'toCity':
      return trip.toCity || '';
    case 'partyName':
      return trip.partyName || '';
    case 'partyPhone':
      return trip.partyPhone || '';
    case 'vehicleNo':
      return trip.vehicleNo || '';
    case 'vehicleType':
      return trip.vehicleType || '14 Wheeler';
    case 'driverName':
      return trip.driverName || '';
    case 'driverMobile':
      return trip.driverMobile || '';
    case 'material':
      return trip.material || '';
    case 'weight':
      return trip.weight || '';
    case 'height':
      return trip.height || '';
    case 'amount':
      return freight;
    case 'advance':
      return advance;
    case 'balance':
      return balance;
    case 'commission':
      return commission;
    case 'totalExpenses':
      return expenses;
    case 'netProfit':
      return netProfit;
    case 'paymentStatus':
      return trip.paymentStatus || 'Pending';
    case 'deliveryStatus':
      return trip.deliveryStatus || 'Booked';
    case 'transactionsSummary':
      if (Array.isArray(trip.transactions) && trip.transactions.length > 0) {
        return trip.transactions
          .map(t => `${t.categoryLabel || t.type}: ₹${t.amount}${t.notes ? ` [${t.notes}]` : ''}`)
          .join('; ');
      }
      return '';
    case 'remarks':
      return trip.remarks || '';
    default:
      return trip[columnId] || '';
  }
}

/**
 * Generate standard CSV string with UTF-8 BOM for Microsoft Excel.
 */
export function generateCsv(trips, selectedColumnIds, _title = 'TransportX Trips Report') {
  const activeCols = EXCEL_COLUMNS.filter(c => selectedColumnIds.includes(c.id));
  if (activeCols.length === 0) return '';

  const headerRow = activeCols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  const rows = trips.map(t => {
    return activeCols.map(c => {
      const val = extractTripValue(t, c.id);
      if (c.type === 'number') {
        return typeof val === 'number' ? val : (Number(val) || 0);
      }
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Calculate totals row for numeric columns
  const totals = {};
  activeCols.forEach(c => {
    if (c.type === 'number') {
      totals[c.id] = trips.reduce((sum, t) => sum + (Number(extractTripValue(t, c.id)) || 0), 0);
    }
  });

  const totalsRow = activeCols.map((c, idx) => {
    if (idx === 0) return '"TOTAL SUMMARY"';
    if (c.type === 'number') return totals[c.id] || 0;
    return '""';
  }).join(',');

  // UTF-8 BOM: \uFEFF ensures Excel displays characters, Rupee symbols, and Indian text correctly
  return `\uFEFF${headerRow}\r\n${rows.join('\r\n')}\r\n${totalsRow}`;
}

/**
 * Generate native Excel XML Spreadsheet (SpreadsheetML) with styled headers,
 * background colors, borders, and currency formatting.
 */
export function generateExcelXml(trips, selectedColumnIds, title = 'TransportX Trips Report') {
  const activeCols = EXCEL_COLUMNS.filter(c => selectedColumnIds.includes(c.id));
  if (activeCols.length === 0) return '';

  const escapeXml = (str) => {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Compute totals
  const totals = {};
  activeCols.forEach(c => {
    if (c.type === 'number') {
      totals[c.id] = trips.reduce((sum, t) => sum + (Number(extractTripValue(t, c.id)) || 0), 0);
    }
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#18181B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3F3F46"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="14" ss:Color="#18181B" ss:Bold="1"/>
  </Style>
  <Style ss:ID="SubTitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#71717A" ss:Italic="1"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="DateStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CenterStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="TotalStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#18181B"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#18181B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F4F4F5" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="TotalLabelStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#18181B"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#18181B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F4F4F5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Trips Report">
  <Table ss:DefaultRowHeight="20">
`;

  // Define Column Widths
  activeCols.forEach(c => {
    let width = 110;
    if (['lrNo', 'date'].includes(c.id)) width = 85;
    if (['fromCity', 'toCity', 'material'].includes(c.id)) width = 130;
    if (['partyName', 'transactionsSummary', 'remarks'].includes(c.id)) width = 180;
    if (c.type === 'number') width = 115;
    xml += `   <Column ss:AutoFitWidth="0" ss:Width="${width}"/>\n`;
  });

  // Title Rows
  xml += `   <Row ss:Height="26">
    <Cell ss:MergeAcross="${activeCols.length - 1}" ss:StyleID="TitleStyle">
     <Data ss:Type="String">${escapeXml(title)}</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="${activeCols.length - 1}" ss:StyleID="SubTitleStyle">
     <Data ss:Type="String">Generated on ${formatDate(new Date())} • Total Records: ${trips.length}</Data>
    </Cell>
   </Row>
   <Row ss:Height="8"/>
`;

  // Header Row
  xml += `   <Row ss:Height="24">
`;
  activeCols.forEach(c => {
    xml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Data Rows
  trips.forEach(t => {
    xml += `   <Row ss:Height="20">\n`;
    activeCols.forEach(c => {
      const val = extractTripValue(t, c.id);
      if (c.type === 'number') {
        const numVal = Number(val) || 0;
        xml += `    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${numVal}</Data></Cell>\n`;
      } else if (c.type === 'date') {
        xml += `    <Cell ss:StyleID="DateStyle"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
      } else {
        xml += `    <Cell><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
      }
    });
    xml += `   </Row>\n`;
  });

  // Totals Row
  xml += `   <Row ss:Height="22">\n`;
  activeCols.forEach((c, idx) => {
    if (idx === 0) {
      xml += `    <Cell ss:StyleID="TotalLabelStyle"><Data ss:Type="String">TOTAL SUMMARY</Data></Cell>\n`;
    } else if (c.type === 'number') {
      const numVal = totals[c.id] || 0;
      xml += `    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${numVal}</Data></Cell>\n`;
    } else {
      xml += `    <Cell ss:StyleID="TotalLabelStyle"><Data ss:Type="String"></Data></Cell>\n`;
    }
  });
  xml += `   </Row>\n`;

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

/**
 * Trigger file download directly in browser.
 */
export function downloadSpreadsheetFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
