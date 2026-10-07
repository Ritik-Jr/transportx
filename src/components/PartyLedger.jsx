import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  Share2, 
  Edit3, 
  Trash2, 
  X,
  Printer
} from 'lucide-react';
import Pagination from './Pagination';
import { formatPartyReminderWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

export default function PartyLedger({ 
  parties = [], 
  trips = [], 
  onSaveParty, 
  onDeleteParty,
  onViewBilty 
}) {
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('sai_parties_search') || '';
  });
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('sai_parties_sort') || 'balance-desc';
  });
  const [selectedPartyForStatement, setSelectedPartyForStatement] = useState(null);
  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [currentPartyPage, setCurrentPartyPage] = useState(() => {
    return Number(localStorage.getItem('sai_parties_page')) || 1;
  });
  const [partyPageSize, setPartyPageSize] = useState(() => {
    return Number(localStorage.getItem('sai_parties_pageSize')) || 9;
  });
  const [statementPage, setStatementPage] = useState(1);
  const [statementPageSize, setStatementPageSize] = useState(5);

  const isFirstPartyRender = React.useRef(true);
  useEffect(() => {
    if (isFirstPartyRender.current) {
      isFirstPartyRender.current = false;
      return;
    }
    setCurrentPartyPage(1);
  }, [searchTerm, sortBy]);

  useEffect(() => {
    localStorage.setItem('sai_parties_search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('sai_parties_sort', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('sai_parties_page', String(currentPartyPage));
  }, [currentPartyPage]);

  useEffect(() => {
    localStorage.setItem('sai_parties_pageSize', String(partyPageSize));
  }, [partyPageSize]);

  useEffect(() => {
    setStatementPage(1);
  }, [selectedPartyForStatement]);

  const [partyForm, setPartyForm] = useState({
    name: '',
    phone: '',
    gstin: '',
    city: '',
    address: ''
  });

  const partiesWithMetrics = useMemo(() => {
    const tripMetricsByParty = {};
    trips.forEach(t => {
      const pName = (t.partyName || '').trim();
      if (!pName) return;
      if (!tripMetricsByParty[pName.toLowerCase()]) {
        tripMetricsByParty[pName.toLowerCase()] = {
          tripsCount: 0,
          totalFreight: 0,
          totalAdvance: 0,
          totalBalance: 0,
          trips: []
        };
      }
      const data = tripMetricsByParty[pName.toLowerCase()];
      const amt = Number(t.amount) || 0;
      const adv = Number(t.advance) || 0;
      const bal = Number(t.balance) || Math.max(0, amt - adv);

      data.tripsCount += 1;
      data.totalFreight += amt;
      data.totalAdvance += adv;
      data.totalBalance += bal;
      data.trips.push(t);
    });

    const combinedList = [];
    const seen = new Set();

    parties.forEach(p => {
      const key = (p.name || '').trim().toLowerCase();
      seen.add(key);
      const metrics = tripMetricsByParty[key] || {
        tripsCount: 0,
        totalFreight: 0,
        totalAdvance: 0,
        totalBalance: 0,
        trips: []
      };
      combinedList.push({
        ...p,
        ...metrics
      });
    });

    Object.keys(tripMetricsByParty).forEach(key => {
      if (!seen.has(key)) {
        const m = tripMetricsByParty[key];
        const sampleTrip = m.trips[0] || {};
        combinedList.push({
          name: sampleTrip.partyName || key,
          phone: sampleTrip.partyPhone || '',
          city: sampleTrip.toCity || '',
          address: '',
          gstin: '',
          ...m
        });
      }
    });

    return combinedList.sort((a, b) => b.totalBalance - a.totalBalance);
  }, [parties, trips]);

  const filteredParties = useMemo(() => {
    let list = partiesWithMetrics;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.gstin || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'trips-desc') return (b.tripsCount || 0) - (a.tripsCount || 0);
      if (sortBy === 'freight-desc') return (b.totalFreight || 0) - (a.totalFreight || 0);
      return (b.totalBalance || 0) - (a.totalBalance || 0);
    });
  }, [partiesWithMetrics, searchTerm, sortBy]);

  const totalPartyPages = Math.max(1, Math.ceil(filteredParties.length / partyPageSize));
  const safePartyPage = Math.min(Math.max(1, currentPartyPage), totalPartyPages);

  const paginatedParties = useMemo(() => {
    const start = (safePartyPage - 1) * partyPageSize;
    return filteredParties.slice(start, start + partyPageSize);
  }, [filteredParties, safePartyPage, partyPageSize]);

  const statementTrips = selectedPartyForStatement?.trips || [];
  const totalStatementPages = Math.max(1, Math.ceil(statementTrips.length / statementPageSize));
  const safeStatementPage = Math.min(Math.max(1, statementPage), totalStatementPages);

  const paginatedStatementTrips = useMemo(() => {
    const start = (safeStatementPage - 1) * statementPageSize;
    return statementTrips.slice(start, start + statementPageSize);
  }, [statementTrips, safeStatementPage, statementPageSize]);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const handleOpenAdd = () => {
    setEditingParty(null);
    setPartyForm({ name: '', phone: '', gstin: '', city: '', address: '' });
    setPartyModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParty(p);
    setPartyForm({
      name: p.name || '',
      phone: p.phone || '',
      gstin: p.gstin || '',
      city: p.city || '',
      address: p.address || ''
    });
    setPartyModalOpen(true);
  };

  const handleSavePartyForm = (e) => {
    e.preventDefault();
    if (!partyForm.name.trim()) return;
    onSaveParty({
      ...partyForm,
      id: editingParty ? editingParty.id : undefined
    });
    setPartyModalOpen(false);
  };

  const handleSendWhatsAppReminder = (party) => {
    const partyTrips = trips.filter(
      t => t.partyName && t.partyName.trim().toLowerCase() === (party.name || '').trim().toLowerCase()
    );
    const text = formatPartyReminderWhatsAppMessage(party, partyTrips);
    openWhatsApp(party.phone, text);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Transport Party Ledger
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Client directory, freight billing totals, and outstanding dues
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 sm:px-4 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Party</span>
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search party by name, phone, city, or GSTIN..."
            className="w-full pl-10 pr-3 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <span className="hidden sm:inline text-xs text-zinc-400 font-medium pl-1">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs font-semibold focus:outline-none cursor-pointer box-border"
          >
            <option value="balance-desc">Highest Due</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="trips-desc">Most Trips</option>
            <option value="freight-desc">Total Freight</option>
          </select>
        </div>
      </div>

      {/* Parties Grid */}
      {filteredParties.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 shadow-xs">
          <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">No transport parties found</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Add parties to keep your transport clients organized.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Party</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedParties.map((party, idx) => (
            <div
              key={party.id || idx}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                      <Building2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base line-clamp-1">
                        {party.name}
                      </h3>
                      {party.city && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{party.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {party.totalBalance > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 shrink-0">
                      Due
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                      Cleared
                    </span>
                  )}
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 py-2.5 border-y border-zinc-100 dark:border-zinc-800">
                  {party.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-800 dark:text-zinc-200 font-mono text-xs">{party.phone}</span>
                      </div>
                      <a
                        href={`tel:${party.phone.replace(/[^\d+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                        title={`Call ${party.name}`}
                      >
                        <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                  {party.gstin && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      GSTIN: <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{party.gstin}</span>
                    </div>
                  )}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Shipments: <strong className="text-zinc-800 dark:text-zinc-200">{party.tripsCount} trips</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2.5 text-xs text-center">
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold block">Total Billed</span>
                    <span className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base mt-0.5 block">
                      {formatCurrency(party.totalFreight)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold block">Balance Due</span>
                    <span className={`font-bold text-sm sm:text-base mt-0.5 block ${
                      party.totalBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {formatCurrency(party.totalBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => setSelectedPartyForStatement(party)}
                  className="flex-1 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Statement</span>
                </button>

                {party.phone && (
                  <a
                    href={`tel:${party.phone.replace(/[^\d+]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    title={`Call ${party.name} (${party.phone})`}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl transition cursor-pointer border border-blue-200 dark:border-blue-800/50 active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <Phone className="w-4.5 h-4.5" />
                  </a>
                )}

                {party.totalBalance > 0 && (
                  <button
                    onClick={() => handleSendWhatsAppReminder(party)}
                    title="Send WhatsApp Reminder"
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl transition cursor-pointer border border-emerald-200 dark:border-emerald-800/50 active:scale-95"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                )}

                {party.id && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(party)}
                      title="Edit Party"
                      className="p-2.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => onDeleteParty(party)}
                      title="Delete Party"
                      className="p-2.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Parties Pagination Controls */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-xs">
          <Pagination
            currentPage={safePartyPage}
            totalItems={filteredParties.length}
            pageSize={partyPageSize}
            onPageChange={(page) => setCurrentPartyPage(page)}
            pageSizeOptions={[6, 9, 18, 30]}
            onPageSizeChange={(size) => {
              setPartyPageSize(size);
              setCurrentPartyPage(1);
            }}
            itemName="parties"
          />
        </div>
      </>
    )}

      {/* Statement Modal */}
      {selectedPartyForStatement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-6">
            
            <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  {selectedPartyForStatement.name} — Statement
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {selectedPartyForStatement.phone ? `Phone: ${selectedPartyForStatement.phone} • ` : ''}
                  Trip ledger history
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedPartyForStatement.phone && (
                  <a
                    href={`tel:${selectedPartyForStatement.phone.replace(/[^\d+]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                    title={`Call ${selectedPartyForStatement.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedPartyForStatement(null)}
                  className="p-2 sm:p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl transition cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50/50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-center">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Total Billed</span>
                <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mt-0.5">
                  {formatCurrency(selectedPartyForStatement.totalFreight)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Total Received</span>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm mt-0.5">
                  {formatCurrency(selectedPartyForStatement.totalAdvance)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Balance Due</span>
                <div className={`font-bold text-xs sm:text-sm mt-0.5 ${
                  selectedPartyForStatement.totalBalance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  {formatCurrency(selectedPartyForStatement.totalBalance)}
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-5 max-h-[55vh] overflow-y-auto">
              {selectedPartyForStatement.trips.length === 0 ? (
                <p className="text-center py-8 text-xs text-zinc-400">
                  No trips logged for this party yet.
                </p>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full min-w-[650px] text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="py-3 px-3.5 font-semibold whitespace-nowrap">LR / Date</th>
                          <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Truck & Route</th>
                          <th className="py-3 px-3.5 font-semibold text-right whitespace-nowrap">Freight</th>
                          <th className="py-3 px-3.5 font-semibold text-right whitespace-nowrap">Advance</th>
                          <th className="py-3 px-3.5 font-semibold text-right whitespace-nowrap">Balance</th>
                          <th className="py-3 px-3.5 font-semibold text-center whitespace-nowrap">Status</th>
                          <th className="py-3 px-3.5 font-semibold text-right whitespace-nowrap">Bilty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {paginatedStatementTrips.map((t) => (
                          <tr 
                            key={t.id || t.lrNo} 
                            onClick={() => {
                              setSelectedPartyForStatement(null);
                              onViewBilty(t);
                            }}
                            className="hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition cursor-pointer group"
                          >
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="font-mono font-bold text-zinc-900 dark:text-white block">{t.lrNo}</span>
                              <span className="text-[10px] text-zinc-400">{t.date}</span>
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200 block">{t.vehicleNo}</span>
                              <span className="text-[10px] text-zinc-400">{t.fromCity} ➔ {t.toCity}</span>
                            </td>
                            <td className="py-3 px-3.5 text-right font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                              {formatCurrency(t.amount)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                              {formatCurrency(t.advance)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-bold text-rose-700 dark:text-rose-400 whitespace-nowrap">
                              {formatCurrency(t.balance)}
                            </td>
                            <td className="py-3 px-3.5 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                t.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : t.paymentStatus === 'Partial'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              }`}>
                                {t.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPartyForStatement(null);
                                  onViewBilty(t);
                                }}
                                title="Print Bilty"
                                className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Un-Squeezed Spacious Cards */}
                  <div className="sm:hidden space-y-3">
                    {paginatedStatementTrips.map((t) => (
                      <div 
                        key={t.id || t.lrNo}
                        onClick={() => {
                          setSelectedPartyForStatement(null);
                          onViewBilty(t);
                        }}
                        className="p-3.5 bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-950 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5 cursor-pointer transition active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{t.lrNo}</span>
                            <span className="text-[10px] text-zinc-400">• {t.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : t.paymentStatus === 'Partial'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          }`}>
                            {t.paymentStatus}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{t.vehicleNo}</span>
                          <span className="text-zinc-600 dark:text-zinc-300 font-medium">{t.fromCity} ➔ {t.toCity}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 py-2 px-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800 text-center">
                          <div>
                            <span className="text-[9px] text-zinc-400 uppercase block">Freight</span>
                            <span className="font-bold text-zinc-900 dark:text-white text-xs block mt-0.5">
                              {formatCurrency(t.amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 uppercase block">Advance</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs block mt-0.5">
                              {formatCurrency(t.advance)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 uppercase block">Balance</span>
                            <span className={`font-bold text-xs block mt-0.5 ${
                              t.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {formatCurrency(t.balance)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPartyForStatement(null);
                              onViewBilty(t);
                            }}
                            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Bilty</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Statement Trips Pagination */}
                  <Pagination
                    currentPage={safeStatementPage}
                    totalItems={statementTrips.length}
                    pageSize={statementPageSize}
                    onPageChange={(page) => setStatementPage(page)}
                    pageSizeOptions={[5, 10, 20]}
                    onPageSizeChange={(size) => {
                      setStatementPageSize(size);
                      setStatementPage(1);
                    }}
                    compact={true}
                    itemName="trips"
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => handleSendWhatsAppReminder(selectedPartyForStatement)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Reminder</span>
              </button>

              <button
                onClick={() => setSelectedPartyForStatement(null)}
                className="px-3.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Party Modal */}
      {partyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative my-6">
            <div className="flex items-center justify-between px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {editingParty ? 'Edit Party' : 'Add Transport Party'}
              </h3>
              <button
                onClick={() => setPartyModalOpen(false)}
                className="p-2 sm:p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl transition cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePartyForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Party Name *
                </label>
                <input
                  type="text"
                  value={partyForm.name}
                  onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  placeholder="e.g. Radhe Krishna Traders"
                  required
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone / Mobile
                </label>
                <input
                  type="tel"
                  value={partyForm.phone}
                  onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })}
                  placeholder="e.g. 9822012345"
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  GSTIN (Tax ID)
                </label>
                <input
                  type="text"
                  value={partyForm.gstin}
                  onChange={(e) => setPartyForm({ ...partyForm, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-mono uppercase text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={partyForm.city}
                  onChange={(e) => setPartyForm({ ...partyForm, city: e.target.value })}
                  placeholder="e.g. Pune / Surat / Mumbai"
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Office Address
                </label>
                <textarea
                  rows="2"
                  value={partyForm.address}
                  onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                  placeholder="e.g. Plot 12, Transport Nagar"
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPartyModalOpen(false)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm sm:text-xs font-semibold cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
                >
                  {editingParty ? 'Save' : 'Add Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
