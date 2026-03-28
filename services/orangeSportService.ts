import { db } from './database';

const ORANGE_API_KEY = "ORANGE-SPORT-SMS-PRO-2026-V1";

export interface OrangeSportAlert {
  id: string;
  type: 'injury' | 'lineup' | 'odds';
  matchId: string;
  message: string;
  timestamp: string;
}

export const subscribeToOrangeAlerts = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate API call to Orange Sport
    console.log(`Subscribing ${phoneNumber} to Orange Sport alerts with API Key: ${ORANGE_API_KEY}`);
    
    // Store subscription in database
    await db.saveUserPreference('orange_sms_subscription', {
      phoneNumber,
      subscribedAt: new Date().toISOString(),
      apiKey: ORANGE_API_KEY
    });

    return { 
      success: true, 
      message: "Félicitations ! Vous recevrez désormais les alertes Orange Sport par SMS." 
    };
  } catch (error) {
    console.error("Erreur lors de l'abonnement Orange Sport:", error);
    return { 
      success: false, 
      message: "Une erreur est survenue lors de l'abonnement. Veuillez réessayer." 
    };
  }
};

export const getOrangeSportAlerts = (): OrangeSportAlert[] => {
  return [
    {
      id: '1',
      type: 'injury',
      matchId: 'm1',
      message: "⚠️ Alerte Blessure: Kylian Mbappé est incertain pour le match de ce soir (douleur à la cuisse).",
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'lineup',
      matchId: 'm2',
      message: "📋 Compo Officielle: Real Madrid aligne son trio offensif habituel face au Barça.",
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      type: 'odds',
      matchId: 'm3',
      message: "📈 Cote Flash: La victoire du Sénégal passe à 2.10 ! Profitez-en maintenant.",
      timestamp: new Date().toISOString()
    }
  ];
};
