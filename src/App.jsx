import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchAppData, 
  saveTripRecord, 
  deleteTripRecord, 
  savePartyRecord, 
  deletePartyRecord, 
  saveCompanySettings, 
  clearAllDatabaseData,
  DEFAULT_COMPANY_SETTINGS 
} from './db';
import { 
  isSupabaseEnabled, 
  checkSupabaseSchema, 
  SUPABASE_SCHEMA_SQL 
} from './utils/supabase';
import AuthGate from './components/AuthGate';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TripList from './components/TripList';
import TripModal from './components/TripModal';
import PartyLedger from './components/PartyLedger';
import BiltyPrinter from './components/BiltyPrinter';
import SettingsModal from './components/SettingsModal';
import PaymentModal from './components/PaymentModal';
import Analytics from './components/Analytics';
import SkeletonLoader from './components/SkeletonLoader';
import ConfirmModal from './components/ConfirmModal';
import { Database, Copy, Check, ExternalLink } from 'lucide-react';

const VALID_TABS = ['dashboard', 'trips', 'analytics', 'parties', 'settings'];

// Get active tab from current URL pathname
const getTabFromPath = () => {
  try {
    const path = window.location.pathname || '';
    const trimmed = path.replace(/\/+$/, '');
    const segments = trimmed.split('/').filter(Boolean);
    const last = segments[segments.length - 1]?.toLowerCase();
    if (last && VALID_TABS.includes(last)) {
      return last;
    }
    if (last === 'database') return 'settings';
    if (segments.length === 0 || last === 'dashboard' || last === 'transportx') {
      return 'dashboard';
    }
  } catch {}
  return null;
};

// Compute target URL pathname for a tab
const getPathForTab = (tab) => {
  try {
    const path = window.location.pathname || '';
    const trimmed = path.replace(/\/+$/, '');
    const segments = trimmed.split('/').filter(Boolean);
    const last = segments[segments.length - 1]?.toLowerCase();
    if (last && (VALID_TABS.includes(last) || last === 'database')) {
      segments.pop();
    }
    const base = segments.length > 0 ? `/${segments.join('/')}` : '';
    if (tab === 'dashboard') {
      return base || '/';
    }
    return `${base}/${tab}`;
  } catch {
    return `/${tab}`;
  }
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sai_transport_theme') || 'dark';
  });

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sai_transport_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth gate state (PIN protected)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('sai_transport_auth') || sessionStorage.getItem('sai_transport_auth');
    return stored === 'true';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState(() => {
    return getTabFromPath() || localStorage.getItem('sai_transport_active_tab') || 'dashboard';
  });

  // Sync tab with browser URL history
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    localStorage.setItem('sai_transport_active_tab', newTab);
    const targetPath = getPathForTab(newTab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: newTab }, '', targetPath);
    }
  };

  // Listen to popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const tabFromUrl = getTabFromPath();
      if (tabFromUrl && tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
        localStorage.setItem('sai_transport_active_tab', tabFromUrl);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  // Unified confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemDetails: '',
    confirmLabel: 'Delete',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Core Cloud Data States (No dummy data)
  const [trips, setTrips] = useState([]);
  const [parties, setParties] = useState([]);
  const [companySettings, setCompanySettings] = useState(DEFAULT_COMPANY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [dbMeta, setDbMeta] = useState({ 
    source: 'supabase', 
    status: 'connecting' 
  });

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [viewingBiltyTrip, setViewingBiltyTrip] = useState(null);
  const [paymentModalTrip, setPaymentModalTrip] = useState(null);

  // Load Database Data directly from Supabase Cloud
  const loadDatabaseData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAppData();
      setTrips(res.trips || []);
      setParties(res.parties || []);
      setCompanySettings(res.settings || DEFAULT_COMPANY_SETTINGS);
      setDbMeta({ source: res.source, status: res.status });
    } catch (error) {
      console.error('Failed to load database:', error);
      setDbMeta({ source: 'supabase', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Lock Portal
  const handleLock = () => {
    localStorage.removeItem('sai_transport_auth');
    sessionStorage.removeItem('sai_transport_auth');
    setIsAuthenticated(false);
  };

  // Compute Next LR Number
  const getNextLrNo = () => {
    if (!trips || trips.length === 0) return 'ST-1001';
    let highest = 1000;
    trips.forEach(t => {
      if (t.lrNo) {
        const numPart = parseInt(t.lrNo.replace(/\D/g, ''), 10);
        if (!isNaN(numPart) && numPart > highest) {
          highest = numPart;
        }
      }
    });
    return `ST-${highest + 1}`;
  };

  const handleCopySql = () => {
    navigator.clipboard?.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Save Trip directly to Supabase cloud
  const handleSaveTrip = async (tripData) => {
    try {
      const saved = await saveTripRecord(tripData);
      if (tripData.id) {
        setTrips(prev => prev.map(t => (t.id === tripData.id ? saved : t)));
      } else {
        setTrips(prev => [saved, ...prev]);
      }

      // Automatically register new party in cloud if not yet registered
      if (tripData.partyName) {
        const exists = parties.some(
          p => p.name.toLowerCase() === tripData.partyName.trim().toLowerCase()
        );
        if (!exists) {
          const newParty = {
            name: tripData.partyName.trim(),
            phone: tripData.partyPhone || '',
            city: tripData.toCity || '',
            address: '',
            gstin: '',
            createdAt: new Date().toISOString()
          };
          const savedParty = await savePartyRecord(newParty);
          setParties(prev => [...prev, savedParty]);
        }
      }
    } catch (error) {
      console.error('Failed to save trip to cloud database:', error);
      alert('Database error: ' + error.message + '. Please ensure Supabase tables are created.');
    }
  };

  const handleDeleteTrip = (tripOrId) => {
    const id = typeof tripOrId === 'object' ? tripOrId.id : tripOrId;
    const trip = trips.find(t => t.id === id) || (typeof tripOrId === 'object' ? tripOrId : null);
    const details = trip 
      ? `LR: ${trip.lrNo || 'N/A'} • ${trip.partyName || ''} (${trip.fromCity || ''} ➔ ${trip.toCity || ''})`
      : '';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Trip Record',
      message: 'Are you sure you want to delete this trip from the cloud database? It will be removed from all devices.',
      itemDetails: details,
      confirmLabel: 'Delete Trip',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteTripRecord(id);
          setTrips(prev => prev.filter(t => t.id !== id));
        } catch (error) {
          console.error('Failed to delete trip:', error);
          alert('Delete error: ' + error.message);
        }
      }
    });
  };

  const handleRecordPayment = async (updatedTrip) => {
    try {
      const saved = await saveTripRecord(updatedTrip);
      setTrips(prev => prev.map(t => (t.id === updatedTrip.id ? saved : t)));
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  // Party Handlers
  const handleSaveParty = async (partyData) => {
    try {
      const saved = await savePartyRecord(partyData);
      if (partyData.id) {
        setParties(prev => prev.map(p => (p.id === partyData.id ? saved : p)));
      } else {
        setParties(prev => [...prev, saved]);
      }
    } catch (error) {
      console.error('Failed to save party:', error);
      alert('Save party error: ' + error.message);
    }
  };

  const handleDeleteParty = (partyOrId) => {
    const id = typeof partyOrId === 'object' ? partyOrId.id : partyOrId;
    const party = parties.find(p => p.id === id) || (typeof partyOrId === 'object' ? partyOrId : null);
    const details = party ? `${party.name}${party.city ? ` • ${party.city}` : ''}` : '';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Party Profile',
      message: 'Are you sure you want to delete this party from the cloud directory? This action affects all devices.',
      itemDetails: details,
      confirmLabel: 'Delete Party',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deletePartyRecord(id);
          setParties(prev => prev.filter(p => p.id !== id));
        } catch (error) {
          console.error('Failed to delete party:', error);
        }
      }
    });
  };

  // Settings Handlers
  const handleSaveCompany = async (newSettings) => {
    try {
      await saveCompanySettings(newSettings);
      setCompanySettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings to cloud:', error);
    }
  };

  // Wipe All Records from Cloud Database
  const handleWipeAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Wipe All Cloud Records',
      message: 'Are you sure you want to wipe all records from Supabase? This permanently removes all trips and parties from all devices.',
      itemDetails: `${trips.length} Trips • ${parties.length} Parties`,
      confirmLabel: 'Wipe All Records',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await clearAllDatabaseData();
          setTrips([]);
          setParties([]);
        } catch (error) {
          console.error('Failed to wipe database:', error);
        }
      }
    });
  };

  // If locked, render 6-Digit PIN Screen
  if (!isAuthenticated) {
    return (
      <AuthGate
        onAuthenticated={() => setIsAuthenticated(true)}
        masterPassword={companySettings.masterPassword || '116600'}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        tripCount={trips.length}
        partyCount={parties.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewTrip={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onLock={handleLock}
      />

      {/* Supabase Schema Notice Banner (Visible only if tables are not yet created in Supabase) */}
      {dbMeta.status === 'needs_schema' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Supabase Setup Required:</strong> Cloud database tables are not yet created. Copy and run the SQL script in your Supabase SQL Editor once so data syncs across all your devices.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopySql}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy Setup SQL'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/znczyfkpcpkmhutlmenh/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-bold text-[11px] flex items-center gap-1 hover:opacity-90"
            >
              <span>Open SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 pb-24 md:pb-8">
        {loading ? (
          <SkeletonLoader type={activeTab} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                trips={trips}
                parties={parties}
                onNewTrip={() => {
                  setEditingTrip(null);
                  setIsTripModalOpen(true);
                }}
                onViewTrip={(trip) => setViewingBiltyTrip(trip)}
                onNavigateTab={handleTabChange}
                onRecordPayment={(trip) => setPaymentModalTrip(trip)}
              />
            )}

            {activeTab === 'trips' && (
              <TripList
                trips={trips}
                parties={parties}
                onNewTrip={() => {
                  setEditingTrip(null);
                  setIsTripModalOpen(true);
                }}
                onEditTrip={(trip) => {
                  setEditingTrip(trip);
                  setIsTripModalOpen(true);
                }}
                onDeleteTrip={handleDeleteTrip}
                onViewBilty={(trip) => setViewingBiltyTrip(trip)}
                onRecordPayment={(trip) => setPaymentModalTrip(trip)}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics
                trips={trips}
                parties={parties}
                onNavigateTab={handleTabChange}
              />
            )}

            {activeTab === 'parties' && (
              <PartyLedger
                parties={parties}
                trips={trips}
                onSaveParty={handleSaveParty}
                onDeleteParty={handleDeleteParty}
                onViewBilty={(trip) => setViewingBiltyTrip(trip)}
              />
            )}

            {(activeTab === 'settings' || activeTab === 'database') && (
              <SettingsModal
                company={companySettings}
                onSaveCompany={handleSaveCompany}
                onClearAllData={handleWipeAllData}
                onLock={handleLock}
                trips={trips}
                parties={parties}
                onDatabaseRestored={loadDatabaseData}
                dbMeta={dbMeta}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="hidden md:block no-print border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-3.5 text-center text-xs text-zinc-400 dark:text-zinc-500 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            © {new Date().getFullYear()} <strong>{companySettings.companyName || 'SAI TRANSPORT'}</strong> • Cloud Fleet Accounts
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Cloud Database (Supabase)</span>
            <span>•</span>
            <span>All Devices Synchronized</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Trip Modal */}
      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        onSaveParty={handleSaveParty}
        editingTrip={editingTrip}
        parties={parties}
        nextLrNo={getNextLrNo()}
      />

      {/* Lorry Receipt (Bilty) Printable Modal */}
      {viewingBiltyTrip && (
        <BiltyPrinter
          trip={viewingBiltyTrip}
          company={companySettings}
          onClose={() => setViewingBiltyTrip(null)}
        />
      )}

      {/* Quick Record Payment Modal */}
      {paymentModalTrip && (
        <PaymentModal
          trip={paymentModalTrip}
          isOpen={!!paymentModalTrip}
          onClose={() => setPaymentModalTrip(null)}
          onSavePayment={handleRecordPayment}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        itemDetails={confirmModal.itemDetails}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
      />

    </div>
  );
}
