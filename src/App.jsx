import React, { useState, useEffect, useCallback } from 'react';
import { 
  db, 
  seedDatabaseIfEmpty, 
  backupToLocalStorage, 
  INITIAL_TRIPS, 
  INITIAL_PARTIES, 
  DEFAULT_COMPANY_SETTINGS 
} from './db';
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
    return tab === 'dashboard' ? '/' : `/${tab}`;
  }
};

export default function App() {
  // Theme State (Default: light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sai_transport_theme') || 'light';
  });

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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      localStorage.getItem('sai_transport_auth') === 'true' ||
      sessionStorage.getItem('sai_transport_auth') === 'true'
    );
  });

  // Navigation State using actual page path routes (/trips, /analytics, /parties, etc.)
  const [activeTab, setActiveTab] = useState(() => {
    const pathTab = getTabFromPath();
    if (pathTab) return pathTab;

    try {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_TABS.includes(hash)) return hash;
    } catch {}

    try {
      const saved = localStorage.getItem('sai_transport_active_tab');
      if (saved && VALID_TABS.includes(saved)) return saved;
    } catch {}

    return 'dashboard';
  });

  // Navigate to tab updating URL pathname
  const handleTabChange = useCallback((tab) => {
    if (!VALID_TABS.includes(tab)) return;
    const targetPath = getPathForTab(tab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setActiveTab(tab);
    try {
      localStorage.setItem('sai_transport_active_tab', tab);
    } catch {}
  }, []);

  // Listen to popstate (Browser Back / Forward) and synchronize path
  useEffect(() => {
    if (window.location.hash) {
      const hashClean = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_TABS.includes(hashClean)) {
        window.history.replaceState(null, '', getPathForTab(hashClean));
      }
    } else {
      const expectedPath = getPathForTab(activeTab);
      if (window.location.pathname !== expectedPath && activeTab !== 'dashboard') {
        window.history.replaceState(null, '', expectedPath);
      }
    }

    const handlePopState = () => {
      const tab = getTabFromPath();
      if (tab) {
        setActiveTab(tab);
        try {
          localStorage.setItem('sai_transport_active_tab', tab);
        } catch {}
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  // Sleek confirmation modal state for all deletions/resets
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

  // Modals (all closed by default)
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [viewingBiltyTrip, setViewingBiltyTrip] = useState(null);
  const [paymentModalTrip, setPaymentModalTrip] = useState(null);

  // Load Database Data
  const loadDatabaseData = useCallback(async () => {
    try {
      await seedDatabaseIfEmpty();
      
      // Smooth initial loading delay to show skeleton cards
      await new Promise(r => setTimeout(r, 500));
      
      const loadedTrips = await db.trips.toArray();
      const loadedParties = await db.parties.toArray();
      const loadedSettings = await db.settings.toArray();

      const settingsMap = { ...DEFAULT_COMPANY_SETTINGS };
      loadedSettings.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      setTrips(loadedTrips);
      setParties(loadedParties);
      setCompanySettings(settingsMap);
    } catch (error) {
      console.error('Failed to load database:', error);
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

  // Trip Handlers
  const handleSaveTrip = async (tripData) => {
    try {
      if (tripData.id) {
        const updated = {
          ...tripData,
          updatedAt: new Date().toISOString()
        };
        await db.trips.put(updated);
        setTrips(prev => prev.map(t => (t.id === tripData.id ? updated : t)));
      } else {
        const newTrip = {
          ...tripData,
          createdAt: new Date().toISOString()
        };
        const id = await db.trips.add(newTrip);
        const created = { ...newTrip, id };
        setTrips(prev => [created, ...prev]);
      }

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
          const pId = await db.parties.add(newParty);
          setParties(prev => [...prev, { ...newParty, id: pId }]);
        }
      }

      await backupToLocalStorage();
    } catch (error) {
      console.error('Failed to save trip:', error);
      alert('Error saving trip: ' + error.message);
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
      message: 'Are you sure you want to delete this trip entry from your logbook? This action cannot be undone.',
      itemDetails: details,
      confirmLabel: 'Delete Trip',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await db.trips.delete(id);
          setTrips(prev => prev.filter(t => t.id !== id));
          await backupToLocalStorage();
        } catch (error) {
          console.error('Failed to delete trip:', error);
        }
      }
    });
  };

  const handleRecordPayment = async (updatedTrip) => {
    try {
      await db.trips.put(updatedTrip);
      setTrips(prev => prev.map(t => (t.id === updatedTrip.id ? updatedTrip : t)));
      await backupToLocalStorage();
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  // Party Handlers
  const handleSaveParty = async (partyData) => {
    try {
      if (partyData.id) {
        await db.parties.put(partyData);
        setParties(prev => prev.map(p => (p.id === partyData.id ? partyData : p)));
      } else {
        const newParty = {
          ...partyData,
          createdAt: new Date().toISOString()
        };
        const id = await db.parties.add(newParty);
        setParties(prev => [...prev, { ...newParty, id }]);
      }
      await backupToLocalStorage();
    } catch (error) {
      console.error('Failed to save party:', error);
    }
  };

  const handleDeleteParty = (partyOrId) => {
    const id = typeof partyOrId === 'object' ? partyOrId.id : partyOrId;
    const party = parties.find(p => p.id === id) || (typeof partyOrId === 'object' ? partyOrId : null);
    const details = party ? `${party.name}${party.city ? ` • ${party.city}` : ''}` : '';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Party Profile',
      message: 'Are you sure you want to delete this party from the directory? Existing trip logs will remain intact.',
      itemDetails: details,
      confirmLabel: 'Delete Party',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await db.parties.delete(id);
          setParties(prev => prev.filter(p => p.id !== id));
          await backupToLocalStorage();
        } catch (error) {
          console.error('Failed to delete party:', error);
        }
      }
    });
  };

  // Settings Handlers
  const handleSaveCompany = async (newSettings) => {
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        await db.settings.put({ key, value });
      }
      setCompanySettings(newSettings);
      await backupToLocalStorage();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Load Demo Records',
      message: 'This will seed sample truck entries and parties into the system for demonstration.',
      itemDetails: 'Sample Fleet Records',
      confirmLabel: 'Load Demo',
      isDestructive: false,
      onConfirm: async () => {
        try {
          await db.trips.bulkAdd(INITIAL_TRIPS);
          await db.parties.bulkAdd(INITIAL_PARTIES);
          await loadDatabaseData();
        } catch (error) {
          console.error('Failed to reset demo data:', error);
        }
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Wipe All Data',
      message: 'Are you sure you want to wipe all records? This permanently clears all trips and parties from the local database.',
      itemDetails: `${trips.length} Trips • ${parties.length} Parties`,
      confirmLabel: 'Wipe Everything',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await db.trips.clear();
          await db.parties.clear();
          setTrips([]);
          setParties([]);
          await backupToLocalStorage();
        } catch (error) {
          console.error('Failed to clear database:', error);
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

      {/* Main Content Area: pb-24 on mobile ensures bottom navigation bar never overlaps content */}
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
                onResetData={handleResetData}
                onClearAllData={handleClearAllData}
                onLock={handleLock}
                trips={trips}
                parties={parties}
                onDatabaseRestored={loadDatabaseData}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Minimal Footer (Hidden on mobile where bottom nav is active) */}
      <footer className="hidden md:block no-print border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-3.5 text-center text-xs text-zinc-400 dark:text-zinc-500 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            © {new Date().getFullYear()} <strong>{companySettings.companyName || 'SAI TRANSPORT'}</strong> • Fleet Accounts
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Safe Local Storage</span>
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
