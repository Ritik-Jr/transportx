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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                {editingTrip ? 'Edit Truck Entry' : 'New Truck Entry'}
              </h3>
              <p className="text-[10px] text-zinc-400">Log trip freight & accounts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Section 1: Trip & Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Bilty / LR No.
              </label>
              <input
                type="text"
                value={formData.lrNo}
                onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })}
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Trip Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Trip Status
              </label>
              <select
                value={formData.deliveryStatus}
                onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value })}
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Transport Party Name *
              </label>
              <input
                type="text"
                list="party-suggestions-modal"
                value={formData.partyName}
                onChange={handlePartySelect}
                placeholder="e.g. Shree Balaji Logistics"
                className={`w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white ${
                  errors.partyName ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                required
              />
              <datalist id="party-suggestions-modal">
                {parties.map((p, idx) => (
                  <option key={idx} value={p.name} />
                ))}
              </datalist>
              {errors.partyName && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.partyName}</span>}
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Party Phone / Mobile
              </label>
              <input
                type="tel"
                value={formData.partyPhone}
                onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                placeholder="e.g. 9822012345"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Section 3: Vehicle & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Vehicle No. (Truck No) *
              </label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                placeholder="e.g. MH 12 RN 8845"
                className={`w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border rounded-xl font-mono uppercase font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white ${
                  errors.vehicleNo ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              >
                {VEHICLE_TYPES.map(vt => (
                  <option key={vt} value={vt}>{vt}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Driver Name *
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="e.g. Rameshwar Yadav"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Driver Mobile
              </label>
              <input
                type="tel"
                value={formData.driverMobile}
                onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                placeholder="e.g. 9821456789"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Section 4: Route & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                From (Origin) *
              </label>
              <input
                type="text"
                value={formData.fromCity}
                onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                placeholder="e.g. Pune"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                To (Destination) *
              </label>
              <input
                type="text"
                value={formData.toCity}
                onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                placeholder="e.g. Surat"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Material / Cargo
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. Steel / Cement / Goods"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Weight / Quantity
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 24 MT or 500 Bags"
                className="w-full px-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Section 5: Financials */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs">
              Freight & Accounts
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Total Freight (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full px-3 py-1.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.advance}
                  onChange={handleAdvanceChange}
                  placeholder="0"
                  className="w-full px-3 py-1.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Balance Due (₹)
                </label>
                <input
                  type="text"
                  value={formData.balance}
                  readOnly
                  className={`w-full px-3 py-1.5 sm:py-2 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-xs sm:text-sm ${
                    parseFloat(formData.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-3 py-1.5 sm:py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Remarks / POD Notes
              </label>
              <textarea
                rows="2"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes or instructions..."
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold shadow-xs cursor-pointer"
            >
              {editingTrip ? 'Save Changes' : 'Record Trip'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
