
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { generateBusinessInsights } from '../services/geminiService';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface AnalyticsProps {
  customers: Customer[];
}

const Analytics: React.FC<AnalyticsProps> = ({ customers }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsights = async () => {
    setLoading(true);
    const result = await generateBusinessInsights(customers);
    setInsights(result || "Não foi possível gerar insights no momento.");
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
              Inteligência de Negócio <Sparkles className="text-indigo-300" />
            </h2>
            <p className="text-indigo-100 opacity-90 leading-relaxed">
              Utilize o poder da IA para analisar sua base de clientes e descobrir oportunidades de manutenção preventiva ou novas vendas.
            </p>
          </div>
          <button 
            onClick={handleGenerateInsights}
            disabled={loading}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            Gerar Insights com IA
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {insights && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden animate-slideUp">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
            <Lightbulb className="text-indigo-600" size={18} />
            <h3 className="font-bold text-indigo-900">Análise Estratégica</h3>
          </div>
          <div className="p-8 prose prose-indigo max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {insights}
            </div>
          </div>
          <div className="px-8 pb-8 flex gap-4">
            <div className="bg-slate-50 p-4 rounded-xl flex-1 flex items-start gap-3">
              <TrendingUp className="text-emerald-500 mt-1" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Oportunidade</p>
                <p className="text-sm font-semibold text-slate-700">Manutenção preventiva em 5 sistemas detectada.</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl flex-1 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 mt-1" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Atenção</p>
                <p className="text-sm font-semibold text-slate-700">Vencimento de garantia próximo para {customers[1]?.name}.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Relatório de Equipamentos em Garantia</h3>
          <div className="space-y-3">
            {customers.flatMap(c => c.equipments.map(e => ({...e, owner: c.name}))).slice(0, 5).map((e, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-slate-800">{e.name}</p>
                  <p className="text-xs text-slate-500">{e.owner}</p>
                </div>
                <span className="text-xs font-medium text-slate-400">Expira em: {e.warrantyUntil}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Meta de Faturamento Mensal</h3>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-indigo-600 rounded-full w-[75%]"></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>R$ 15.000 / R$ 20.000</span>
            <span className="text-indigo-600">75% concluído</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
