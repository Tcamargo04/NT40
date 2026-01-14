
import React from 'react';
import { LayoutGrid, Users, FileText, PieChart, Shield, Calculator, History } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'customers' | 'budgets' | 'analytics' | 'history';
  onTabChange: (tab: 'dashboard' | 'customers' | 'budgets' | 'analytics' | 'history') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'budgets', label: 'Orçamentos', icon: Calculator },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'analytics', label: 'Relatórios', icon: PieChart },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Shield className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">SecureTrack <span className="text-indigo-400">Pro</span></span>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suporte</p>
          <button className="w-full text-left text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Centro de Ajuda
          </button>
          <button className="w-full text-left text-sm font-medium text-slate-300 hover:text-white transition-colors mt-2">
            Documentação API
          </button>
        </div>
        <div className="mt-4 px-2 py-3 flex items-center gap-3 text-slate-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-xs font-medium italic">Sistema Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
