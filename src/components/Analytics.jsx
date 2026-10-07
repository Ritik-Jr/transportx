import React, { useState, useMemo, useEffect } from 'react';
import { 
  IndianRupee, 
  Truck, 
  Users, 
  MapPin, 
  Share2, 
  Clock, 
  BarChart3
} from 'lucide-react';
import CasinoCounter from './CasinoCounter';
import Pagination from './Pagination';
import { formatPartyReminderWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';
import PeriodDropdown, { PERIOD_OPTIONS } from './PeriodDropdown';

export default function Analytics({ trips = [], parties = [], onNavigateTab }) {
  // Persisted period state (defaults to 'today')
  const [filterPeriod, setFilterPeriod] = useState(() => {
    return localStorage.getItem('sai_analytics_period') || 'today';
  });

  const [activeMetricTab, setActiveMetricTab] = useState(() => {
    return localStorage.getItem('sai_analytics_metric_tab') || 'freight';
  });
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  const [routePage, setRoutePage] = useState(() => {
    return Number(localStorage.getItem('sai_analytics_route_page')) || 1;
  });
  const [partyPage, setPartyPage] = useState(() => {
    return Number(localStorage.getItem('sai_analytics_party_page')) || 1;
  });
  const [vehiclePage, setVehiclePage] = useState(() => {
    return Number(localStorage.getItem('sai_analytics_vehicle_page')) || 1;
  });

  useEffect(() => {
    localStorage.setItem('sai_analytics_period', filterPeriod);
  }, [filterPeriod]);

  useEffect(() => {
    localStorage.setItem('sai_analytics_metric_tab', activeMetricTab);
  }, [activeMetricTab]);

  useEffect(() => {
    localStorage.setItem('sai_analytics_route_page', String(routePage));
  }, [routePage]);

  useEffect(() => {
    localStorage.setItem('sai_analytics_party_page', String(partyPage));
  }, [partyPage]);

  useEffect(() => {
    localStorage.setItem('sai_analytics_vehicle_page', String(vehiclePage));
  }, [vehiclePage]);

  // Period-filtered trips
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

  // Comprehensive Analytics Metrics
  const analyticsData = useMemo(() => {
    let totalFreight = 0;
    let totalAdvance = 0;
    let totalBalance = 0;
    let totalDiesel = 0;
    let totalToll = 0;

    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    const routeMap = {};
    const partyMap = {};
    const vehicleMap = {};
    const dateMap = {};

    filteredTrips.forEach(t => {
      const amt = Number(t.amount) || 0;
      const adv = Number(t.advance) || 0;
      const bal = Number(t.balance) || Math.max(0, amt - adv);
      const diesel = Number(t.dieselExpense) || 0;
      const toll = Number(t.tollExpense) || 0;

      totalFreight += amt;
      totalAdvance += adv;
      totalBalance += bal;
      totalDiesel += diesel;
      totalToll += toll;

      if (t.paymentStatus === 'Paid') paidCount++;
      else if (t.paymentStatus === 'Partial') partialCount++;
      else pendingCount++;

      // Route aggregation
      const routeKey = `${t.fromCity || 'Unknown'} ➔ ${t.toCity || 'Unknown'}`;
      if (!routeMap[routeKey]) {
        routeMap[routeKey] = { route: routeKey, count: 0, freight: 0 };
      }
      routeMap[routeKey].count += 1;
      routeMap[routeKey].freight += amt;

      // Party aggregation
      const partyKey = t.partyName || 'Unknown Party';
      if (!partyMap[partyKey]) {
        partyMap[partyKey] = { 
          name: partyKey, 
          phone: t.partyPhone || '',
          count: 0, 
          freight: 0, 
          advance: 0, 
          balance: 0 
        };
      }
      partyMap[partyKey].count += 1;
      partyMap[partyKey].freight += amt;
      partyMap[partyKey].advance += adv;
      partyMap[partyKey].balance += bal;

      // Vehicle aggregation
      const vehKey = t.vehicleNo || 'Unknown';
      if (!vehicleMap[vehKey]) {
        vehicleMap[vehKey] = {
          vehicleNo: vehKey,
          type: t.vehicleType || 'Truck',
          count: 0,
          freight: 0
        };
      }
      vehicleMap[vehKey].count += 1;
      vehicleMap[vehKey].freight += amt;

      // Date trend aggregation
      const dateKey = t.date || 'Unknown';
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          freight: 0,
          advance: 0,
          profit: 0,
          trips: 0
        };
      }
      dateMap[dateKey].freight += amt;
      dateMap[dateKey].advance += adv;
      dateMap[dateKey].profit += (amt - diesel - toll);
      dateMap[dateKey].trips += 1;
    });

    const totalExpenses = totalDiesel + totalToll;
    const netProfit = totalFreight - totalExpenses;
    const profitMargin = totalFreight > 0 ? ((netProfit / totalFreight) * 100).toFixed(1) : '0';
    const collectionRate = totalFreight > 0 ? Math.round((totalAdvance / totalFreight) * 100) : 0;
    const avgFreightPerTrip = filteredTrips.length > 0 ? Math.round(totalFreight / filteredTrips.length) : 0;

    // All Routes, Parties, Vehicles
    const allRoutes = Object.values(routeMap).sort((a, b) => b.freight - a.freight);
    const allParties = Object.values(partyMap).sort((a, b) => b.freight - a.freight);
    const allVehicles = Object.values(vehicleMap).sort((a, b) => b.freight - a.freight);

    // Sort Timeline Dates
    const trendData = Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      totalFreight,
      totalAdvance,
      totalBalance,
      totalDiesel,
      totalToll,
      totalExpenses,
      netProfit,
      profitMargin,
      collectionRate,
      avgFreightPerTrip,
      tripCount: filteredTrips.length,
      paidCount,
      partialCount,
      pendingCount,
      allRoutes,
      allParties,
      allVehicles,
      trendData
    };
  }, [filteredTrips]);

  const totalRoutePages = Math.max(1, Math.ceil(analyticsData.allRoutes.length / 5));
  const safeRoutePage = Math.min(Math.max(1, routePage), totalRoutePages);
  const paginatedRoutes = useMemo(() => {
    const start = (safeRoutePage - 1) * 5;
    return analyticsData.allRoutes.slice(start, start + 5);
  }, [analyticsData.allRoutes, safeRoutePage]);

  const totalPartyPages = Math.max(1, Math.ceil(analyticsData.allParties.length / 5));
  const safePartyPage = Math.min(Math.max(1, partyPage), totalPartyPages);
  const paginatedParties = useMemo(() => {
    const start = (safePartyPage - 1) * 5;
    return analyticsData.allParties.slice(start, start + 5);
  }, [analyticsData.allParties, safePartyPage]);

  const totalVehiclePages = Math.max(1, Math.ceil(analyticsData.allVehicles.length / 5));
  const safeVehiclePage = Math.min(Math.max(1, vehiclePage), totalVehiclePages);
  const paginatedVehicles = useMemo(() => {
    const start = (safeVehiclePage - 1) * 5;
    return analyticsData.allVehicles.slice(start, start + 5);
  }, [analyticsData.allVehicles, safeVehiclePage]);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const handleSendReminder = (party) => {
    const partyTrips = trips.filter(
      t => t.partyName && t.partyName.trim().toLowerCase() === (party.name || '').trim().toLowerCase()
    );
    let phone = party.phone;
    if (!phone) {
      const foundParty = parties.find(
        p => p.name && p.name.trim().toLowerCase() === (party.name || '').trim().toLowerCase()
      );
      if (foundParty) phone = foundParty.phone;
    }
    const text = formatPartyReminderWhatsAppMessage(
      {
        name: party.name,
        totalBalance: party.balance,
        totalFreight: party.freight,
        totalAdvance: party.advance,
        tripsCount: party.count,
        phone
      },
      partyTrips
    );
    openWhatsApp(phone, text);
  };

  // SVG Chart Dimensions & Calculations
  const chartHeight = 200;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const chartPoints = useMemo(() => {
    const data = analyticsData.trendData;
    if (data.length === 0) return [];

    let maxVal = 10000;
    data.forEach(d => {
      const v = activeMetricTab === 'freight' ? d.freight : activeMetricTab === 'cashflow' ? d.advance : Math.max(0, d.profit);
      if (v > maxVal) maxVal = v;
    });

    const effectiveWidth = chartWidth - paddingX * 2;
    const effectiveHeight = chartHeight - paddingY * 2;

    return data.map((d, index) => {
      const x = data.length === 1 
        ? chartWidth / 2 
        : paddingX + (index / (data.length - 1)) * effectiveWidth;
      const v = activeMetricTab === 'freight' ? d.freight : activeMetricTab === 'cashflow' ? d.advance : Math.max(0, d.profit);
      const y = chartHeight - paddingY - (v / maxVal) * effectiveHeight;
      return { x, y, data: d, val: v };
    });
  }, [analyticsData.trendData, activeMetricTab]);

  // Construct SVG Path
  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    if (chartPoints.length === 1) {
      return `M ${chartPoints[0].x - 30} ${chartPoints[0].y} L ${chartPoints[0].x + 30} ${chartPoints[0].y}`;
    }
    return chartPoints.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic curve
      const prev = arr[idx - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (!linePath || chartPoints.length === 0) return '';
    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    const groundY = chartHeight - paddingY;
    return `${linePath} L ${lastX} ${groundY} L ${firstX} ${groundY} Z`;
  }, [linePath, chartPoints]);

  // Donut Chart calculations
  const totalStatusTrips = analyticsData.tripCount || 1;
  const paidPct = Math.round((analyticsData.paidCount / totalStatusTrips) * 100);
  const partialPct = Math.round((analyticsData.partialCount / totalStatusTrips) * 100);
  const pendingPct = 100 - paidPct - partialPct;

  return (
    <div className="space-y-5 sm:space-y-7 transition-all duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Business Intelligence & Analytics
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Fleet revenues, cash flows, operational profit, and freight route profitability
          </p>
        </div>

        {/* Minimalist Date Range Dropdown Button */}
        <PeriodDropdown period={filterPeriod} onChange={setFilterPeriod} />
      </div>

      {/* Top Notice if viewing 'Today' and 0 records */}
      {filterPeriod === 'today' && analyticsData.tripCount === 0 && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300">
            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>
              You are currently viewing <strong>Today's</strong> analytics. 0 trips logged so far today.
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

      {/* Key Metric Executive Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Billed Freight */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Freight Billed
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              <CasinoCounter value={analyticsData.totalFreight} />
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              <span>{analyticsData.tripCount} shipments</span>
              <span>Avg: {formatCurrency(analyticsData.avgFreightPerTrip)}</span>
            </div>
          </div>
        </div>

        {/* Realized Advance Cash */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Advance Collected
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
              {analyticsData.collectionRate}% Realized
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
              <CasinoCounter value={analyticsData.totalAdvance} />
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Cash received upfront
            </p>
          </div>
        </div>

        {/* Outstanding Market Dues */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Market Receivables
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
              {analyticsData.pendingCount + analyticsData.partialCount} Unsettled
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              <CasinoCounter value={analyticsData.totalBalance} />
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Pending party payments
            </p>
          </div>
        </div>

        {/* Estimated Net Operating Profit */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Operating Profit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {analyticsData.profitMargin}% Margin
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              <CasinoCounter value={analyticsData.netProfit} />
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              After diesel & toll expenses
            </p>
          </div>
        </div>

      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Interactive Cashflow & Revenue Graph (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  Revenue & Cash Realization Timeline
                </h3>
                <p className="text-[10px] sm:text-[11px] text-zinc-400">
                  Visual curve across trip logging dates
                </p>
              </div>

              {/* Metric Switcher */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                {[
                  { id: 'freight', label: 'Freight Billed' },
                  { id: 'cashflow', label: 'Advances' },
                  { id: 'profit', label: 'Net Profit' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetricTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      activeMetricTab === tab.id
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Interactive Area Chart */}
            {analyticsData.trendData.length === 0 ? (
              <div className="h-48 sm:h-56 flex flex-col items-center justify-center text-zinc-400 text-xs bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <BarChart3 className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                <span>No timeline data recorded for {PERIOD_OPTIONS.find(p => p.id === filterPeriod)?.label}.</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Switch filter to "This Month" or "All Time".</span>
              </div>
            ) : (
              <div className="relative pt-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-48 sm:h-56 overflow-visible"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#71717a" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#71717a" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.25, 0.5, 0.75].map((pct, idx) => (
                    <line
                      key={idx}
                      x1={paddingX}
                      y1={paddingY + pct * (chartHeight - paddingY * 2)}
                      x2={chartWidth - paddingX}
                      y2={paddingY + pct * (chartHeight - paddingY * 2)}
                      stroke="currentColor"
                      className="text-zinc-100 dark:text-zinc-800/80"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Area Fill */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#areaGradient)"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Line Stroke */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-zinc-900 dark:text-white transition-all duration-300"
                    />
                  )}

                  {/* Data Points */}
                  {chartPoints.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredDataPoint?.data.date === pt.data.date ? 6 : 4}
                        className={`transition-all duration-150 ${
                          hoveredDataPoint?.data.date === pt.data.date 
                            ? 'fill-zinc-900 dark:fill-white stroke-4 stroke-zinc-200 dark:stroke-zinc-700' 
                            : 'fill-white dark:fill-zinc-900 stroke-2 stroke-zinc-700 dark:stroke-zinc-300'
                        }`}
                        onMouseEnter={() => setHoveredDataPoint(pt)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredDataPoint && (
                  <div className="absolute top-2 right-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] p-2 rounded-xl shadow-lg border border-zinc-700 dark:border-zinc-200 pointer-events-none transition-all">
                    <div className="font-semibold">{hoveredDataPoint.data.date}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {activeMetricTab === 'freight' && `Freight: ${formatCurrency(hoveredDataPoint.data.freight)}`}
                      {activeMetricTab === 'cashflow' && `Advances: ${formatCurrency(hoveredDataPoint.data.advance)}`}
                      {activeMetricTab === 'profit' && `Operating Profit: ${formatCurrency(hoveredDataPoint.data.profit)}`}
                      {` (${hoveredDataPoint.data.trips} trip${hoveredDataPoint.data.trips > 1 ? 's' : ''})`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-2">
            <span>Range: {analyticsData.trendData[0]?.date || '—'} to {analyticsData.trendData[analyticsData.trendData.length - 1]?.date || '—'}</span>
            <span>Total Shipments: <strong className="text-zinc-800 dark:text-zinc-200">{analyticsData.tripCount}</strong></span>
          </div>
        </div>

        {/* Payment Collection Donut Visualization */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                Collection Health
              </h3>
              <span className="text-[10px] text-zinc-400 font-medium">Payment status</span>
            </div>

            {/* Circular Donut Diagram */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-zinc-100 dark:text-zinc-800"
                />

                {/* Paid Segment (Emerald) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={`${paidPct * 2.38} 238`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Partial Segment (Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="10"
                  strokeDasharray={`${partialPct * 2.38} 238`}
                  strokeDashoffset={`${-paidPct * 2.38}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Pending Segment (Rose) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="10"
                  strokeDasharray={`${pendingPct * 2.38} 238`}
                  strokeDashoffset={`${-(paidPct + partialPct) * 2.38}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>

              {/* Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsData.collectionRate}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Cleared
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Fully Paid</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                  <span>{analyticsData.paidCount} trips</span>
                  <span className="text-zinc-400 text-[10px]">({paidPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Partial Dues</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                  <span>{analyticsData.partialCount} trips</span>
                  <span className="text-zinc-400 text-[10px]">({partialPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Fully Pending</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                  <span>{analyticsData.pendingCount} trips</span>
                  <span className="text-zinc-400 text-[10px]">({pendingPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Route Corridors, Client Ledger & Fleet Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Top Profitable Freight Corridors */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  Top Freight Routes (Volume & Value)
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400">By Billed Freight</span>
            </div>

            {analyticsData.allRoutes.length === 0 ? (
              <p className="text-center py-8 text-zinc-400 text-xs">No routes recorded for this period.</p>
            ) : (
              <div className="space-y-3">
                {paginatedRoutes.map((r, idx) => {
                  const maxRouteFreight = analyticsData.allRoutes[0]?.freight || 1;
                  const percentage = Math.round((r.freight / maxRouteFreight) * 100);
                  const rank = (safeRoutePage - 1) * 5 + idx + 1;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                            #{rank}
                          </span>
                          <strong className="text-zinc-800 dark:text-zinc-200">{r.route}</strong>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(r.freight)}</span>
                          <span className="text-zinc-400 text-[10px] ml-1.5">({r.count} trip{r.count > 1 ? 's' : ''})</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {totalRoutePages > 1 && (
            <Pagination
              currentPage={safeRoutePage}
              totalItems={analyticsData.allRoutes.length}
              pageSize={5}
              onPageChange={(page) => setRoutePage(page)}
              compact={true}
              itemName="routes"
            />
          )}
        </div>

        {/* Client Ledger Contribution & Unpaid Dues */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  Party Billing & Outstanding Balance
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('parties')}
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                All Parties →
              </button>
            </div>

            {analyticsData.allParties.length === 0 ? (
              <p className="text-center py-8 text-zinc-400 text-xs">No client transactions recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {paginatedParties.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 dark:text-white text-xs truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Billed: {formatCurrency(p.freight)} • {p.count} trip{p.count > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2 shrink-0">
                      <div>
                        {p.balance > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block">
                            Due: {formatCurrency(p.balance)}
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 text-[11px] block">
                            Cleared
                          </span>
                        )}
                      </div>

                      {p.balance > 0 && (
                        <button
                          onClick={() => handleSendReminder(p)}
                          title="WhatsApp Reminder"
                          className="p-2 sm:p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl cursor-pointer transition border border-emerald-200 dark:border-emerald-800/60 active:scale-95"
                        >
                          <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPartyPages > 1 && (
            <Pagination
              currentPage={safePartyPage}
              totalItems={analyticsData.allParties.length}
              pageSize={5}
              onPageChange={(page) => setPartyPage(page)}
              compact={true}
              itemName="parties"
            />
          )}
        </div>

        {/* Fleet Vehicle Utilization */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  Top Performing Fleet Trucks
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400">By Billed Revenue</span>
            </div>

            {analyticsData.allVehicles.length === 0 ? (
              <p className="text-center py-8 text-zinc-400 text-xs">No vehicle operations recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {paginatedVehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs block">
                        {v.vehicleNo}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {v.type} • {v.count} shipment{v.count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-right font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                      {formatCurrency(v.freight)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalVehiclePages > 1 && (
            <Pagination
              currentPage={safeVehiclePage}
              totalItems={analyticsData.allVehicles.length}
              pageSize={5}
              onPageChange={(page) => setVehiclePage(page)}
              compact={true}
              itemName="trucks"
            />
          )}
        </div>

      </div>

    </div>
  );
}
