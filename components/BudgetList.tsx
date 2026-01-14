
import React, { useState, useMemo } from 'react';
import { Budget, BudgetStatus, Customer } from '../types';
import { Search, Plus, FileText, Calculator, Filter, Eye, Mail, CheckCircle, XCircle, Clock, Trash2, Calendar, Download, AlertCircle, MessageSquare, Share2 } from 'lucide-react';
import BudgetForm from './BudgetForm';

interface BudgetListProps {
  budgets: Budget[];
  customers: Customer[];
  onUpdate: (budget: Budget) => void;
  onAdd: (budget: Budget) => void;
  onConvert: (budget: Budget) => void;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, customers, onUpdate, onAdd, onConvert }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Period filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      
      const budgetDate = new Date(b.createdAt);
      const matchesStart = !startDate || budgetDate >= new Date(startDate);
      const matchesEnd = !endDate || budgetDate <= new Date(endDate);

      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
  }, [budgets, searchTerm, statusFilter, startDate, endDate]);

  const reportStats = useMemo(() => {
    const totalValue = filteredBudgets.reduce((acc, b) => acc + b.total, 0);
    const converted = filteredBudgets.filter(b => b.status === BudgetStatus.ACCEPTED).length;
    const conversionRate = filteredBudgets.length > 0 ? (converted / filteredBudgets.length) * 100 : 0;
    
    return {
      totalValue,
      count: filteredBudgets.length,
      conversionRate
    };
  }, [filteredBudgets]);

  const getStatusStyle = (status: BudgetStatus, validUntil: string) => {
    const isExpired = new Date(validUntil) < new Date();
    
    if (isExpired && status === BudgetStatus.OPEN) {
      return 'bg-slate-100 text-slate-500 border-slate-200 italic';
    }

    switch (status) {
      case BudgetStatus.OPEN: 
        const diff = new Date(validUntil).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-100';
      case BudgetStatus.ACCEPTED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case BudgetStatus.REJECTED: return 'bg-red-50 text-red-700 border-red-100';
      case BudgetStatus.EXPIRED: return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const updateStatus = (budget: Budget, newStatus: BudgetStatus) => {
    onUpdate({ ...budget, status: newStatus });
  };

  const handleSendEmail = (budget: Budget) => {
    alert(`Enviando proposta PDF para ${budget.customerEmail}...`);
    setTimeout(() => alert(`E-mail enviado com sucesso!`), 1000);
  };

  const handleSendWhatsApp = (budget: Budget) => {
    const customer = customers.find(c => c.id === budget.customerId);
    const phone = customer?.phone.replace(/\D/g, '') || '';
    
    const message = `Olá ${budget.customerName}! Segue o resumo do seu orçamento na SecureTrack Pro:\n\n` +
      `📌 Proposta: ${budget.accountNumber}\n` +
      `💰 Total: R$ ${budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `💳 Pagamento: ${budget.paymentTerms}\n` +
      `📅 Validade: ${budget.validUntil}\n\n` +
      `Ficamos à disposição para dúvidas!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const handleExportReport = () => {
    alert(`Exportando relatório do período: ${startDate || 'Início'} até ${endDate || 'Hoje'}\nValor total no período: R$ ${reportStats.totalValue.toLocaleString('pt-BR')}`);
  };

  return (
    <div className="space-y-6">
      {showForm && (
        <BudgetForm 
          customers={customers}
          onClose={() => { setShowForm(false); setEditingBudget(null); }}
          onSave={(b) => {
            if (editingBudget) onUpdate(b);
            else onAdd(b);
            setShowForm(false);
            setEditingBudget(null);
          }}
          initialData={editingBudget || undefined}
        />
      )}

      {/* Hero Stats (Filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Calculator size={18} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Filtrado</p>
              <p className="text-lg font-bold text-slate-900">R$ {reportStats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
           </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <CheckCircle size={18} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversão</p>
              <p className="text-lg font-bold text-slate-900">{Math.round(reportStats.conversionRate)}%</p>
           </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <FileText size={18} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qtd. Propostas</p>
              <p className="text-lg font-bold text-slate-900">{reportStats.count}</p>
           </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
              <Clock size={18} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em Aberto</p>
              <p className="text-lg font-bold text-slate-900">{filteredBudgets.filter(b => b.status === BudgetStatus.OPEN).length}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar cliente ou número da proposta..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleExportReport}
                className="bg-white text-slate-600 px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-200 transition-all font-bold text-sm"
              >
                <Download size={18} />
                <span>Exportar Relatório</span>
              </button>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-bold text-sm"
              >
                <Plus size={18} />
                <span>Novo Orçamento</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} />
                <span className="text-xs font-bold uppercase">Filtrar Período:</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <span className="text-slate-400 text-xs">até</span>
                <input 
                  type="date" 
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                {(startDate || endDate) && (
                  <button onClick={() => {setStartDate(''); setEndDate('');}} className="text-xs text-red-500 hover:underline font-bold">Limpar</button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              {(['All', ...Object.values(BudgetStatus)] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    statusFilter === status 
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {status === 'All' ? 'Todos' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data Emissão</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações de Envio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.map((b) => {
                const isExpired = new Date(b.validUntil) < new Date();
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-indigo-600 font-bold">{b.accountNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{b.customerName}</p>
                        <p className="text-xs text-slate-500">{b.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">R$ {b.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{b.createdAt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(b.status, b.validUntil)}`}>
                        {isExpired && b.status === BudgetStatus.OPEN ? BudgetStatus.EXPIRED : b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          // Fixed: changed 'budget' to 'b' which is available in map scope
                          onClick={() => handleSendWhatsApp(b)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-emerald-200 transition-all"
                          title="Enviar via WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleSendEmail(b)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all"
                          title="Enviar E-mail (PDF)"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={() => { setEditingBudget(b); setShowForm(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all"
                          title="Editar"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {b.status === BudgetStatus.ACCEPTED && (
                          <button 
                            onClick={() => onConvert(b)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-black rounded-xl hover:bg-emerald-700 transition-all ml-2"
                          >
                            ATIVAR SERVIÇO
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetList;
