import { Match, MatchEvent, MatchHighlight, MatchStats, Standing, Lineup, LineupPlayer, SportType } from '../types';
import { db } from './database';

// API KEY PROVIDED BY USER
const API_KEY = "221f837d3d230af85f23bf1eae26c541";
const API_BASE_URL = "https://v3.football.api-sports.io";

const getLogo = (name: string, code?: string) => {
    // If we have a specific country code that isn't a generic region, use the flag
    if (code && code !== 'eu' && code !== 'un' && code !== 'wo' && code !== 'africa') {
        return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
    }
    
    // Check if the team name itself has a known code
    const teamCode = TEAM_DATA[name]?.code;
    if (teamCode) {
        return `https://flagcdn.com/w160/${teamCode.toLowerCase()}.png`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&font-size=0.5&bold=true`;
};

const TEAM_DATA: Record<string, { code: string }> = {
    // AFCON / National Teams
    "Sénégal": { code: "sn" },
    "Maroc": { code: "ma" },
    "Côte d'Ivoire": { code: "ci" },
    "Cameroun": { code: "cm" },
    "Égypte": { code: "eg" },
    "Algérie": { code: "dz" },
    "Nigeria": { code: "ng" },
    "Ghana": { code: "gh" },
    "Tunisie": { code: "tn" },
    "RDC": { code: "cd" },
    "Mali": { code: "ml" },
    "Burkina Faso": { code: "bf" },
    "Guinée": { code: "gn" },
    "Afrique du Sud": { code: "za" },
    "Zambie": { code: "zm" },
    "Gabon": { code: "ga" },
    "Angola": { code: "ao" },
    "Cap-Vert": { code: "cv" },
    "Mauritanie": { code: "mr" },
    "Namibie": { code: "na" },
    "Guinée Équatoriale": { code: "gq" },
    "Gambie": { code: "gm" },
    "Tanzanie": { code: "tz" },
    "Mozambique": { code: "mz" },
    "Soudan": { code: "sd" },
    "Libye": { code: "ly" },
    "Bénin": { code: "bj" },
    "Togo": { code: "tg" },
    "Ouganda": { code: "ug" },
    "Kenya": { code: "ke" },
    "Rwanda": { code: "rw" },
    "Éthiopie": { code: "et" },
    "Zimbabwe": { code: "zw" },
    "Madagascar": { code: "mg" },
    "Sierra Leone": { code: "sl" },
    "Liberia": { code: "lr" },
    "Centrafrique": { code: "cf" },
    "Congo": { code: "cg" },
    "Burundi": { code: "bi" },
    "Comores": { code: "km" },
    "Djibouti": { code: "dj" },
    "Érythrée": { code: "er" },
    "Eswatini": { code: "sz" },
    "Lesotho": { code: "ls" },
    "Malawi": { code: "mw" },
    "Maurice": { code: "mu" },
    "Seychelles": { code: "sc" },
    "Somalie": { code: "so" },
    "Soudan du Sud": { code: "ss" },
    "Tchad": { code: "td" },

    // European Teams (UCL / Leagues)
    "Real Madrid": { code: "es" },
    "Barcelona": { code: "es" },
    "Atlético": { code: "es" },
    "Sevilla": { code: "es" },
    "Valencia": { code: "es" },
    "Real Sociedad": { code: "es" },
    "Villarreal": { code: "es" },
    "Betis": { code: "es" },
    "Girona": { code: "es" },
    "Bilbao": { code: "es" },
    "Osasuna": { code: "es" },
    "Getafe": { code: "es" },
    "Celta Vigo": { code: "es" },
    "Mallorca": { code: "es" },
    "Rayo Vallecano": { code: "es" },
    "Alavés": { code: "es" },
    "Las Palmas": { code: "es" },
    "Granada": { code: "es" },
    "Cadiz": { code: "es" },
    "Man City": { code: "gb" },
    "Liverpool": { code: "gb" },
    "Arsenal": { code: "gb" },
    "Man Utd": { code: "gb" },
    "Chelsea": { code: "gb" },
    "Asante Kotoko": { code: "gh" },
    "Hearts of Oak": { code: "gh" },
    "Medeama SC": { code: "gh" },
    "Aduana Stars": { code: "gh" },
    "Bechem Utd": { code: "gh" },
    "Nsoatreman": { code: "gh" },
    "Berekum Chelsea": { code: "gh" },
    "Legon Cities": { code: "gh" },
    "Bibiani Gold Stars": { code: "gh" },
    "Karela Utd": { code: "gh" },
    "Great Olympics": { code: "gh" },
    "Heart of Lions": { code: "gh" },
    "Teungueth FC": { code: "sn" },
    "Jaraaf": { code: "sn" },
    "Pikine": { code: "sn" },
    "Casa Sports": { code: "sn" },
    "Guédiawaye": { code: "sn" },
    "Dakar Sacré-Cœur": { code: "sn" },
    "US Ouakam": { code: "sn" },
    "Stade de Mbour": { code: "sn" },
    "Génération Foot": { code: "sn" },
    "Diambars": { code: "sn" },
    "AS Douanes": { code: "sn" },
    "ASC Linguère": { code: "sn" },
    "ASC Diaraf": { code: "sn" },
    "US Gorée": { code: "sn" },
    "ASEC Mimosas": { code: "ci" },
    "San Pédro": { code: "ci" },
    "AFAD": { code: "ci" },
    "SC Gagnoa": { code: "ci" },
    "Racing Club Abidjan": { code: "ci" },
    "SOA": { code: "ci" },
    "Stella Club": { code: "ci" },
    "LYS Sassandra": { code: "ci" },
    "CO Korhogo": { code: "ci" },
    "Mouna FC": { code: "ci" },
    "Stade d'Abidjan": { code: "ci" },
    "Zoman FC": { code: "ci" },
    "Bouaké FC": { code: "ci" },
    "ASI d'Abengourou": { code: "ci" },
    "Indenié": { code: "ci" },
    "Denguélé": { code: "ci" },
    "SOL FC": { code: "ci" },
    "FC San Pedro": { code: "ci" },
    "Lys Sassandra": { code: "ci" },
    "Sporting Gagnoa": { code: "ci" },
    "Bassam": { code: "ci" },
    "Gagnoa": { code: "ci" },
    "Korhogo": { code: "ci" },
    "Bouake": { code: "ci" },
    "Abengourou": { code: "ci" },
    "Denguele": { code: "ci" },
    "Sol FC": { code: "ci" },
    "San Pedro": { code: "ci" },
    "Stella": { code: "ci" },
    "Racing": { code: "ci" },
    "Afad": { code: "ci" },
    "Asec": { code: "ci" },
    "Mimosas": { code: "ci" },
    "Africa Sports": { code: "ci" },
    "Stade Abidjan": { code: "ci" },
    "JCA Treichville": { code: "ci" },
    "Sewe Sport": { code: "ci" },
    "Tanda": { code: "ci" },
    "Moossou": { code: "ci" },
    "WAC": { code: "ci" },
    "Yamoussoukro": { code: "ci" },
    "Issia Wazi": { code: "ci" },
    "Ouragahio": { code: "ci" },
    "Hiré": { code: "ci" },
    "Daloa": { code: "ci" },
    "Odienné": { code: "ci" },
    "Bingerville": { code: "ci" },
    "Toumodi": { code: "ci" },
    "Man": { code: "ci" },
    "Bouna": { code: "ci" },
    "Bondoukou": { code: "ci" },
    "Ferké": { code: "ci" },
    "Ouangolo": { code: "ci" },
    "Tingrela": { code: "ci" },
    "Boundiali": { code: "ci" },
    "Mankono": { code: "ci" },
    "Seguela": { code: "ci" },
    "Vavoua": { code: "ci" },
    "Zuenoula": { code: "ci" },
    "Bouaflé": { code: "ci" },
    "Sinfra": { code: "ci" },
    "Oumé": { code: "ci" },
    "Divo": { code: "ci" },
    "Lakota": { code: "ci" },
    "Guiglo": { code: "ci" },
    "Duékoué": { code: "ci" },
    "Bangolo": { code: "ci" },
    "Logoualé": { code: "ci" },
    "Danané": { code: "ci" },
    "Biankouma": { code: "ci" },
    "Sipilou": { code: "ci" },
    "Zouan-Hounien": { code: "ci" },
    "Bin-Houyé": { code: "ci" },
    "Toulépleu": { code: "ci" },
    "Bloléquin": { code: "ci" },
    "Taï": { code: "ci" },
    "Grabo": { code: "ci" },
    "Tabou": { code: "ci" },
    "Grand-Béréby": { code: "ci" },
    "Sassandra": { code: "ci" },
    "Fresco": { code: "ci" },
    "Grand-Lahou": { code: "ci" },
    "Jacqueville": { code: "ci" },
    "Dabou": { code: "ci" },
    "Sikensi": { code: "ci" },
    "Tiassalé": { code: "ci" },
    "N'douci": { code: "ci" },
    "Spurs": { code: "gb" },
    "Newcastle": { code: "gb" },
    "Aston Villa": { code: "gb" },
    "West Ham": { code: "gb" },
    "Brighton": { code: "gb" },
    "Wolves": { code: "gb" },
    "Fulham": { code: "gb" },
    "Everton": { code: "gb" },
    "Brentford": { code: "gb" },
    "Nottingham": { code: "gb" },
    "Bournemouth": { code: "gb" },
    "Crystal Palace": { code: "gb" },
    "Burnley": { code: "gb" },
    "Sheffield Utd": { code: "gb" },
    "Luton Town": { code: "gb" },
    "Leicester": { code: "gb" },
    "Leeds": { code: "gb" },
    "Southampton": { code: "gb" },
    "Bayern Munich": { code: "de" },
    "Dortmund": { code: "de" },
    "Leipzig": { code: "de" },
    "Leverkusen": { code: "de" },
    "Frankfurt": { code: "de" },
    "Stuttgart": { code: "de" },
    "Freiburg": { code: "de" },
    "Wolfsburg": { code: "de" },
    "Hoffenheim": { code: "de" },
    "Gladbach": { code: "de" },
    "Werder Bremen": { code: "de" },
    "Augsburg": { code: "de" },
    "Mainz": { code: "de" },
    "Heidenheim": { code: "de" },
    "Union Berlin": { code: "de" },
    "PSG": { code: "fr" },
    "Marseille": { code: "fr" },
    "Lyon": { code: "fr" },
    "Monaco": { code: "fr" },
    "Lille": { code: "fr" },
    "Lens": { code: "fr" },
    "Rennes": { code: "fr" },
    "Nice": { code: "fr" },
    "Reims": { code: "fr" },
    "Toulouse": { code: "fr" },
    "Montpellier": { code: "fr" },
    "Strasbourg": { code: "fr" },
    "Brest": { code: "fr" },
    "Nantes": { code: "fr" },
    "Inter Milan": { code: "it" },
    "AC Milan": { code: "it" },
    "Juventus": { code: "it" },
    "Napoli": { code: "it" },
    "Roma": { code: "it" },
    "Lazio": { code: "it" },
    "Atalanta": { code: "it" },
    "Fiorentina": { code: "it" },
    "Bologna": { code: "it" },
    "Torino": { code: "it" },
    "Monza": { code: "it" },
    "Genoa": { code: "it" },
    "Lecce": { code: "it" },
    "Sassuolo": { code: "it" },
    "Udinese": { code: "it" },
    "Empoli": { code: "it" },
    "Verona": { code: "it" },
    "Cagliari": { code: "it" },
    "Benfica": { code: "pt" },
    "Porto": { code: "pt" },
    "Sporting CP": { code: "pt" },
    "Braga": { code: "pt" },
    "Guimarães": { code: "pt" },
    "Ajax": { code: "nl" },
    "PSV": { code: "nl" },
    "Feyenoord": { code: "nl" },
    "AZ Alkmaar": { code: "nl" },
    "Twente": { code: "nl" },
    "Celtic": { code: "gb" },
    "Rangers": { code: "gb" },
    "Club Brugge": { code: "be" },
    "Anderlecht": { code: "be" },
    "Gent": { code: "be" },
    "Salzburg": { code: "at" },
    "Sturm Graz": { code: "at" },
    "Sparta Praha": { code: "cz" },
    "Slavia Praha": { code: "cz" },
    "Shakhtar": { code: "ua" },
    "Dynamo Kyiv": { code: "ua" },
    "Galatasaray": { code: "tr" },
    "Fenerbahce": { code: "tr" },
    "Besiktas": { code: "tr" },
    "Trabzonspor": { code: "tr" },
    "AEK Athens": { code: "gr" },
    "PAOK": { code: "gr" },
    "Panathinaikos": { code: "gr" },
    "Olympiacos": { code: "gr" },
    "Zenit": { code: "ru" },
    "Spartak Moscow": { code: "ru" },
    "CSKA Moscow": { code: "ru" },
    "Krasnodar": { code: "ru" },
    "Dinamo Moscow": { code: "ru" },
    "Basel": { code: "ch" },
    "Young Boys": { code: "ch" },
    "Zurich": { code: "ch" },
    "Servette": { code: "ch" },
    "Lugano": { code: "ch" },
    "Copenhagen": { code: "dk" },
    "Midtjylland": { code: "dk" },
    "Brondby": { code: "dk" },
    "Nordsjaelland": { code: "dk" },
    "Bodo/Glimt": { code: "no" },
    "Molde": { code: "no" },
    "Viking": { code: "no" },
    "Rosenborg": { code: "no" },
    "Malmo FF": { code: "se" },
    "Djurgarden": { code: "se" },
    "Hammarby": { code: "se" },
    "Elfsborg": { code: "se" },
    "Legia Warsaw": { code: "pl" },
    "Lech Poznan": { code: "pl" },
    "Rakow": { code: "pl" },
    "Pogon Szczecin": { code: "pl" },
    "Steaua Bucharest": { code: "ro" },
    "CFR Cluj": { code: "ro" },
    "Farul Constanta": { code: "ro" },
    "Rapid Bucharest": { code: "ro" },
    "Dinamo Zagreb": { code: "hr" },
    "Hajduk Split": { code: "hr" },
    "Rijeka": { code: "hr" },
    "Osijek": { code: "hr" },
    "Red Star Belgrade": { code: "rs" },
    "Partizan Belgrade": { code: "rs" },
    "TSC Backa Topola": { code: "rs" },
    "Cukaricki": { code: "rs" },
    "Ludogorets": { code: "bg" },
    "CSKA Sofia": { code: "bg" },
    "Levski Sofia": { code: "bg" },
    "Ferencvaros": { code: "hu" },
    "Fehervar": { code: "hu" },
    "Puskas Academy": { code: "hu" },
    "Slovan Bratislava": { code: "sk" },
    "Spartak Trnava": { code: "sk" },
    "Zilina": { code: "sk" },
    "Qarabag": { code: "az" },
    "Neftci Baku": { code: "az" },
    "Sheriff Tiraspol": { code: "md" },
    "Astana": { code: "kz" },
    "Kairat": { code: "kz" },
    "Ordabasy": { code: "kz" },
    "Maccabi Haifa": { code: "il" },
    "Maccabi Tel Aviv": { code: "il" },
    "Hapoel Beer Sheva": { code: "il" },
    "APOEL": { code: "cy" },
    "AEK Larnaca": { code: "cy" },
    "Omonia": { code: "cy" },
    "Aris Limassol": { code: "cy" },

    // African Clubs
    "Al Ahly": { code: "eg" },
    "Zamalek": { code: "eg" },
    "Pyramids FC": { code: "eg" },
    "Al Masry": { code: "eg" },
    "Future FC": { code: "eg" },
    "Raja CA": { code: "ma" },
    "Wydad AC": { code: "ma" },
    "AS FAR": { code: "ma" },
    "RS Berkane": { code: "ma" },
    "FUS Rabat": { code: "ma" },
    "Maghreb Fes": { code: "ma" },
    "Espérance Tunis": { code: "tn" },
    "Étoile du Sahel": { code: "tn" },
    "Club Africain": { code: "tn" },
    "CS Sfaxien": { code: "tn" },
    "US Monastir": { code: "tn" },
    "MC Alger": { code: "dz" },
    "CR Belouizdad": { code: "dz" },
    "JS Kabylie": { code: "dz" },
    "USM Alger": { code: "dz" },
    "ES Sétif": { code: "dz" },
    "Paradou AC": { code: "dz" },
    "Mamelodi Sundowns": { code: "za" },
    "Orlando Pirates": { code: "za" },
    "Kaizer Chiefs": { code: "za" },
    "SuperSport Utd": { code: "za" },
    "Cape Town City": { code: "za" },
    "Stellenbosch": { code: "za" },
    "TP Mazembe": { code: "cd" },
    "AS Vita Club": { code: "cd" },
    "Saint Eloi Lupopo": { code: "cd" },
    "Simba SC": { code: "tz" },
    "Young Africans": { code: "tz" },
    "Azam FC": { code: "tz" },
    "Gor Mahia": { code: "ke" },
    "Tusker FC": { code: "ke" },
    "AFC Leopards": { code: "ke" },
    "ZESCO United": { code: "zm" },
    "Power Dynamos": { code: "zm" },
    "Nkana FC": { code: "zm" },
    "Petro de Luanda": { code: "ao" },
    "Sagrada Esperança": { code: "ao" },
    "Primeiro de Agosto": { code: "ao" },
    "Al-Hilal Omdurman": { code: "sd" },
    "Al-Merrikh": { code: "sd" },
    "Djoliaba AC": { code: "ml" },
    "Stade Malien": { code: "ml" },
    "Coton Sport": { code: "cm" },
    "Canon Yaoundé": { code: "cm" },
    "Union Douala": { code: "cm" },
    "Horoya AC": { code: "gn" },
    "Hafia FC": { code: "gn" },

    // Basketball (EuroLeague / NBA)
    "Lakers": { code: "us" },
    "Warriors": { code: "us" },
    "Celtics": { code: "us" },
    "Bulls": { code: "us" },
    "Heat": { code: "us" },
    "Knicks": { code: "us" },
    "Bucks": { code: "us" },
    "Suns": { code: "us" },
    "Mavericks": { code: "us" },
    "Nuggets": { code: "us" },
    "Clippers": { code: "us" },
    "Kings": { code: "us" },
    "Grizzlies": { code: "us" },
    "SA Spurs": { code: "us" },
    "Nets": { code: "us" },
    "Sixers": { code: "us" },
    "Thunder": { code: "us" },
    "Timberwolves": { code: "us" },
    "Pacers": { code: "us" },
    "Cavaliers": { code: "us" },
    "Pelicans": { code: "us" },
    "Magic": { code: "us" },
    "Rockets": { code: "us" },
    "Hawks": { code: "us" },
    "Jazz": { code: "us" },
    "Raptors": { code: "ca" },
    "Real Madrid B.": { code: "es" },
    "Barcelona B.": { code: "es" },
    "Unicaja": { code: "es" },
    "Tenerife": { code: "es" },
    "Olympiacos B.": { code: "gr" },
    "Panathinaikos B.": { code: "gr" },
    "Peristeri": { code: "gr" },
    "Fenerbahçe": { code: "tr" },
    "Anadolu Efes": { code: "tr" },
    "Maccabi": { code: "il" },
    "Partizan": { code: "rs" },
    "Crvena Zvezda": { code: "rs" },
    "Virtus Bologna": { code: "it" },
    "Olimpia Milano": { code: "it" },
    "Venezia": { code: "it" },
    "Sassari": { code: "it" },
    "Monaco Basket": { code: "fr" },
    "ASVEL": { code: "fr" },
    "Paris Basketball": { code: "fr" },
    "Valencia Basket": { code: "es" },
    "Baskonia": { code: "es" },
    "Zalgiris Kaunas": { code: "lt" },
    "Bayern Basketball": { code: "de" },
    "ALBA Berlin": { code: "de" },
    "AS Monaco": { code: "mc" },
    "LDLC ASVEL": { code: "fr" },
    "Brose Bamberg": { code: "de" },
    "Ulm": { code: "de" },
    "Oldenburg": { code: "de" },
    "Bonn": { code: "de" },
    "Ludwigsburg": { code: "de" },
    "Chemnitz": { code: "de" },
    "Vechta": { code: "de" },
    "Rostock": { code: "de" },
    "Göttingen": { code: "de" },
    "Braunschweig": { code: "de" },
    "Heidelberg": { code: "de" },
    "Crailsheim": { code: "de" },
    "Weißenfels": { code: "de" },
    "Tübingen": { code: "de" },
    "Brescia": { code: "it" },
    "Reggiana": { code: "it" },
    "Trento": { code: "it" },
    "Tortona": { code: "it" },
    "Pistoia": { code: "it" },
    "Napoli Basket": { code: "it" },
    "Scafati": { code: "it" },
    "Treviso": { code: "it" },
    "Varese": { code: "it" },
    "Cremona": { code: "it" },
    "Pesaro": { code: "it" },
    "Brindisi": { code: "it" },
    "Manresa": { code: "es" },
    "Joventut": { code: "es" },
    "Gran Canaria": { code: "es" },
    "Murcia": { code: "es" },
    "Zaragoza": { code: "es" },
    "Bilbao Basket": { code: "es" },
    "Andorra": { code: "ad" },
    "Girona Basket": { code: "es" },
    "Breogan": { code: "es" },
    "Granada Basket": { code: "es" },
    "Obradoiro": { code: "es" },
    "Palencia": { code: "es" },
    "Cholet": { code: "fr" },
    "Nanterre": { code: "fr" },
    "Le Mans": { code: "fr" },
    "Strasbourg IG": { code: "fr" },
    "Bourg": { code: "fr" },
    "Dijon": { code: "fr" },
    "Saint-Quentin": { code: "fr" },
    "Le Portel": { code: "fr" },
    "Limoges": { code: "fr" },
    "Nancy": { code: "fr" },
    "Chalon": { code: "fr" },
    "Blois": { code: "fr" },
    "Gravelines": { code: "fr" },
    "Roanne": { code: "fr" },
    "Metropolitans 92": { code: "fr" },
    "Boulogne-Levallois": { code: "fr" },
    "Fos-sur-Mer": { code: "fr" },
    "Pau-Orthez": { code: "fr" },
    "Antibes": { code: "fr" },
    "Denain": { code: "fr" },
    "Evreux": { code: "fr" },
    "Gries-Souffel": { code: "fr" },
    "Lille Basket": { code: "fr" },
    "Saint-Chamond": { code: "fr" },
    "Vichy-Clermont": { code: "fr" },
    "Aix-Maurienne": { code: "fr" },
    "Angers": { code: "fr" },
    "Boulazac": { code: "fr" },
    "Chalons-Reims": { code: "fr" },
    "La Rochelle Basket": { code: "fr" },
    "Poitiers": { code: "fr" },
    "Rouen": { code: "fr" },
    "St-Vallier": { code: "fr" },
    "Quimper": { code: "fr" },
    "Alliance Sport Alsace": { code: "fr" },
    "Saint-Vallier": { code: "fr" },

    // More Football Teams
    "Lorient": { code: "fr" },
    "Metz": { code: "fr" },
    "Le Havre": { code: "fr" },
    "Clermont Foot": { code: "fr" },
    "Auxerre": { code: "fr" },
    "Angers SCO": { code: "fr" },
    "Saint-Étienne": { code: "fr" },
    "Bordeaux FC": { code: "fr" },
    "Paris FC": { code: "fr" },
    "Troyes": { code: "fr" },
    "Ajaccio": { code: "fr" },
    "Caen": { code: "fr" },
    "Guingamp": { code: "fr" },
    "Rodez": { code: "fr" },
    "Pau FC": { code: "fr" },
    "Amiens": { code: "fr" },
    "Grenoble": { code: "fr" },
    "Laval": { code: "fr" },
    "Annecy": { code: "fr" },
    "Concarneau": { code: "fr" },
    "Quevilly": { code: "fr" },
    "Valenciennes": { code: "fr" },
    "Dunkerque": { code: "fr" },
    "Red Star": { code: "fr" },
    "Martigues": { code: "fr" },
    "Niort": { code: "fr" },
    "Orléans": { code: "fr" },
    "Nancy-Lorraine": { code: "fr" },
    "Châteauroux": { code: "fr" },
    "Sochaux": { code: "fr" },
    "Nîmes": { code: "fr" },
    "Le Mans FC": { code: "fr" },
    "Dijon FCO": { code: "fr" },
    "Versailles": { code: "fr" },
    "Cholet SO": { code: "fr" },
    "Avranches": { code: "fr" },
    "Villefranche": { code: "fr" },
    "Marignane": { code: "fr" },
    "Epinal": { code: "fr" },
    "Goyave": { code: "fr" },
    "Bastia": { code: "fr" },
    "Bastia-Borgo": { code: "fr" },
    "Sedan": { code: "fr" },
    "Boulogne": { code: "fr" },
    "Creteil": { code: "fr" },
    "Bourg-en-Bresse": { code: "fr" },
    "Concarneau US": { code: "fr" },
    "Stade Briochin": { code: "fr" },
    "Sete": { code: "fr" },
    "Chambly": { code: "fr" },
    "Luzenac": { code: "fr" },
    "Arles-Avignon": { code: "fr" },
    "Istres": { code: "fr" },
    "Gueugnon": { code: "fr" },
    "Libourne": { code: "fr" },
    "Vannes": { code: "fr" },
    "Evian": { code: "fr" },
    "Gazelec Ajaccio": { code: "fr" },
    "Tours FC": { code: "fr" },
    "Laval MFC": { code: "fr" },
    "Le Puy": { code: "fr" },
    "Sète 34": { code: "fr" },
    "Lyon-Duchère": { code: "fr" },
    "Drancy": { code: "fr" },
    "Entente SSG": { code: "fr" },
    "Les Herbiers": { code: "fr" },
    "Consolat Marseille": { code: "fr" },
    "Belfort": { code: "fr" },
    "Colmar": { code: "fr" },
    "Luçon": { code: "fr" },
    "Fréjus Saint-Raphaël": { code: "fr" },
    "Carquefou": { code: "fr" },
    "Uzès Pont du Gard": { code: "fr" },
    "Cherbourg": { code: "fr" },
    "Quevilly-Rouen": { code: "fr" },
    "Rouen FC": { code: "fr" },
    "Beauvais": { code: "fr" },
    "Pacy-sur-Eure": { code: "fr" },
    "Plabennec": { code: "fr" },
    "Rodez AF": { code: "fr" },
    "Cannes": { code: "fr" },
    "Cassis Carnoux": { code: "fr" },
    "Croix de Savoie": { code: "fr" },
    "Pau Football Club": { code: "fr" },
    "Villemomble": { code: "fr" },
    "Calais": { code: "fr" },
    "Louhans-Cuiseaux": { code: "fr" },
    "Raon-l'Étape": { code: "fr" },
    "Yzeure": { code: "fr" },
    "Montceau": { code: "fr" },
    "Châtellerault": { code: "fr" },
    "Toulon": { code: "fr" },
    "Moulins": { code: "fr" },
    "Bayonne Aviron": { code: "fr" },
    "Sannois Saint-Gratien": { code: "fr" },
    "Wasquehal": { code: "fr" },
    "Alès": { code: "fr" },
    "Martigues FC": { code: "fr" },
    "Angoulême": { code: "fr" },
    "La Roche-sur-Yon": { code: "fr" },
    "Lusitanos Saint-Maur": { code: "fr" },
    "Poissy": { code: "fr" },
    "Sainte-Geneviève": { code: "fr" },
    "Fleury": { code: "fr" },
    "Bobigny": { code: "fr" },
    "Haguenau": { code: "fr" },
    "Schiltigheim": { code: "fr" },
    "Biesheim": { code: "fr" },
    "Colomiers": { code: "fr" },
    "Bergerac": { code: "fr" },
    "Trélissac": { code: "fr" },
    "Anglet": { code: "fr" },
    "Canet Roussillon": { code: "fr" },
    "Blagnac": { code: "fr" },
    "Castanet": { code: "fr" },
    "Onet-le-Château": { code: "fr" },
    "Alberes Argeles": { code: "fr" },
    "Balma": { code: "fr" },
    "Agde": { code: "fr" },
    "Beziers": { code: "fr" },
    "Sete FC": { code: "fr" },
    "Aubagne": { code: "fr" },
    "Hyères": { code: "fr" },
    "Grasse": { code: "fr" },
    "Fréjus": { code: "fr" },
    "Saint-Priest": { code: "fr" },
    "Jura Sud": { code: "fr" },
    "Louhans": { code: "fr" },
    "Gueugnon FC": { code: "fr" },
    "Montceau FC": { code: "fr" },
    "Bourgoin-Jallieu": { code: "fr" },
    "Rumilly-Vallières": { code: "fr" },
    "Thonon Évian": { code: "fr" },
    "Chambéry": { code: "fr" },
    "Aix FC": { code: "fr" },
    "Hauts Lyonnais": { code: "fr" },
    "Limonest": { code: "fr" },
    "Vaulx-en-Velin": { code: "fr" },
    "Ain Sud": { code: "fr" },
    "Chassieu Décines": { code: "fr" },
    "Espaly": { code: "fr" },
    "Feurs": { code: "fr" },
    "Valence": { code: "fr" },
    "Montélimar": { code: "fr" },
    "Rhône Vallées": { code: "fr" },
    "Cluses-Scionzier": { code: "fr" },
    "Sallanches": { code: "fr" },
    "Passy": { code: "fr" },
    "Bonneville": { code: "fr" },
    "Saint-Julien": { code: "fr" },
    "Annemasse": { code: "fr" },
    "Gaillard": { code: "fr" },
    "Ville-la-Grand": { code: "fr" },
    "Ambilly": { code: "fr" },
    "Vétraz-Monthoux": { code: "fr" },
    "Cranves-Sales": { code: "fr" },
    "Douvaine": { code: "fr" },
    "Thonon": { code: "fr" },
    "Evian TG": { code: "fr" },
    "Publier": { code: "fr" },
    "Neuvecelle": { code: "fr" },
    "Maxilly": { code: "fr" },
    "Lugrin": { code: "fr" },
    "Meillerie": { code: "fr" },
    "Saint-Gingolph": { code: "fr" },
    "Abondance": { code: "fr" },
    "La Chapelle d'Abondance": { code: "fr" },
    "Châtel": { code: "fr" },
    "Morzine": { code: "fr" },
    "Les Gets": { code: "fr" },
    "Taninges": { code: "fr" },
    "Mieussy": { code: "fr" },
    "Viuz-en-Sallaz": { code: "fr" },
    "Saint-Jeoire": { code: "fr" },
    "Onnion": { code: "fr" },
    "Bogève": { code: "fr" },
    "Habère-Lullin": { code: "fr" },
    "Habère-Poche": { code: "fr" },
    "Bellevaux": { code: "fr" },
    "Lullin": { code: "fr" },
    "Vailly": { code: "fr" },
    "Reyvroz": { code: "fr" },
    "Lyaud": { code: "fr" },
    "Armoy": { code: "fr" },
    "Allinges": { code: "fr" },
    "Orcier": { code: "fr" },
    "Draillant": { code: "fr" },
    "Perrignier": { code: "fr" },
    "Cervens": { code: "fr" },
    "Fessy": { code: "fr" },
    "Lully": { code: "fr" },
    "Bons-en-Chablais": { code: "fr" },
    "Brenthonne": { code: "fr" },
    "Sciez": { code: "fr" },
    "Excenevex": { code: "fr" },
    "Yvoire": { code: "fr" },
    "Messery": { code: "fr" },
    "Nernier": { code: "fr" },
    "Chens-sur-Léman": { code: "fr" },
    "Veigy-Foncenex": { code: "fr" },
    "Loisin": { code: "fr" },
    "Ballaison": { code: "fr" },
    "Massongy": { code: "fr" },
    "Douvaine FC": { code: "fr" },

    // More African Teams
    "Plateau Utd": { code: "ng" },
    "Bendel Insurance": { code: "ng" },
    "Shooting Stars": { code: "ng" },
    "Kwara Utd": { code: "ng" },
    "Sunshine Stars": { code: "ng" },
    "Akwa Utd": { code: "ng" },
    "Abia Warriors": { code: "ng" },
    "Heartland FC": { code: "ng" },
    "Gombe Utd": { code: "ng" },
    "Niger Tornadoes": { code: "ng" },
    "Katsina Utd": { code: "ng" },
    "Sporting Lagos": { code: "ng" },
    "Bayelsa Utd": { code: "ng" },
    "Doma Utd": { code: "ng" },
    "Ittihad Tanger": { code: "ma" },
    "Moghreb Tetouan": { code: "ma" },
    "JS Soualem": { code: "ma" },
    "Union Touarga": { code: "ma" },
    "Chabab Mohammedia": { code: "ma" },
    "Mouloudia Oujda": { code: "ma" },
    "Renaissance Zemamra": { code: "ma" },
    "Youssoufia Berrechid": { code: "ma" },
    "CS Constantine": { code: "dz" },
    "JS Saoura": { code: "dz" },
    "MC Oran": { code: "dz" },
    "ASO Chlef": { code: "dz" },
    "US Biskra": { code: "dz" },
    "NC Magra": { code: "dz" },
    "ES Ben Aknoun": { code: "dz" },
    "US Souf": { code: "dz" },
    "Sekhukhune Utd": { code: "za" },
    "TS Galaxy": { code: "za" },
    "Golden Arrows": { code: "za" },
    "AmaZulu": { code: "za" },
    "Polokwane City": { code: "za" },
    "Chippa Utd": { code: "za" },
    "Moroka Swallows": { code: "za" },
    "Richards Bay": { code: "za" },
    "Cape Town Spurs": { code: "za" },
    "Smouha": { code: "eg" },
    "ZED FC": { code: "eg" },
    "Ceramica Cleopatra": { code: "eg" },
    "Al Ittihad": { code: "eg" },
    "Enppi": { code: "eg" },
    "Tala'ea El Gaish": { code: "eg" },
    "National Bank": { code: "eg" },
    "Ismaily": { code: "eg" },
    "El Gouna": { code: "eg" },
    "Modern Future": { code: "eg" },
    "Stade Tunisien": { code: "tn" },
    "CA Bizertin": { code: "tn" },
    "ES Métlaoui": { code: "tn" },
    "US Tataouine": { code: "tn" },
    "Olympique Béja": { code: "tn" },
    "AS Soliman": { code: "tn" },
    "EGS Gafsa": { code: "tn" },

    // Rugby (Six Nations)
    "France": { code: "fr" },
    "Ireland": { code: "ie" },
    "England": { code: "gb" },
    "Scotland": { code: "gb" },
    "Wales": { code: "gb" },
    "Italy": { code: "it" },

    // Tennis
    "Djokovic N.": { code: "rs" },
    "Alcaraz C.": { code: "es" },
    "Medvedev D.": { code: "ru" },
    "Sinner J.": { code: "it" },
    "Nadal R.": { code: "es" },
    "Rublev A.": { code: "ru" },
    "Zverev A.": { code: "de" },
    "Tsitsipas S.": { code: "gr" },
    "Rune H.": { code: "dk" },
    "Hurkacz H.": { code: "pl" },
    "Fritz T.": { code: "us" },
    "Ruud C.": { code: "no" },
    "De Minaur A.": { code: "au" },
    "Swiatek I.": { code: "pl" },
    "Sabalenka A.": { code: "by" },
    "Gauff C.": { code: "us" },
    "Rybakina E.": { code: "kz" },
    "Pegula J.": { code: "us" },
    "Jabeur O.": { code: "tn" },
    "Vondrousova M.": { code: "cz" },
    "Sakkari M.": { code: "gr" },
    "Muchova K.": { code: "cz" },
    "Krejcikova B.": { code: "cz" },
};

export const getFlag = (code: string) => {
    if (code === 'africa') return '🌍';
    if (code === 'eu') return 'https://raw.githubusercontent.com/gazawaamos8-blip/Icon-sport-bet-pro/refs/heads/main/ucl-logo.png'; // Champions League Logo
    if (code === 'wo' || code === 'un') return 'https://flagcdn.com/w40/un.png';
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

export const getLeagueInfo = (leagueName: string) => {
    return Object.values(LEAGUES).find(l => l.name === leagueName);
};

// Realistic Player Names for Lineups and Events
const PLAYER_NAMES = [
    "Kylian Mbappé", "Lionel Messi", "Cristiano Ronaldo", "Erling Haaland", "Kevin De Bruyne", 
    "Mohamed Salah", "Robert Lewandowski", "Vinícius Júnior", "Jude Bellingham", "Harry Kane",
    "Bukayo Saka", "Phil Foden", "Rodri", "Bernardo Silva", "Antoine Griezmann",
    "Luka Modrić", "Toni Kroos", "Federico Valverde", "Aurélien Tchouaméni", "Eduardo Camavinga",
    "Sadio Mané", "Victor Osimhen", "Achraf Hakimi", "Riyad Mahrez", "Mohamed Kudus",
    "André Onana", "Kalidou Koulibaly", "Thomas Partey", "Sébastien Haller", "Nicolas Jackson",
    "Darwin Núñez", "Luis Díaz", "Alexis Mac Allister", "Dominik Szoboszlai", "Virgil van Dijk",
    "Bruno Fernandes", "Marcus Rashford", "Alejandro Garnacho", "Rasmus Højlund", "Casemiro",
    "Martin Ødegaard", "Declan Rice", "Gabriel Jesus", "Gabriel Martinelli", "William Saliba",
    "Lautaro Martínez", "Marcus Thuram", "Nicolò Barella", "Hakan Çalhanoğlu", "Alessandro Bastoni",
    "Rafael Leão", "Olivier Giroud", "Theo Hernández", "Mike Maignan", "Christian Pulisic",
    "Dušan Vlahović", "Federico Chiesa", "Adrien Rabiot", "Manuel Locatelli", "Gleison Bremer",
    "Jamal Musiala", "Harry Kane", "Leroy Sané", "Joshua Kimmich", "Alphonso Davies",
    "Julian Brandt", "Marco Reus", "Gregor Kobel", "Nico Schlotterbeck", "Emre Can",
    "Florian Wirtz", "Granit Xhaka", "Jeremie Frimpong", "Álex Grimaldo", "Victor Boniface"
];

const getPlayerPhoto = (seed: number) => `https://randomuser.me/api/portraits/men/${seed % 99}.jpg`;

// Expanded Database of Leagues and Teams for 500+ matches generation
const LEAGUES = {
  // --- FOOTBALL ---
  NPFL: {
      name: "Nigeria Premier League", category: 'africa', code: 'ng', sport: 'football',
      teams: ["Enyimba", "Remo Stars", "Lobi Stars", "Kano Pillars", "Rangers Int.", "Rivers Utd", "Plateau Utd", "Bendel Insurance", "Shooting Stars", "Kwara Utd", "Akwa Utd", "Abia Warriors", "Heartland FC", "Gombe Utd", "Niger Tornadoes", "Katsina Utd", "Sporting Lagos", "Bayelsa Utd", "Doma Utd", "Sunshine Stars"]
  },
  BOTOLA: {
      name: "Botola Pro", category: 'africa', code: 'ma', sport: 'football',
      teams: ["Raja CA", "Wydad AC", "AS FAR", "RS Berkane", "FUS Rabat", "Maghreb Fes", "Ittihad Tanger", "Moghreb Tetouan", "JS Soualem", "Union Touarga", "Chabab Mohammedia", "Mouloudia Oujda", "Renaissance Zemamra", "Youssoufia Berrechid", "JS Soualem", "Union Touarga", "Chabab Mohammedia", "Mouloudia Oujda", "Renaissance Zemamra", "Youssoufia Berrechid"]
  },
  LIGUE1_DZ: {
      name: "Ligue 1 Algérie", category: 'africa', code: 'dz', sport: 'football',
      teams: ["MC Alger", "CR Belouizdad", "JS Kabylie", "ES Sétif", "USM Alger", "Paradou AC", "CS Constantine", "JS Saoura", "MC Oran", "ASO Chlef", "US Biskra", "NC Magra", "ES Ben Aknoun", "US Souf", "US Biskra", "NC Magra", "ES Ben Aknoun", "US Souf", "US Biskra", "NC Magra"]
  },
  PSL_SA: {
      name: "PSL South Africa", category: 'africa', code: 'za', sport: 'football',
      teams: ["Mamelodi Sundowns", "Orlando Pirates", "Kaizer Chiefs", "SuperSport Utd", "Cape Town City", "Stellenbosch", "Sekhukhune Utd", "TS Galaxy", "Golden Arrows", "AmaZulu", "Polokwane City", "Chippa Utd", "Moroka Swallows", "Richards Bay", "Cape Town Spurs", "Polokwane City", "Chippa Utd", "Moroka Swallows", "Richards Bay", "Cape Town Spurs"]
  },
  EGYPT_PL: {
      name: "Egyptian Premier League", category: 'africa', code: 'eg', sport: 'football',
      teams: ["Al Ahly", "Zamalek", "Pyramids FC", "Al Masry", "Future FC", "Smouha", "ZED FC", "Ceramica Cleopatra", "Al Ittihad", "Enppi", "Tala'ea El Gaish", "National Bank", "Ismaily", "El Gouna", "Modern Future", "Enppi", "Tala'ea El Gaish", "National Bank", "Ismaily", "El Gouna"]
  },
  TUNISIA_L1: {
      name: "Ligue 1 Tunisie", category: 'africa', code: 'tn', sport: 'football',
      teams: ["Espérance Tunis", "Étoile du Sahel", "Club Africain", "CS Sfaxien", "US Monastir", "Stade Tunisien", "CA Bizertin", "ES Métlaoui", "US Tataouine", "Olympique Béja", "AS Soliman", "EGS Gafsa", "US Tataouine", "Olympique Béja", "AS Soliman", "EGS Gafsa", "US Tataouine", "Olympique Béja", "AS Soliman", "EGS Gafsa"]
  },
  GHANA_PL: {
      name: "Ghana Premier League", category: 'local', code: 'gh', sport: 'football',
      teams: ["Asante Kotoko", "Hearts of Oak", "Medeama SC", "Aduana Stars", "Bechem Utd", "Nsoatreman", "Berekum Chelsea", "Legon Cities", "Bibiani Gold Stars", "Karela Utd", "Great Olympics", "Heart of Lions", "Medeama SC", "Aduana Stars", "Bechem Utd", "Nsoatreman", "Berekum Chelsea", "Legon Cities", "Bibiani Gold Stars", "Karela Utd"]
  },
  SENEGAL_L1: {
      name: "Ligue 1 Sénégal", category: 'local', code: 'sn', sport: 'football',
      teams: ["Teungueth FC", "Jaraaf", "Pikine", "Casa Sports", "Guédiawaye", "Dakar Sacré-Cœur", "US Ouakam", "Stade de Mbour", "Génération Foot", "Diambars", "AS Douanes", "ASC Linguère", "ASC Diaraf", "US Gorée", "Teungueth FC", "Jaraaf", "Pikine", "Casa Sports", "Guédiawaye", "Dakar Sacré-Cœur"]
  },
  CIV_L1: { 
      name: "Ligue 1 Côte d'Ivoire", category: 'local', code: 'ci', sport: 'football',
      teams: ["ASEC Mimosas", "San Pédro", "AFAD", "SC Gagnoa", "Racing Club Abidjan", "SOA", "Stella Club", "LYS Sassandra", "CO Korhogo", "Mouna FC", "Stade d'Abidjan", "Zoman FC", "Bouaké FC", "ASI d'Abengourou", "Indenié", "Denguélé", "SOL FC", "FC San Pedro", "Lys Sassandra", "Sporting Gagnoa", "Bassam", "Gagnoa", "Korhogo", "Bouake", "Abengourou", "Denguele", "Sol FC", "San Pedro", "Stella", "Racing", "Afad", "Asec", "Mimosas", "Africa Sports", "Stade Abidjan", "JCA Treichville", "Sewe Sport", "Tanda", "Moossou", "WAC", "Yamoussoukro", "Issia Wazi", "Ouragahio", "Hiré", "Daloa", "Odienné", "Bingerville", "Toumodi", "Man", "Bouna", "Bondoukou", "Ferké", "Ouangolo", "Tingrela", "Boundiali", "Mankono", "Seguela", "Vavoua", "Zuenoula", "Bouaflé", "Sinfra", "Oumé", "Divo", "Lakota", "Guiglo", "Duékoué", "Bangolo", "Logoualé", "Danané", "Biankouma", "Sipilou", "Zouan-Hounien", "Bin-Houyé", "Toulépleu", "Bloléquin", "Taï", "Grabo", "Tabou", "Grand-Béréby", "Sassandra", "Fresco", "Grand-Lahou", "Jacqueville", "Dabou", "Sikensi", "Tiassalé", "N'douci"]
  },
  UCL: { 
      name: "UEFA Champions League", category: 'europe', code: 'eu', sport: 'football',
      teams: [
          "Real Madrid", "Barcelona", "Bayern Munich", "Man City", "PSG", "Liverpool", "Arsenal", "Inter Milan", 
          "AC Milan", "Juventus", "Dortmund", "Atlético", "Chelsea", "Man Utd", "Bayer Leverkusen", "Napoli",
          "Benfica", "Porto", "Sporting CP", "Ajax", "PSV", "Feyenoord", "Lazio", "Roma", "Atalanta", "RB Leipzig"
      ] 
  },
  PL: { 
      name: "Premier League", category: 'europe', code: 'gb', sport: 'football',
      teams: ["Liverpool", "Chelsea", "Man Utd", "Spurs", "Newcastle", "Aston Villa", "West Ham", "Brighton", "Bournemouth", "Fulham", "Wolves", "Everton", "Brentford", "Nottingham", "Palace", "Luton", "Burnley", "Sheffield Utd", "Leicester", "Leeds", "Southampton", "Arsenal", "Man City", "Aston Villa", "Newcastle", "Spurs"] 
  },
  LIGA: { 
      name: "La Liga", category: 'europe', code: 'es', sport: 'football',
      teams: ["Sevilla", "Atletico", "Valencia", "Betis", "Girona", "Bilbao", "Espanyol", "Barcelona", "Real Madrid", "Sociedad", "Villarreal", "Mallorca", "Osasuna", "Rayo Vallecano", "Getafe", "Alavés", "Las Palmas", "Granada", "Cadiz", "Celta Vigo", "Almeria", "Mallorca", "Osasuna", "Rayo Vallecano", "Getafe", "Alavés", "Las Palmas", "Granada", "Cadiz"] 
  },
  SERIEA: {
      name: "Serie A", category: 'europe', code: 'it', sport: 'football',
      teams: ["Juventus", "AC Milan", "Inter Milan", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Bologna", "Torino", "Monza", "Genoa", "Lecce", "Sassuolo", "Udinese", "Empoli", "Verona", "Cagliari", "Salernitana", "Frosinone", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina"]
  },
  BUNDESLIGA: {
      name: "Bundesliga", category: 'europe', code: 'de', sport: 'football',
      teams: ["Bayern Munich", "Dortmund", "Leipzig", "Leverkusen", "Frankfurt", "Wolfsburg", "Stuttgart", "Freiburg", "Hoffenheim", "Gladbach", "Werder Bremen", "Augsburg", "Mainz", "Heidenheim", "Union Berlin", "Darmstadt", "Koln", "Bayern Munich", "Dortmund", "Leipzig", "Leverkusen", "Frankfurt"]
  },
  LIGUE1: {
      name: "Ligue 1", category: 'europe', code: 'fr', sport: 'football',
      teams: ["PSG", "Marseille", "Lyon", "Monaco", "Lille", "Lens", "Rennes", "Nice", "Reims", "Toulouse", "Montpellier", "Strasbourg", "Brest", "Nantes", "Lorient", "Metz", "Le Havre", "Clermont Foot", "Auxerre", "Angers SCO", "Saint-Étienne", "Bordeaux FC", "Paris FC", "Troyes", "Ajaccio", "Caen", "Guingamp", "Rodez", "Pau FC", "Amiens", "Grenoble", "Laval", "Annecy", "Concarneau", "Quevilly", "Valenciennes", "Dunkerque", "Red Star", "Martigues", "Niort", "Orléans", "Nancy-Lorraine", "Châteauroux", "Sochaux", "Nîmes", "Le Mans FC", "Dijon FCO", "Versailles", "Cholet SO", "Avranches", "Villefranche", "Marignane", "Epinal", "Goyave", "Bastia", "Bastia-Borgo", "Sedan", "Boulogne", "Creteil", "Bourg-en-Bresse", "Concarneau US", "Stade Briochin", "Sete", "Chambly", "Luzenac", "Arles-Avignon", "Istres", "Gueugnon", "Libourne", "Vannes", "Evian", "Gazelec Ajaccio", "Tours FC", "Laval MFC", "Le Puy", "Sète 34", "Lyon-Duchère", "Drancy", "Entente SSG", "Les Herbiers", "Consolat Marseille", "Belfort", "Colmar", "Luçon", "Fréjus Saint-Raphaël", "Carquefou", "Uzès Pont du Gard", "Cherbourg", "Quevilly-Rouen", "Rouen FC", "Beauvais", "Pacy-sur-Eure", "Plabennec", "Rodez AF", "Cannes", "Cassis Carnoux", "Croix de Savoie", "Pau Football Club", "Villemomble", "Calais", "Louhans-Cuiseaux", "Raon-l'Étape", "Yzeure", "Montceau", "Châtellerault", "Toulon", "Moulins", "Bayonne Aviron", "Sannois Saint-Gratien", "Wasquehal", "Alès", "Martigues FC", "Angoulême", "La Roche-sur-Yon", "Lusitanos Saint-Maur", "Poissy", "Sainte-Geneviève", "Fleury", "Bobigny", "Haguenau", "Schiltigheim", "Biesheim", "Colomiers", "Bergerac", "Trélissac", "Anglet", "Canet Roussillon", "Blagnac", "Castanet", "Onet-le-Château", "Alberes Argeles", "Balma", "Agde", "Beziers", "Sete FC", "Aubagne", "Hyères", "Grasse", "Fréjus", "Saint-Priest", "Jura Sud", "Louhans", "Gueugnon FC", "Montceau FC", "Bourgoin-Jallieu", "Rumilly-Vallières", "Thonon Évian", "Chambéry", "Aix FC", "Hauts Lyonnais", "Limonest", "Vaulx-en-Velin", "Ain Sud", "Chassieu Décines", "Espaly", "Feurs", "Valence", "Montélimar", "Rhône Vallées", "Cluses-Scionzier", "Sallanches", "Passy", "Bonneville", "Saint-Julien", "Annemasse", "Gaillard", "Ville-la-Grand", "Ambilly", "Vétraz-Monthoux", "Cranves-Sales", "Douvaine", "Thonon", "Evian TG", "Publier", "Neuvecelle", "Maxilly", "Lugrin", "Meillerie", "Saint-Gingolph", "Abondance", "La Chapelle d'Abondance", "Châtel", "Morzine", "Les Gets", "Taninges", "Mieussy", "Viuz-en-Sallaz", "Saint-Jeoire", "Onnion", "Bogève", "Habère-Lullin", "Habère-Poche", "Bellevaux", "Lullin", "Vailly", "Reyvroz", "Lyaud", "Armoy", "Allinges", "Orcier", "Draillant", "Perrignier", "Cervens", "Fessy", "Lully", "Bons-en-Chablais", "Brenthonne", "Sciez", "Excenevex", "Yvoire", "Messery", "Nernier", "Chens-sur-Léman", "Veigy-Foncenex", "Loisin", "Ballaison", "Massongy", "Douvaine FC"]
  },


  EREDIVISIE: {
      name: "Eredivisie", category: 'europe', code: 'nl', sport: 'football',
      teams: ["Ajax", "PSV", "Feyenoord", "AZ Alkmaar", "Twente", "Utrecht", "Sparta Rotterdam", "Go Ahead Eagles", "NEC Nijmegen", "Heerenveen"]
  },
  PRIMEIRA: {
      name: "Primeira Liga", category: 'europe', code: 'pt', sport: 'football',
      teams: ["Benfica", "Porto", "Sporting CP", "Braga", "Guimarães", "Moreirense", "Arouca", "Rio Ave", "Famalicao", "Gil Vicente"]
  },
  MLS: {
      name: "Major League Soccer", category: 'world', code: 'us', sport: 'football',
      teams: ["Inter Miami", "LA Galaxy", "LAFC", "NY Red Bulls", "Seattle Sounders", "Columbus Crew", "FC Cincinnati", "St. Louis City", "Orlando City", "Philadelphia Union"]
  },
  SAUDI: {
      name: "Saudi Pro League", category: 'world', code: 'sa', sport: 'football',
      teams: ["Al-Nassr", "Al-Hilal", "Al-Ittihad", "Al-Ahli", "Al-Shabab", "Al-Ettifaq", "Al-Fateh", "Al-Taawoun", "Damac", "Al-Fayha"]
  },
  ARGENTINA: {
      name: "Primera División", category: 'world', code: 'ar', sport: 'football',
      teams: ["River Plate", "Boca Juniors", "Racing Club", "Independiente", "San Lorenzo", "Estudiantes", "Talleres", "Godoy Cruz", "Lanus", "Velez Sarsfield"]
  },
  BRAZIL: {
      name: "Série A", category: 'world', code: 'br', sport: 'football',
      teams: ["Flamengo", "Palmeiras", "São Paulo", "Corinthians", "Fluminense", "Grêmio", "Atlético Mineiro", "Botafogo", "Red Bull Bragantino", "Athletico Paranaense"]
  },
  
  // --- BASKETBALL ---
  NBA: {
      name: "NBA", category: 'world', code: 'us', sport: 'basketball',
      teams: ["Lakers", "Warriors", "Celtics", "Heat", "Bulls", "Knicks", "Nets", "Sixers", "Bucks", "Suns", "Mavericks", "Nuggets", "Clippers", "Kings", "Grizzlies", "Spurs", "Thunder", "Timberwolves", "Pacers", "Cavaliers", "Pelicans", "Magic", "Rockets", "Hawks", "Jazz"]
  },
  ACB: {
      name: "Liga ACB", category: 'europe', code: 'es', sport: 'basketball',
      teams: ["Real Madrid B.", "Barcelona B.", "Unicaja", "Valencia Basket", "Tenerife", "Gran Canaria", "Murcia", "Baskonia", "Manresa", "Joventut"]
  },
  LEGA_BASKET: {
      name: "Lega Basket", category: 'europe', code: 'it', sport: 'basketball',
      teams: ["Olimpia Milano", "Virtus Bologna", "Venezia", "Sassari", "Brescia", "Reggiana", "Trento", "Tortona"]
  },
  EUROLEAGUE: {
      name: "EuroLeague", category: 'europe', code: 'eu', sport: 'basketball',
      teams: ["Real Madrid B.", "Barcelona B.", "Olympiacos", "Monaco Basket", "Fenerbahçe", "Panathinaikos", "Maccabi", "Virtus Bologna", "Partizan", "Valencia Basket", "Crvena Zvezda", "Anadolu Efes", "Zalgiris Kaunas", "Bayern Basketball", "ALBA Berlin", "ASVEL", "Baskonia", "Olimpia Milano"]
  },

  // --- TENNIS ---
  ROLAND_GARROS: {
      name: "Roland Garros", category: 'europe', code: 'fr', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Nadal R.", "Sinner J.", "Medvedev D.", "Rublev A.", "Zverev A.", "Tsitsipas S."]
  },
  WIMBLEDON: {
      name: "Wimbledon", category: 'europe', code: 'gb', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J.", "Hurkacz H.", "Fritz T.", "Ruud C.", "Berrettini M."]
  },
  US_OPEN: {
      name: "US Open", category: 'world', code: 'us', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J.", "Shelton B.", "Tiafoe F.", "Paul T.", "Eubanks C."]
  },
  AUS_OPEN: {
      name: "Australian Open", category: 'world', code: 'au', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J.", "De Minaur A.", "Popyrin A.", "Thompson J.", "Kyrgios N."]
  },
  ATP: {
      name: "ATP Tour", category: 'world', code: 'un', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J.", "Rublev A.", "Zverev A.", "Tsitsipas S.", "Rune H.", "Hurkacz H.", "Fritz T.", "Ruud C.", "De Minaur A.", "Khachanov K.", "Dimitrov G.", "Shelton B.", "Musetti L.", "Auger-Aliassime F.", "Norrie C.", "Jarry N.", "Bublik A."]
  },
  WTA: {
      name: "WTA Tour", category: 'world', code: 'un', sport: 'tennis',
      teams: ["Swiatek I.", "Sabalenka A.", "Gauff C.", "Rybakina E.", "Pegula J.", "Jabeur O.", "Vondrousova M.", "Sakkari M.", "Muchova K.", "Krejcikova B.", "Ostapenko J.", "Zheng Q.", "Kasatkina D.", "Haddad Maia B.", "Samsonova L.", "Keys M.", "Garcia C.", "Azarenka V.", "Svitolina E.", "Badosa P."]
  },

  // --- RUGBY ---
  TOP14: {
      name: "Top 14", category: 'europe', code: 'fr', sport: 'rugby',
      teams: ["Toulouse", "La Rochelle", "Stade Français", "Bordeaux", "Racing 92", "Toulon", "Lyon", "Bayonne", "Castres", "Clermont", "Pau", "Perpignan", "Oyonnax", "Montpellier"]
  },
  PREMIERSHIP: {
      name: "Premiership Rugby", category: 'europe', code: 'gb', sport: 'rugby',
      teams: ["Northampton", "Bath", "Sale Sharks", "Saracens", "Bristol Bears", "Harlequins", "Leicester Tigers", "Exeter Chiefs", "Gloucester", "Newcastle Falcons"]
  }
};

let matchesState: Match[] = [];
let listeners: ((matches: Match[]) => void)[] = [];

// --- Mock WebSocket Engine ---
class MockSocket {
  interval: any = null;

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.updateLiveMatches();
    }, 2000); // Updates every 2 seconds
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  updateLiveMatches() {
    let hasChanges = false;
    matchesState = matchesState.map(match => {
      if (match.status !== 'live') return match;

      let newTime = match.time;
      let newHomeScore = match.homeScore;
      let newAwayScore = match.awayScore;
      let newEvents = match.events || [];
      let newLiveAction = match.liveAction;

      // Logic differs by sport
      if (match.sport === 'football' || match.sport === 'rugby') {
          const timeVal = parseInt(match.time.replace("'", ""));
          if (!isNaN(timeVal) && timeVal < 90) {
            newTime = `${timeVal + 1}'`;
            hasChanges = true;
          }

          // Live Action Simulation
          const actionTypes: any[] = ['attack', 'danger', 'normal', 'corner', 'freekick'];
          const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
          const team = Math.random() < 0.5 ? 'home' : 'away';
          
          let x = 50;
          let y = Math.floor(Math.random() * 60) + 20;
          let message = "Jeu au milieu de terrain";

          if (type === 'attack') {
            x = team === 'home' ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 20) + 20;
            message = team === 'home' ? `${match.homeTeam} attaque` : `${match.awayTeam} attaque`;
          } else if (type === 'danger') {
            x = team === 'home' ? Math.floor(Math.random() * 10) + 85 : Math.floor(Math.random() * 10) + 5;
            message = "DANGER ! Attaque dangereuse";
          } else if (type === 'corner') {
            x = team === 'home' ? 95 : 5;
            y = Math.random() < 0.5 ? 5 : 95;
            message = `Corner pour ${team === 'home' ? match.homeTeam : match.awayTeam}`;
          }

          newLiveAction = {
            type,
            team,
            x,
            y,
            message
          };
          hasChanges = true;
      } else if (match.sport === 'basketball') {
          // Basketball time counts down usually, simplified here
          if (Math.random() > 0.5) newTime = `Q4 ${Math.floor(Math.random()*10)}:00`;
      }

      // Random Scoring Simulation
      if (Math.random() < 0.05) { 
        const isHome = Math.random() > 0.5;
        let points = 1;
        let eventType = 'goal';
        let detail = "But";

        if (match.sport === 'basketball') {
            points = Math.floor(Math.random() * 3) + 1; // 1, 2 or 3 points
            eventType = 'goal';
            detail = `${points} Pts`;
        } else if (match.sport === 'rugby') {
            points = Math.random() > 0.7 ? 5 : 3; // Try or Penalty
            eventType = 'goal';
            detail = points === 5 ? "Essai" : "Pénalité";
        } else if (match.sport === 'tennis') {
            points = 0; 
        }

        if (points > 0) {
            if (isHome) newHomeScore += points; else newAwayScore += points;
            hasChanges = true;
            
            newEvents = [...newEvents, {
                id: `e_live_${Date.now()}_${match.id}`,
                minute: parseInt(newTime) || 0,
                type: 'goal',
                team: isHome ? 'home' : 'away',
                player: { name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], photo: getPlayerPhoto(Date.now()) },
                detail: detail
            }];
        }
      }

      return {
        ...match,
        time: newTime,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        events: newEvents,
        liveAction: newLiveAction
      };
    });

    if (hasChanges) {
      this.notifyListeners();
    }
  }

  notifyListeners() {
    listeners.forEach(callback => callback([...matchesState]));
  }
}

const socketEngine = new MockSocket();

// --- Initialization ---

const generateEvents = (homeScore: number, awayScore: number, sport: string): MatchEvent[] => {
  const events: MatchEvent[] = [];
  const totalScore = homeScore + awayScore;
  const limit = sport === 'basketball' ? 5 : totalScore; 

  for(let i=0; i<limit; i++) {
    const isHome = Math.random() > 0.5;
    let type: any = 'goal';
    let detail = 'But';

    if (sport === 'basketball') { detail = "3 Points"; }
    else if (sport === 'tennis') { detail = "Ace"; }
    else if (sport === 'rugby') { detail = "Essai"; }

    events.push({
      id: `e_init_${i}`, 
      minute: Math.floor(Math.random() * 90) + 1, 
      type, 
      team: isHome ? 'home' : 'away',
      player: { name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], photo: getPlayerPhoto(i) },
      detail
    });
  }
  return events;
};

const getStatsBySport = (sport: string): MatchStats => {
    if (sport === 'basketball') {
        return { 
            possession: {home: 50, away: 50}, 
            shots: {home: Math.floor(Math.random()*40)+80, away: Math.floor(Math.random()*40)+80}, 
            shotsOnTarget: {home: Math.floor(Math.random()*10)+5, away: Math.floor(Math.random()*10)+5}, 
            corners: {home: Math.floor(Math.random()*20)+10, away: Math.floor(Math.random()*20)+10}
        };
    } else if (sport === 'tennis') {
        return {
            possession: {home: Math.floor(Math.random()*40)+40, away: Math.floor(Math.random()*40)+40}, 
            shots: {home: Math.floor(Math.random()*10), away: Math.floor(Math.random()*10)}, 
            shotsOnTarget: {home: Math.floor(Math.random()*5), away: Math.floor(Math.random()*5)}, 
            corners: {home: Math.floor(Math.random()*10), away: Math.floor(Math.random()*10)}
        };
    }
    return { 
        possession: {home: 50, away: 50}, 
        shots: {home: 12, away: 8}, 
        shotsOnTarget: {home: 5, away: 3}, 
        corners: {home: 6, away: 4} 
    };
};

// --- GEOLOCATION ---
let userCountryCode = 'cm'; // Default to Cameroon
const detectUserLocation = async () => {
    try {
        // Try first service: ipapi.co
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            if (data.country_code) {
                userCountryCode = data.country_code.toLowerCase();
                console.log("User location detected (ipapi):", userCountryCode);
                return;
            }
        }
        
        // Try second service: ip-api.com (fallback)
        const res2 = await fetch('http://ip-api.com/json/'); // Note: http because some free tiers block https
        if (res2.ok) {
            const data2 = await res2.json();
            if (data2.countryCode) {
                userCountryCode = data2.countryCode.toLowerCase();
                console.log("User location detected (ip-api):", userCountryCode);
                return;
            }
        }
    } catch (e) {
        // Silent fallback to default 'cm' to avoid cluttering console with errors
        console.log("Using default location:", userCountryCode);
    }
};
detectUserLocation();

const initializeMatches = (): Match[] => {
  const matches: Match[] = [];
  let idCounter = 1;

  // Generate 7 days of data
  const datesToGenerate = [-1, 0, 1, 2, 3, 4, 5];

  datesToGenerate.forEach(dayOffset => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + dayOffset);
    
    // Use ALL leagues to generate matches with specific distribution
    Object.entries(LEAGUES).forEach(([leagueKey, leagueData]) => {
        let matchCount = 15;
        
        if (leagueKey === 'UCL') {
            // Champions League: Many matches
            matchCount = 40 + Math.floor(Math.random() * 20);
        } else if (leagueData.category === 'africa') {
            // African Leagues: Exactly 20 matches total across 7 days (~3 per day)
            matchCount = 3; 
        } else {
            // Others: Standard
            matchCount = 10 + Math.floor(Math.random() * 10);
        }
        
        for(let i=0; i<matchCount; i++) {
            const homeIdx = Math.floor(Math.random() * leagueData.teams.length);
            let awayIdx = Math.floor(Math.random() * leagueData.teams.length);
            while (awayIdx === homeIdx) awayIdx = Math.floor(Math.random() * leagueData.teams.length);

            // Determine status
            let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
            let time = "";
            
            if (dayOffset < 0) {
                status = 'finished';
                time = "FT";
            } else if (dayOffset === 0) {
                 const rand = Math.random();
                 if (rand < 0.25) { 
                     status = 'live'; 
                     if (leagueData.sport === 'football' || leagueData.sport === 'rugby') time = `${Math.floor(Math.random()*85)+1}'`;
                     else if (leagueData.sport === 'basketball') time = `Q${Math.floor(Math.random()*3)+1}`;
                     else time = `Set ${Math.floor(Math.random()*2)+1}`;
                 }
                 else if (rand < 0.45) { status = 'finished'; time = "FT"; }
                 else { status = 'upcoming'; }
            }

            // Generate Scores based on sport
            let hScore = 0, aScore = 0;
            if (status !== 'upcoming') {
                if (leagueData.sport === 'football') {
                    hScore = Math.floor(Math.random() * 5);
                    aScore = Math.floor(Math.random() * 4);
                } else if (leagueData.sport === 'basketball') {
                    hScore = Math.floor(Math.random() * 50) + 80;
                    aScore = Math.floor(Math.random() * 50) + 80;
                } else if (leagueData.sport === 'rugby') {
                    hScore = Math.floor(Math.random() * 40) + 10;
                    aScore = Math.floor(Math.random() * 40) + 10;
                } else if (leagueData.sport === 'tennis') {
                    hScore = Math.floor(Math.random() * 3); // Sets
                    aScore = Math.floor(Math.random() * 3);
                    if (hScore === aScore && status === 'finished') hScore++; 
                }
            }
            
            const hours = 7 + Math.floor(Math.random() * 16); // 7h to 23h
            const minutes = [0, 10, 15, 30, 45, 50][Math.floor(Math.random() * 6)];
            const matchDate = new Date(baseDate);
            matchDate.setHours(hours, minutes, 0, 0);

            if (status === 'upcoming') {
                time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }

            const homeStrength = Math.random();
            const awayStrength = Math.random();
            const total = homeStrength + awayStrength + 0.5;
            const aiHome = Math.floor((homeStrength / total) * 100);
            const aiAway = Math.floor((awayStrength / total) * 100);
            const aiDraw = 100 - aiHome - aiAway;

            const homeTeamName = leagueData.teams[homeIdx];
            const awayTeamName = leagueData.teams[awayIdx];
            const homeCode = TEAM_DATA[homeTeamName]?.code || leagueData.code;
            const awayCode = TEAM_DATA[awayTeamName]?.code || leagueData.code;

            // Local Category Logic: If league code matches user country code
            const category = (leagueData.code === userCountryCode) ? 'local' : leagueData.category;

            matches.push({
                id: `m_${leagueData.code}_${idCounter++}`,
                sport: leagueData.sport as SportType,
                league: leagueData.name,
                category: category as any,
                countryCode: leagueData.code,
                homeCountryCode: homeCode,
                awayCountryCode: awayCode,
                homeTeam: homeTeamName,
                awayTeam: awayTeamName,
                homeScore: hScore,
                awayScore: aScore,
                time: time,
                startDate: matchDate,
                status: status,
                isFavorite: false,
                odds: {
                    home: parseFloat((Math.random() * 2 + 1.2).toFixed(2)),
                    draw: leagueData.sport === 'tennis' ? 0 : parseFloat((Math.random() * 3 + 2.5).toFixed(2)),
                    away: parseFloat((Math.random() * 4 + 1.5).toFixed(2))
                },
                doubleChance: leagueData.sport === 'tennis' ? undefined : {
                    homeDraw: parseFloat((Math.random() * 0.5 + 1.1).toFixed(2)),
                    homeAway: parseFloat((Math.random() * 0.5 + 1.2).toFixed(2)),
                    drawAway: parseFloat((Math.random() * 0.5 + 1.3).toFixed(2))
                },
                overUnder25: leagueData.sport === 'tennis' ? undefined : {
                    over: parseFloat((Math.random() * 1.5 + 1.5).toFixed(2)),
                    under: parseFloat((Math.random() * 1.5 + 1.5).toFixed(2))
                },
                aiProbabilities: {
                    home: aiHome,
                    draw: leagueData.sport === 'tennis' ? 0 : aiDraw,
                    away: aiAway
                },
                homeLogo: getLogo(homeTeamName, homeCode),
                awayLogo: getLogo(awayTeamName, awayCode),
                videoUrl: status === 'live' ? "https://www.youtube.com/embed/h8b98_c_g50" : undefined,
                events: generateEvents(hScore, aScore, leagueData.sport),
                highlights: [],
                stats: getStatsBySport(leagueData.sport),
                liveAction: status === 'live' ? {
                    type: 'normal',
                    team: 'none',
                    x: 50,
                    y: 50,
                    message: "Match en cours"
                } : undefined
            });
        }
    });
  });

  console.log(`Initialized ${matches.length} matches.`);
  return matches;
};

// --- API Methods ---

export const fetchMatchesFromApi = async (): Promise<Match[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/fixtures?live=all`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });
        const data = await response.json();
        
        if (data.response && data.response.length > 0) {
            return data.response.map((item: any) => ({
                id: item.fixture.id.toString(),
                sport: 'football',
                league: item.league.name,
                category: 'world',
                homeTeam: item.teams.home.name,
                awayTeam: item.teams.away.name,
                homeScore: item.goals.home || 0,
                awayScore: item.goals.away || 0,
                time: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : item.fixture.status.short,
                startDate: new Date(item.fixture.date),
                status: item.fixture.status.short === 'FT' ? 'finished' : (['1H', '2H', 'HT'].includes(item.fixture.status.short) ? 'live' : 'upcoming'),
                odds: {
                    home: 1.5 + Math.random(),
                    draw: 2.5 + Math.random(),
                    away: 2.0 + Math.random()
                },
                overUnder25: {
                    over: 1.7 + Math.random(),
                    under: 1.8 + Math.random()
                },
                homeLogo: item.teams.home.logo,
                awayLogo: item.teams.away.logo
            }));
        }
    } catch (error) {
        console.error("API Error:", error);
    }
    return [];
};

export const fetchMatches = async (): Promise<Match[]> => {
  if (matchesState.length === 0) {
    matchesState = initializeMatches();
    socketEngine.start(); // Start live updates
    
    // Try to merge with real API data if available
    const apiMatches = await fetchMatchesFromApi();
    if (apiMatches.length > 0) {
        matchesState = [...apiMatches, ...matchesState];
    }
  }
  
  const sorted = [...matchesState].sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      return a.startDate.getTime() - b.startDate.getTime();
  });
  
  return sorted;
};

// Logic to check bet results
export const checkBetResults = async () => {
    const bets = db.getBets();
    const pendingBets = bets.filter(b => b.status === 'pending');
    
    if (pendingBets.length === 0) return;

    const allMatches = await fetchMatches();
    
    pendingBets.forEach(bet => {
        let allFinished = true;
        let won = true;
        
        bet.items.forEach(item => {
            const match = allMatches.find(m => m.id === item.matchId);
            if (!match || match.status !== 'finished') {
                allFinished = false;
                return;
            }
            
            const result = match.homeScore > match.awayScore ? 'home' : (match.homeScore < match.awayScore ? 'away' : 'draw');
            const totalGoals = match.homeScore + match.awayScore;
            
            let isWin = false;
            if (item.selection === 'home' || item.selection === 'draw' || item.selection === 'away') {
                isWin = result === item.selection;
            } else if (item.selection === 'homeDraw') {
                isWin = result === 'home' || result === 'draw';
            } else if (item.selection === 'homeAway') {
                isWin = result === 'home' || result === 'away';
            } else if (item.selection === 'drawAway') {
                isWin = result === 'draw' || result === 'away';
            } else if (item.selection === 'over2.5') {
                isWin = totalGoals > 2.5;
            } else if (item.selection === 'under2.5') {
                isWin = totalGoals < 2.5;
            }

            if (!isWin) {
                won = false;
            }
        });
        
        if (allFinished) {
            db.updateBetStatus(bet.id, won ? 'won' : 'lost', won ? bet.potentialWin : 0);
            if (won) {
                alert(`Félicitations ! Votre pari ${bet.id} est GAGNANT ! Gain: ${bet.potentialWin.toLocaleString()} F`);
            } else {
                alert(`Désolé, votre pari ${bet.id} est PERDU.`);
            }
        }
    });
};

export const fetchMatchesByDate = async (date: Date): Promise<Match[]> => {
    const all = await fetchMatches();
    return all.filter(m => {
        const d1 = new Date(m.startDate);
        const d2 = new Date(date);
        return d1.getDate() === d2.getDate() && 
               d1.getMonth() === d2.getMonth();
    });
};

// --- Standings & Lineups (New Features) ---

export const fetchStandings = async (leagueName: string): Promise<Standing[]> => {
    // Generate mock standings based on league teams
    const league = Object.values(LEAGUES).find(l => l.name === leagueName) || LEAGUES.PL;
    const teams = league.teams;
    
    const standings: Standing[] = teams.map((teamName, i) => {
        const played = 25;
        const win = Math.floor(Math.random() * 15) + (teams.length - i); // Bias towards top teams
        const lose = Math.floor(Math.random() * (played - win));
        const draw = played - win - lose;
        const points = (win * 3) + draw;
        
        // Resolve code for team if it exists in TEAM_DATA, otherwise use league code
        const teamCode = TEAM_DATA[teamName]?.code || league.code;
        
        return {
            rank: 0, // Assigned after sort
            team: { id: i, name: teamName, logo: getLogo(teamName, teamCode) },
            points,
            goalsDiff: Math.floor(Math.random() * 40) - 10 + (win * 2),
            form: "WWLDL".split('').sort(() => 0.5 - Math.random()).join(''),
            played,
            win,
            draw,
            lose
        };
    }).sort((a, b) => b.points - a.points);

    // Ensure unique ranks even if points are same
    return standings.map((s, i) => ({ ...s, rank: i + 1 }));
};

const generateLineup = (teamName: string, code?: string): Lineup => {
    const formations = ["4-3-3", "4-4-2", "3-5-2", "5-3-2", "4-2-3-1", "4-1-4-1", "3-4-3"];
    const formation = formations[Math.floor(Math.random() * formations.length)];
    const startXI: LineupPlayer[] = [];
    const substitutes: LineupPlayer[] = [];
    
    // Parse formation to get counts
    const parts = formation.split('-').map(Number);
    let idCounter = 1;

    // Goalkeeper
    startXI.push({ id: idCounter++, name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], number: 1, pos: "G" });
    
    // Defenders
    const defCount = parts[0] || 4;
    for(let i=0; i<defCount; i++) startXI.push({ id: idCounter++, name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], number: idCounter, pos: "D" });
    
    // Midfielders
    const midCount = parts[1] || 3;
    for(let i=0; i<midCount; i++) startXI.push({ id: idCounter++, name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], number: idCounter, pos: "M" });
    
    // Forwards
    const fwdCount = parts[2] || 3;
    for(let i=0; i<fwdCount; i++) startXI.push({ id: idCounter++, name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], number: idCounter, pos: "F" });

    // Ensure we have 11 players if formation parsing was weird
    while(startXI.length < 11) {
        startXI.push({ id: idCounter++, name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], number: idCounter, pos: "M" });
    }

    // Subs
    for(let i=0; i<7; i++) substitutes.push({ id: 20+i, name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)], number: 12+i, pos: "Sub" });

    return {
        team: { id: 0, name: teamName, logo: getLogo(teamName, code) },
        coach: { name: "Coach Pro" },
        formation,
        startXI,
        substitutes
    };
};

export const fetchLineups = async (matchId: string): Promise<{ home: Lineup; away: Lineup } | null> => {
    const match = matchesState.find(m => m.id === matchId);
    if (!match) return null;
    return {
        home: generateLineup(match.homeTeam, match.homeCountryCode),
        away: generateLineup(match.awayTeam, match.awayCountryCode)
    };
};

export const fetchH2H = async (matchId: string): Promise<Match[]> => {
    const match = matchesState.find(m => m.id === matchId);
    if (!match) return [];
    
    // Generate 5 previous matches
    const history: Match[] = [];
    for(let i=0; i<5; i++) {
        history.push({
            ...match,
            id: `h2h_${i}`,
            startDate: new Date(Date.now() - (1000 * 60 * 60 * 24 * (30 * (i+1)))), // Months ago
            homeScore: Math.floor(Math.random() * 3),
            awayScore: Math.floor(Math.random() * 3),
            status: 'finished',
            time: "FT"
        });
    }
    return history;
};

// --- Real-time Subscription ---
export const subscribeToMatchUpdates = (callback: (matches: Match[]) => void) => {
  listeners.push(callback);
  // Return cleanup function
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

export const toggleMatchFavorite = (matchId: string) => {
    matchesState = matchesState.map(m => 
        m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
    );
    socketEngine.notifyListeners();
};

export const sportApiService = {
    getMatches: fetchMatches,
    getMatchesByDate: fetchMatchesByDate,
    getStandings: fetchStandings,
    getLineups: fetchLineups,
    getH2H: fetchH2H,
    toggleFavorite: toggleMatchFavorite,
    subscribeToUpdates: subscribeToMatchUpdates,
    searchMatches: async (query: string): Promise<Match[]> => {
        const q = query.toLowerCase().trim();
        if (q.length < 2) return [];
        return matchesState.filter(m => 
            m.homeTeam.toLowerCase().includes(q) ||
            m.awayTeam.toLowerCase().includes(q) ||
            m.league.toLowerCase().includes(q) ||
            (m.sport && m.sport.toLowerCase().includes(q))
        );
    }
};