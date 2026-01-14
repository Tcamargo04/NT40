
import React, { useState, useMemo } from 'react';
import { AppEvent, EventType } from '../types';
// Fixed: Added 'History' to the import list from lucide-react to avoid using the global window.History constructor in JSX
import { Search, Filter, Download, Calendar, User, Clock, ShieldAlert, CheckCircle2, AlertTriangle, Info, Eye, X, History } from 'lucide-react';

interface EventHistoryProps {
  events: AppEvent[];
}

const EventHistory: React.FC<EventHistoryProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<AppEvent['status'] | 'Todos'>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch = ev.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           ev.user.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Todos' || ev.type === typeFilter;
      const matchesStatus = statusFilter === 'Todos' || ev.status === statusFilter;
      
      const eventDate = new Date(ev.timestamp);
      const matchesStart = !startDate || eventDate >= new Date(startDate);
      const matchesEnd = !endDate || eventDate <= new Date(endDate);

      return matchesSearch && matchesType && matchesStatus && matchesStart && matchesEnd;
    });
  }, [events, searchTerm, typeFilter, statusFilter, startDate, endDate]);

  const getStatusIcon = (status: AppEvent['status']) => {
    switch (status) {
      case 'Crítico': return <ShieldAlert className="text-red-500" size={18} />;
      case 'Alerta': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'Sucesso': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'Informativo': return <Info className="text-blue-500" size={18} />;
    }
  };

  const getStatusBadge = (status: AppEvent['status']) => {
    switch (status) {
      case 'Crítico': return 'bg-red-50 text-red-700 border-red-100';
      case 'Alerta': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Sucesso': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Informativo': return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const handleExport = () => {
    alert('Exportando histórico de eventos consolidado para PDF/CSV...');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-slate-100 animate-slideUp">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`${getStatusBadge(selectedEvent.status)} p-3 rounded-2xl`}>
                  {getStatusIcon(selectedEvent.status)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedEvent.type}</h3>
                  <p className="text-xs text-slate-500">{new Date(selectedEvent.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Descrição</p>
                <p className="text-sm font-semibold text-slate-800">{selectedEvent.description}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detalhes Técnicos / Logs</p>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.details || 'Nenhum detalhe adicional disponível.'}</p>
              </div>
              
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Responsável</p>
                    <p className="text-xs font-bold text-slate-700">{selectedEvent.user}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Eventos Críticos', count: events.filter(e => e.status === 'Crítico').length, icon: ShieldAlert, color: 'text-red-600' },
          { label: 'Alertas Pendentes', count: events.filter(e => e.status === 'Alerta').length, icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Total de Logs', count: events.length, icon: Clock, color: 'text-indigo-600' },
          { label: 'Sincronização', count: 'Ativa', icon: CheckCircle2, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className={`${stat.color.replace('text', 'bg')}/10 p-2 rounded-lg`}>
                <stat.icon size={18} className={stat.color} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-bold text-slate-900">{stat.count}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar evento, descrição ou usuário..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleExport}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 font-bold text-sm"
            >
              <Download size={18} />
              <span>Exportar Auditoria</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Período:</span>
              </div>
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
            </div>

            <div className="flex flex-wrap items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Filtros:</span>
              </div>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
              >
                <option value="Todos">Todos os Tipos</option>
                {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Sucesso">Sucesso</option>
                <option value="Informativo">Informativo</option>
                <option value="Alerta">Alerta</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data / Hora</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(ev.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-700">{ev.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{ev.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {ev.user.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-600 font-medium">{ev.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ev.status)}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusBadge(ev.status)}`}>
                        {ev.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedEvent(ev)}
                      className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <History size={48} className="opacity-10 mb-2" />
                      <p className="text-sm">Nenhum evento registrado com os filtros atuais.</p>
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

export default EventHistory;
