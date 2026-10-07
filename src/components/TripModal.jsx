import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Truck,
  Building2,
  UserPlus,
  MapPin,
  CreditCard,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  Package,
  Calendar,
  IndianRupee,
  Phone,
  Fuel,
  Receipt
} from 'lucide-react';

const VEHICLE_TYPES = [
  '14 Wheeler (Taurus)',
  '12 Wheeler (3118)',
  '10 Wheeler (2518)',
  '16 Wheeler (Multi-Axle)',
  '22 Wheeler Trailer',
  '32 Ft Multi-Axle Container',
  '20 Ft Container',
  'Open Body Truck',
  'Eicher / 6 Wheeler',
  'Tata 407 / Pickup'
];

const LEVEL_CONFIG = [
  {
    id: 1,
    title: 'Route & Dispatch',
    shortName: 'Route',
    badge: 'Stage 1',
    icon: MapPin,
    description: 'Set Bilty LR number, trip date, and travel corridor'
  },
  {
    id: 2,
    title: 'Transport Party',
    shortName: 'Party',
    badge: 'Stage 2',
    icon: Building2,
    description: 'Link transport party or register a new client'
  },
  {
    id: 3,
    title: 'Fleet & Pilot',
    shortName: 'Fleet',
    badge: 'Stage 3',
    icon: Truck,
    description: 'Assign truck registration, body type, and driver'
  },
  {
    id: 4,
    title: 'Cargo & Freight',
    shortName: 'Freight',
    badge: 'Stage 4',
    icon: CreditCard,
    description: 'Define cargo payload, freight billing, and accounts'
  }
];

export default function TripModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onSaveParty,
  editingTrip = null, 
  parties = [],
  nextLrNo = 'ST-1005'
}) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [savedTripSummary, setSavedTripSummary] = useState(null);

  const [formData, setFormData] = useState({
    lrNo: '',
    partyName: '',
    partyPhone: '',
    vehicleNo: '',
    vehicleType: '14 Wheeler (Taurus)',
    fromCity: '',
    toCity: '',
    date: new Date().toISOString().split('T')[0],
    material: '',
    weight: '',
    driverName: '',
    driverMobile: '',
    amount: '',
    advance: '0',
    balance: '0',
    paymentStatus: 'Pending',
    deliveryStatus: 'Booked',
    dieselExpense: '0',
    tollExpense: '0',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [partyMode, setPartyMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [quickSavedPartyMsg, setQuickSavedPartyMsg] = useState('');

  useEffect(() => {
    if (editingTrip) {
      setFormData({
        ...editingTrip,
        amount: String(editingTrip.amount || ''),
        advance: String(editingTrip.advance || '0'),
        balance: String(editingTrip.balance || '0'),
        dieselExpense: String(editingTrip.dieselExpense || '0'),
        tollExpense: String(editingTrip.tollExpense || '0'),
      });

      const matchedParty = parties.find(
        p => p.name.trim().toLowerCase() === (editingTrip.partyName || '').trim().toLowerCase()
      );
      if (matchedParty) {
        setPartyMode('existing');
        setSelectedPartyId(String(matchedParty.id || matchedParty.name));
      } else if (editingTrip.partyName) {
        setPartyMode('new');
        setSelectedPartyId('');
      } else {
        setPartyMode(parties.length > 0 ? 'existing' : 'new');
        setSelectedPartyId('');
      }
    } else {
      setFormData({
        lrNo: nextLrNo,
        partyName: '',
        partyPhone: '',
        vehicleNo: '',
        vehicleType: '14 Wheeler (Taurus)',
        fromCity: '',
        toCity: '',
        date: new Date().toISOString().split('T')[0],
        material: '',
        weight: '',
        driverName: '',
        driverMobile: '',
        amount: '',
        advance: '0',
        balance: '0',
        paymentStatus: 'Pending',
        deliveryStatus: 'Booked',
        dieselExpense: '0',
        tollExpense: '0',
        remarks: ''
      });
      setPartyMode(parties.length > 0 ? 'existing' : 'new');
      setSelectedPartyId('');
    }

    setCurrentLevel(1);
    setIsSuccessView(false);
    setSavedTripSummary(null);
    setErrors({});
    setQuickSavedPartyMsg('');
  }, [editingTrip, isOpen, nextLrNo, parties]);

  const sortedParties = useMemo(() => {
    return [...parties].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [parties]);

  const selectedPartyObj = useMemo(() => {
    if (!formData.partyName) return null;
    return parties.find(
      p => (selectedPartyId && String(p.id || p.name) === String(selectedPartyId)) ||
           p.name.trim().toLowerCase() === formData.partyName.trim().toLowerCase()
    );
  }, [parties, selectedPartyId, formData.partyName]);

  const duplicatePartyMatch = useMemo(() => {
    if (partyMode !== 'new' || !formData.partyName.trim()) return null;
    return parties.find(
      p => p.name.trim().toLowerCase() === formData.partyName.trim().toLowerCase()
    );
  }, [partyMode, formData.partyName, parties]);

  const isLevelCompleted = (lvl) => {
    switch (lvl) {
      case 1:
        return !!(formData.lrNo?.trim() && formData.date && formData.fromCity?.trim() && formData.toCity?.trim());
      case 2:
        return !!formData.partyName?.trim();
      case 3:
        return !!(formData.vehicleNo?.trim() && formData.driverName?.trim());
      case 4:
        return !!(formData.amount && parseFloat(formData.amount) > 0);
      default:
        return false;
    }
  };

  const completedLevelsCount = useMemo(() => {
    return [1, 2, 3, 4].filter(isLevelCompleted).length;
  }, [formData]);

  const progressPercentage = useMemo(() => {
    const basePercent = Math.round((currentLevel / 4) * 100);
    const completedPercent = Math.round((completedLevelsCount / 4) * 100);
    return Math.max(basePercent, completedPercent);
  }, [currentLevel, completedLevelsCount]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    const amtStr = e.target.value;
    const amt = parseFloat(amtStr) || 0;
    const adv = parseFloat(formData.advance) || 0;
    const bal = Math.max(0, amt - adv);

    let status = 'Pending';
    if (adv >= amt && amt > 0) status = 'Paid';
    else if (adv > 0 && adv < amt) status = 'Partial';

    setFormData(prev => ({
      ...prev,
      amount: amtStr,
      balance: String(bal),
      paymentStatus: status
    }));
  };

  const handleAdvanceChange = (e) => {
    const advStr = e.target.value;
    const adv = parseFloat(advStr) || 0;
    const amt = parseFloat(formData.amount) || 0;
    const bal = Math.max(0, amt - adv);

    let status = 'Pending';
    if (adv >= amt && amt > 0) status = 'Paid';
    else if (adv > 0 && adv < amt) status = 'Partial';

    setFormData(prev => ({
      ...prev,
      advance: advStr,
      balance: String(bal),
      paymentStatus: status
    }));
  };

  const handleExistingPartyChange = (e) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setPartyMode('new');
      setSelectedPartyId('');
      setFormData(prev => ({
        ...prev,
        partyName: '',
        partyPhone: ''
      }));
      return;
    }

    setSelectedPartyId(val);
    if (!val) {
      setFormData(prev => ({
        ...prev,
        partyName: '',
        partyPhone: ''
      }));
      return;
    }

    const found = parties.find(p => String(p.id || p.name) === val || p.name === val);
    if (found) {
      setFormData(prev => ({
        ...prev,
        partyName: found.name,
        partyPhone: found.phone || '',
        toCity: (!prev.toCity && found.city) ? found.city : prev.toCity
      }));
      if (errors.partyName) {
        setErrors(prev => ({ ...prev, partyName: null }));
      }
    }
  };

  const handleNewPartyNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      partyName: name
    }));
    if (errors.partyName) {
      setErrors(prev => ({ ...prev, partyName: null }));
    }
  };

  const handleQuickSaveParty = async () => {
    if (!formData.partyName.trim()) {
      setErrors(prev => ({ ...prev, partyName: 'Party name required' }));
      return;
    }
    if (onSaveParty) {
      try {
        await onSaveParty({
          name: formData.partyName.trim(),
          phone: formData.partyPhone.trim(),
          city: formData.toCity.trim() || ''
        });
        setQuickSavedPartyMsg('Party saved to ledger!');
        setTimeout(() => setQuickSavedPartyMsg(''), 3000);
      } catch (err) {
        console.error('Failed to quick save party:', err);
      }
    }
  };

  const handleNextLevel = () => {
    const newErrors = {};

    if (currentLevel === 1) {
      if (!formData.fromCity?.trim()) newErrors.fromCity = 'Origin location required';
      if (!formData.toCity?.trim()) newErrors.toCity = 'Destination required';
      if (!formData.date) newErrors.date = 'Trip date required';
    } else if (currentLevel === 2) {
      if (!formData.partyName?.trim()) newErrors.partyName = 'Party name required';
    } else if (currentLevel === 3) {
      if (!formData.vehicleNo?.trim()) newErrors.vehicleNo = 'Vehicle number required';
      if (!formData.driverName?.trim()) newErrors.driverName = 'Driver name required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    setErrors({});
    if (currentLevel < 4) {
      setCurrentLevel(prev => prev + 1);
    }
  };

  const handlePrevLevel = () => {
    setErrors({});
    if (currentLevel > 1) {
      setCurrentLevel(prev => prev - 1);
    }
  };

  const handleSelectLevel = (lvlNum) => {
    setErrors({});
    setCurrentLevel(lvlNum);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fromCity?.trim()) newErrors.fromCity = 'Origin location required';
    if (!formData.toCity?.trim()) newErrors.toCity = 'Destination required';
    if (!formData.partyName?.trim()) newErrors.partyName = 'Party name required';
    if (!formData.vehicleNo?.trim()) newErrors.vehicleNo = 'Vehicle number required';
    if (!formData.driverName?.trim()) newErrors.driverName = 'Driver name required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Freight amount required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto-jump to earliest level with missing required field
      if (newErrors.fromCity || newErrors.toCity) {
        setCurrentLevel(1);
      } else if (newErrors.partyName) {
        setCurrentLevel(2);
      } else if (newErrors.vehicleNo || newErrors.driverName) {
        setCurrentLevel(3);
      } else if (newErrors.amount) {
        setCurrentLevel(4);
      }
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      advance: parseFloat(formData.advance) || 0,
      balance: parseFloat(formData.balance) || 0,
      dieselExpense: parseFloat(formData.dieselExpense) || 0,
      tollExpense: parseFloat(formData.tollExpense) || 0,
      vehicleNo: formData.vehicleNo.toUpperCase().trim(),
    };

    onSave(payload);
    setSavedTripSummary(payload);
    setIsSuccessView(true);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch (confettiErr) {
      console.warn('Confetti animation:', confettiErr);
    }
  };

  const activeLevelConfig = LEVEL_CONFIG[currentLevel - 1];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 box-border">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-6 box-border transition-all">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>{editingTrip ? 'Edit Truck Entry' : 'New Truck Entry'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Interactive Workflow
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Step-by-step dispatch & accounts logger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl cursor-pointer transition active:scale-95"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Celebration Success Screen */}
        {isSuccessView ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500/30 animate-bounce shadow-lg">
                <Trophy className="w-10 h-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MISSION ACCOMPLISHED</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {editingTrip ? 'Truck Entry Updated!' : 'Truck Entry Logged Successfully!'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                All 4 stages completed. Fleet log, driver details, and freight accounts are synchronized.
              </p>
            </div>

            {/* Receipt Summary Card */}
            {savedTripSummary && (
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                    {savedTripSummary.lrNo || 'Bilty'}
                  </span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {savedTripSummary.vehicleNo}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Route</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {savedTripSummary.fromCity} ➔ {savedTripSummary.toCity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Party</span>
                  <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">
                    {savedTripSummary.partyName}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Total Freight</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">
                    ₹{Number(savedTripSummary.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessView(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                Done & Close
              </button>

              {!editingTrip && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessView(false);
                    setCurrentLevel(1);
                    setFormData({
                      lrNo: nextLrNo,
                      partyName: '',
                      partyPhone: '',
                      vehicleNo: '',
                      vehicleType: '14 Wheeler (Taurus)',
                      fromCity: '',
                      toCity: '',
                      date: new Date().toISOString().split('T')[0],
                      material: '',
                      weight: '',
                      driverName: '',
                      driverMobile: '',
                      amount: '',
                      advance: '0',
                      balance: '0',
                      paymentStatus: 'Pending',
                      deliveryStatus: 'Booked',
                      dieselExpense: '0',
                      tollExpense: '0',
                      remarks: ''
                    });
                    setErrors({});
                  }}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-sm transition cursor-pointer active:scale-95"
                >
                  + Log Another Entry
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Gamified Level Stepper & Progress Graph */}
            <div className="px-4 sm:px-6 pt-3.5 pb-3 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5">
              {/* Top Progress Info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs">
                    LEVEL {currentLevel} OF 4
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {activeLevelConfig.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{progressPercentage}% Completed</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Interactive Clickable Step Graph (Nodes & Quick Jump) */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {LEVEL_CONFIG.map((lvl) => {
                  const isCompleted = isLevelCompleted(lvl.id);
                  const isCurrent = currentLevel === lvl.id;
                  const Icon = lvl.icon;

                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleSelectLevel(lvl.id)}
                      className={`flex flex-col items-center p-2 rounded-xl transition cursor-pointer text-center group ${
                        isCurrent
                          ? 'bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 hover:bg-emerald-100/60'
                          : 'bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                      }`}
                      title={`Jump to ${lvl.title}`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : lvl.id}
                        </div>
                        <Icon className={`w-3.5 h-3.5 hidden sm:block ${
                          isCurrent ? 'text-zinc-900 dark:text-white' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                        }`} />
                      </div>
                      <span className={`text-[11px] font-semibold mt-1 truncate max-w-full ${
                        isCurrent 
                          ? 'text-zinc-900 dark:text-white font-bold' 
                          : isCompleted
                          ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {lvl.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Form Content */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full box-border text-xs sm:text-sm">
              
              {/* Level 1: Route & Dispatch Initializer */}
              {currentLevel === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                          Stage 1: Travel Corridor & Schedule
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Set the origin, destination, and booking timing
                        </span>
                      </div>
                    </div>
                    {isLevelCompleted(1) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Ready ✓
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Bilty / LR No.
                      </label>
                      <input
                        type="text"
                        value={formData.lrNo}
                        onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })}
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Trip Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                        required
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Trip Status
                      </label>
                      <select
                        value={formData.deliveryStatus}
                        onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value })}
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer"
                      >
                        <option value="Booked">Booked</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        From (Origin Location) *
                      </label>
                      <input
                        type="text"
                        value={formData.fromCity}
                        onChange={(e) => {
                          setFormData({ ...formData, fromCity: e.target.value });
                          if (errors.fromCity) setErrors(prev => ({ ...prev, fromCity: null }));
                        }}
                        placeholder="e.g. Pune / Mumbai"
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                          errors.fromCity ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                        required
                        autoFocus
                      />
                      {errors.fromCity && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.fromCity}</span>}
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        To (Destination Location) *
                      </label>
                      <input
                        type="text"
                        value={formData.toCity}
                        onChange={(e) => {
                          setFormData({ ...formData, toCity: e.target.value });
                          if (errors.toCity) setErrors(prev => ({ ...prev, toCity: null }));
                        }}
                        placeholder="e.g. Surat / Ahmedabad"
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                          errors.toCity ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                        required
                      />
                      {errors.toCity && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.toCity}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Level 2: Transport Party (Existing vs New) */}
              {currentLevel === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 w-full box-border">
                    {/* Header & Mode Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                            Stage 2: Client & Consignor
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Choose an existing registered party or add a new one
                          </span>
                        </div>
                      </div>

                      {/* Segmented Mode Toggle */}
                      <div className="inline-flex p-0.5 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-lg text-xs font-medium self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setPartyMode('existing')}
                          className={`px-3 py-1.5 sm:py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                            partyMode === 'existing'
                              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Choose Existing ({parties.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartyMode('new');
                            setSelectedPartyId('');
                          }}
                          className={`px-3 py-1.5 sm:py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                            partyMode === 'new'
                              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          + Add New Party
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: Choose Existing Party */}
                    {partyMode === 'existing' ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          <div className="min-w-0">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                              Select Registered Party *
                            </label>
                            <select
                              value={selectedPartyId}
                              onChange={handleExistingPartyChange}
                              className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer ${
                                errors.partyName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                              }`}
                            >
                              <option value="">-- Choose from existing parties --</option>
                              {sortedParties.map(p => (
                                <option key={p.id || p.name} value={String(p.id || p.name)}>
                                  {p.name} {p.city ? `• ${p.city}` : ''} {p.phone ? `(${p.phone})` : ''}
                                </option>
                              ))}
                              <option value="__ADD_NEW__">➕ Add New Party Instead...</option>
                            </select>
                            {errors.partyName && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.partyName}</span>}
                          </div>

                          <div className="min-w-0">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                              Party Phone / Mobile
                            </label>
                            <input
                              type="tel"
                              value={formData.partyPhone}
                              onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                              placeholder="e.g. 9822012345"
                              className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                            />
                          </div>
                        </div>

                        {/* Selected Party Info & Quick Actions */}
                        {selectedPartyObj ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-zinc-900 dark:text-white">{selectedPartyObj.name}</span>
                              {selectedPartyObj.city && <span>• {selectedPartyObj.city}</span>}
                              {selectedPartyObj.phone && <span>• {selectedPartyObj.phone}</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPartyMode('new');
                                setSelectedPartyId('');
                                setFormData(prev => ({ ...prev, partyName: '', partyPhone: '' }));
                              }}
                              className="text-xs font-semibold text-zinc-900 dark:text-white underline hover:opacity-80 cursor-pointer"
                            >
                              Change to new party
                            </button>
                          </div>
                        ) : parties.length === 0 ? (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 p-2.5 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between flex-wrap gap-2">
                            <span>No existing parties saved in ledger yet.</span>
                            <button
                              type="button"
                              onClick={() => setPartyMode('new')}
                              className="font-bold text-zinc-900 dark:text-white underline cursor-pointer"
                            >
                              + Create New Party
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      /* Mode 2: Add New Party */
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          <div className="min-w-0">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                              New Party Name *
                            </label>
                            <input
                              type="text"
                              value={formData.partyName}
                              onChange={handleNewPartyNameChange}
                              placeholder="e.g. Radhe Krishna Logistics"
                              className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                                errors.partyName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                              }`}
                              required
                              autoFocus
                            />
                            {errors.partyName && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.partyName}</span>}
                          </div>

                          <div className="min-w-0">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                              Party Phone / Mobile
                            </label>
                            <input
                              type="tel"
                              value={formData.partyPhone}
                              onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                              placeholder="e.g. 9822012345"
                              className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                            />
                          </div>
                        </div>

                        {/* Duplicate Party Warning */}
                        {duplicatePartyMatch && (
                          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between flex-wrap gap-2">
                            <span>"{duplicatePartyMatch.name}" is already in your Party Ledger.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPartyMode('existing');
                                setSelectedPartyId(String(duplicatePartyMatch.id || duplicatePartyMatch.name));
                                setFormData(prev => ({
                                  ...prev,
                                  partyName: duplicatePartyMatch.name,
                                  partyPhone: duplicatePartyMatch.phone || prev.partyPhone
                                }));
                              }}
                              className="font-bold underline cursor-pointer"
                            >
                              Use Existing Party
                            </button>
                          </div>
                        )}

                        {/* Info & Helper actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Auto-saved to Party Ledger on submission
                            </span>
                            {quickSavedPartyMsg && (
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                                {quickSavedPartyMsg}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {onSaveParty && formData.partyName.trim() && !duplicatePartyMatch && (
                              <button
                                type="button"
                                onClick={handleQuickSaveParty}
                                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg cursor-pointer transition active:scale-95"
                              >
                                + Save to Ledger Now
                              </button>
                            )}
                            {parties.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setPartyMode('existing')}
                                className="text-xs font-semibold text-zinc-900 dark:text-white underline hover:opacity-80 cursor-pointer"
                              >
                                ← Choose from existing ({parties.length})
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Level 3: Fleet & Pilot (Truck & Driver) */}
              {currentLevel === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                          Stage 3: Fleet Assignment & Driver Pilot
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Assign truck registration, body type, and driver mobile
                        </span>
                      </div>
                    </div>
                    {isLevelCompleted(3) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Ready ✓
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Vehicle No. (Truck No) *
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNo}
                        onChange={(e) => {
                          setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() });
                          if (errors.vehicleNo) setErrors(prev => ({ ...prev, vehicleNo: null }));
                        }}
                        placeholder="e.g. MH 12 RN 8845"
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl font-mono uppercase font-bold text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                          errors.vehicleNo ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                        required
                        autoFocus
                      />
                      {errors.vehicleNo && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.vehicleNo}</span>}
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Vehicle Configuration
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer"
                      >
                        {VEHICLE_TYPES.map(vt => (
                          <option key={vt} value={vt}>{vt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        value={formData.driverName}
                        onChange={(e) => {
                          setFormData({ ...formData, driverName: e.target.value });
                          if (errors.driverName) setErrors(prev => ({ ...prev, driverName: null }));
                        }}
                        placeholder="e.g. Rameshwar Yadav"
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                          errors.driverName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                        required
                      />
                      {errors.driverName && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.driverName}</span>}
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Driver Mobile / Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.driverMobile}
                        onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                        placeholder="e.g. 9821456789"
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Level 4: Cargo & Financial Clearance */}
              {currentLevel === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                          Stage 4: Payload & Freight Accounts
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Lock freight rate, advances, balance, and operational expenses
                        </span>
                      </div>
                    </div>
                    {isLevelCompleted(4) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Ready ✓
                      </span>
                    )}
                  </div>

                  {/* Cargo Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Material / Cargo Description
                      </label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        placeholder="e.g. Steel / Cement / Pipes"
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                        autoFocus
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Weight / Quantity
                      </label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="e.g. 24 MT or 500 Bags"
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>
                  </div>

                  {/* Freight & Financial Accounts Box */}
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 w-full min-w-0 box-border">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Total Freight (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formData.amount}
                          onChange={handleAmountChange}
                          placeholder="0"
                          className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border rounded-xl font-bold text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                            errors.amount ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-700'
                          }`}
                          required
                        />
                        {errors.amount && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.amount}</span>}
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Advance Paid (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formData.advance}
                          onChange={handleAdvanceChange}
                          placeholder="0"
                          className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                        />
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Balance Due (₹)
                        </label>
                        <input
                          type="text"
                          value={formData.balance}
                          readOnly
                          className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm box-border ${
                            parseFloat(formData.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Payment Status
                        </label>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                          className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-semibold text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Partial">Partial</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                    </div>

                    {/* Operational Expenses (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
                      <div className="min-w-0">
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Diesel Expense (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formData.dieselExpense}
                          onChange={(e) => setFormData({ ...formData, dieselExpense: e.target.value })}
                          placeholder="0"
                          className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs box-border"
                        />
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Toll / Fastag Expense (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formData.tollExpense}
                          onChange={(e) => setFormData({ ...formData, tollExpense: e.target.value })}
                          placeholder="0"
                          className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs box-border"
                        />
                      </div>
                    </div>

                    <div className="min-w-0 pt-1">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Remarks / POD Instructions
                      </label>
                      <textarea
                        rows="2"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Optional delivery notes or instructions..."
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Bottom Level Navigation Bar */}
              <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {/* Back / Cancel Button */}
                {currentLevel === 1 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-sm sm:text-xs font-semibold cursor-pointer active:scale-95 transition"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrevLevel}
                    className="px-4 py-2.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm sm:text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back ({LEVEL_CONFIG[currentLevel - 2].shortName})</span>
                  </button>
                )}

                {/* Right Action: Next Level or Final Complete */}
                <div className="flex items-center gap-2">
                  {currentLevel < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextLevel}
                      className="px-5 py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <span>Continue to {LEVEL_CONFIG[currentLevel].shortName}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm sm:text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{editingTrip ? 'Save Changes' : 'Complete Entry 🎉'}</span>
                    </button>
                  )}
                </div>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
