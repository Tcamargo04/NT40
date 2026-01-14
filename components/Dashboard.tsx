
import React from 'react';
import { Customer, ServiceStatus } from '../types';
import { Users, Activity, CreditCard, ShieldCheck, ArrowRight, FileText, Calculator, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  customers: Customer[];
  onNavigateToCustomers: () => void;
  onNewBudget: () => void;
  onNavigateToHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ customers, onNavigateToCustomers, onNewBudget, onNavigateToHistory }) => {
  const totalCustomers = customers.length;
  const activeServices = customers.reduce((acc, c) => acc + c.services.filter(s => s.status === ServiceStatus.ACTIVE).length, 0);
  const totalEquipments = customers.reduce((acc, c) => acc + c.equipments.length, 0);
  const overduePayments = 2; // Mocking

  const serviceData = [
    { name: 'Monitoramento', value: 45 },
    { name: 'Manutenção', value: 25 },
    { name: 'Venda', value: 20 },
    { name: 'Comodato', value: 10 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const stats = [
    { label: 'Total Clientes', value: totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Serviços Ativos', value: activeServices, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Equipamentos', value: totalEquipments, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Pendências', value: overduePayments, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Distribuição de Serviços</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
              Ver mais <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ações Rápidas</h3>
          <div className="space-y-3 flex-1">
            <button 
              onClick={onNavigateToCustomers}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users size={18} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Gerenciar Clientes</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
            </button>
            <button 
              onClick={onNewBudget}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Calculator size={18} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Novo Orçamento</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
            </button>
            <button 
              onClick={onNavigateToHistory}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <History size={18} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Histórico de Eventos</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">98%</span>
                <span className="text-xs text-slate-500">Uptime dos Sistemas</span>
              </div>
              <div className="w-16 h-16">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{value: 98}, {value: 2}]} dataKey="value" innerRadius={20} outerRadius={30} paddingAngle={2} startAngle={90} endAngle={450}>
                        <Cell fill="#10b981" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
