
// Déclaration globale pour le script CinetPay injecté dans index.html
declare global {
  interface Window {
    CinetPay: any;
  }
}

const API_KEY = import.meta.env.VITE_CINETPAY_API_KEY || "49132804168c9939d5f97f7.06113084";
const SITE_ID = import.meta.env.VITE_CINETPAY_SITE_ID || "105907554";

interface CinetPayPaymentProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onClose?: () => void;
}

export const initiateCinetPayPayment = ({ 
  amount, 
  currency = "XAF", 
  description = "Dépôt SportBot Pro",
  onSuccess, 
  onError,
  onClose 
}: CinetPayPaymentProps) => {
  if (!window.CinetPay) {
    console.error("CinetPay SDK not loaded");
    onError("CinetPay SDK non chargé");
    return;
  }

  try {
    window.CinetPay.setConfig({
      apikey: API_KEY,
      site_id: SITE_ID,
      notify_url: 'https://sportbot.app/api/cinetpay-notify',
      mode: 'PRODUCTION'
    });

    window.CinetPay.getCheckout({
      transaction_id: "TX-" + Date.now(),
      amount: amount,
      currency: currency,
      channels: 'ALL',
      description: description,
      customer_name: "Client",
      customer_surname: "SportBot",
      customer_email: "client@sportbot.app",
      customer_phone_number: "00000000",
      customer_address: "BP 123",
      customer_city: "Douala",
      customer_country: "CM",
      customer_state: "CM",
      customer_zip_code: "00237",
    });

    window.CinetPay.waitResponse(function(data: any) {
      if (data.status === "REFUSED") {
        onError("Paiement refusé");
      } else if (data.status === "ACCEPTED") {
        onSuccess(data);
      }
    });

    window.CinetPay.onError(function(data: any) {
      onError(data);
    });

  } catch (e) {
    console.error("CinetPay Init Error:", e);
    onError(e);
  }
};
