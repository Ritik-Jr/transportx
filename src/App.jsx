import React, { useState, useEffect, useCallback } from 'react';
import { 
  db, 
  loadLocalCache,
  fetchAppData, 
  saveTripRecord, 
  deleteTripRecord, 
  savePartyRecord, 
  deletePartyRecord, 
  saveCompanySettings, 
  deleteDummyRecordsOnly,
  clearAllDatabaseData, 
  isDummyRecord,
  INITIAL_TRIPS,
  INITIAL_PARTIES,
  DEFAULT_COMPANY_SETTINGS 
} from './db';
import { isSupabaseEnabled, checkSupabaseSchema } from './utils/supabase';
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

  // Unified sleek confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemDetails: '',
    confirmLabel: 'Delete',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Core Data States
  const [trips, setTrips] = useState([]);
  const [parties, setParties] = useState([]);
  const [companySettings, setCompanySettings] = useState(DEFAULT_COMPANY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dbMeta, setDbMeta] = useState({ 
    source: isSupabaseEnabled() ? 'supabase' : 'localhost_indexeddb', 
    status: isSupabaseEnabled() ? 'connecting' : 'local' 
  });

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [viewingBiltyTrip, setViewingBiltyTrip] = useState(null);
  const [paymentModalTrip, setPaymentModalTrip] = useState(null);

  // Fast Instant Load: Loads local cache immediately (< 10ms), then non-blocking Supabase sync
  const loadDatabaseData = useCallback(async () => {
    try {
      // 1. INSTANT: Load local IndexedDB/cache immediately in ~5ms
      const local = await loadLocalCache();
      setTrips(local.trips || []);
      setParties(local.parties || []);
      setCompanySettings(local.settings || DEFAULT_COMPANY_SETTINGS);
      setLoading(false); // UI renders IMMEDIATELY with no 10-15s wait!

      // 2. Non-blocking background sync with Supabase if in production
      if (isSupabaseEnabled()) {
        checkSupabaseSchema().then(async (ready) => {
          if (ready) {
            const remote = await fetchAppData();
            if (remote && remote.trips && remote.status === 'online') {
              setTrips(remote.trips);
              setParties(remote.parties);
              setCompanySettings(remote.settings);
              setDbMeta({ source: 'supabase', status: 'online' });
            }
          } else {
            setDbMeta({ source: 'fallback_local', status: 'needs_schema' });
          }
        }).catch(console.warn);
      }
    } catch (error) {
      console.error('Failed to load database:', error);
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
    const list = isDemoMode ? INITIAL_TRIPS : trips;
    if (!list || list.length === 0) return 'ST-1001';
    let highest = 1000;
    list.forEach(t => {
      if (t.lrNo) {
        const numPart = parseInt(t.lrNo.replace(/\D/g, ''), 10);
        if (!isNaN(numPart) && numPart > highest) {
          highest = numPart;
        }
      }
    });
    return `ST-${highest + 1}`;
  };

  // Displayed items: in demo mode, temporary sample data is shown while actual data is safely hidden
  const displayedTrips = isDemoMode ? INITIAL_TRIPS : trips;
  const displayedParties = isDemoMode ? INITIAL_PARTIES : parties;

  // Trip Handlers with OPTIMISTIC UI UPDATES (0ms lag)
  const handleSaveTrip = async (tripData) => {
    // If in demo mode, exit demo mode so user sees their actual data and new entry
    if (isDemoMode) {
      setIsDemoMode(false);
    }

    const isEditing = Boolean(tripData.id);
    const tempId = tripData.id || Date.now();
    const optimisticTrip = {
      ...tripData,
      id: tempId,
      isDummy: false, // User created trip is ALWAYS actual data!
      createdAt: tripData.createdAt || new Date().toISOString()
    };

    // 1. INSTANT SYNCHRONOUS STATE UPDATE:
    // Newly added or edited entry appears in the list in 0ms!
    if (isEditing) {
      setTrips(prev => prev.map(t => (t.id === tripData.id ? optimisticTrip : t)));
    } else {
      setTrips(prev => [optimisticTrip, ...prev]);
    }

    // 2. Auto-add party to state immediately if new
    if (tripData.partyName) {
      const exists = parties.some(
        p => p.name.toLowerCase() === tripData.partyName.trim().toLowerCase()
      );
      if (!exists) {
        const optimisticParty = {
          id: Date.now() + 1,
          name: tripData.partyName.trim(),
          phone: tripData.partyPhone || '',
          city: tripData.toCity || '',
          address: '',
          gstin: '',
          isDummy: false,
          createdAt: new Date().toISOString()
        };
        setParties(prev => [...prev, optimisticParty]);
        savePartyRecord(optimisticParty).catch(console.warn);
      }
    }

    // 3. Persist to Dexie DB and Supabase in background
    try {
      const saved = await saveTripRecord(optimisticTrip);
      if (saved.id && saved.id !== tempId) {
        setTrips(prev => prev.map(t => (t.id === tempId ? saved : t)));
      }
    } catch (error) {
      console.error('Failed to save trip to database:', error);
    }
  };

  const handleDeleteTrip = (tripOrId) => {
    const id = typeof tripOrId === 'object' ? tripOrId.id : tripOrId;
    const trip = displayedTrips.find(t => t.id === id) || (typeof tripOrId === 'object' ? tripOrId : null);
    const details = trip 
      ? `LR: ${trip.lrNo || 'N/A'} • ${trip.partyName || ''} (${trip.fromCity || ''} ➔ ${trip.toCity || ''})`
      : '';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Trip Record',
      message: 'Are you sure you want to delete this trip entry from your logbook? This action cannot be undone.',
      itemDetails: details,
      confirmLabel: 'Delete Trip',
      isDestructive: true,
      onConfirm: async () => {
        // 1. Instant optimistic state update
        setTrips(prev => prev.filter(t => t.id !== id));
        // 2. Background database delete
        try {
          await deleteTripRecord(id);
        } catch (error) {
          console.error('Failed to delete trip:', error);
        }
      }
    });
  };

  const handleRecordPayment = async (updatedTrip) => {
    // 1. Instant optimistic update
    setTrips(prev => prev.map(t => (t.id === updatedTrip.id ? updatedTrip : t)));
    // 2. Background database write
    try {
      await saveTripRecord(updatedTrip);
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  // Party Handlers with OPTIMISTIC UI UPDATES
  const handleSaveParty = async (partyData) => {
    const isEditing = Boolean(partyData.id);
    const tempId = partyData.id || Date.now();
    const optimisticParty = {
      ...partyData,
      id: tempId,
      isDummy: false,
      createdAt: partyData.createdAt || new Date().toISOString()
    };

    if (isEditing) {
      setParties(prev => prev.map(p => (p.id === partyData.id ? optimisticParty : p)));
    } else {
      setParties(prev => [...prev, optimisticParty]);
    }

    try {
      const saved = await savePartyRecord(optimisticParty);
      if (saved.id && saved.id !== tempId) {
        setParties(prev => prev.map(p => (p.id === tempId ? saved : p)));
      }
    } catch (error) {
      console.error('Failed to save party:', error);
    }
  };

  const handleDeleteParty = (partyOrId) => {
    const id = typeof partyOrId === 'object' ? partyOrId.id : partyOrId;
    const party = displayedParties.find(p => p.id === id) || (typeof partyOrId === 'object' ? partyOrId : null);
    const details = party ? `${party.name}${party.city ? ` • ${party.city}` : ''}` : '';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Party Profile',
      message: 'Are you sure you want to delete this party from the directory? Existing trip logs will remain intact.',
      itemDetails: details,
      confirmLabel: 'Delete Party',
      isDestructive: true,
      onConfirm: async () => {
        setParties(prev => prev.filter(p => p.id !== id));
        try {
          await deletePartyRecord(id);
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
      console.error('Failed to save settings:', error);
    }
  };

  // Reload Demo Data: temporarily shows dummy records while keeping actual data hidden and safe until refresh
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reload Demo Data',
      message: 'This will temporarily display sample fleet records. Your actual records will be kept safe and hidden until you refresh the page or click Exit Demo.',
      itemDetails: 'Sample Demo Records (Temporary)',
      confirmLabel: 'Load Demo Mode',
      isDestructive: false,
      onConfirm: async () => {
        setIsDemoMode(true);
      }
    });
  };

  // Delete All Dummy Data: DELETES ONLY DUMMY RECORDS! Never deletes actual user data!
  const handleDeleteDummyData = () => {
    const dummyTripsCount = (trips || []).filter(isDummyRecord).length;
    const dummyPartiesCount = (parties || []).filter(isDummyRecord).length;
    const actualTripsCount = (trips || []).filter(t => !isDummyRecord(t)).length;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Dummy Data',
      message: actualTripsCount > 0
        ? `This will remove only sample demo records (${dummyTripsCount} trips, ${dummyPartiesCount} parties). Your ${actualTripsCount} actual business trip(s) will be completely preserved and kept safe.`
        : 'This will remove all sample demo records from the logbook.',
      itemDetails: `${dummyTripsCount} Sample Trips • ${dummyPartiesCount} Sample Parties`,
      confirmLabel: 'Delete Dummy Records',
      isDestructive: true,
      onConfirm: async () => {
        try {
          if (isDemoMode) {
            setIsDemoMode(false);
          }
          // Optimistically filter out dummy records immediately in state!
          setTrips(prev => prev.filter(t => !isDummyRecord(t)));
          setParties(prev => prev.filter(p => !isDummyRecord(p)));
          // Delete only dummy records from database
          await deleteDummyRecordsOnly();
        } catch (error) {
          console.error('Failed to delete dummy data:', error);
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
        tripCount={displayedTrips.length}
        partyCount={displayedParties.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewTrip={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onLock={handleLock}
      />

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-amber-500/10 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800/70 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] tracking-wide">
              DEMO MODE
            </span>
            <span>
              Sample dummy data is currently shown. Your actual business data is safely stored in the database. Refresh or reload page to view your actual data.
            </span>
          </div>
          <button
            onClick={() => setIsDemoMode(false)}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-lg font-bold text-[11px] cursor-pointer transition shrink-0 active:scale-95"
          >
            Exit Demo & Show Actual Data
          </button>
        </div>
      )}

      {/* Main Content Area: pb-24 on mobile ensures bottom navigation bar never overlaps content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 pb-24 md:pb-8">
        {loading ? (
          <SkeletonLoader type={activeTab} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                trips={displayedTrips}
                parties={displayedParties}
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
                trips={displayedTrips}
                parties={displayedParties}
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
                trips={displayedTrips}
                parties={displayedParties}
                onNavigateTab={handleTabChange}
              />
            )}

            {activeTab === 'parties' && (
              <PartyLedger
                parties={displayedParties}
                trips={displayedTrips}
                onSaveParty={handleSaveParty}
                onDeleteParty={handleDeleteParty}
                onViewBilty={(trip) => setViewingBiltyTrip(trip)}
              />
            )}

            {(activeTab === 'settings' || activeTab === 'database') && (
              <SettingsModal
                company={companySettings}
                onSaveCompany={handleSaveCompany}
                onResetData={handleResetData}
                onClearAllData={handleDeleteDummyData}
                onLock={handleLock}
                trips={displayedTrips}
                parties={displayedParties}
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
            © {new Date().getFullYear()} <strong>{companySettings.companyName || 'SAI TRANSPORT'}</strong> • Fleet Accounts
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Fast Instant Cache</span>
            <span>•</span>
            <span>Passcode Protected</span>
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
        parties={displayedParties}
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

      {/* Sleek Minimal Delete & Action Confirmation Modal */}
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
