
// Déclaration globale pour le script Flutterwave injecté dans index.html
declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

// Clé Publique (Utilisez votre clé de production ou de test ici)
const PUBLIC_KEY = "FLWPUBK-b13f71d6b6c2d0d7642fcb0df026c4ca-X";

interface PaymentProps {
  amount: number;
  email: string;
  phone: string;
  name: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
}

export const initiatePayment = ({ amount, email, phone, name, onSuccess, onClose }: PaymentProps) => {
  if (!window.FlutterwaveCheckout) {
    alert("Erreur: Le module de paiement n'est pas chargé. Vérifiez votre connexion internet.");
    onClose();
    return;
  }

  try {
    window.FlutterwaveCheckout({
      public_key: PUBLIC_KEY,
      tx_ref: "TX-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
      amount: amount,
      currency: "XAF",
      payment_options: "card, mobilemoney, ussd",
      customer: {
        email: email,
        phonenumber: phone,
        name: name,
      },
      customizations: {
        title: "SportBot Pro Rechargement",
        description: "Dépôt sur compte parieur",
        logo: "https://cdn-icons-png.flaticon.com/512/404/404626.png", // Logo générique de sport
      },
      callback: function (data: any) {
        console.log("Paiement Flutterwave réussi:", data);
        onSuccess(data);
      },
      onclose: function() {
        console.log("Fermeture du modal de paiement");
        onClose();
      }
    });
  } catch (error) {
    console.error("Erreur d'initialisation Flutterwave:", error);
    alert("Une erreur est survenue lors du lancement du paiement.");
    onClose();
  }
};
