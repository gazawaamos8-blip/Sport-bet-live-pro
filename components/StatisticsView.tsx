import React from 'react';
import { BarChart2, Activity, TrendingUp, Users, Trophy, Target, Zap } from 'lucide-react';

const StatisticsView: React.FC = () => {
  return (
    <div className="p-4 animate-fade-in space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-cyan-500/20 p-2 rounded-lg">
          <BarChart2 className="text-cyan-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white italic uppercase">Statistiques <span className="text-brand-accent">PRO</span></h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Analyse de Performance Algorithmique</p>
        </div>
      </div>

      {/* Pro AI Insights */}
      <div className="bg-brand-accent/10 border border-brand-accent/30 p-4 rounded-2xl flex gap-4 items-center shadow-lg relative overflow-hidden">
        <div className="absolute -right-2 -top-2 opacity-10 rotate-12"><Zap size={40} className="text-brand-accent" /></div>
        <div className="bg-brand-accent/20 p-3 rounded-xl text-brand-accent"><Activity size={24} /></div>
        <div>
            <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest mb-1">Insight IA du Jour</p>
            <p className="text-xs text-white font-bold leading-tight">Tendance forte sur les victoires à domicile en Bundesliga (72% de réussite sur les 10 derniers matchs).</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-brand-800 p-4 rounded-2xl border border-brand-700 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <Activity size={18} className="text-brand-accent" />
            <span className="text-[10px] font-black text-green-500">+12%</span>
          </div>
          <p className="text-2xl font-black text-white">84%</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Précision IA</p>
        </div>
        <div className="bg-brand-800 p-4 rounded-2xl border border-brand-700 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <TrendingUp size={18} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400">Live</span>
          </div>
          <p className="text-2xl font-black text-white">1.4k</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Matchs Analysés</p>
        </div>
      </div>

      {/* Detailed Stats Section */}
      <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex justify-between items-center">
          <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" /> Tendances du Jour
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {[
            { label: 'Victoires Domicile', value: 45, color: 'bg-brand-accent' },
            { label: 'Matchs Nuls', value: 22, color: 'bg-slate-500' },
            { label: 'Victoires Extérieur', value: 33, color: 'bg-red-500' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">{stat.label}</span>
                <span className="text-white">{stat.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-brand-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} transition-all duration-1000`} 
                  style={{ width: `${stat.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Rankings Preview */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Top Équipes en Forme</h3>
        <div className="space-y-2">
          {[
            { name: 'Real Madrid', form: 'WWWWW', rating: 9.2 },
            { name: 'Man City', form: 'WWDWW', rating: 8.9 },
            { name: 'Bayern Munich', form: 'WLWWW', rating: 8.5 },
          ].map((team, i) => (
            <div key={i} className="bg-brand-800 p-3 rounded-xl border border-brand-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-600">0{i+1}</span>
                <span className="text-sm font-bold text-white">{team.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {team.form.split('').map((f, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${f === 'W' ? 'bg-green-500' : f === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                  ))}
                </div>
                <span className="text-xs font-black text-brand-accent">{team.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 rounded-2xl border border-brand-600 text-center relative overflow-hidden">
         <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><Target size={120} /></div>
         <h4 className="text-white font-black italic mb-1 uppercase">Devenez un Expert</h4>
         <p className="text-slate-400 text-xs mb-4">Accédez à l'intégralité des données historiques et des analyses avancées.</p>
         <button className="bg-brand-accent text-brand-900 font-black px-6 py-2.5 rounded-xl text-xs uppercase shadow-lg hover:scale-105 transition-transform">
           Passer au Mode Pro
         </button>
      </div>
    </div>
  );
};

export default StatisticsView;
