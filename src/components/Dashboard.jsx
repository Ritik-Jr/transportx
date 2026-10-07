import React, { useMemo, useState, useEffect } from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  ArrowUpRight, 
  Users, 
  FileSpreadsheet, 
  Download, 
  ChevronRight,
  Plus,
  Clock
} from 'lucide-react';
import { exportTripsToCsv, exportDatabaseToJson } from '../db';
import CasinoCounter from './CasinoCounter';
import Pagination from './Pagination';
import PeriodDropdown, { PERIOD_OPTIONS } from './PeriodDropdown';

export default function Dashboard({ 
  trips = [], 
  parties = [], 
  onNewTrip, 
  onViewTrip, 
  onNavigateTab,
  onRecordPayment 
}) {
  // Persisted period state (defaults to 'today')
  const [filterPeriod, setFilterPeriod] = useState(() => {
    return localStorage.getItem('sai_dashboard_period') || 'today';
  });

  const [recentTripsPage, setRecentTripsPage] = useState(() => {
    return Number(localStorage.getItem('sai_dashboard_trips_page')) || 1;
  });
  const recentTripsPageSize = 5;

  const [duePartiesPage, setDuePartiesPage] = useState(() => {
    return Number(localStorage.getItem('sai_dashboard_parties_page')) || 1;
  });
  const duePartiesPageSize = 4;

  useEffect(() => {
    localStorage.setItem('sai_dashboard_period', filterPeriod);
  }, [filterPeriod]);

  useEffect(() => {
    localStorage.setItem('sai_dashboard_trips_page', String(recentTripsPage));
  }, [recentTripsPage]);

  useEffect(() => {
    localStorage.setItem('sai_dashboard_parties_page', String(duePartiesPage));
  }, [duePartiesPage]);

  const filteredTrips = useMemo(() => {
    if (filterPeriod === 'all_time') return trips;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return trips.filter(trip => {
      if (!trip.date) return false;
      const tripDate = new Date(trip.date + 'T00:00:00');
      const tripDay = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());

      switch (filterPeriod) {
        case 'today':
          return tripDay.getTime() === today.getTime();
        case 'this_week': {
          const day = today.getDay();
          const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
          const startOfWeek = new Date(today);
          startOfWeek.setDate(diffToMonday);
          return tripDay >= startOfWeek;
        }
        case 'this_month':
          return (
            tripDay.getFullYear() === today.getFullYear() &&
            tripDay.getMonth() === today.getMonth()
          );
        case 'last_28_days': {
          const past28 = new Date(today);
          past28.setDate(today.getDate() - 28);
          return tripDay >= past28;
        }
        case 'last_3_months': {
          const past3m = new Date(today);
          past3m.setMonth(today.getMonth() - 3);
          return tripDay >= past3m;
        }
        case 'last_6_months': {
          const past6m = new Date(today);
          past6m.setMonth(today.getMonth() - 6);
          return tripDay >= past6m;
        }
        case '1_year': {
          const past1y = new Date(today);
          past1y.setFullYear(today.getFullYear() - 1);
          return tripDay >= past1y;
        }
        default:
          return true;
      }
    });
  }, [trips, filterPeriod]);

  const stats = useMemo(() => {
    let totalFreight = 0;
    let totalAdvance = 0;
    let totalBalance = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;

    filteredTrips.forEach(t => {
      const amt = Number(t.amount) || 0;
      const adv = Number(t.advance) || 0;
      const bal = Number(t.balance) || Math.max(0, amt - adv);

      totalFreight += amt;
      totalAdvance += adv;
      totalBalance += bal;

      if (t.paymentStatus === 'Paid') paidCount++;
      else if (t.paymentStatus === 'Partial') partialCount++;
      else pendingCount++;

      if (t.deliveryStatus === 'In Transit') inTransitCount++;
      else if (t.deliveryStatus === 'Delivered') deliveredCount++;
    });

    return {
      totalFreight,
      totalAdvance,
      totalBalance,
      paidCount,
      partialCount,
      pendingCount,
      inTransitCount,
      deliveredCount,
      totalTrips: filteredTrips.length,
      collectionRate: totalFreight > 0 ? Math.round((totalAdvance / totalFreight) * 100) : 0,
    };
  }, [filteredTrips]);

  const allPendingParties = useMemo(() => {
    const map = {};
    trips.forEach(t => {
      const bal = Number(t.balance) || 0;
      if (bal > 0) {
        const pName = t.partyName || 'Unknown Party';
        if (!map[pName]) {
          map[pName] = {
            partyName: pName,
            totalDue: 0,
            pendingTrips: 0,
          };
        }
        map[pName].totalDue += bal;
        map[pName].pendingTrips += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.totalDue - a.totalDue);
  }, [trips]);

  const totalDuePartyPages = Math.max(1, Math.ceil(allPendingParties.length / duePartiesPageSize));
  const safeDuePartyPage = Math.min(Math.max(1, duePartiesPage), totalDuePartyPages);

  const paginatedDueParties = useMemo(() => {
    const start = (safeDuePartyPage - 1) * duePartiesPageSize;
    return allPendingParties.slice(start, start + duePartiesPageSize);
  }, [allPendingParties, safeDuePartyPage, duePartiesPageSize]);

  const allRecentTrips = useMemo(() => {
    return [...trips].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [trips]);

  const totalRecentPages = Math.max(1, Math.ceil(allRecentTrips.length / recentTripsPageSize));
  const safeRecentPage = Math.min(Math.max(1, recentTripsPage), totalRecentPages);

  const paginatedRecentTrips = useMemo(() => {
    const start = (safeRecentPage - 1) * recentTripsPageSize;
    return allRecentTrips.slice(start, start + recentTripsPageSize);
  }, [allRecentTrips, safeRecentPage, recentTripsPageSize]);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            Paid
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Account & Fleet Overview
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Showing records for <strong className="text-zinc-800 dark:text-zinc-200">{PERIOD_OPTIONS.find(p => p.id === filterPeriod)?.label}</strong> ({filteredTrips.length} entries)
          </p>
        </div>

        {/* Minimalist Date Range Dropdown Button */}
        <PeriodDropdown period={filterPeriod} onChange={setFilterPeriod} />
      </div>

      {/* Friendly notice if viewing Today with 0 trips */}
      {filterPeriod === 'today' && filteredTrips.length === 0 && (
        <div className="p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>
              You are currently viewing <strong>Today's</strong> log (0 trips recorded today so far).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterPeriod('this_month')}
              className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold cursor-pointer text-xs"
            >
              View This Month
            </button>
            <button
              onClick={() => setFilterPeriod('all_time')}
              className="px-3 py-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-semibold cursor-pointer text-xs"
            >
              View All Time
            </button>
          </div>
        </div>
      )}

      {/* Symmetrical 2x2 Grid on Mobile, 4-Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Freight */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Freight
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            <CasinoCounter value={stats.totalFreight} />
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            {stats.totalTrips} trips logged
          </p>
        </div>

        {/* Advance Received */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Advance
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
            <CasinoCounter value={stats.totalAdvance} />
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            {stats.collectionRate}% collected
          </p>
        </div>

        {/* Balance Due */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Balance Due
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center border border-rose-200 dark:border-rose-800/40">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
            <CasinoCounter value={stats.totalBalance} />
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            {stats.pendingCount + stats.partialCount} trips pending
          </p>
        </div>

        {/* Active Fleet */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              In Transit
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-baseline gap-1">
            <CasinoCounter value={stats.inTransitCount} prefix="" suffix="" isCurrency={false} />
            <span className="text-xs font-normal text-zinc-400">Trucks</span>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            {stats.deliveredCount} Delivered
          </p>
        </div>

      </div>

      {/* Grid: Receivables Watchlist & Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Receivables by Party */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Due by Party</h3>
              </div>
              <button
                onClick={() => onNavigateTab('parties')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {allPendingParties.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5 opacity-60" />
                All party balances are fully cleared!
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedDueParties.map((p, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white text-xs line-clamp-1">{p.partyName}</div>
                      <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                        {p.pendingTrips} trip{p.pendingTrips > 1 ? 's' : ''} unpaid
                      </div>
                    </div>
                    <div className="text-right font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                      {formatCurrency(p.totalDue)}
                    </div>
                  </div>
                ))}

                {totalDuePartyPages > 1 && (
                  <Pagination
                    currentPage={safeDuePartyPage}
                    totalItems={allPendingParties.length}
                    pageSize={duePartiesPageSize}
                    onPageChange={(page) => setDuePartiesPage(page)}
                    compact={true}
                    itemName="parties"
                  />
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => onNavigateTab('parties')}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Full Party Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Trips Log */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Recent Truck Entries</h3>
              </div>
              <button
                onClick={() => onNavigateTab('trips')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {allRecentTrips.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No trips logged yet. Click "New Trip" to get started.
              </div>
            ) : (
              <>
                {/* Desktop Sized Table with min-width to prevent squeezing */}
                <div className="hidden md:block overflow-x-auto rounded-xl">
                  <table className="w-full min-w-[760px] text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3.5 font-semibold">LR / Date</th>
                        <th className="py-3 px-3.5 font-semibold">Vehicle</th>
                        <th className="py-3 px-3.5 font-semibold">Route</th>
                        <th className="py-3 px-3.5 font-semibold">Party</th>
                        <th className="py-3 px-3.5 font-semibold text-right">Freight</th>
                        <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {paginatedRecentTrips.map((t) => (
                        <tr 
                          key={t.id || t.lrNo} 
                          onClick={() => onViewTrip(t)}
                          className="hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition cursor-pointer group"
                        >
                          <td className="py-3.5 px-3.5">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white block">{t.lrNo}</span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 block">{t.date}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 block">{t.vehicleNo}</span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 block">{t.driverName}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="text-zinc-800 dark:text-zinc-200 block font-medium">{t.fromCity} → {t.toCity}</span>
                            <span className="text-[10px] text-zinc-400 truncate max-w-[140px] block mt-0.5">{t.material || 'General'}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="text-zinc-800 dark:text-zinc-200 font-medium block truncate max-w-[150px]">{t.partyName}</span>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            <span className="font-bold text-zinc-900 dark:text-white block">{formatCurrency(t.amount)}</span>
                            {t.balance > 0 ? (
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mt-0.5">Due: {formatCurrency(t.balance)}</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">Cleared</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 text-center">
                            {getStatusBadge(t.paymentStatus)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Spacious Card Layout (Never squeezed) */}
                <div className="md:hidden space-y-3.5">
                  {paginatedRecentTrips.map((t) => (
                    <div 
                      key={t.id || t.lrNo}
                      onClick={() => onViewTrip(t)}
                      className="p-4 bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-950 dark:hover:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3 cursor-pointer transition active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{t.lrNo}</span>
                          <span className="text-[10px] text-zinc-400">• {t.date}</span>
                        </div>
                        <div>{getStatusBadge(t.paymentStatus)}</div>
                      </div>

                      <div className="flex items-start justify-between gap-3 pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-zinc-900 dark:text-white text-xs">
                            {t.vehicleNo}
                          </div>
                          <div className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                            {t.fromCity} ➔ {t.toCity}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px]">
                            {t.partyName}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end shrink-0">
                          <span className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                            {formatCurrency(t.amount)}
                          </span>
                          {t.balance > 0 ? (
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                              Due: {formatCurrency(t.balance)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                              Cleared
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Trips Pagination */}
                <Pagination
                  currentPage={safeRecentPage}
                  totalItems={allRecentTrips.length}
                  pageSize={recentTripsPageSize}
                  onPageChange={(page) => setRecentTripsPage(page)}
                  pageSizeOptions={[5, 10, 20]}
                  onPageSizeChange={(size) => {
                    setRecentPageSize(size);
                    setRecentTripsPage(1);
                  }}
                  compact={true}
                  itemName="trips"
                />
              </>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={exportTripsToCsv}
                className="px-3.5 py-2 sm:px-3 sm:py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export to Excel</span>
              </button>
              <button
                onClick={exportDatabaseToJson}
                className="px-3.5 py-2 sm:px-3 sm:py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save Backup</span>
              </button>
            </div>

            <button
              onClick={onNewTrip}
              className="px-4 py-2 sm:px-3.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
