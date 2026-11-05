import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Building2, 
  CheckSquare, 
  Square, 
  Filter, 
  Table, 
  Eye,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import { 
  EXCEL_COLUMNS, 
  extractTripValue, 
  generateCsv, 
  generateExcelXml, 
  downloadSpreadsheetFile 
} from '../utils/excelExporter';

export default function ExcelExportModal({
  isOpen,
  onClose,
  trips = [],
  parties = [],
  selectedTripIds = [],
  defaultParty = null
}) {
  // Filter states
  const [scopeMode, setScopeMode] = useState(() => (selectedTripIds.length > 0 ? 'selected' : 'all'));
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParty, setSelectedParty] = useState(defaultParty || 'ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');

  // Column selection state
  const [selectedColIds, setSelectedColIds] = useState(() => {
    return EXCEL_COLUMNS.filter(c => c.default).map(c => c.id);
  });

  const [showDataPreview, setShowDataPreview] = useState(false);

  // Sync default party or selectedTripIds when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (selectedTripIds.length > 0) {
        setScopeMode('selected');
      } else {
        setScopeMode('all');
      }
      if (defaultParty) {
        setSelectedParty(defaultParty);
      }
    }
  }, [isOpen, selectedTripIds, defaultParty]);

  // Compute filtered trips based on scope, date, party, and status
  const filteredTrips = useMemo(() => {
    if (!isOpen) return [];

    let result = [...trips];

    // If specific trips selected
    if (scopeMode === 'selected' && selectedTripIds.length > 0) {
      const idSet = new Set(selectedTripIds.map(String));
      result = result.filter(t => idSet.has(String(t.id || t.lrNo)));
    }

    // Party filter
    if (selectedParty !== 'ALL') {
      const pLower = selectedParty.trim().toLowerCase();
      result = result.filter(t => (t.partyName || '').trim().toLowerCase() === pLower);
    }

    // Payment status filter
    if (paymentStatusFilter !== 'ALL') {
      result = result.filter(t => (t.paymentStatus || 'Pending').toLowerCase() === paymentStatusFilter.toLowerCase());
    }

    // Date range filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (datePreset === 'today') {
      result = result.filter(t => t.date === todayStr);
    } else if (datePreset === 'yesterday') {
      const yDate = new Date(now);
      yDate.setDate(yDate.getDate() - 1);
      const yStr = yDate.toISOString().split('T')[0];
      result = result.filter(t => t.date === yStr);
    } else if (datePreset === 'this_week') {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      result = result.filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date + 'T00:00:00');
        return d >= startOfWeek && d <= now;
      });
    } else if (datePreset === 'this_month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;
      result = result.filter(t => (t.date || '').startsWith(prefix));
    } else if (datePreset === 'last_month') {
      const lDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = lDate.getFullYear();
      const month = String(lDate.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;
      result = result.filter(t => (t.date || '').startsWith(prefix));
    } else if (datePreset === 'custom') {
      if (startDate) {
        result = result.filter(t => (t.date || '') >= startDate);
      }
      if (endDate) {
        result = result.filter(t => (t.date || '') <= endDate);
      }
    }

    // Sort by date descending
    return result.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [trips, scopeMode, selectedTripIds, selectedParty, paymentStatusFilter, datePreset, startDate, endDate, isOpen]);

  // Aggregate financial metrics for the filtered trips
  const totals = useMemo(() => {
    let freight = 0;
    let advance = 0;
    let balance = 0;
    let expenses = 0;

    filteredTrips.forEach(t => {
      freight += Number(t.amount) || 0;
      advance += Number(t.advance) || 0;
      balance += Number(t.balance) || 0;
      if (Array.isArray(t.transactions) && t.transactions.length > 0) {
        t.transactions.forEach(tx => {
          if (tx.type === 'expense') expenses += Number(tx.amount) || 0;
        });
      } else {
        expenses += (Number(t.commission) || 0) + (Number(t.dieselExpense) || 0) + (Number(t.tollExpense) || 0);
      }
    });

    return {
      freight,
      advance,
      balance,
      expenses,
      profit: freight - expenses
    };
  }, [filteredTrips]);

  // Group columns by category for clean UI rendering
  const columnCategories = useMemo(() => {
    const cats = {};
    EXCEL_COLUMNS.forEach(col => {
      if (!cats[col.category]) cats[col.category] = [];
      cats[col.category].push(col);
    });
    return cats;
  }, []);

  if (!isOpen) return null;

  // Toggle single column
  const toggleColumn = (id) => {
    setSelectedColIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          alert('At least one column must be selected in the Excel file.');
          return prev;
        }
        return prev.filter(c => c !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Quick Column Select Handlers
  const handleSelectAllCols = () => {
    setSelectedColIds(EXCEL_COLUMNS.map(c => c.id));
  };

  const handleSelectStandardCols = () => {
    setSelectedColIds(EXCEL_COLUMNS.filter(c => c.default).map(c => c.id));
  };

  const handleSelectFinancialsOnly = () => {
    setSelectedColIds(['lrNo', 'date', 'partyName', 'vehicleNo', 'amount', 'advance', 'balance', 'commission', 'totalExpenses', 'netProfit', 'paymentStatus']);
  };

  const handleClearCols = () => {
    // Keep at least LR No
    setSelectedColIds(['lrNo', 'date', 'amount']);
  };

  // Export handlers
  const handleDownloadExcel = () => {
    if (filteredTrips.length === 0) {
      alert('No matching trips found for the selected filters.');
      return;
    }
    if (selectedColIds.length === 0) {
      alert('Please select at least one column to export.');
      return;
    }

    const todayDateStr = formatDate(new Date()).replace(/\//g, '-');
    const filename = `TransportX-Trips-Report-${todayDateStr}.xls`;
    const xml = generateExcelXml(filteredTrips, selectedColIds, `TransportX Trips Log (${filteredTrips.length} records)`);
    downloadSpreadsheetFile(xml, filename, 'application/vnd.ms-excel;charset=utf-8');
    onClose();
  };

  const handleDownloadCsv = () => {
    if (filteredTrips.length === 0) {
      alert('No matching trips found for the selected filters.');
      return;
    }
    if (selectedColIds.length === 0) {
      alert('Please select at least one column to export.');
      return;
    }

    const todayDateStr = formatDate(new Date()).replace(/\//g, '-');
    const filename = `TransportX-Trips-Report-${todayDateStr}.csv`;
    const csv = generateCsv(filteredTrips, selectedColIds, `TransportX Trips Log`);
    downloadSpreadsheetFile(csv, filename, 'text/csv;charset=utf-8;');
    onClose();
  };

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Download Excel Report</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {filteredTrips.length} Trips Match
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Filter by date or party, customize columns, and download as Excel workbook or CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-200/70 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: FILTER CRITERIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>1. Select Scope & Filters</span>
              </h4>

              {selectedTripIds.length > 0 && (
                <div className="inline-flex p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setScopeMode('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
                      scopeMode === 'all'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    All Trips ({trips.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeMode('selected')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
                      scopeMode === 'selected'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    Checked Only ({selectedTripIds.length})
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Date Range Preset */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Date Range</span>
                  </label>
                  <select
                    value={datePreset}
                    onChange={(e) => setDatePreset(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
                  >
                    <option value="all">All Dates (Lifetime)</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this_week">This Week (Mon-Sun)</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="custom">Custom Date Range...</option>
                  </select>
                </div>

                {/* Specific Party Filter */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Party / Consignor</span>
                  </label>
                  <select
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
                  >
                    <option value="ALL">All Parties ({parties.length})</option>
                    {parties.map(p => (
                      <option key={p.id || p.name} value={p.name}>
                        {p.name} {p.city ? `(${p.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Payment Status</span>
                  </label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
                  >
                    <option value="ALL">All Statuses (Pending & Paid)</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Partial">Partial Dues</option>
                    <option value="Paid">Fully Paid</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Pickers when 'custom' is active */}
              {datePreset === 'custom' && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Start Date</span>
                      {startDate && (
                        <span className="text-[10px] font-mono text-zinc-400">{formatDate(startDate)}</span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">End Date</span>
                      {endDate && (
                        <span className="text-[10px] font-mono text-zinc-400">{formatDate(endDate)}</span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: CHOOSE COLUMNS TO INCLUDE */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5" />
                  <span>2. Select Columns to Include</span>
                  <span className="text-zinc-400 font-mono normal-case">
                    ({selectedColIds.length} of {EXCEL_COLUMNS.length} selected)
                  </span>
                </h4>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllCols}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleSelectStandardCols}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer transition"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={handleSelectFinancialsOnly}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer transition"
                >
                  Financials Only
                </button>
                <button
                  type="button"
                  onClick={handleClearCols}
                  className="px-2 py-1 text-[11px] font-semibold rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Categorized Checkboxes */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              {Object.entries(columnCategories).map(([category, cols]) => (
                <div key={category} className="space-y-2">
                  <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {cols.map(col => {
                      const isChecked = selectedColIds.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleColumn(col.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 text-xs ${
                            isChecked
                              ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold shadow-xs'
                              : 'bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400'
                          }`}
                        >
                          <span className="truncate">{col.label}</span>
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400 shrink-0 opacity-60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: SUMMARY & OPTIONAL PREVIEW */}
          <div className="space-y-3">
            {/* Live Financial Summary Box */}
            <div className="p-4 bg-zinc-900 text-white rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Report Output Summary</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDataPreview(prev => !prev)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showDataPreview ? 'Hide Preview' : 'Preview First Rows'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">Shipments</span>
                  <strong className="text-base sm:text-lg font-bold">{filteredTrips.length} Trips</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase block">Total Freight</span>
                  <strong className="text-base sm:text-lg font-bold text-emerald-400">{formatCurrency(totals.freight)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 uppercase block">Pending Dues</span>
                  <strong className="text-base sm:text-lg font-bold text-rose-400">{formatCurrency(totals.balance)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 uppercase block">Net Margin</span>
                  <strong className="text-base sm:text-lg font-bold text-amber-400">{formatCurrency(totals.profit)}</strong>
                </div>
              </div>
            </div>

            {/* Quick Live Preview Table */}
            {showDataPreview && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-150">
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Previewing First 5 of {filteredTrips.length} Matching Records:</span>
                  <span className="text-[11px] text-zinc-400">Columns formatted as DD/MM/YYYY & INR</span>
                </div>
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold">
                        {EXCEL_COLUMNS.filter(c => selectedColIds.includes(c.id)).map(col => (
                          <th key={col.id} className="py-2 px-3">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                      {filteredTrips.slice(0, 5).map(trip => (
                        <tr key={trip.id || trip.lrNo} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          {EXCEL_COLUMNS.filter(c => selectedColIds.includes(c.id)).map(col => {
                            const val = extractTripValue(trip, col.id);
                            return (
                              <td key={col.id} className={`py-2 px-3 text-[11px] ${col.type === 'number' ? 'text-right font-mono' : ''}`}>
                                {col.type === 'number' ? formatCurrency(val) : String(val ?? '')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer with Direct Download Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredTrips.length > 0 ? (
              <span>Ready to export <strong>{filteredTrips.length} trips</strong> with <strong>{selectedColIds.length} columns</strong></span>
            ) : (
              <span className="text-rose-500 font-medium">No trips match the current filter selection</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>

            {/* Download CSV Option */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={filteredTrips.length === 0 || selectedColIds.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xs"
              title="Download UTF-8 CSV compatible with Excel, Google Sheets, & Numbers"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>

            {/* Primary Download Excel (.xls) Option */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={filteredTrips.length === 0 || selectedColIds.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
              title="Download styled Microsoft Excel Workbook with bold headers and formatted totals"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xls)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
