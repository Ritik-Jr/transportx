import React from 'react';
import { Printer, X, Share2 } from 'lucide-react';
import { formatTripWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

export default function BiltyPrinter({ trip, company = {}, onClose }) {
  if (!trip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = formatTripWhatsAppMessage(trip, company);
    const phone = trip.partyPhone || trip.driverMobile || '';
    openWhatsApp(phone, text);
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Outer container (Flat, zero shadows) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden relative my-6 print:m-0 print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white min-w-0 mr-2">
            <Printer className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
            <span className="font-bold text-xs sm:text-sm truncate">
              <span className="hidden sm:inline">Lorry Receipt (Bilty) - </span>
              <span className="sm:hidden">LR </span>
              {trip.lrNo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleShareWhatsApp}
              className="p-2.5 sm:px-3.5 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              title="Share Bilty on WhatsApp"
              aria-label="Share Bilty on WhatsApp"
            >
              <Share2 className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2.5 sm:px-3.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Print A4 Voucher"
              aria-label="Print A4 Voucher"
            >
              <Printer className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Print A4 Voucher</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 sm:p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl cursor-pointer active:scale-95"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-3 sm:p-6 max-h-[80vh] overflow-y-auto bg-zinc-100 dark:bg-zinc-950/80 print:p-0 print:bg-white print:max-h-none print:overflow-visible">
          
          {/* Paper Sheet Preview (Flat, zero shadows) */}
          <div className="bg-white text-black p-5 sm:p-8 rounded-xl border border-zinc-200 print:shadow-none print:border-none print:p-0 max-w-3xl mx-auto font-sans shadow-none">
            
            {/* Top Transport Title */}
            <div className="border-b-2 border-zinc-900 pb-3 text-center">
              <div className="inline-block px-2.5 py-0.5 bg-zinc-900 text-white font-bold text-[9px] tracking-widest uppercase mb-1">
                Goods Consignment Note / Lorry Receipt
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950">
                {company.companyName || 'SAI TRANSPORT'}
              </h1>
              <p className="text-[11px] text-zinc-600 font-medium">
                {company.tagline || 'Leading Fleet & All India Truck Transport Service'}
              </p>
              <p className="text-[10px] text-zinc-700 mt-0.5">
                {company.address || 'Shop No. 12, New Transport Nagar, Nigdi, Pune, Maharashtra - 411044'}
              </p>
              <p className="text-[10px] text-zinc-800 font-semibold mt-0.5">
                Phone: {company.phone || '+91 98220 99887'} • GSTIN: {company.gstin || '27AAAAA0000A1Z5'}
              </p>
            </div>

            {/* LR Meta Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-zinc-300 py-2.5 text-xs gap-y-1.5">
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Bilty / LR No.</span>
                <span className="font-mono font-bold text-xs text-zinc-950">{trip.lrNo || 'ST-NA'}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Date</span>
                <span className="font-semibold text-zinc-900 text-xs">{trip.date}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Truck Number</span>
                <span className="font-mono font-bold text-zinc-950 text-xs">{trip.vehicleNo}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Vehicle Type</span>
                <span className="font-medium text-zinc-800 text-xs">{trip.vehicleType || '14 Wheeler'}</span>
              </div>
            </div>

            {/* Route & Driver details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-zinc-300 py-2.5 text-xs gap-3">
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Route Particulars</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <span>{trip.fromCity}</span>
                  <span className="text-zinc-500 font-extrabold">➔</span>
                  <span>{trip.toCity}</span>
                </div>
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  Status: <strong className="text-zinc-800">{trip.deliveryStatus || 'Booked'}</strong>
                </div>
              </div>

              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Driver Details</span>
                <div className="font-bold text-zinc-900 text-xs">
                  {trip.driverName}
                </div>
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  Mobile: <strong className="font-mono text-zinc-800">{trip.driverMobile || 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Consignor / Party Information */}
            <div className="border-b border-zinc-300 py-2.5 text-xs">
              <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">
                Consignor / Transport Party Details
              </span>
              <div className="text-xs font-bold text-zinc-950">
                {trip.partyName}
              </div>
              {trip.partyPhone && (
                <div className="text-zinc-600 text-[10px]">
                  Contact: <span className="font-mono">{trip.partyPhone}</span>
                </div>
              )}
            </div>

            {/* Cargo / Goods Description Table */}
            <div className="py-2.5 border-b border-zinc-300 text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-300 text-zinc-600 text-[10px]">
                    <th className="py-1 font-semibold">Item Description / Cargo</th>
                    <th className="py-1 font-semibold">Weight / Quantity</th>
                    <th className="py-1 font-semibold text-right">Payment Terms</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 font-medium text-zinc-900">
                      {trip.material || 'General Freight Goods'}
                    </td>
                    <td className="py-2 font-medium text-zinc-800">
                      {trip.weight || 'Full Truck Load (FTL)'}
                    </td>
                    <td className="py-2 font-semibold text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                        trip.paymentStatus === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : trip.paymentStatus === 'Partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {trip.paymentStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Accounting & Freight Statement */}
            <div className="py-2.5 border-b-2 border-zinc-900 flex justify-end text-xs">
              <div className="w-64 space-y-1">
                <div className="flex justify-between text-zinc-700 text-[11px]">
                  <span>Total Freight Amount:</span>
                  <span className="font-bold text-zinc-950">{formatCurrency(trip.amount)}</span>
                </div>
                <div className="flex justify-between text-zinc-700 text-[11px]">
                  <span>Less: Advance Received:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(trip.advance)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-300 pt-1 font-bold text-xs">
                  <span>Balance Payable:</span>
                  <span className={`${trip.balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {formatCurrency(trip.balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks if any */}
            {trip.remarks && (
              <div className="py-2 text-[10px] text-zinc-600 border-b border-zinc-200">
                <strong>Remarks / POD Note:</strong> {trip.remarks}
              </div>
            )}

            {/* Standard Terms and Signatures */}
            <div className="pt-3 text-[9px] text-zinc-500 space-y-5">
              <p className="leading-tight">
                <strong>Terms & Conditions:</strong> {company.terms || '1. Goods carried strictly at owner\'s risk. 2. Demurrage chargeable after 24 hours of reporting at destination. 3. Subject to local jurisdiction only.'}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-8 text-center font-medium text-zinc-800">
                <div className="border-t border-zinc-400 pt-1">
                  Driver's Signature
                </div>
                <div className="border-t border-zinc-400 pt-1">
                  Consignor's Signature
                </div>
                <div className="border-t border-zinc-900 pt-1 font-bold">
                  For SAI TRANSPORT<br />
                  <span className="text-[8px] font-normal text-zinc-600">(Authorized Signatory)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
