
import React, { useState, useEffect } from 'react';
import { Customer, Budget, BudgetItem, BudgetStatus } from '../types';
import { EQUIPMENT_CATALOG } from '../constants';
import { X, Save, Calculator, Plus, Trash2, User, Mail, Calendar, CreditCard, DollarSign, Package, MessageSquare } from 'lucide-react';

interface BudgetFormProps {
  onClose: () => void;
  onSave: (budget: Budget) => void;
  customers: Customer[];
  initialData?: Budget;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, onSave, customers, initialData }) => {
  const [formData, setFormData] = useState<Partial<Budget>>({
    id: initialData?.id || `b-${Date.now()}`,
    accountNumber: initialData?.accountNumber || `QT-${Math.floor(5000 + Math.random() * 999)}`,
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerId: initialData?.customerId || '',
    items: initialData?.items || [],
    discount: initialData?.discount || 0,
    paymentTerms: initialData?.paymentTerms || 'Pix à vista (5% desc.)',
    validUntil: initialData?.validUntil || new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
    status: initialData?.status || BudgetStatus.OPEN,
    notes: initialData?.notes || ''
  });

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const paymentOptions = [
    'Pix à vista (5% desc.)',
    'Boleto Bancário - 30 dias',
    'Boleto Bancário - 3x sem juros',
    'Boleto Bancário - 12x (com juros)',
    'Cartão de Crédito - Até 12x',
    'Débito Automático',
    'Entrada (50%) + Saldo 30 dias',
    'Personalizado (Ver notas)'
  ];

  useEffect(() => {
    const itemsTotal = (formData.items || []).reduce((acc, item) => acc + item.total, 0);
    setSubtotal(itemsTotal);
    setTotal(Math.max(0, itemsTotal - (formData.discount || 0)));
  }, [formData.items, formData.discount]);

  const handleAddItem = () => {
    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const updateItem = (id: string, updates: Partial<BudgetItem>) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  };

  const selectFromCatalog = (item: typeof EQUIPMENT_CATALOG[0]) => {
    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      description: `${item.name} ${item.brand} ${item.model}`,
      quantity: 1,
      unitPrice: item.basePrice || 0,
      total: item.basePrice || 0
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail) return alert('Preencha os dados do cliente.');
    if ((formData.items || []).length === 0) return alert('Adicione pelo menos um item.');

    onSave({
      ...formData,
      subtotal,
      total,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0]
    } as Budget);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar Proposta' : 'Nova Proposta Comercial'}</h2>
            <p className="text-sm text-slate-500">Referência: <span className="font-mono text-indigo-600 font-bold">{formData.accountNumber}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Section 1: Customer & Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                <User size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informações do Cliente</h3>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vincular Cliente</label>
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      onChange={(e) => {
                        const customer = customers.find(c => c.id === e.target.value);
                        if (customer) {
                          setFormData(prev => ({ 
                            ...prev, 
                            customerId: customer.id, 
                            customerName: customer.name, 
                            customerEmail: customer.email 
                          }));
                        }
                      }}
                      value={formData.customerId}
                    >
                      <option value="">Novo Lead / Digitar Manualmente</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.accountNumber})</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                       <input 
                         required
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                         value={formData.customerName}
                         onChange={e => setFormData({...formData, customerName: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-mail</label>
                       <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            required
                            type="email"
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.customerEmail}
                            onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                <Calendar size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prazos e Pagamento</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data de Validade</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.validUntil}
                      onChange={e => setFormData({...formData, validUntil: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Forma de Pagamento</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.paymentTerms}
                        onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
                      >
                        {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Section 2: Items & Calculator */}
          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                   <Package size={18} className="text-indigo-600" />
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Itens do Orçamento</h3>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold hover:bg-indigo-100 transition-colors"
                >
                   <Plus size={14} /> Novo Item
                </button>
             </div>

             <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center h-8">Atalhos:</span>
                {EQUIPMENT_CATALOG.map((item, idx) => (
                   <button
                     key={idx}
                     type="button"
                     onClick={() => selectFromCatalog(item)}
                     className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all border border-slate-200"
                   >
                     + {item.name}
                   </button>
                ))}
             </div>

             <div className="space-y-3">
                {formData.items?.map((item, index) => (
                   <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fadeIn group">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Descrição do Serviço/Equipamento</label>
                        <input 
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           placeholder="Ex: Instalação de Painel Central"
                           value={item.description}
                           onChange={e => updateItem(item.id, { description: e.target.value })}
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Qtd</label>
                        <input 
                           type="number"
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                           value={item.quantity}
                           onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="w-32 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Preço Un.</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">R$</span>
                           <input 
                              type="number"
                              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                              value={item.unitPrice}
                              onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                           />
                        </div>
                      </div>
                      <div className="w-32 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Total Item</label>
                        <div className="w-full px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm font-black text-slate-700 font-mono text-right">
                           R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="flex items-end pb-1.5">
                         <button 
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Section 3: Summary & Totals */}
          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-8">
             <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Observações de Faturamento</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Inclua detalhes sobre parcelamento, juros ou prazos de entrega..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
             </div>

             <div className="w-full md:w-80 bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-slate-200">
                <div className="flex justify-between items-center text-slate-400 text-sm">
                   <span>Subtotal</span>
                   <span className="font-mono">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Desconto</span>
                   <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">-</span>
                      <input 
                         type="number"
                         className="w-24 bg-slate-800 border-none rounded-lg px-2 py-1 text-right font-mono text-emerald-400 focus:ring-1 focus:ring-emerald-500"
                         value={formData.discount}
                         onChange={e => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                      />
                   </div>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-lg font-bold">Total Geral</span>
                   <span className="text-2xl font-black text-indigo-400 font-mono">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
             </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Save size={18} />
            {initialData ? 'Salvar Alterações' : 'Gerar Proposta Comercial'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
