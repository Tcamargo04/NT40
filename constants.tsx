
import { Customer, ServiceStatus, ServiceType, EquipmentStatus, PaymentStatus, Budget, BudgetStatus, AppEvent, EventType } from './types';

export const EQUIPMENT_CATALOG = [
  { name: 'Painel de Alarme', brand: 'Intelbras', model: 'AMT 2018 E', basePrice: 450 },
  { name: 'Sensor de Presença', brand: 'JFL', model: 'DX-400', basePrice: 85 },
  { name: 'Câmera IP', brand: 'Hikvision', model: 'DS-2CD1023G0E', basePrice: 280 },
  { name: 'Sirene de Alta Potência', brand: 'Intelbras', model: 'SIR 1000', basePrice: 45 },
  { name: 'Bateria Estacionária', brand: 'Moura', model: '12V 7Ah', basePrice: 120 },
  { name: 'Cerca Elétrica', brand: 'JFL', model: 'ECR-18', basePrice: 350 }
];

export const INITIAL_EVENTS: AppEvent[] = [
  {
    id: 'ev1',
    timestamp: new Date().toISOString(),
    type: EventType.SECURITY_ALERT,
    description: 'Disparo de alarme - Zona 4 (Cozinha)',
    user: 'Sistema Monitoramento',
    status: 'Crítico',
    details: 'Alarme acionado no Condomínio Solar às 02:34 AM. Viaturas em deslocamento.'
  },
  {
    id: 'ev2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: EventType.STATUS_CHANGE,
    description: 'Status financeiro alterado para "Pendente"',
    user: 'Admin SecureTrack',
    status: 'Alerta',
    details: 'Cliente Maria Oliveira teve o status alterado devido a atraso no boleto 456.'
  },
  {
    id: 'ev3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: EventType.EQUIPMENT_MAINTENANCE,
    description: 'Manutenção de Câmera IP concluída',
    user: 'Técnico Roberto',
    status: 'Sucesso',
    details: 'Substituição de conector RJ45 e realinhamento de lente.'
  },
  {
    id: 'ev4',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: EventType.CUSTOMER_INTERACTION,
    description: 'Nova proposta comercial enviada via WhatsApp',
    user: 'Vendedor Lucas',
    status: 'Informativo',
    details: 'Proposta QT-5003 enviada para o cliente João Silva.'
  },
  {
    id: 'ev5',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    type: EventType.DATA_MODIFICATION,
    description: 'Alteração de endereço de cobrança',
    user: 'Admin SecureTrack',
    status: 'Sucesso',
    details: 'Endereço atualizado conforme solicitação do cliente via ticket #889.'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b1',
    accountNumber: 'QT-5001',
    customerName: 'Condomínio Solar',
    customerEmail: 'contato@solar.com',
    items: [
      { id: 'bi1', description: 'Instalação de Sistema de Monitoramento', quantity: 1, unitPrice: 1200, total: 1200 },
      { id: 'bi2', description: 'Câmera IP Hikvision', quantity: 4, unitPrice: 280, total: 1120 }
    ],
    subtotal: 2320,
    discount: 120,
    total: 2200,
    paymentTerms: '3x no Boleto',
    validUntil: '2025-12-30',
    status: BudgetStatus.OPEN,
    createdAt: '2023-11-20'
  },
  {
    id: 'b2',
    accountNumber: 'QT-5002',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerId: '1',
    items: [
      { id: 'bi3', description: 'Manutenção Preventiva Semestral', quantity: 1, unitPrice: 250, total: 250 }
    ],
    subtotal: 250,
    discount: 0,
    total: 250,
    paymentTerms: 'Pix à vista',
    validUntil: '2024-01-15',
    status: BudgetStatus.ACCEPTED,
    createdAt: '2023-12-05'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: '1',
    accountNumber: 'ACC-1001',
    name: 'João Silva',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    phone: '(11) 99999-8888',
    email: 'joao@email.com',
    createdAt: '2023-01-15',
    paymentStatus: PaymentStatus.UP_TO_DATE,
    notes: [
      { id: 'n1', text: 'Cliente prefere contato via WhatsApp.', createdAt: '2023-01-15' },
      { id: 'n2', text: 'Possui cão de guarda no quintal, atentar ao acesso técnico.', createdAt: '2023-02-10' }
    ],
    services: [
      {
        id: 's1',
        type: ServiceType.MONITORING,
        startDate: '2023-01-15',
        status: ServiceStatus.ACTIVE,
        price: 150.00,
        paymentMethod: 'Boleto'
      }
    ],
    equipments: [
      {
        id: 'e1',
        name: 'Painel de Alarme',
        brand: 'Intelbras',
        model: 'AMT 2018 E',
        installationDate: '2023-01-15',
        status: EquipmentStatus.OPERATIONAL,
        warrantyUntil: '2025-01-15',
        isLeased: false
      },
      {
        id: 'e2',
        name: 'Sensor de Presença',
        brand: 'JFL',
        model: 'DX-400',
        installationDate: '2023-01-15',
        status: EquipmentStatus.OPERATIONAL,
        warrantyUntil: '2024-01-15',
        isLeased: true
      }
    ]
  },
  {
    id: '2',
    accountNumber: 'ACC-1002',
    name: 'Maria Oliveira',
    address: 'Rua das Flores, 450 - Curitiba, PR',
    phone: '(41) 98888-7777',
    email: 'maria.o@email.com',
    createdAt: '2023-05-20',
    paymentStatus: PaymentStatus.PENDING,
    notes: [
      { id: 'n3', text: 'Solicitou revisão das câmeras para o próximo mês.', createdAt: '2023-12-01' }
    ],
    services: [
      {
        id: 's2',
        type: ServiceType.MAINTENANCE,
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        status: ServiceStatus.FINISHED,
        price: 250.00,
        paymentMethod: 'Pix'
      }
    ],
    equipments: [
      {
        id: 'e3',
        name: 'Câmera IP',
        brand: 'Hikvision',
        model: 'DS-2CD1023G0E',
        installationDate: '2023-05-20',
        status: EquipmentStatus.NEEDS_MAINTENANCE,
        warrantyUntil: '2024-05-20',
        isLeased: false
      }
    ]
  }
];
