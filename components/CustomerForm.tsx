
import React, { useState, useEffect } from 'react';
import { Customer, PaymentStatus } from '../types';
import { X, Save, MapPin, User, Phone, Mail, Hash, Info, Navigation, Loader2 } from 'lucide-react';

interface CustomerFormProps {
  onClose: () => void;
  onSave: (customer: Customer) => void;
  initialData?: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onClose, onSave, initialData }) => {
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    accountNumber: initialData?.accountNumber || `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: '',
    state: '',
    zipCode: '',
    referencePoint: '',
    notes: initialData?.notes?.[0]?.text || ''
  });

  // Effect to handle CEP lookup
  useEffect(() => {
    const cleanCep = formData.zipCode.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      const fetchAddress = async () => {
        setIsFetchingCep(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await response.json();
          
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              address: `${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}`,
              city: data.localidade,
              state: data.uf,
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        } finally {
          setIsFetchingCep(false);
        }
      };

      fetchAddress();
    }
  }, [formData.zipCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If city and state are provided, we format them, otherwise keep original address if it was an edit
    const hasNewLocationParts = formData.city || formData.state;
    const fullAddress = hasNewLocationParts 
      ? `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ' - ' + formData.state : ''}`
      : formData.address;
    
    const customerData: Customer = {
      ...(initialData || {
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        services: [],
        equipments: [],
        notes: [],
        paymentStatus: PaymentStatus.UP_TO_DATE
      }),
      accountNumber: formData.accountNumber,
      name: formData.name,
      address: fullAddress,
      phone: formData.phone,
      email: formData.email,
    };

    // If there were new notes, prepend them
    if (formData.notes && (!initialData || formData.notes !== initialData.notes?.[0]?.text)) {
      customerData.notes = [
        { id: `n-${Date.now()}`, text: formData.notes, createdAt: new Date().toISOString().split('T')[0] },
        ...(initialData?.notes || [])
      ];
    }

    onSave(customerData);
    onClose();
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    setFormData({ ...formData, zipCode: value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar Perfil do Cliente' : 'Novo Cadastro de Cliente'}</h2>
            <p className="text-sm text-slate-500">{initialData ? 'Atualize as informações cadastrais do cliente.' : 'Preencha todos os dados para registro no sistema.'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Personal Info Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <User size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dados Principais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="text"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Ex: João da Silva"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Número da Conta</label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="text"
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-600 cursor-not-allowed"
                    readOnly
                    value={formData.accountNumber}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="tel"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-mail</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="email"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="email@cliente.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location Info Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <MapPin size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Localização do Imóvel</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CEP</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="00000-000"
                    value={formData.zipCode}
                    onChange={handleZipCodeChange}
                  />
                  {isFetchingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="text-indigo-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Endereço (Rua, Número, Bairro)</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Rua das Acácias, 123 - Centro"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cidade</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="UF"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ponto de Referência</label>
                <div className="relative">
                  <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Próximo à padaria"
                    value={formData.referencePoint}
                    onChange={e => setFormData({...formData, referencePoint: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Observations */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <Info size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Observações Gerais</h3>
            </div>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Alguma informação adicional relevante para o monitoramento ou equipe técnica?"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </section>
        </form>

        {/* Footer Actions */}
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
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Save size={18} />
            {initialData ? 'Salvar Alterações' : 'Finalizar Cadastro'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
