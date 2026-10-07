/**
 * Utility for generating beautifully organized, professional WhatsApp messages
 * for Sai Transport (Consignment slips, Bilty share, and Ledger payment reminders).
 */

export function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

export function formatDate(dStr) {
  if (!dStr) return '';
  try {
    const d = new Date(dStr + (dStr.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (_) {
    return dStr;
  }
}

export function getWhatsAppUrl(phone, text) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(text);

  if (cleanPhone.length >= 10) {
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    }
    const tenDigits = cleanPhone.slice(-10);
    return `https://api.whatsapp.com/send?phone=91${tenDigits}&text=${encoded}`;
  }

  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function openWhatsApp(phone, text) {
  const url = getWhatsAppUrl(phone, text);
  window.open(url, '_blank');
}

/**
 * Format an organized Trip / Bilty consignment slip
 */
export function formatTripWhatsAppMessage(trip, company = {}) {
  const compName = (company.companyName || 'SAI TRANSPORT').toUpperCase();
  const compPhone = company.phone || '+91 98220 99887';
  
  const statusEmoji = 
    trip.paymentStatus === 'Paid' ? '✅ Paid' :
    trip.paymentStatus === 'Partial' ? '⚠️ Partial' : '⏳ Pending';

  const routeStr = trip.fromCity && trip.toCity 
    ? `${trip.fromCity} ➔ ${trip.toCity}`
    : (trip.toCity || trip.fromCity || 'Local');

  const cargoDetails = [
    trip.material,
    trip.weight ? `${trip.weight} MT` : null
  ].filter(Boolean).join(' • ');

  const driverInfo = trip.driverName
    ? `${trip.driverName}${trip.driverMobile ? ` (📞 ${trip.driverMobile})` : ''}`
    : 'Assigned';

  const lines = [
    `🚚 *${compName}*`,
    `*CONSIGNMENT / BILTY SLIP*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *LR / Bilty No:* ${trip.lrNo || 'N/A'}`,
    `📅 *Booking Date:* ${formatDate(trip.date)}`,
    `🏢 *Party:* ${trip.partyName || 'N/A'}`,
    `📍 *Route:* ${routeStr}`,
    `🚛 *Vehicle No:* ${trip.vehicleNo || 'N/A'}${trip.vehicleType ? ` (${trip.vehicleType})` : ''}`,
  ];

  if (cargoDetails) {
    lines.push(`📦 *Cargo / Goods:* ${cargoDetails}`);
  }

  lines.push(`👨‍✈️ *Driver:* ${driverInfo}`);

  if (trip.deliveryStatus) {
    lines.push(`🚩 *Delivery Status:* ${trip.deliveryStatus}`);
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *FREIGHT & BILLING*`,
    `• *Total Freight:* ${formatCurrency(trip.amount)}`,
    `• *Advance Paid:* ${formatCurrency(trip.advance)}`,
    `• *Balance Due:* *${formatCurrency(trip.balance)}*`,
    `• *Payment Status:* ${statusEmoji}`
  );

  if (trip.remarks && trip.remarks.trim()) {
    lines.push(
      `━━━━━━━━━━━━━━━━━━━━`,
      `📝 *Remarks:* ${trip.remarks.trim()}`
    );
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━`,
    `🙏 _Thank you for choosing ${compName}!_`,
    `📞 *Helpline:* ${compPhone}`
  );

  return lines.join('\n');
}

/**
 * Format an organized Outstanding Payment / Account Ledger reminder
 */
export function formatPartyReminderWhatsAppMessage(party, partyTrips = [], company = {}) {
  const compName = (company.companyName || 'SAI TRANSPORT').toUpperCase();
  const compPhone = company.phone || '+91 98220 99887';
  const partyName = party.name || 'Valued Client';

  // Compute pending shipments if partyTrips is available
  const pendingTrips = (partyTrips || [])
    .filter(t => Number(t.balance || 0) > 0)
    .slice(0, 5); // top 5 most recent pending trips

  const totalDue = formatCurrency(party.totalBalance ?? party.balance ?? 0);
  const totalBilled = formatCurrency(party.totalFreight ?? party.totalBilled ?? 0);
  const totalRecv = formatCurrency(party.totalAdvance ?? party.totalPaid ?? 0);
  const shipmentsCount = party.tripsCount ?? party.count ?? (partyTrips ? partyTrips.length : 0);

  const lines = [
    `🚚 *${compName}*`,
    `*PAYMENT STATEMENT & REMINDER*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Dear *${partyName}*,`,
    ``,
    `Please find the updated account balance statement for your transport shipments:`,
    ``,
    `📊 *ACCOUNT SUMMARY*`,
    `• *Total Shipments:* ${shipmentsCount} Trips`,
    `• *Total Freight Billed:* ${totalBilled}`,
    `• *Total Amount Received:* ${totalRecv}`,
    `• *Outstanding Balance:* *${totalDue}*`,
  ];

  if (pendingTrips.length > 0) {
    lines.push(
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 *PENDING BILTY DETAILS (Top ${pendingTrips.length}):*`
    );
    pendingTrips.forEach((t, i) => {
      const lr = t.lrNo || `Trip #${i + 1}`;
      const dt = t.date ? ` (${formatDate(t.date)})` : '';
      const route = (t.fromCity && t.toCity) ? ` • ${t.fromCity} ➔ ${t.toCity}` : '';
      const due = formatCurrency(t.balance);
      lines.push(`${i + 1}. *${lr}*${dt}${route} ➔ Due: *${due}*`);
    });
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ *Net Balance Payable: ${totalDue}*`,
    ``,
    `Kindly arrange for the clearance of this balance at your earliest convenience. If already paid, kindly reply with the payment confirmation or reference.`,
    ``,
    `🙏 _Thank you for your continued business!_`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*${compName}*`,
    `📞 *Accounts Contact:* ${compPhone}`
  );

  return lines.join('\n');
}
