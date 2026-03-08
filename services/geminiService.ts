import { GoogleGenAI } from "@google/genai";
import { Match, PlacedBet } from '../types';

// Initialize the API client safely
const getAIClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAIClient();

export const analyzeMatch = async (match: Match): Promise<string> => {
  if (!ai) return "Analyse indisponible (Clé API manquante).";
  try {
    const prompt = `
      Agis comme un expert en paris sportifs professionnel.
      Analyse ce match en temps réel et donne une prédiction courte et percutante (max 2 phrases).
      
      Match: ${match.homeTeam} vs ${match.awayTeam}
      Ligue: ${match.league}
      Score Actuel: ${match.homeScore} - ${match.awayScore}
      Temps: ${match.time}
      Cotes: 1(${match.odds.home}) - X(${match.odds.draw}) - 2(${match.odds.away})
      
      Concentre-toi sur la dynamique du match et la valeur du pari. Utilise un ton énergique.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Analyse indisponible pour le moment.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Les insights IA sont temporairement indisponibles.";
  }
};

export const getMatchOfTheDayInsight = async (matches: Match[]): Promise<{title: string, insight: string} | null> => {
    if (!ai) return null;
    try {
        // Explicitly look for Morocco vs Senegal as priority
        const specialMatch = matches.find(m => m.homeTeam === 'Maroc' && m.awayTeam === 'Sénégal');
        
        // Simple logic to find a "big" match if special match is missing
        const bigMatch = specialMatch || matches.find(m => m.league.includes('Champions') || m.league.includes('Premier') || m.league.includes('NBA')) || matches[0];
        
        if (!bigMatch) return null;

        const prompt = `
            Tu es un analyste sportif TV. Choisis ce match comme "Match du Jour": ${bigMatch.homeTeam} vs ${bigMatch.awayTeam}.
            Donne-moi:
            1. Un titre accrocheur (ex: Choc des titans).
            2. Une raison clé de regarder ou parier maintenant (très court).
            Format JSON attendu: { "title": "...", "insight": "..." }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);

    } catch (e) {
        console.error("Error getting match of day", e);
        return null;
    }
};

export const generateDailySummary = async (matches: Match[], dateLabel: string): Promise<string> => {
  if (!ai) return "Résumé indisponible.";
  try {
     const matchData = matches.slice(0, 10).map(m => 
       `${m.league}: ${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam} (${m.status})`
     ).join('\n');

     const prompt = `
        Tu es un journaliste sportif. Écris un résumé très court et énergique (max 3 points) des résultats du ${dateLabel}.
        Mets en avant la plus grosse surprise ou victoire.
        
        Matchs:
        ${matchData}
     `;
     
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Pas de résumé disponible.";

  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "L'IA n'a pas pu générer le résumé.";
  }
};

export const generateChatBotMessage = async (lastBet: PlacedBet | undefined, featuredMatch: Match | undefined): Promise<string> => {
    if (!ai) return "Gros match ce soir ! Maroc vs Sénégal à ne pas rater ! 🔥";
    try {
        let context = "";
        
        if (lastBet) {
            context += `L'utilisateur a récemment parié ${lastBet.stake}F sur ${lastBet.items[0]?.matchInfo} et le statut est ${lastBet.status}. `;
            if(lastBet.status === 'lost') context += "Il est probablement déçu. Encourage-le à se refaire.";
            if(lastBet.status === 'won') context += "Il est content. Félicite-le et propose de rejouer.";
        }

        if (featuredMatch) {
            context += `Le match vedette aujourd'hui est ${featuredMatch.homeTeam} vs ${featuredMatch.awayTeam} (${featuredMatch.league}). Cotes: 1(${featuredMatch.odds.home}) 2(${featuredMatch.odds.away}).`;
        }

        const prompt = `
            Tu es le Chatbot IA officiel de SportBot Pro.
            Génère un message court (1 phrase max) pour le chat public.
            
            Contexte:
            ${context}
            
            Si l'utilisateur a perdu, sois compatissant mais motivant ("La chance va tourner sur Maroc-Sénégal !").
            Si l'utilisateur a gagné, sois hype ("Bravo champion ! On remet ça sur le choc de ce soir ?").
            Sinon, hype simplement le match Maroc vs Sénégal.
            Ne mentionne pas que tu es une IA. Parle comme un ami parieur.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });

        return response.text || "Gros match ce soir ! Maroc vs Sénégal à ne pas rater ! 🔥";

    } catch (e) {
        return "Connectez-vous pour voir les pronos en direct !";
    }
};