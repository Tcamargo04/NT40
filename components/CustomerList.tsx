
import React, { useState } from 'react';
import { Customer, PaymentStatus } from '../types';
import { Search, Plus, MoreVertical, Eye, MapPin, Phone, Filter } from 'lucide-react';
import CustomerForm from './CustomerForm';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onAddCustomer: (customer: Customer) => void;
}

type StatusFilter = 'all' | 'active' | 'no-contract';

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer, onAddCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasContract = c.services.length > 0;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && hasContract) || 
                         (statusFilter === 'no-contract' && !hasContract);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {showAddForm && (
        <CustomerForm 
          onClose={() => setShowAddForm(false)} 
          onSave={(newCustomer) => {
            onAddCustomer(newCustomer);
            setShowAddForm(false);
          }} 
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou conta..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>Novo Cliente</span>
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <Filter size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Filtrar por:</span>
            </div>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === 'all' 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === 'active' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('no-contract')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === 'no-contract' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Sem Contrato
            </button>
            
            <div className="ml-auto text-xs font-medium text-slate-400">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Conta</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {customer.accountNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin size={12} />
                          <span className="truncate max-w-[200px]">{customer.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Phone size={12} />
                          {customer.phone}
                        </div>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.services.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {customer.services.length > 0 ? 'Ativo' : 'Sem Contrato'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onSelectCustomer(customer.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="text-slate-200" size={48} />
                      <p>Nenhum cliente encontrado com os filtros atuais.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
