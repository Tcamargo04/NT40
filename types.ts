
export enum ServiceStatus {
  ACTIVE = 'Ativo',
  PENDING = 'Pendente',
  FINISHED = 'Finalizado',
  OVERDUE = 'Em Atraso',
  AWAITING_APPROVAL = 'Aguardando Autorização'
}

export enum ServiceType {
  MONITORING = 'Monitoramento',
  MAINTENANCE = 'Manutenção',
  SALES = 'Venda',
  LEASE = 'Comodato',
  INSTALLATION = 'Instalação',
  REPAIR = 'Reparo Técnico'
}

export enum EquipmentStatus {
  OPERATIONAL = 'Operacional',
  NEEDS_MAINTENANCE = 'Manutenção Necessária',
  REPLACED = 'Substituído'
}

export enum PaymentStatus {
  UP_TO_DATE = 'Em dia',
  PENDING = 'Pendente',
  OVERDUE = 'Em atraso'
}

export enum BudgetStatus {
  OPEN = 'Em Aberto',
  ACCEPTED = 'Aceito',
  REJECTED = 'Rejeitado',
  EXPIRED = 'Expirado'
}

export enum EventType {
  STATUS_CHANGE = 'Alteração de Status',
  CUSTOMER_INTERACTION = 'Interação com Cliente',
  DATA_MODIFICATION = 'Alteração de Dados',
  EQUIPMENT_MAINTENANCE = 'Manutenção de Equipamento',
  SYSTEM = 'Sistema',
  SECURITY_ALERT = 'Alerta de Segurança'
}

export interface AppEvent {
  id: string;
  timestamp: string;
  type: EventType;
  description: string;
  user: string;
  status: 'Sucesso' | 'Alerta' | 'Crítico' | 'Informativo';
  details?: string;
  targetId?: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  accountNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentTerms: string;
  validUntil: string;
  status: BudgetStatus;
  createdAt: string;
  notes?: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  installationDate: string;
  status: EquipmentStatus;
  warrantyUntil: string;
  isLeased: boolean;
}

export interface Service {
  id: string;
  type: ServiceType;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  status: ServiceStatus;
  price: number;
  paymentMethod: string;
  description?: string;
  contractNotes?: string;
}

export interface Customer {
  id: string;
  accountNumber: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  services: Service[];
  equipments: Equipment[];
  notes: Note[];
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface AppState {
  customers: Customer[];
  budgets: Budget[];
  events: AppEvent[];
  lastUpdate: string;
}
