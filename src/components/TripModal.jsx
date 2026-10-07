import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Truck, 
  Building2, 
  UserPlus, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw 
} from 'lucide-react';
import { generateUniqueLrId } from '../utils/lrGenerator';

const VEHICLE_TYPES = [
  '14 Wheeler',
  '12 Wheeler',
  '10 Wheeler',
  '16 Wheeler',
  '18 Wheeler',
  '22 Wheeler',
  '6 Wheeler',
  '4 Wheeler'
];

const STEPS = [
  { id: 1, label: 'Route' },
  { id: 2, label: 'Party' },
  { id: 3, label: 'Truck & Driver' },
  { id: 4, label: 'Freight' }
];

const normalizeVehicleType = (val) => {
  if (!val) return '14 Wheeler';
  // Strip parentheses and anything inside: "14 Wheeler (Taurus)" -> "14 Wheeler"
  const cleaned = val.replace(/\s*\(.*?\)/g, '').trim();
  if (VEHICLE_TYPES.includes(cleaned)) return cleaned;
  if (VEHICLE_TYPES.includes(val)) return val;
  const match = val.match(/(\d+\s*Wheeler)/i);
  if (match) {
    const formatted = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    if (VEHICLE_TYPES.includes(formatted)) return formatted;
  }
  return cleaned || '14 Wheeler';
};

export default function TripModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onSaveParty: _onSaveParty,
  editingTrip = null, 
  parties = [], 
  trips = [],
  nextLrNo = ''
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [savedTripSummary, setSavedTripSummary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const prevIsOpenRef = useRef(false);
  const prevEditingIdRef = useRef(null);

  const [formData, setFormData] = useState({
    lrNo: '',
    partyName: '',
    partyPhone: '',
    vehicleNo: '',
    vehicleType: '14 Wheeler',
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
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [partyMode, setPartyMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPartyId, setSelectedPartyId] = useState('');

  // Only initialize/reset when modal transitions from closed to open, or when editing target changes
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      prevEditingIdRef.current = null;
      setIsSuccessView(false);
      setSavedTripSummary(null);
      setCurrentStep(1);
      setErrors({});
      setIsSaving(false);
      return;
    }

    const justOpened = !prevIsOpenRef.current;
    const currentEditId = editingTrip ? (editingTrip.id || '__editing__') : null;
    const editingTargetChanged = currentEditId !== prevEditingIdRef.current;

    if (justOpened || editingTargetChanged) {
      prevIsOpenRef.current = true;
      prevEditingIdRef.current = currentEditId;

      if (editingTrip) {
        setFormData({
          ...editingTrip,
          vehicleType: normalizeVehicleType(editingTrip.vehicleType),
          amount: String(editingTrip.amount || ''),
          advance: String(editingTrip.advance || '0'),
          balance: String(editingTrip.balance || '0'),
          remarks: editingTrip.remarks || ''
        });

        const matchedParty = parties.find(
          p => p.name?.trim().toLowerCase() === (editingTrip.partyName || '').trim().toLowerCase()
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
          lrNo: nextLrNo || generateUniqueLrId(trips),
          partyName: '',
          partyPhone: '',
          vehicleNo: '',
          vehicleType: '14 Wheeler',
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
          remarks: ''
        });
        setPartyMode(parties.length > 0 ? 'existing' : 'new');
        setSelectedPartyId('');
      }

      setCurrentStep(1);
      setIsSuccessView(false);
      setSavedTripSummary(null);
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, editingTrip]);

  const sortedParties = useMemo(() => {
    return [...parties].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [parties]);

  const duplicatePartyMatch = useMemo(() => {
    if (partyMode !== 'new' || !formData.partyName.trim()) return null;
    return parties.find(
      p => p.name.trim().toLowerCase() === formData.partyName.trim().toLowerCase()
    );
  }, [partyMode, formData.partyName, parties]);

  const isStepCompleted = (stepId) => {
    switch (stepId) {
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

  const handleNextStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      const enteredLr = (formData.lrNo || '').toUpperCase().trim();
      if (!enteredLr) {
        newErrors.lrNo = 'LR / Bilty ID required';
      } else {
        const isDuplicate = (trips || []).some(
          t => t && t.lrNo && t.lrNo.toUpperCase().trim() === enteredLr && (!editingTrip || t.id !== editingTrip.id)
        );
        if (isDuplicate) {
          newErrors.lrNo = `LR ID "${enteredLr}" already exists. Please use a unique ID.`;
        }
      }
      if (!formData.fromCity?.trim()) newErrors.fromCity = 'Origin location required';
      if (!formData.toCity?.trim()) newErrors.toCity = 'Destination required';
      if (!formData.date) newErrors.date = 'Trip date required';
    } else if (currentStep === 2) {
      if (!formData.partyName?.trim()) newErrors.partyName = 'Party name required';
    } else if (currentStep === 3) {
      if (!formData.vehicleNo?.trim()) newErrors.vehicleNo = 'Vehicle number required';
      if (!formData.driverName?.trim()) newErrors.driverName = 'Driver name required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    setErrors({});
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelectStep = (stepId) => {
    setErrors({});
    setCurrentStep(stepId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const newErrors = {};

    const enteredLr = (formData.lrNo || '').toUpperCase().trim();
    if (!enteredLr) {
      newErrors.lrNo = 'LR / Bilty ID required';
    } else {
      const isDuplicate = (trips || []).some(
        t => t && t.lrNo && t.lrNo.toUpperCase().trim() === enteredLr && (!editingTrip || t.id !== editingTrip.id)
      );
      if (isDuplicate) {
        newErrors.lrNo = `LR ID "${enteredLr}" already exists. Please use a unique ID.`;
      }
    }

    if (!formData.fromCity?.trim()) newErrors.fromCity = 'Origin location required';
    if (!formData.toCity?.trim()) newErrors.toCity = 'Destination required';
    if (!formData.partyName?.trim()) newErrors.partyName = 'Party name required';
    if (!formData.vehicleNo?.trim()) newErrors.vehicleNo = 'Vehicle number required';
    if (!formData.driverName?.trim()) newErrors.driverName = 'Driver name required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Freight amount required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.lrNo || newErrors.fromCity || newErrors.toCity) setCurrentStep(1);
      else if (newErrors.partyName) setCurrentStep(2);
      else if (newErrors.vehicleNo || newErrors.driverName) setCurrentStep(3);
      else if (newErrors.amount) setCurrentStep(4);
      return;
    }

    const payload = {
      ...formData,
      lrNo: enteredLr,
      amount: parseFloat(formData.amount) || 0,
      advance: parseFloat(formData.advance) || 0,
      balance: parseFloat(formData.balance) || 0,
      vehicleNo: formData.vehicleNo.toUpperCase().trim()
    };

    // Preserve existing expense values only if editing an older trip record
    if (editingTrip && editingTrip.dieselExpense !== undefined) {
      payload.dieselExpense = Number(editingTrip.dieselExpense) || 0;
    }
    if (editingTrip && editingTrip.tollExpense !== undefined) {
      payload.tollExpense = Number(editingTrip.tollExpense) || 0;
    }

    try {
      setIsSaving(true);
      const saved = await onSave(payload);
      setSavedTripSummary(saved || payload);
      setIsSuccessView(true);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (confettiErr) {
        console.warn('Confetti animation:', confettiErr);
      }
    } catch (saveErr) {
      console.error('Save failed:', saveErr);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 box-border">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-auto box-border transition-all">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-tight">
                {isSuccessView 
                  ? (editingTrip ? 'Entry Updated' : 'Entry Saved')
                  : (editingTrip ? 'Edit Truck Entry' : 'New Truck Entry')}
              </h3>
              {isSuccessView ? (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved to Register
                </span>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Step {currentStep} of 4</p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setIsSuccessView(false);
              setSavedTripSummary(null);
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-lg cursor-pointer transition active:scale-95"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Celebration / Success View */}
        {isSuccessView ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {editingTrip ? 'Entry Updated Successfully!' : 'Truck Entry Saved!'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {editingTrip ? 'Trip details have been updated in the cloud register.' : 'The trip record has been added to the register.'}
              </p>
            </div>

            {/* Summary Card */}
            {savedTripSummary && (
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 max-w-sm mx-auto text-left space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {savedTripSummary.lrNo || 'Bilty'}
                  </span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {savedTripSummary.vehicleNo}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Route</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {savedTripSummary.fromCity} ➔ {savedTripSummary.toCity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Party</span>
                  <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[180px]">
                    {savedTripSummary.partyName}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">Total Freight</span>
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
                  setSavedTripSummary(null);
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
                    setSavedTripSummary(null);
                    setCurrentStep(1);
                    setFormData({
                      lrNo: generateUniqueLrId(trips),
                      partyName: '',
                      partyPhone: '',
                      vehicleNo: '',
                      vehicleType: '14 Wheeler',
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
                      remarks: ''
                    });
                    setPartyMode(parties.length > 0 ? 'existing' : 'new');
                    setSelectedPartyId('');
                    setErrors({});
                  }}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-sm transition cursor-pointer active:scale-95"
                >
                  + Add Another
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Clean 4-Step Tab Navigation */}
            <div className="px-3 sm:px-6 pt-3 pb-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {STEPS.map((step) => {
                  const isCompleted = isStepCompleted(step.id);
                  const isCurrent = currentStep === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleSelectStep(step.id)}
                      className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
                        isCurrent
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60'
                      }`}
                    >
                      <span className={`w-4 h-4 shrink-0 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isCurrent
                          ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.id}
                      </span>
                      <span className="text-[11px] sm:text-xs truncate font-medium">
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto overflow-x-hidden w-full max-w-full box-border text-xs sm:text-sm">
              
              {/* Step 1: Route */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Bilty / LR ID *
                        </label>
                        {!editingTrip && (
                          <button
                            type="button"
                            onClick={() => {
                              const newId = generateUniqueLrId(trips);
                              setFormData(prev => ({ ...prev, lrNo: newId }));
                              if (errors.lrNo) setErrors(prev => ({ ...prev, lrNo: null }));
                            }}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Generate a new random 6-char unique LR ID"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>New ID</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.lrNo}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setFormData({ ...formData, lrNo: val });
                          if (errors.lrNo) setErrors(prev => ({ ...prev, lrNo: null }));
                        }}
                        placeholder="e.g. 7B4K9M"
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border ${
                          errors.lrNo ? 'border-rose-500 focus:ring-rose-500' : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white'
                        } rounded-xl font-mono font-bold text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 box-border tracking-wider uppercase`}
                        required
                      />
                      {errors.lrNo && (
                        <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.lrNo}</p>
                      )}
                    </div>

                    {/* Trip Date with Mobile Overflow Fix */}
                    <div className="w-full min-w-0 max-w-full overflow-hidden">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Trip Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full block min-w-0 max-w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                        style={{ maxWidth: '100%', minWidth: 0, width: '100%' }}
                        required
                      />
                    </div>

                    <div className="w-full min-w-0">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        From (Origin) *
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
                      />
                      {errors.fromCity && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.fromCity}</span>}
                    </div>

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        To (Destination) *
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

              {/* Step 2: Party */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Segmented Mode Toggle */}
                  <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-medium w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setPartyMode('existing')}
                      className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                      className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        partyMode === 'new'
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      + Add New Party
                    </button>
                  </div>

                  {partyMode === 'existing' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                      <div className="w-full min-w-0">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Select Party *
                        </label>
                        <select
                          value={selectedPartyId}
                          onChange={handleExistingPartyChange}
                          className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer ${
                            errors.partyName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <option value="">-- Choose Party --</option>
                          {sortedParties.map(p => (
                            <option key={p.id || p.name} value={String(p.id || p.name)}>
                              {p.name} {p.city ? `• ${p.city}` : ''}
                            </option>
                          ))}
                          <option value="__ADD_NEW__">➕ Add New Party...</option>
                        </select>
                        {errors.partyName && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.partyName}</span>}
                      </div>

                      <div className="w-full min-w-0">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Party Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.partyPhone}
                          onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                          placeholder="e.g. 9822012345"
                          className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                        <div className="w-full min-w-0">
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            New Party Name *
                          </label>
                          <input
                            type="text"
                            value={formData.partyName}
                            onChange={handleNewPartyNameChange}
                            placeholder="e.g. Radhe Krishna Logistics"
                            className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                              errors.partyName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                            required
                          />
                          {errors.partyName && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.partyName}</span>}
                        </div>

                        <div className="w-full min-w-0">
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Party Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.partyPhone}
                            onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                            placeholder="e.g. 9822012345"
                            className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                          />
                        </div>
                      </div>

                      {duplicatePartyMatch && (
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between flex-wrap gap-2">
                          <span>"{duplicatePartyMatch.name}" is already in your Party list.</span>
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
                            Select Existing Party
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Truck & Driver */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
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
                      />
                      {errors.vehicleNo && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.vehicleNo}</span>}
                    </div>

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Vehicle Type
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer"
                      >
                        {!VEHICLE_TYPES.includes(formData.vehicleType) && formData.vehicleType && (
                          <option value={formData.vehicleType}>{formData.vehicleType}</option>
                        )}
                        {VEHICLE_TYPES.map(vt => (
                          <option key={vt} value={vt}>{vt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full min-w-0">
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

                    <div className="w-full min-w-0">
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

              {/* Step 4: Freight (No Expense Data) */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Material / Cargo Description
                      </label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        placeholder="e.g. Steel / Cement / Pipes"
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>

                    <div className="w-full min-w-0">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
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
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl font-bold text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                          errors.amount ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                        required
                      />
                      {errors.amount && <span className="text-rose-500 text-[11px] mt-0.5 block">{errors.amount}</span>}
                    </div>

                    <div className="w-full min-w-0">
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
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Balance Due (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.balance}
                        readOnly
                        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm box-border ${
                          parseFloat(formData.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Payment Status
                      </label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Remarks / Delivery Notes
                      </label>
                      <input
                        type="text"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Optional remarks..."
                        className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold cursor-pointer active:scale-95 transition"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <div>
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-5 py-2 ${
                        isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                      } bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition`}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{editingTrip ? 'Saving Changes...' : 'Saving Entry...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{editingTrip ? 'Save Changes' : 'Save Entry'}</span>
                        </>
                      )}
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
