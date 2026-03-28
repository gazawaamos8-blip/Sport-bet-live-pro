
// Déclaration globale pour le script CinetPay injecté dans index.html
declare global {
  interface Window {
    CinetPay: any;
  }
}

const API_KEY = (import.meta.env.VITE_CINETPAY_API_KEY || "49132804168c9939d5f97f7.06113084").toString().trim();
const SITE_ID = (import.meta.env.VITE_CINETPAY_SITE_ID || "105907554").toString().trim();
const SECRET_KEY = (import.meta.env.VITE_CINETPAY_SECRET_KEY || "363941278699a955cea1112.46793272").toString().trim();
const MODE = (import.meta.env.VITE_CINETPAY_MODE || "PRODUCTION").toString().trim();

interface CinetPayPaymentProps {
  transactionId?: string;
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
  customerSurname?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onClose?: () => void;
}

const DEFAULT_DOMAIN = "https://sportbot.app";

export const checkCinetPayStatus = async (transactionId: string) => {
  try {
    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id: transactionId
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking CinetPay status:", error);
    throw error;
  }
};
export const initiateCinetPayPayment = ({ 
  transactionId: customTransactionId,
  amount, 
  currency = "XAF", 
  description = "Dépôt SportBot Pro",
  customerName = "Client",
  customerSurname = "SportBot",
  customerEmail = "client@sportbot.app",
  customerPhone = "690000000",
  onSuccess, 
  onError,
  onClose 
}: CinetPayPaymentProps) => {
  const loadCinetPayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.CinetPay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = "https://cdn.cinetpay.com/seamless/main.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load CinetPay SDK"));
      document.head.appendChild(script);
    });
  };

  loadCinetPayScript().then(() => {
    if (!window.CinetPay) {
      console.error("CinetPay SDK not loaded after dynamic injection");
      onError("CinetPay SDK non chargé");
      return;
    }

    try {
      const cleanAmount = Math.floor(amount);
      const transactionId = customTransactionId || `SB${Date.now()}${Math.floor(Math.random() * 1000)}`;
      // Use the root origin for notification to ensure a 200 OK response in SPA
      const notifyUrl = `${window.location.origin || DEFAULT_DOMAIN}/`;
      
      console.log("CinetPay: Initializing payment", { 
        amount: cleanAmount, 
        transactionId,
        mode: 'PRODUCTION',
        notifyUrl
      });
      
      // IMPORTANT: Ensure this domain is authorized in your CinetPay dashboard
      try {
        window.CinetPay.setConfig({
          apikey: API_KEY,
          site_id: SITE_ID,
          notify_url: notifyUrl,
          mode: MODE
        });
      } catch (configError) {
        console.error("CinetPay setConfig error:", configError);
      }

      window.CinetPay.waitResponse((data: any) => {
        console.log("CinetPay waitResponse:", data);
        if (data.status === 'REFUSED') {
          onError(`Le paiement a été refusé par l'opérateur (Code: ${data.code || 'N/A'})`);
        } else if (data.status === 'ACCEPTED') {
          onSuccess(data);
        } else if (data.status === 'CANCELLED') {
          if (onClose) onClose();
        }
      });

      window.CinetPay.getCheckout({
        transaction_id: transactionId,
        amount: cleanAmount,
        currency: currency,
        channels: 'ALL',
        description: description,
        customer_name: customerName,
        customer_surname: customerSurname,
        customer_email: customerEmail,
        customer_phone_number: customerPhone.replace(/\s+/g, '').replace(/[^\d+]/g, ''),
        customer_address: "Douala",
        customer_city: "Douala",
        customer_country: "CM",
        customer_state: "CM",
        customer_zip_code: "237",
      });

      window.CinetPay.onError(function(data: any) {
        console.error("CinetPay Error Callback:", data);
        const errorMsg = data?.message || data?.description || "Une erreur est survenue lors du paiement";
        const code = data?.code || 'N/A';
        const currentOrigin = window.location.origin;
        
        let detailedMsg = `${errorMsg} (Code: ${code})`;
        if (code === 'UNKNOWN_ERROR') {
          detailedMsg += `. Votre domaine actuel (${currentOrigin}) n'est probablement pas autorisé dans votre tableau de bord CinetPay.`;
        }
        
        onError(detailedMsg);
      });

      // Handle close event if possible (some SDK versions support it)
      if (window.CinetPay.onClose && onClose) {
        window.CinetPay.onClose(onClose);
      }

    } catch (e: any) {
      console.error("CinetPay Init Error:", e);
      onError(e?.message || "Erreur d'initialisation CinetPay");
    }
  }).catch(err => {
    console.error("CinetPay Script Load Error:", err);
    onError("Erreur de chargement du SDK CinetPay");
  });
};
