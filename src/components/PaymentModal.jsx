import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  IndianRupee, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ trip, isOpen, onClose, onSavePayment }) {
  if (!isOpen || !trip) return null;

  const currentAmount = Number(trip.amount) || 0;
  const currentAdvance = Number(trip.advance) || 0;
  const currentBalance = Number(trip.balance) || Math.max(0, currentAmount - currentAdvance);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / GPay / PhonePe');
  const [paymentRef, setPaymentRef] = useState('');

  const numPayment = parseFloat(paymentAmount) || 0;
  const newAdvance = currentAdvance + numPayment;
  const newBalance = Math.max(0, currentAmount - newAdvance);

  const handleSettleFull = () => {
    setPaymentAmount(String(currentBalance));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numPayment <= 0) return;

    let newStatus = 'Partial';
    if (newAdvance >= currentAmount) {
      newStatus = 'Paid';
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }

    const additionalRemark = `Recv ₹${numPayment} via ${paymentMode}${paymentRef ? ` (Ref: ${paymentRef})` : ''} on ${new Date().toISOString().split('T')[0]}`;
    const updatedRemarks = trip.remarks ? `${trip.remarks} | ${additionalRemark}` : additionalRemark;

    onSavePayment({
      ...trip,
      advance: newAdvance,
      balance: newBalance,
      paymentStatus: newStatus,
      remarks: updatedRemarks
    });

    onClose();
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
            <h3 className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg">Record Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl transition cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>LR / Vehicle:</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{trip.lrNo} • {trip.vehicleNo}</strong>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Party:</span>
              <strong className="text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">{trip.partyName}</strong>
            </div>
            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-1 font-semibold">
              <span className="text-zinc-700 dark:text-zinc-300">Balance Due:</span>
              <span className="text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold">{formatCurrency(currentBalance)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                Amount Received (₹) *
              </label>
              {currentBalance > 0 && (
                <button
                  type="button"
                  onClick={handleSettleFull}
                  className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer py-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Settle All</span>
                </button>
              )}
            </div>

            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="1"
                step="any"
                max={currentBalance > 0 ? currentBalance : undefined}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                autoFocus
                required
                className="w-full pl-9 pr-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
              />
            </div>
          </div>

          {numPayment > 0 && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 flex justify-between font-medium">
              <span>New Balance:</span>
              <strong className={newBalance === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}>
                {newBalance === 0 ? '₹0 (Full Paid)' : formatCurrency(newBalance)}
              </strong>
            </div>
          )}

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs box-border"
            >
              <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Ref / Note (Optional)
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UTR or Cheque no"
              className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-mono text-sm sm:text-xs box-border"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm sm:text-xs font-semibold cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
            >
              Save Payment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
