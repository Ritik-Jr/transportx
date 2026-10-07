import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Edit3, 
  Trash2, 
  CreditCard, 
  Truck, 
  Share2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpDown,
  LayoutGrid,
  List,
  Phone,
  ChevronDown
} from 'lucide-react';
import { exportTripsToCsv } from '../db';
import Pagination from './Pagination';
import { formatTripWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Status', shortLabel: 'All', icon: ArrowUpDown, color: 'text-zinc-400' },
  { id: 'PENDING', label: 'Pending', shortLabel: 'Pending', icon: AlertCircle, color: 'text-rose-500' },
  { id: 'PARTIAL', label: 'Partial', shortLabel: 'Partial', icon: Clock, color: 'text-amber-500' },
  { id: 'PAID', label: 'Paid', shortLabel: 'Paid', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'IN_TRANSIT', label: 'In Transit', shortLabel: 'Transit', icon: Truck, color: 'text-sky-500' }
];

const FORMAT_OPTIONS = [
  { id: 'table', label: 'Table Format', shortLabel: 'Table', icon: List },
  { id: 'cards', label: 'Card Format', shortLabel: 'Cards', icon: LayoutGrid }
];

export default function TripList({ 
  trips = [], 
  parties = [],
  onNewTrip, 
  onEditTrip, 
  onDeleteTrip, 
  onViewBilty, 
  onRecordPayment 
}) {
  const cleanPhone = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/[^\d+]/g, '');
  };

  const getPartyPhone = (trip) => {
    if (trip.partyPhone && trip.partyPhone.trim()) return trip.partyPhone.trim();
    if (trip.partyName) {
      const match = parties.find(
        p => p.name?.trim().toLowerCase() === trip.partyName.trim().toLowerCase()
      );
      if (match && match.phone && match.phone.trim()) return match.phone.trim();
    }
    return '';
  };
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('sai_trips_search') || '';
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    return localStorage.getItem('sai_trips_status') || 'ALL';
  });
  const [sortField, setSortField] = useState(() => {
    return localStorage.getItem('sai_trips_sortField') || 'date';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('sai_trips_sortOrder') || 'desc';
  });
  const [mobileViewMode, setMobileViewMode] = useState(() => {
    const saved = localStorage.getItem('sai_trips_viewMode');
    if (saved) return saved;
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem('sai_trips_page')) || 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem('sai_trips_pageSize')) || 10;
  });

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const formatDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(e.target)) {
        setIsFormatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    localStorage.setItem('sai_trips_search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('sai_trips_status', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('sai_trips_sortField', sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem('sai_trips_sortOrder', sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    localStorage.setItem('sai_trips_viewMode', mobileViewMode);
  }, [mobileViewMode]);

  useEffect(() => {
    localStorage.setItem('sai_trips_page', String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('sai_trips_pageSize', String(pageSize));
  }, [pageSize]);

  const currentStatusOption = STATUS_OPTIONS.find(s => s.id === statusFilter) || STATUS_OPTIONS[0];
  const CurrentStatusIcon = currentStatusOption.icon;

  const currentFormatOption = FORMAT_OPTIONS.find(f => f.id === mobileViewMode) || FORMAT_OPTIONS[0];
  const CurrentFormatIcon = currentFormatOption.icon;

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (statusFilter === 'PAID' && trip.paymentStatus !== 'Paid') return false;
      if (statusFilter === 'PARTIAL' && trip.paymentStatus !== 'Partial') return false;
      if (statusFilter === 'PENDING' && trip.paymentStatus !== 'Pending') return false;
      if (statusFilter === 'IN_TRANSIT' && trip.deliveryStatus !== 'In Transit') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const party = (trip.partyName || '').toLowerCase();
        const veh = (trip.vehicleNo || '').toLowerCase();
        const driver = (trip.driverName || '').toLowerCase();
        const mobile = (trip.driverMobile || '').toLowerCase();
        const from = (trip.fromCity || '').toLowerCase();
        const to = (trip.toCity || '').toLowerCase();
        const lr = (trip.lrNo || '').toLowerCase();
        const mat = (trip.material || '').toLowerCase();

        return (
          party.includes(query) ||
          veh.includes(query) ||
          driver.includes(query) ||
          mobile.includes(query) ||
          from.includes(query) ||
          to.includes(query) ||
          lr.includes(query) ||
          mat.includes(query)
        );
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'date') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [trips, statusFilter, searchTerm, sortField, sortOrder]);


  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTrips = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTrips.slice(start, start + pageSize);
  }, [filteredTrips, safeCurrentPage, pageSize]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const handleShareWhatsApp = (trip) => {
    const text = formatTripWhatsAppMessage(trip);
    const phone = trip.partyPhone || trip.driverMobile || '';
    openWhatsApp(phone, text);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Truck Transport Logbook
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Log of truck trips, freight bills, driver assignments, and dues
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportTripsToCsv}
            className="px-3.5 py-2 sm:px-3.5 sm:py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-zinc-200 dark:border-zinc-800 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={onNewTrip}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Truck Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar - All in one clean line */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full">
          
          {/* Search Input Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Vehicle, Party, Driver, LR..."
              className="w-full pl-8 sm:pl-9 pr-6 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-0.5 cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Payment Status Dropdown with Icons */}
          <div className="relative shrink-0" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(prev => !prev);
                setIsFormatDropdownOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Filter by payment status"
            >
              <CurrentStatusIcon className={`w-3.5 h-3.5 shrink-0 ${currentStatusOption.color}`} />
              <span className="hidden sm:inline">{currentStatusOption.label}</span>
              <span className="sm:hidden text-[11px]">{currentStatusOption.shortLabel}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1 text-xs">
                {STATUS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = opt.id === statusFilter;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${opt.color}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Format Dropdown with Icons */}
          <div className="relative shrink-0" ref={formatDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsFormatDropdownOpen(prev => !prev);
                setIsStatusDropdownOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Change display format"
            >
              <CurrentFormatIcon className="w-3.5 h-3.5 shrink-0 text-zinc-600 dark:text-zinc-300" />
              <span className="hidden sm:inline">{currentFormatOption.label}</span>
              <span className="sm:hidden text-[11px]">{currentFormatOption.shortLabel}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isFormatDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFormatDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1 text-xs">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = opt.id === mobileViewMode;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setMobileViewMode(opt.id);
                        setIsFormatDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-600 dark:text-zinc-300" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Trips Content */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 shadow-xs">
          <Truck className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">No truck records found</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try modifying your search or filter.'
              : 'Add your first truck entry to start logging.'}
          </p>
          <button
            onClick={onNewTrip}
            className="mt-3 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      ) : (
        <>
          {/* Table View */}
          <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden'} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs`}>
            {/* Mobile swipe helper */}
            <div className="md:hidden px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between font-medium">
              <span>⇄ Swipe horizontally to view all columns</span>
              <span className="font-mono text-[10px] text-zinc-400">7 Columns</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">
                      <button 
                        onClick={() => toggleSort('date')} 
                        className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>LR / Date</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">Vehicle & Driver</th>
                    <th className="py-3 px-4">Route & Cargo</th>
                    <th className="py-3 px-4">Party</th>
                    <th className="py-3 px-4 text-right">
                      <button 
                        onClick={() => toggleSort('amount')} 
                        className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white cursor-pointer ml-auto"
                      >
                        <span>Freight / Balance</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {paginatedTrips.map((trip) => (
                    <tr 
                      key={trip.id || trip.lrNo}
                      onClick={() => onViewBilty(trip)}
                      className="hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition cursor-pointer group"
                    >
                      {/* LR & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-zinc-900 dark:text-white block text-xs">
                          {trip.lrNo || 'N/A'}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          {trip.date}
                        </span>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-zinc-900 dark:text-white block text-xs">
                          {trip.vehicleNo}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium truncate max-w-[120px]">
                            {trip.driverName || 'Driver'}
                          </span>
                          {trip.driverMobile && (
                            <a
                              href={`tel:${cleanPhone(trip.driverMobile)}`}
                              onClick={(e) => e.stopPropagation()}
                              title={`Call Driver (${trip.driverMobile})`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 text-[10px] font-mono font-semibold transition active:scale-95 cursor-pointer shrink-0"
                            >
                              <Phone className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Route & Cargo */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {trip.fromCity} → {trip.toCity}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-[150px] mt-0.5">
                          {trip.material ? `${trip.material}` : 'General'}
                          {trip.weight && ` (${trip.weight})`}
                        </div>
                      </td>

                      {/* Party */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 block max-w-[170px] truncate" title={trip.partyName}>
                          {trip.partyName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getPartyPhone(trip) ? (
                            <a
                              href={`tel:${cleanPhone(getPartyPhone(trip))}`}
                              onClick={(e) => e.stopPropagation()}
                              title={`Call Party (${getPartyPhone(trip)})`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-[10px] font-mono font-semibold transition active:scale-95 cursor-pointer shrink-0"
                            >
                              <Phone className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Call</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-400">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* Freight & Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                          {formatCurrency(trip.amount)}
                        </span>
                        <div className="text-[10px] mt-0.5">
                          <span className="text-zinc-400">Adv: {formatCurrency(trip.advance)}</span>
                          {trip.balance > 0 ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400 ml-1.5">
                              Due: {formatCurrency(trip.balance)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1.5">
                              Cleared
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getPaymentBadge(trip.paymentStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewBilty(trip);
                            }}
                            title="Print Bilty"
                            className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordPayment(trip);
                            }}
                            title="Record Payment"
                            className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareWhatsApp(trip);
                            }}
                            title="Share on WhatsApp"
                            className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTrip(trip);
                            }}
                            title="Edit Trip"
                            className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTrip(trip);
                            }}
                            title="Delete"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards View */}
          <div className={`${mobileViewMode === 'cards' ? 'block' : 'hidden'} space-y-3.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:space-y-0 sm:gap-3.5`}>
            {paginatedTrips.map((trip) => (
              <div
                key={trip.id || trip.lrNo}
                onClick={() => onViewBilty(trip)}
                className="bg-white hover:bg-zinc-50/80 dark:bg-zinc-900 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs cursor-pointer transition active:scale-[0.99]"
              >
                {/* Row 1: LR, Date & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white text-base">{trip.lrNo}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">• {trip.date}</span>
                  </div>
                  <div>
                    {getPaymentBadge(trip.paymentStatus)}
                  </div>
                </div>

                {/* Row 2: Truck No, Route, Party & Driver Box */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm sm:text-base">{trip.vehicleNo}</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{trip.fromCity} ➔ {trip.toCity}</span>
                  </div>

                  {trip.material && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Cargo: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{trip.material}</span>
                      {trip.weight && ` (${trip.weight})`}
                    </div>
                  )}

                  {/* Party Row with Direct Call Button */}
                  <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Party</span>
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate block" title={trip.partyName}>
                        {trip.partyName || 'N/A'}
                      </span>
                      {getPartyPhone(trip) && (
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">
                          {getPartyPhone(trip)}
                        </span>
                      )}
                    </div>
                    {getPartyPhone(trip) ? (
                      <a
                        href={`tel:${cleanPhone(getPartyPhone(trip))}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer shadow-2xs"
                        title={`Call Party: ${getPartyPhone(trip)}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Call Party</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">No phone</span>
                    )}
                  </div>

                  {/* Driver Row with Direct Call Button */}
                  {(trip.driverName || trip.driverMobile) && (
                    <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Driver</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate block">
                          {trip.driverName || 'Driver'}
                        </span>
                        {trip.driverMobile && (
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">
                            {trip.driverMobile}
                          </span>
                        )}
                      </div>
                      {trip.driverMobile ? (
                        <a
                          href={`tel:${cleanPhone(trip.driverMobile)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer shadow-2xs"
                          title={`Call Driver: ${trip.driverMobile}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Call Driver</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">No phone</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 3: Financials in Spacious 3-column Card */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-zinc-50/60 dark:bg-zinc-950/60 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px] sm:text-xs uppercase font-semibold tracking-wider">Freight</span>
                    <strong className="text-zinc-900 dark:text-white block mt-0.5 text-sm sm:text-base font-bold">{formatCurrency(trip.amount)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px] sm:text-xs uppercase font-semibold tracking-wider">Advance</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5 text-sm sm:text-base">{formatCurrency(trip.advance)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px] sm:text-xs uppercase font-semibold tracking-wider">Balance Due</span>
                    <span className={`font-bold block mt-0.5 text-sm sm:text-base ${trip.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(trip.balance)}
                    </span>
                  </div>
                </div>

                {/* Row 4: Spacious Touch-Friendly Action Bar */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewBilty(trip);
                      }}
                      className="flex-1 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      title="Print Bilty"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Bilty</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordPayment(trip);
                      }}
                      className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      title="Record Payment"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Payment</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareWhatsApp(trip);
                      }}
                      className="p-2.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition cursor-pointer active:scale-95"
                      title="Share on WhatsApp"
                    >
                      <Share2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTrip(trip);
                      }}
                      className="p-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-95"
                      title="Edit Trip"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrip(trip);
                      }}
                      className="p-2.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer active:scale-95"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-xs">
            <Pagination
              currentPage={safeCurrentPage}
              totalItems={filteredTrips.length}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              pageSizeOptions={[10, 25, 50, 100]}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="trips"
            />
          </div>
        </>
      )}

    </div>
  );
}
