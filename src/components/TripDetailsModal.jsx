import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Edit3, 
  Trash2, 
  Phone, 
  Truck, 
  User, 
  Building2, 
  Plus, 
  FileText, 
  Fuel, 
  Receipt, 
  BadgePercent, 
  CreditCard, 
  Wrench, 
  ShieldAlert, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Copy,
  Check,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { formatTripWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';
import { formatDate } from '../utils/dateFormatter';
import ExcelExportModal from './ExcelExportModal';

const TRANSACTION_CATEGORIES = [
  { id: 'customer_payment', label: 'Party Payment (Received)', type: 'payment', icon: Coins, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { id: 'fuel', label: 'Fuel / Diesel', type: 'expense', icon: Fuel, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { id: 'toll', label: 'Toll / FASTag', type: 'expense', icon: Receipt, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  { id: 'driver_bhatta', label: 'Driver Bhatta / Allowance', type: 'expense', icon: User, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  { id: 'commission', label: 'Commission / Brokerage', type: 'expense', icon: BadgePercent, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { id: 'loading', label: 'Loading / Unloading (Hamali)', type: 'expense', icon: Truck, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  { id: 'maintenance', label: 'Maintenance / Tyre / Repair', type: 'expense', icon: Wrench, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800' },
  { id: 'challan', label: 'Police / RTO / Challan', type: 'expense', icon: ShieldAlert, color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
  { id: 'other', label: 'Other Trip Expense', type: 'expense', icon: CreditCard, color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700' }
];

const PAYMENT_MODES = [
  'UPI / GPay / PhonePe',
  'Cash',
  'Bank Transfer / NEFT / RTGS',
  'Fuel Card / Fleet Card',
  'FASTag Wallet',
  'Cheque'
];

export default function TripDetailsModal({
  trip,
  isOpen,
  onClose,
  onEditTrip,
  onSaveTrip,
  onDeleteTrip,
  company = {},
  parties = [],
  initialTab = 'details'
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'details');
  const [copiedLr, setCopiedLr] = useState(false);

  // Transaction form state
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  const [txForm, setTxForm] = useState({
    category: 'fuel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    mode: 'UPI / GPay / PhonePe',
    notes: ''
  });
  const [txError, setTxError] = useState('');
  const [isLoggingTx, setIsLoggingTx] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Keep active tab in sync when opening directly to invoice or details
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Safe transactions array
  const transactions = useMemo(() => {
    return Array.isArray(trip?.transactions) ? trip.transactions : [];
  }, [trip?.transactions]);

  // Compute Comprehensive Financial Tally
  const tally = useMemo(() => {
    if (!trip) {
      return {
        freight: 0,
        totalCustomerPaid: 0,
        remainingBalance: 0,
        commission: 0,
        totalExpenses: 0,
        netProfit: 0,
        cashFlow: 0
      };
    }

    const freight = Number(trip.amount) || 0;
    const initialAdvance = Number(trip.advance) || 0;
    const initialCommission = Number(trip.commission) || 0;

    // Filter customer payments and trip expenses
    let paymentsTotal = 0;
    let expensesTotal = 0;
    let commissionTotal = initialCommission;

    transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'payment') {
        paymentsTotal += amt;
      } else {
        expensesTotal += amt;
        if (tx.category === 'commission' || (tx.categoryLabel || '').toLowerCase().includes('commission')) {
          // If commission is logged in transactions, tally it
          if (!commissionTotal) commissionTotal = amt;
        }
      }
    });

    // Total Customer Paid: Advance + any additional payments logged in transactions
    // If transactions include an advance entry, avoid double adding
    const hasAdvanceInTx = transactions.some(
      tx => tx.type === 'payment' && (tx.categoryLabel || tx.notes || '').toLowerCase().includes('advance')
    );
    const totalCustomerPaid = hasAdvanceInTx 
      ? paymentsTotal 
      : (initialAdvance + paymentsTotal);

    const remainingBalance = Math.max(0, freight - totalCustomerPaid);

    // Total Trip Expenses includes logged expenses and commission
    const totalExpenses = expensesTotal > 0 ? expensesTotal : (initialCommission + (Number(trip.dieselExpense) || 0) + (Number(trip.tollExpense) || 0));

    // Net Profit = Total Freight - Total Expenses
    const netProfit = freight - totalExpenses;

    // Realized Profit = Total Customer Paid - Total Expenses
    const cashFlow = totalCustomerPaid - totalExpenses;

    return {
      freight,
      totalCustomerPaid,
      remainingBalance,
      commission: commissionTotal,
      totalExpenses,
      netProfit,
      cashFlow
    };
  }, [trip, transactions]);

  if (!isOpen || !trip) return null;

  const cleanPhone = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/[^\d+]/g, '');
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const handleCopyLr = () => {
    navigator.clipboard?.writeText(trip.lrNo || '');
    setCopiedLr(true);
    setTimeout(() => setCopiedLr(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = formatTripWhatsAppMessage(trip, company);
    const phone = trip.partyPhone || trip.driverMobile || '';
    openWhatsApp(phone, text);
  };

  // Handle open add transaction form
  const handleOpenAddTx = (defaultCat = 'fuel') => {
    setEditingTxId(null);
    setTxForm({
      category: defaultCat,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      mode: 'UPI / GPay / PhonePe',
      notes: ''
    });
    setTxError('');
    setIsAddingTx(true);
  };

  // Handle edit transaction
  const handleEditTx = (tx) => {
    setEditingTxId(tx.id);
    setTxForm({
      category: tx.categoryId || (tx.type === 'payment' ? 'customer_payment' : 'fuel'),
      amount: String(tx.amount || ''),
      date: tx.date || new Date().toISOString().split('T')[0],
      mode: tx.mode || 'UPI / GPay / PhonePe',
      notes: tx.notes || ''
    });
    setTxError('');
    setIsAddingTx(true);
  };

  // Handle delete transaction
  const handleDeleteTx = async (txId) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;

    const updatedTransactions = transactions.filter(t => t.id !== txId);

    // Recalculate advance and balance
    let newPaid = 0;
    updatedTransactions.forEach(t => {
      if (t.type === 'payment') newPaid += Number(t.amount) || 0;
    });

    const freight = Number(trip.amount) || 0;
    const newBal = Math.max(0, freight - newPaid);
    let newStatus = 'Pending';
    if (newPaid >= freight && freight > 0) newStatus = 'Paid';
    else if (newPaid > 0 && newPaid < freight) newStatus = 'Partial';

    const updatedTrip = {
      ...trip,
      advance: newPaid,
      balance: newBal,
      paymentStatus: newStatus,
      transactions: updatedTransactions
    };

    setIsLoggingTx(true);
    try {
      if (onSaveTrip) {
        await onSaveTrip(updatedTrip);
      }
      await new Promise(r => setTimeout(r, 450));
    } finally {
      setIsLoggingTx(false);
    }
  };

  // Handle submit transaction (Add or Edit)
  const handleSaveTx = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(txForm.amount);
    if (!numAmt || numAmt <= 0) {
      setTxError('Please enter a valid amount greater than 0');
      return;
    }

    const catObj = TRANSACTION_CATEGORIES.find(c => c.id === txForm.category) || TRANSACTION_CATEGORIES[0];
    const txType = catObj.type; // 'payment' | 'expense'

    let updatedTransactions = [...transactions];

    if (editingTxId) {
      // Edit existing
      updatedTransactions = updatedTransactions.map(t => {
        if (t.id === editingTxId) {
          return {
            ...t,
            categoryId: catObj.id,
            categoryLabel: catObj.label,
            type: txType,
            amount: numAmt,
            date: txForm.date,
            mode: txForm.mode,
            notes: txForm.notes
          };
        }
        return t;
      });
    } else {
      // Add new
      const newEntry = {
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        categoryId: catObj.id,
        categoryLabel: catObj.label,
        type: txType,
        amount: numAmt,
        date: txForm.date,
        mode: txForm.mode,
        notes: txForm.notes,
        createdAt: new Date().toISOString()
      };
      updatedTransactions = [newEntry, ...updatedTransactions];
    }

    // Recalculate customer payments & balance
    let totalCustomerPaid = 0;
    updatedTransactions.forEach(t => {
      if (t.type === 'payment') totalCustomerPaid += Number(t.amount) || 0;
    });

    const freight = Number(trip.amount) || 0;
    const newBalance = Math.max(0, freight - totalCustomerPaid);
    let newStatus = 'Pending';
    if (totalCustomerPaid >= freight && freight > 0) newStatus = 'Paid';
    else if (totalCustomerPaid > 0 && totalCustomerPaid < freight) newStatus = 'Partial';

    // Check if commission was updated
    let newCommission = Number(trip.commission) || 0;
    if (catObj.id === 'commission') {
      newCommission = numAmt;
    }

    const updatedTrip = {
      ...trip,
      advance: totalCustomerPaid,
      balance: newBalance,
      commission: newCommission,
      paymentStatus: newStatus,
      transactions: updatedTransactions
    };

    setIsAddingTx(false);
    setEditingTxId(null);
    setTxForm({
      category: 'fuel',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      mode: 'UPI / GPay / PhonePe',
      notes: ''
    });

    setIsLoggingTx(true);
    try {
      if (onSaveTrip) {
        await onSaveTrip(updatedTrip);
      }
      await new Promise(r => setTimeout(r, 450));
    } finally {
      setIsLoggingTx(false);
    }
  };

  const getPartyInfo = () => {
    if (trip.partyName) {
      const matched = parties.find(
        p => p.name?.trim().toLowerCase() === trip.partyName.trim().toLowerCase()
      );
      if (matched) return matched;
    }
    return {
      name: trip.partyName,
      phone: trip.partyPhone,
      city: trip.toCity,
      address: '',
      gstin: ''
    };
  };

  const partyInfo = getPartyInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Outer Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden relative my-4 sm:my-6 shadow-2xl flex flex-col max-h-[92vh] print:m-0 print:border-none print:max-w-none print:w-full print:rounded-none print:shadow-none print:max-h-none">
        
        {/* Modal Header & Tabs (Hidden in Print) */}
        <div className="no-print bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-3.5 sm:px-6 py-3 flex flex-col gap-3 shrink-0">
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                    LR #{trip.lrNo}
                  </h3>
                  <button
                    onClick={handleCopyLr}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                    title="Copy LR Number"
                  >
                    {copiedLr ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    trip.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : trip.paymentStatus === 'Partial'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}>
                    {trip.paymentStatus || 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {trip.vehicleNo} • {trip.fromCity} ➔ {trip.toCity} ({formatDate(trip.date)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShareWhatsApp}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onEditTrip) onEditTrip(trip);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95"
                title="Edit Trip Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Trip</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-zinc-200/70 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Trip Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Transactions & Tally</span>
              {transactions.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                  {transactions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invoice')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'invoice'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Invoice / Bilty</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 print:p-0 print:overflow-visible">
          
          {/* ============================================================== */}
          {/* TAB 1: TRIP OVERVIEW & DETAILS                                 */}
          {/* ============================================================== */}
          {activeTab === 'details' && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Route Banner */}
              <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-300 uppercase tracking-wider font-semibold">
                      Active Transport Route • {formatDate(trip.date)}
                    </div>
                    <div className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <span>{trip.fromCity}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      <span>{trip.toCity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold">
                    {trip.vehicleNo}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-medium">
                    {trip.vehicleType || '14 Wheeler'}
                  </span>
                </div>
              </div>

              {/* 4 Core Financial Figures Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">1. Total Freight</div>
                  <div className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white mt-0.5">
                    {formatCurrency(tally.freight)}
                  </div>
                  <div className="text-[10px] text-zinc-500">Agreed Bilty Amount</div>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">2. Customer Paid</div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(tally.totalCustomerPaid)}
                  </div>
                  <div className="text-[10px] text-zinc-500">Advance + Payments</div>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-rose-500 uppercase font-semibold">3. Balance Due</div>
                  <div className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    {formatCurrency(tally.remainingBalance)}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {tally.remainingBalance === 0 ? '✓ Fully Cleared' : 'Pending from Party'}
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">4. Commission</div>
                  <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatCurrency(tally.commission)}
                  </div>
                  <div className="text-[10px] text-zinc-500">Brokerage / Agent</div>
                </div>
              </div>

              {/* 3 Detail Cards (Party, Driver, Cargo) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                
                {/* Party Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      <h4 className="font-bold text-xs uppercase text-zinc-500 tracking-wider">Party / Consignor</h4>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                      {trip.partyName || 'N/A'}
                    </div>
                    {partyInfo.phone && (
                      <div className="text-xs font-mono text-zinc-500 mt-0.5">
                        {partyInfo.phone}
                      </div>
                    )}
                  </div>

                  {partyInfo.phone && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                      <a
                        href={`tel:${cleanPhone(partyInfo.phone)}`}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Party</span>
                      </a>
                      <button
                        onClick={handleShareWhatsApp}
                        className="py-1.5 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold inline-flex items-center gap-1 transition active:scale-95 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Driver Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      <h4 className="font-bold text-xs uppercase text-zinc-500 tracking-wider">Driver Assigned</h4>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                      {trip.driverName || 'Driver Not Specified'}
                    </div>
                    {trip.driverMobile ? (
                      <div className="text-xs font-mono text-zinc-500 mt-0.5">
                        {trip.driverMobile}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-400 mt-0.5">No contact registered</div>
                    )}
                  </div>

                  {trip.driverMobile && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <a
                        href={`tel:${cleanPhone(trip.driverMobile)}`}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Driver</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Cargo & Logistics Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <h4 className="font-bold text-xs uppercase text-zinc-500 tracking-wider">Cargo & Status</h4>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-zinc-500">
                      Material: <strong className="text-zinc-800 dark:text-zinc-200">{trip.material || 'General Freight'}</strong>
                    </div>
                    <div className="text-xs text-zinc-500">
                      Weight: <strong className="text-zinc-800 dark:text-zinc-200">{trip.weight || 'Full Truck Load'}</strong>
                    </div>
                    {trip.height && (
                      <div className="text-xs text-zinc-500">
                        Height: <strong className="text-zinc-800 dark:text-zinc-200">{trip.height}</strong>
                      </div>
                    )}
                    <div className="text-xs text-zinc-500">
                      Delivery: <strong className="text-zinc-800 dark:text-zinc-200">{trip.deliveryStatus || 'Booked'}</strong>
                    </div>
                  </div>

                  {trip.remarks && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 italic">
                      "{trip.remarks}"
                    </div>
                  )}
                </div>

              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Expense / Payment</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('invoice')}
                    className="px-3.5 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Print Bilty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Export this trip to Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>
                </div>

                {onDeleteTrip && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete LR #${trip.lrNo}?`)) {
                        onClose();
                        onDeleteTrip(trip.id || trip);
                      }
                    }}
                    className="px-3 py-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 cursor-pointer transition hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TRANSACTIONS, EXPENSES & TAILLY                          */}
          {/* ============================================================== */}
          {activeTab === 'transactions' && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Comprehensive Tally Card */}
              <div className="p-4 sm:p-5 bg-zinc-900 text-white rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm sm:text-base">Trip Accounts & Tailly</h3>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    LR #{trip.lrNo}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-zinc-800">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Freight</div>
                    <div className="text-base sm:text-xl font-bold mt-0.5">{formatCurrency(tally.freight)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">Customer Paid</div>
                    <div className="text-base sm:text-xl font-bold text-emerald-400 mt-0.5">{formatCurrency(tally.totalCustomerPaid)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-400 uppercase font-semibold">Balance Due</div>
                    <div className="text-base sm:text-xl font-bold text-rose-400 mt-0.5">{formatCurrency(tally.remainingBalance)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 uppercase font-semibold">Total Expenses</div>
                    <div className="text-base sm:text-xl font-bold text-amber-400 mt-0.5">{formatCurrency(tally.totalExpenses)}</div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs border border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span><strong>Net Trip Profit / Margin:</strong> (Freight - Expenses)</span>
                  </div>
                  <div className={`text-sm sm:text-base font-extrabold font-mono ${
                    tally.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatCurrency(tally.netProfit)}
                  </div>
                </div>
              </div>

              {/* Add / Edit Transaction Form */}
              {isAddingTx ? (
                <form onSubmit={handleSaveTx} className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-2xl space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-500" />
                      <span>{editingTxId ? 'Edit Transaction Entry' : 'Log New Transaction or Expense'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingTx(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {txError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs">
                      {txError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Category / Entry Type *
                      </label>
                      <select
                        value={txForm.category}
                        onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
                      >
                        {TRANSACTION_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.type === 'payment' ? '💰 ' : '⛽ '}{cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={txForm.amount}
                        onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={txForm.date}
                        onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Payment Mode
                      </label>
                      <select
                        value={txForm.mode}
                        onChange={(e) => setTxForm({ ...txForm, mode: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
                      >
                        {PAYMENT_MODES.map(pm => (
                          <option key={pm} value={pm}>{pm}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Notes / Bill No / Reference
                      </label>
                      <input
                        type="text"
                        value={txForm.notes}
                        onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                        placeholder="e.g. Pump #4 Diesel slip / Google Pay Ref"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingTx(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingTx}
                      className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center gap-1.5"
                    >
                      {isLoggingTx && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isLoggingTx ? 'Saving...' : 'Save Transaction'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                    Transaction & Expense Logs ({transactions.length})
                  </h4>

                  <button
                    onClick={() => handleOpenAddTx('fuel')}
                    disabled={isLoggingTx}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Transaction</span>
                  </button>
                </div>
              )}

              {/* Transactions Log Section with Loader */}
              {isLoggingTx ? (
                <div className="p-8 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-150 shadow-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white animate-spin" />
                  <div className="text-center">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">
                      Updating Transaction Log & Tally...
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Syncing changes to cloud accounts and refreshing entries
                    </div>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                  <Receipt className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No transactions recorded yet</div>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    Track fuel, tolls, party payments, driver bhatta, and commission to keep a clean financial tally.
                  </p>
                  <button
                    onClick={() => handleOpenAddTx('fuel')}
                    className="mt-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Entry</span>
                  </button>
                </div>
              ) : (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-semibold">
                          <th className="py-2.5 px-3.5">Date</th>
                          <th className="py-2.5 px-3.5">Category</th>
                          <th className="py-2.5 px-3.5">Mode / Notes</th>
                          <th className="py-2.5 px-3.5 text-right">Amount (₹)</th>
                          <th className="py-2.5 px-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
                        {transactions.map(tx => {
                          const isPayment = tx.type === 'payment';
                          const catInfo = TRANSACTION_CATEGORIES.find(c => c.id === tx.categoryId) || {
                            label: tx.categoryLabel || (isPayment ? 'Payment Received' : 'Expense'),
                            icon: isPayment ? Coins : CreditCard
                          };
                          const Icon = catInfo.icon;

                          return (
                            <tr key={tx.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                              <td className="py-3 px-3.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                                {formatDate(tx.date)}
                              </td>

                              <td className="py-3 px-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                                  isPayment
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                                }`}>
                                  <Icon className="w-3 h-3 shrink-0" />
                                  <span>{catInfo.label}</span>
                                </span>
                              </td>

                              <td className="py-3 px-3.5">
                                <div className="text-zinc-800 dark:text-zinc-200 font-medium">{tx.mode || 'Direct'}</div>
                                {tx.notes && (
                                  <div className="text-[10px] text-zinc-400 truncate max-w-xs">{tx.notes}</div>
                                )}
                              </td>

                              <td className={`py-3 px-3.5 text-right font-bold font-mono text-sm ${
                                isPayment ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                              }`}>
                                {isPayment ? '+' : '-'}{formatCurrency(tx.amount)}
                              </td>

                              <td className="py-3 px-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleEditTx(tx)}
                                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
                                    title="Edit Transaction"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTx(tx.id)}
                                    className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                                    title="Delete Transaction"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: INVOICE / PRINTABLE BILTY                               */}
          {/* ============================================================== */}
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              
              {/* Action Toolbar (no-print) */}
              <div className="no-print p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    A4 Clean Printable Lorry Receipt
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>

              {/* Printable Bilty Paper Container */}
              <div 
                id="printable-bilty"
                className="bg-white text-zinc-950 p-6 sm:p-8 rounded-2xl border border-zinc-200 print:border-none print:p-0 print:m-0 font-sans shadow-xs"
              >
                
                {/* 1. Header & Transporter Details */}
                <div className="border-b-2 border-zinc-950 pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Goods Consignment Note</span>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
                      {company.companyName || 'SAI TRANSPORT SERVICES'}
                    </h1>
                    <p className="text-xs text-zinc-600 max-w-md leading-relaxed font-medium">
                      {company.address || 'New Transport Nagar, Pune, Maharashtra'}
                    </p>
                    <div className="text-[11px] text-zinc-700 font-semibold pt-0.5">
                      Phone: <span className="font-mono">{company.phone || '+91 98220 99887'}</span>
                      {company.gstin && (
                        <span className="ml-3 font-mono">GSTIN: {company.gstin}</span>
                      )}
                    </div>
                  </div>

                  {/* LR Badge box */}
                  <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-xl text-right sm:min-w-[160px] self-start">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase">LR / Bilty No.</div>
                    <div className="text-lg sm:text-xl font-black font-mono text-zinc-950">{trip.lrNo}</div>
                    <div className="text-xs font-semibold text-zinc-600 mt-0.5">Date: {formatDate(trip.date)}</div>
                  </div>
                </div>

                {/* 2. Route & Vehicle Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">From (Origin)</span>
                    <strong className="text-sm font-bold text-zinc-950">{trip.fromCity}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">To (Destination)</span>
                    <strong className="text-sm font-bold text-zinc-950">{trip.toCity}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Truck No</span>
                    <strong className="text-sm font-mono font-bold text-zinc-950">{trip.vehicleNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Truck Type</span>
                    <strong className="text-xs font-semibold text-zinc-800">{trip.vehicleType || '14 Wheeler'}</strong>
                  </div>
                </div>

                {/* 3. Consignor / Consignee & Driver Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                  <div className="p-3.5 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Consignor / Party</span>
                    <div className="font-bold text-sm text-zinc-950">{trip.partyName || 'N/A'}</div>
                    {partyInfo.phone && <div className="text-zinc-600 font-mono">Mobile: {partyInfo.phone}</div>}
                    {partyInfo.gstin && <div className="text-zinc-600 font-mono">GSTIN: {partyInfo.gstin}</div>}
                  </div>

                  <div className="p-3.5 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Driver Details</span>
                    <div className="font-bold text-sm text-zinc-950">{trip.driverName || 'Driver'}</div>
                    {trip.driverMobile && <div className="text-zinc-600 font-mono">Mobile: {trip.driverMobile}</div>}
                    <div className="text-zinc-600">Truck: {trip.vehicleNo}</div>
                  </div>
                </div>

                {/* 4. Goods Description Table */}
                <div className="border border-zinc-200 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Description of Goods</th>
                        <th className="py-2.5 px-3">Weight / Quantity</th>
                        <th className="py-2.5 px-3 text-right">Freight Rate</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-3 font-medium text-zinc-950">
                          <div>{trip.material || 'General Industrial Cargo'}</div>
                          {trip.height && (
                            <div className="text-[10px] text-zinc-500 font-normal mt-0.5">
                              Cargo Height: <strong className="text-zinc-700">{trip.height}</strong>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-zinc-800">
                          {trip.weight || 'Full Truck Load'}
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-600">Lumpsum</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-950">
                          {formatCurrency(trip.amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. Financial Breakdown Table (Freight, Advance, Balance, Commission) */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs pt-2 border-t border-zinc-200">
                  <div className="text-zinc-500 space-y-1 max-w-sm">
                    <strong className="block text-zinc-950 text-[11px] uppercase">Terms & Conditions:</strong>
                    <p className="text-[10px] leading-relaxed">
                      1. Goods carried at owner's risk.<br/>
                      2. Unloading demurrage applies after 24 hrs of arrival.<br/>
                      3. All disputes subject to local jurisdiction.
                    </p>
                  </div>

                  <div className="sm:w-64 space-y-1.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="flex justify-between font-semibold text-zinc-700">
                      <span>1. Total Freight:</span>
                      <span className="font-mono font-bold text-zinc-950">{formatCurrency(tally.freight)}</span>
                    </div>

                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>2. Advance Paid:</span>
                      <span className="font-mono font-bold">-{formatCurrency(tally.totalCustomerPaid)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-zinc-950 pt-1.5 border-t border-zinc-200 text-sm">
                      <span>3. Balance Due:</span>
                      <span className="font-mono text-rose-600">{formatCurrency(tally.remainingBalance)}</span>
                    </div>

                    {tally.commission > 0 && (
                      <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-dashed border-zinc-200">
                        <span>4. Commission:</span>
                        <span className="font-mono font-semibold">{formatCurrency(tally.commission)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Signature Footers */}
                <div className="grid grid-cols-3 gap-4 pt-10 text-center text-xs">
                  <div className="border-t border-zinc-400 pt-2 font-semibold text-zinc-600">
                    Consignor Signature
                  </div>
                  <div className="border-t border-zinc-400 pt-2 font-semibold text-zinc-600">
                    Driver Signature
                  </div>
                  <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-950">
                    For {company.companyName || 'SAI TRANSPORT'}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Excel Export Modal for this trip */}
      <ExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        trips={[trip]}
        parties={parties}
        selectedTripIds={[trip.id || trip.lrNo]}
      />

    </div>
  );
}
