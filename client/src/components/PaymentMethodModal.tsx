import { useState } from "react";

export type PaymentMethod = "MPESA" | "DEBIT_CARD" | "CREDIT_CARD" | "PESALINK";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  color: string;
  icon: JSX.Element;
}

const options: PaymentOption[] = [
  {
    id: "MPESA",
    name: "M-Pesa",
    color: "#2E7D32",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </svg>
    ),
  },
  {
    id: "DEBIT_CARD",
    name: "Visa / Mastercard (Debit)",
    color: "#1D4ED8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    id: "CREDIT_CARD",
    name: "Credit Card",
    color: "#6D28D9",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
      </svg>
    ),
  },
  {
    id: "PESALINK",
    name: "PesaLink",
    color: "#0D9488",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
];

export default function PaymentMethodModal({
  amount,
  onConfirm,
  onClose,
  loading,
}: {
  amount: number;
  onConfirm: (method: PaymentMethod) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="font-display text-lg font-bold text-navy-900">Choose a payment method</h2>
        <p className="mt-1 text-sm text-navy-500">
          Total due: <span className="font-semibold text-navy-900">KSh {amount.toLocaleString()}</span>
        </p>

        <div className="mt-5 space-y-2.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition ${
                selected === opt.id ? "border-amber-500 bg-amber-50" : "border-navy-100 hover:border-navy-200"
              }`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: opt.color }}
              >
                {opt.icon}
              </span>
              <span className="font-medium text-navy-900">{opt.name}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-navy-400">
          You won't be charged yet — payment collection is handled separately once your booking is approved.
        </p>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selected && onConfirm(selected)}
            className="btn-primary flex-1"
            disabled={!selected || loading}
          >
            {loading ? "Booking…" : "Confirm & book"}
          </button>
        </div>
      </div>
    </div>
  );
}