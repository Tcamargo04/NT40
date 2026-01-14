
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_BUDGETS, INITIAL_EVENTS } from './constants';
import { Customer, ServiceStatus, ServiceType, EquipmentStatus, Budget, BudgetStatus, Service, AppEvent } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import BudgetList from './components/BudgetList';
import Analytics from './components/Analytics';
import EventHistory from './components/EventHistory';
import { Bell } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'budgets' | 'analytics' | 'history'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [events, setEvents] = useState<AppEvent[]>(INITIAL_EVENTS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate "Real-time" sync effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 800);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const handleAddBudget = (newBudget: Budget) => {
    setBudgets(prev => [newBudget, ...prev]);
  };

  const handleConvertBudgetToService = (budget: Budget) => {
    if (!budget.customerId) {
      alert("Para converter, vincule este orçamento a um cliente cadastrado.");
      return;
    }

    const customer = customers.find(c => c.id === budget.customerId);
    if (!customer) return;

    // Create a new service based on budget data
    const newService: Service = {
      id: `s-conv-${Date.now()}`,
      type: ServiceType.INSTALLATION, 
      startDate: new Date().toISOString().split('T')[0],
      price: budget.total,
      paymentMethod: budget.paymentTerms,
      status: ServiceStatus.PENDING,
      description: `[CONVERTIDO] Orçamento ${budget.accountNumber}. Itens: ${budget.items.map(i => i.description).join(', ')}`,
      contractNotes: budget.notes
    };

    const updatedCustomer: Customer = {
      ...customer,
      services: [newService, ...customer.services]
    };

    handleUpdateCustomer(updatedCustomer);
    handleUpdateBudget({ ...budget, status: BudgetStatus.ACCEPTED });
    
    alert(`Orçamento ${budget.accountNumber} convertido com sucesso! Um novo serviço foi adicionado ao cliente ${customer.name}.`);
    setActiveTab('customers');
    setSelectedCustomerId(customer.id);
  };

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId), 
  [customers, selectedCustomerId]);

  const renderContent = () => {
    if (selectedCustomerId && selectedCustomer) {
      return (
        <CustomerDetail 
          customer={selectedCustomer} 
          onBack={() => setSelectedCustomerId(null)} 
          onUpdate={handleUpdateCustomer}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            customers={customers} 
            onNavigateToCustomers={() => setActiveTab('customers')} 
            onNewBudget={() => setActiveTab('budgets')}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        );
      case 'customers':
        return <CustomerList customers={customers} onSelectCustomer={setSelectedCustomerId} onAddCustomer={handleAddCustomer} />;
      case 'budgets':
        return (
          <BudgetList 
            budgets={budgets} 
            customers={customers}
            onUpdate={handleUpdateBudget} 
            onAdd={handleAddBudget}
            onConvert={handleConvertBudgetToService}
          />
        );
      case 'history':
        return <EventHistory events={events} />;
      case 'analytics':
        return <Analytics customers={customers} />;
      default:
        return <Dashboard customers={customers} onNavigateToCustomers={() => setActiveTab('customers')} onNewBudget={() => setActiveTab('budgets')} onNavigateToHistory={() => setActiveTab('history')} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedCustomerId(null);
      }} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Início' : 
               activeTab === 'customers' ? 'Clientes' : 
               activeTab === 'budgets' ? 'Orçamentos' : 
               activeTab === 'history' ? 'Histórico de Eventos' : 'Relatórios'}
            </h1>
            {isSyncing && (
              <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 animate-pulse bg-emerald-50 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Sincronizando...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">Admin SecureTrack</p>
                <p className="text-xs text-slate-500">Operador Principal</p>
              </div>
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
