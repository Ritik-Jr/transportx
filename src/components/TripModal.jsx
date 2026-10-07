import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck
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

export default function TripModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTrip = null, 
  parties = [],
  nextLrNo = 'ST-1005'
}) {
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
    }
    setErrors({});
  }, [editingTrip, isOpen, nextLrNo]);

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

  const handlePartySelect = (e) => {
    const name = e.target.value;
    const found = parties.find(p => p.name.toLowerCase() === name.toLowerCase());
    setFormData(prev => ({
      ...prev,
      partyName: name,
      partyPhone: found ? (found.phone || prev.partyPhone) : prev.partyPhone
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.vehicleNo.trim()) newErrors.vehicleNo = 'Vehicle number required';
    if (!formData.partyName.trim()) newErrors.partyName = 'Party name required';
    if (!formData.fromCity.trim()) newErrors.fromCity = 'From location required';
    if (!formData.toCity.trim()) newErrors.toCity = 'To location required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Freight amount required';
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 box-border">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-6 box-border">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                {editingTrip ? 'Edit Truck Entry' : 'New Truck Entry'}
              </h3>
              <p className="text-[11px] text-zinc-400">Log trip freight & accounts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto overflow-x-hidden w-full max-w-full box-border text-xs sm:text-sm">
          
          {/* Section 1: Trip & Identification */}
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

          {/* Section 2: Party */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Transport Party Name *
              </label>
              <input
                type="text"
                list="party-suggestions-modal"
                value={formData.partyName}
                onChange={handlePartySelect}
                placeholder="e.g. Shree Balaji Logistics"
                className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                  errors.partyName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                required
              />
              <datalist id="party-suggestions-modal">
                {parties.map((p, idx) => (
                  <option key={idx} value={p.name} />
                ))}
              </datalist>
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
                className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
              />
            </div>
          </div>

          {/* Section 3: Vehicle & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Vehicle No. (Truck No) *
              </label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                placeholder="e.g. MH 12 RN 8845"
                className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl font-mono uppercase font-bold text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border ${
                  errors.vehicleNo ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                required
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Vehicle Type
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

            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Driver Name *
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="e.g. Rameshwar Yadav"
                className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                required
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Driver Mobile
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

          {/* Section 4: Route & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                From (Origin) *
              </label>
              <input
                type="text"
                value={formData.fromCity}
                onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                placeholder="e.g. Pune"
                className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                required
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                To (Destination) *
              </label>
              <input
                type="text"
                value={formData.toCity}
                onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                placeholder="e.g. Surat"
                className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                required
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Material / Cargo
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. Steel / Cement / Goods"
                className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
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

          {/* Section 5: Financials */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 w-full min-w-0 box-border">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs sm:text-sm">
              Freight & Accounts
            </span>

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
                  className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                  required
                />
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

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Remarks / POD Notes
              </label>
              <textarea
                rows="2"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes or instructions..."
                className="w-full min-w-0 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-sm sm:text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition"
            >
              {editingTrip ? 'Save Changes' : 'Record Trip'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
