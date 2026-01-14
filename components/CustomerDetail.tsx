
import React, { useState, useEffect, useMemo } from 'react';
import { Customer, ServiceStatus, ServiceType, EquipmentStatus, Equipment, Service, PaymentStatus, Note } from '../types';
import { EQUIPMENT_CATALOG } from '../constants';
import { ArrowLeft, Edit3, Trash2, Plus, Shield, Settings, PenTool, CheckCircle2, AlertCircle, MessageSquare, CreditCard, X, Calendar, Package, Save, RotateCcw, CheckCircle, Clock, DollarSign, Briefcase, FileText, AlertTriangle, History, CalendarRange } from 'lucide-react';
import CustomerForm from './CustomerForm';

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onUpdate: (customer: Customer) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'equipments'>('info');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Memoize and sort notes to ensure chronological descending order
  const sortedNotes = useMemo(() => {
    return [...customer.notes].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  }, [customer.notes]);

  // Equipment states
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);
  const [equipForm, setEquipForm] = useState<Partial<Equipment>>({
    name: '',
    brand: '',
    model: '',
    installationDate: new Date().toISOString().split('T')[0],
    warrantyUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: EquipmentStatus.OPERATIONAL,
    isLeased: false
  });

  // Service states
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    type: ServiceType.MAINTENANCE,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    renewalDate: '',
    price: 0,
    paymentMethod: 'Boleto',
    status: ServiceStatus.AWAITING_APPROVAL,
    description: '',
    contractNotes: ''
  });

  useEffect(() => {
    if (serviceForm.type === ServiceType.LEASE) {
      setServiceForm(prev => ({ ...prev, price: 0 }));
    }
  }, [serviceForm.type]);

  const handleEquipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipmentId) {
      const updatedEquips = customer.equipments.map(eq => 
        eq.id === editingEquipmentId ? { ...eq, ...equipForm } as Equipment : eq
      );
      onUpdate({ ...customer, equipments: updatedEquips });
      setEditingEquipmentId(null);
    } else {
      const newEquip: Equipment = {
        id: `e${Date.now()}`,
        ...equipForm
      } as Equipment;
      onUpdate({ ...customer, equipments: [...customer.equipments, newEquip] });
      setIsAddingEquipment(false);
    }
    resetEquipForm();
  };

  const resetEquipForm = () => {
    setEquipForm({
      name: '',
      brand: '',
      model: '',
      installationDate: new Date().toISOString().split('T')[0],
      warrantyUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: EquipmentStatus.OPERATIONAL,
      isLeased: false
    });
  };

  const startEditEquipment = (equip: Equipment) => {
    setEquipForm(equip);
    setEditingEquipmentId(equip.id);
    setIsAddingEquipment(false);
  };

  const deleteEquipment = (id: string) => {
    if (confirm('Deseja realmente remover este equipamento?')) {
      onUpdate({ ...customer, equipments: customer.equipments.filter(e => e.id !== id) });
    }
  };

  const selectFromCatalog = (item: typeof EQUIPMENT_CATALOG[0]) => {
    setEquipForm(prev => ({
      ...prev,
      name: item.name,
      brand: item.brand,
      model: item.model
    }));
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: Service = {
      id: `s${Date.now()}`,
      ...serviceForm,
      status: ServiceStatus.AWAITING_APPROVAL
    } as Service;
    
    onUpdate({ ...customer, services: [newService, ...customer.services] });
    setIsAddingService(false);
    setServiceForm({
      type: ServiceType.MAINTENANCE,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      renewalDate: '',
      price: 0,
      paymentMethod: 'Boleto',
      status: ServiceStatus.AWAITING_APPROVAL,
      description: '',
      contractNotes: ''
    });
  };

  const updateServiceStatus = (serviceId: string, newStatus: ServiceStatus) => {
    const updatedServices = customer.services.map(s => 
      s.id === serviceId ? { ...s, status: newStatus } : s
    );
    onUpdate({ ...customer, services: updatedServices });
  };

  const confirmDeleteService = () => {
    if (serviceToDeleteId) {
      onUpdate({ ...customer, services: customer.services.filter(s => s.id !== serviceToDeleteId) });
      setServiceToDeleteId(null);
    }
  };

  const approveService = (serviceId: string) => {
    updateServiceStatus(serviceId, ServiceStatus.ACTIVE);
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: Note = {
      id: `n${Date.now()}`,
      text: newNoteText,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onUpdate({ ...customer, notes: [newNote, ...customer.notes] });
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const deleteNote = (noteId: string) => {
    if (confirm('Deseja excluir esta nota permanentemente?')) {
      onUpdate({ ...customer, notes: customer.notes.filter(n => n.id !== noteId) });
    }
  };

  const updatePaymentStatus = (status: PaymentStatus) => {
    if (status === customer.paymentStatus) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const systemNote: Note = {
      id: `sys-${Date.now()}`,
      text: `[SISTEMA] Status financeiro alterado de "${customer.paymentStatus}" para "${status}".`,
      createdAt: timestamp
    };

    onUpdate({ 
      ...customer, 
      paymentStatus: status,
      notes: [systemNote, ...customer.notes]
    });
  };

  const typesWithDescription = [
    ServiceType.MAINTENANCE,
    ServiceType.SALES,
    ServiceType.INSTALLATION,
    ServiceType.REPAIR
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative">
      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <CustomerForm 
          initialData={customer}
          onClose={() => setIsEditingProfile(false)}
          onSave={onUpdate}
        />
      )}

      {/* Service Deletion Confirmation Modal */}
      {serviceToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Serviço?</h3>
              <p className="text-slate-500 mb-8">
                Esta ação não pode ser desfeita. Tem certeza que deseja remover este serviço do histórico do cliente?
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setServiceToDeleteId(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteService}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar para Lista
        </button>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <Edit3 size={18} />
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
        <div className="h-20 w-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
            <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{customer.accountNumber}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 mt-4">
            <p className="text-sm text-slate-500 flex items-center gap-2"><Settings size={14} /> Membro desde: {customer.createdAt}</p>
            <p className="text-sm text-slate-500 flex items-center gap-2"><PenTool size={14} /> Endereço: {customer.address}</p>
            <p className="text-sm text-slate-500 flex items-center gap-2">📞 Telefone: {customer.phone}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        {[
          { id: 'info', label: 'Informações Gerais' },
          { id: 'services', label: 'Serviços' },
          { id: 'equipments', label: 'Equipamentos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-1 text-sm font-semibold transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <History size={18} className="text-indigo-600" />
                  Histórico de Notas
                </h3>
                {!isAddingNote && (
                  <button 
                    onClick={() => setIsAddingNote(true)}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                  >
                    <Plus size={14} /> Nova Nota
                  </button>
                )}
              </div>
              
              {isAddingNote && (
                <div className="mb-6 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 animate-slideDown">
                   <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                     <MessageSquare size={14} /> Escrever Nova Nota
                   </div>
                  <textarea 
                    autoFocus
                    className="w-full bg-white border border-indigo-200 p-3 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                    placeholder="Relate aqui informações importantes, contatos ou ocorrências..."
                    rows={4}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button 
                      onClick={() => { setIsAddingNote(false); setNewNoteText(''); }}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={addNote}
                      className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                    >
                      Salvar Nota
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6 flex-1 pr-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {sortedNotes.length > 0 ? (
                  <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {sortedNotes.map((note, index) => (
                      <div key={note.id} className="relative group animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className={`absolute -left-[22px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-200 ${note.text.includes('[SISTEMA]') ? 'bg-slate-400' : (index === 0 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300')}`}></div>
                        
                        <div className={`bg-white p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md group ${note.text.includes('[SISTEMA]') ? 'border-slate-50 bg-slate-50/30' : 'border-slate-100 hover:border-indigo-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                               <Clock size={12} className="text-slate-400" />
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                 {note.createdAt}
                               </p>
                               {note.text.includes('[SISTEMA]') && <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase">Sistema</span>}
                               {!note.text.includes('[SISTEMA]') && index === 0 && <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase">Recente</span>}
                             </div>
                             {!note.text.includes('[SISTEMA]') && (
                               <button 
                                  onClick={() => deleteNote(note.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Excluir nota"
                                >
                                  <Trash2 size={14} />
                                </button>
                             )}
                          </div>
                          
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${note.text.includes('[SISTEMA]') ? 'text-slate-500 italic' : 'text-slate-700'}`}>
                            {note.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare size={32} strokeWidth={1.5} className="opacity-30" />
                    </div>
                    <p className="text-sm font-medium">Nenhum histórico de notas registrado.</p>
                    <button 
                       onClick={() => setIsAddingNote(true)}
                       className="text-indigo-600 text-xs font-bold mt-2 hover:underline"
                    >
                      Adicionar primeira nota
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" />
                Resumo Financeiro
              </h3>
              
              <div className={`p-5 rounded-2xl mb-8 flex items-center justify-between border-2 ${
                customer.paymentStatus === PaymentStatus.UP_TO_DATE ? 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-50' :
                customer.paymentStatus === PaymentStatus.PENDING ? 'bg-amber-50 border-amber-100 shadow-sm shadow-amber-50' :
                'bg-red-50 border-red-100 shadow-sm shadow-red-50'
              }`}>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                    customer.paymentStatus === PaymentStatus.UP_TO_DATE ? 'text-emerald-600' :
                    customer.paymentStatus === PaymentStatus.PENDING ? 'text-amber-600' :
                    'text-red-600'
                  }`}>Status de Cobrança</p>
                  <p className={`text-2xl font-black ${
                    customer.paymentStatus === PaymentStatus.UP_TO_DATE ? 'text-emerald-700' :
                    customer.paymentStatus === PaymentStatus.PENDING ? 'text-amber-700' :
                    'text-red-700'
                  }`}>{customer.paymentStatus}</p>
                </div>
                <div className={`p-3 rounded-2xl ${
                   customer.paymentStatus === PaymentStatus.UP_TO_DATE ? 'bg-emerald-100' :
                   customer.paymentStatus === PaymentStatus.PENDING ? 'bg-amber-100' :
                   'bg-red-100'
                }`}>
                  {customer.paymentStatus === PaymentStatus.UP_TO_DATE ? 
                    <CheckCircle2 className="text-emerald-600" size={32} /> :
                    <AlertCircle className={customer.paymentStatus === PaymentStatus.PENDING ? 'text-amber-600' : 'text-red-600'} size={32} />
                  }
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Alterar Status Financeiro</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => updatePaymentStatus(PaymentStatus.UP_TO_DATE)}
                    className={`text-xs py-3 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-1 ${
                      customer.paymentStatus === PaymentStatus.UP_TO_DATE 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:text-emerald-600 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <CheckCircle size={14} />
                    Em dia
                  </button>
                  <button 
                    onClick={() => updatePaymentStatus(PaymentStatus.PENDING)}
                    className={`text-xs py-3 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-1 ${
                      customer.paymentStatus === PaymentStatus.PENDING 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-amber-200 hover:text-amber-600 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <Clock size={14} />
                    Pendente
                  </button>
                  <button 
                    onClick={() => updatePaymentStatus(PaymentStatus.OVERDUE)}
                    className={`text-xs py-3 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-1 ${
                      customer.paymentStatus === PaymentStatus.OVERDUE 
                        ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-red-200 hover:text-red-600 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <AlertTriangle size={14} />
                    Em atraso
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-600" />
                Contratos e Serviços
               </h3>
               {!isAddingService && (
                 <button 
                   onClick={() => setIsAddingService(true)}
                   className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                 >
                   <Plus size={14} /> Novo Serviço
                 </button>
               )}
             </div>

             {isAddingService && (
               <div className="p-6 bg-slate-50 border-b border-slate-100 animate-slideDown">
                 <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <Plus size={16} />
                      Relatar Novo Serviço
                    </h4>
                    <button onClick={() => setIsAddingService(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={20} />
                    </button>
                 </div>
                 <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Service Info */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo de Serviço</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={serviceForm.type}
                        onChange={e => setServiceForm({ ...serviceForm, type: e.target.value as ServiceType })}
                      >
                        {Object.values(ServiceType)
                          .filter(t => t !== ServiceType.MONITORING)
                          .map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor (R$)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="number"
                          disabled={serviceForm.type === ServiceType.LEASE}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                          value={serviceForm.price}
                          onChange={e => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pagamento</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={serviceForm.paymentMethod}
                        onChange={e => setServiceForm({ ...serviceForm, paymentMethod: e.target.value })}
                      >
                        <option value="Boleto">Boleto</option>
                        <option value="Pix">Pix</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Débito Automático">Débito Automático</option>
                      </select>
                    </div>

                    {/* Timeline / Contract Dates Section */}
                    <div className="md:col-span-3 pt-2">
                       <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                          <CalendarRange size={16} className="text-indigo-600" />
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cronograma do Contrato</h5>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock size={12} className="text-emerald-500" /> Data de Início
                            </label>
                            <input 
                              type="date"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={serviceForm.startDate}
                              onChange={e => setServiceForm({ ...serviceForm, startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                               <Calendar size={12} className="text-red-500" /> Data de Término
                            </label>
                            <input 
                              type="date"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={serviceForm.endDate}
                              onChange={e => setServiceForm({ ...serviceForm, endDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                               <RotateCcw size={12} className="text-indigo-500" /> Renovação Contratual
                            </label>
                            <input 
                              type="date"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={serviceForm.renewalDate}
                              onChange={e => setServiceForm({ ...serviceForm, renewalDate: e.target.value })}
                            />
                          </div>
                       </div>
                    </div>

                    {/* Detailed Notes / Descriptions */}
                    <div className="md:col-span-3 space-y-4 pt-2">
                      {serviceForm.type && typesWithDescription.includes(serviceForm.type as ServiceType) && (
                        <div className="space-y-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 animate-fadeIn">
                          <div className="flex items-center gap-2 mb-2">
                             <FileText size={16} className="text-indigo-600" />
                             <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                               Relatório Técnico / Descrição do Serviço
                             </label>
                          </div>
                          <textarea 
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
                            placeholder={`Descreva os detalhes técnicos da ${serviceForm.type.toLowerCase()}...`}
                            value={serviceForm.description}
                            onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-2 mb-2">
                           <Shield size={16} className="text-slate-600" />
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                             Observações Específicas do Contrato
                           </label>
                        </div>
                        <textarea 
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
                          placeholder="Adicione cláusulas específicas, condições de pagamento diferenciadas ou detalhes de renovação..."
                          value={serviceForm.contractNotes}
                          onChange={e => setServiceForm({ ...serviceForm, contractNotes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button 
                          type="button"
                          onClick={() => setIsAddingService(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                        >
                          <Save size={14} />
                          Finalizar e Solicitar Aprovação
                        </button>
                    </div>
                 </form>
               </div>
             )}

             <div className="p-0 overflow-x-auto">
               {customer.services.length > 0 ? (
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Serviço</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Período</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Renovação</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {customer.services.map(s => (
                       <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-6 py-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{s.type}</p>
                                {(s.description || s.contractNotes) && (
                                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={s.description || s.contractNotes}>
                                        {s.description || s.contractNotes}
                                    </p>
                                )}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-sm text-slate-600 font-medium">{s.startDate}</span>
                               {s.endDate && <span className="text-[10px] text-slate-400">Até: {s.endDate}</span>}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{s.renewalDate || '-'}</td>
                         <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-700">R$ {s.price.toFixed(2)}</td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <select 
                                  value={s.status}
                                  onChange={(e) => updateServiceStatus(s.id, e.target.value as ServiceStatus)}
                                  className={`px-2 py-1 rounded text-xs font-bold border-none bg-transparent cursor-pointer focus:ring-0 ${
                                    s.status === ServiceStatus.ACTIVE ? 'text-emerald-700 bg-emerald-50' : 
                                    s.status === ServiceStatus.AWAITING_APPROVAL ? 'text-indigo-700 bg-indigo-50' :
                                    s.status === ServiceStatus.PENDING ? 'text-amber-700 bg-amber-50' :
                                    s.status === ServiceStatus.FINISHED ? 'text-slate-600 bg-slate-100' :
                                    'text-red-700 bg-red-50'
                                  }`}
                                >
                                    {Object.values(ServiceStatus).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                {s.status === ServiceStatus.AWAITING_APPROVAL && (
                                    <button 
                                        onClick={() => approveService(s.id)}
                                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 ml-2 animate-bounce"
                                    >
                                        <CheckCircle size={10} /> Aprovar (Gestor)
                                    </button>
                                )}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => setServiceToDeleteId(s.id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-all rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white border border-transparent hover:border-slate-100 shadow-sm"
                            >
                                <Trash2 size={16} />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                   <Calendar size={48} className="opacity-10 mb-2" />
                   <p className="text-sm">Nenhum serviço registrado.</p>
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'equipments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-indigo-600" />
                Inventário de Equipamentos
              </h3>
              {!isAddingEquipment && !editingEquipmentId && (
                <button onClick={() => setIsAddingEquipment(true)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold shadow-sm hover:bg-indigo-700 transition-colors">
                  <Plus size={14} /> Registrar Instalação
                </button>
              )}
            </div>

            {(isAddingEquipment || editingEquipmentId) && (
              <div className="p-6 bg-slate-50 border-b border-slate-100 animate-slideDown">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    {editingEquipmentId ? <Edit3 size={16} /> : <Plus size={16} />}
                    {editingEquipmentId ? 'Editar Equipamento' : 'Relatar Nova Instalação'}
                  </h4>
                  <button 
                    onClick={() => { setIsAddingEquipment(false); setEditingEquipmentId(null); resetEquipForm(); }}
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>

                {!editingEquipmentId && (
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Banco de Dados de Equipamentos</p>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_CATALOG.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectFromCatalog(item)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                          {item.name} ({item.brand})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleEquipSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Equipamento</label>
                    <input 
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={equipForm.name}
                      onChange={e => setEquipForm({ ...equipForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                    <input 
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={equipForm.brand}
                      onChange={e => setEquipForm({ ...equipForm, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                    <input 
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={equipForm.model}
                      onChange={e => setEquipForm({ ...equipForm, model: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Instalação</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={equipForm.installationDate}
                      onChange={e => setEquipForm({ ...equipForm, installationDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Garantia Até</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={equipForm.warrantyUntil}
                      onChange={e => setEquipForm({ ...equipForm, warrantyUntil: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={equipForm.status}
                      onChange={e => setEquipForm({ ...equipForm, status: e.target.value as EquipmentStatus })}
                    >
                      <option value={EquipmentStatus.OPERATIONAL}>{EquipmentStatus.OPERATIONAL}</option>
                      <option value={EquipmentStatus.NEEDS_MAINTENANCE}>{EquipmentStatus.NEEDS_MAINTENANCE}</option>
                      <option value={EquipmentStatus.REPLACED}>{EquipmentStatus.REPLACED}</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox"
                          className="sr-only"
                          checked={equipForm.isLeased}
                          onChange={e => setEquipForm({ ...equipForm, isLeased: e.target.checked })}
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${equipForm.isLeased ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${equipForm.isLeased ? 'translate-x-5' : ''}`}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase">Equipamento em Comodato</span>
                    </label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => { setIsAddingEquipment(false); setEditingEquipmentId(null); resetEquipForm(); }}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Descartar
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                      >
                        <Save size={14} />
                        {editingEquipmentId ? 'Salvar Alterações' : 'Confirmar Instalação'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {customer.equipments.map(e => (
                <div key={e.id} className={`group p-4 border rounded-xl bg-slate-50 flex items-start gap-4 transition-all hover:shadow-md ${editingEquipmentId === e.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-100'}`}>
                  <div className={`p-2 rounded-lg ${e.status === EquipmentStatus.OPERATIONAL ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <Shield className={e.status === EquipmentStatus.OPERATIONAL ? 'text-emerald-600' : 'text-amber-600'} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">{e.name}</p>
                      <div className="flex items-center gap-1">
                        {e.isLeased && <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">Comodato</span>}
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button 
                            onClick={() => startEditEquipment(e)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteEquipment(e.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{e.brand} - {e.model}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Instalado em: {e.installationDate}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Garantia: {e.warrantyUntil}</span>
                      </div>
                      <button 
                        onClick={() => startEditEquipment(e)}
                        className="text-indigo-600 text-xs font-semibold hover:underline"
                      >
                        Editar Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {customer.equipments.length === 0 && !isAddingEquipment && (
                <div className="col-span-2 py-12 text-center text-slate-400 italic">Nenhum equipamento listado para este cliente.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
