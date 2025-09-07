import { type NavItem } from '@/types';
import { Link as linkmegb, Calendar, Cog, LayoutGrid, MessageSquareMore, PackagePlus, UserCog, Users2, Wrench, Building, MessageCircleCode, Printer, Tags, CogIcon, Copyright, Monitor, Sparkles, ClipboardList, Blocks, Building2, HandCoins, MemoryStick } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
        icon: LayoutGrid,
        active: 'app.dashboard',
    },
    {
        title: 'Clientes',
        href: route('app.customers.index'),
        icon: Users2,
        active: 'app.customers.*',
    },
    {
        title: 'Ordens de serviço',
        href: route('app.orders.index'),
        icon: Wrench,
        active: 'app.orders.*',
    },
    {
        title: 'Agendamentos',
        href: route('app.schedules.index'),
        icon: Calendar,
        active: 'app.schedules.*',
    },
    {
        title: 'Mensagens',
        href: route('app.messages.index'),
        icon: MessageSquareMore,
        active: 'app.messages.*',
    },
    {
        title: 'Peças',
        href: route('app.parts.index'),
        icon: MemoryStick,
        active: 'app.parts.*',
    },
];

const mainUserItems: NavItem[] = [
    {
        title: 'Usuários',
        href: route('app.users.index'),
        icon: UserCog,
        active: 'app.users.*',
    },
];

const mainConfItems = [
    {
        title: "Configurações",
        url: "#",
        icon: Cog,
        items: [
            {
                title: 'Dados da empresa',
                url: route('app.company.index'),
                icon: Building,
                active: 'app.company.*',
            },
            {
                title: 'Mensagens do Whatsapp',
                url: route('app.whatsapp-message.index'),
                icon: MessageCircleCode,
                active: 'app.whatsapp-message.*',
            },
            {
                title: 'Impressões de recibos',
                url: route('app.receipts.index'),
                icon: Printer,  
                active: 'app.receipts.*',
            },
            {
                title: 'Impressão de etiquetas',
                url: route('app.label-printing.index'),
                icon: Tags, 
                active: 'app.label-printing.*',
            },
            {
                title: 'Tipo de equipamento',
                url: route('app.register-equipments.index'),
                icon: Monitor,
                active: 'app.register-equipments.*',
            },
            {
                title: 'Checklist',
                url: route('app.register-checklists.index'),
                icon: ClipboardList,
                active: 'app.register-checklists.*',
            },
            {
                title: 'Outras configurações',
                url: route('app.other-settings.index'),
                icon: CogIcon,
                active: 'app.other-settings.*',
            },
        ]
    }
];

const mainRegisterItems = [
    {
        title: "Cadastros",
        url: "#",
        icon: PackagePlus,
        items: [
            {
                title: 'Cadastrar marcas',
                url: route('app.register-brands.index'),
                icon: Copyright,
                active: 'app.register-brands.*',
            },
            {
                title: 'Cadastrar modelos',
                url: route('app.register-models.index'),
                icon: Sparkles,
                active: 'app.register-models.*',
            },
            {
                title: 'Cadastrar serviços',
                url: route('app.register-services.index'),
                icon: Wrench,
                active: 'app.register-services.*',
            },
            {
                title: 'Cadastrar orçamentos',
                url: route('app.register-budgets.index'),
                icon: Blocks,
                active: 'app.register-budgets.*',
            },
        ]
    }
];

const mainAdminItems = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutGrid,
        active: 'admin.dashboard',
    },
    {
        title: 'Empresas',
        href: route('admin.tenants.index'),
        icon: Building,
        active: 'admin.tenants.*',
    },
    {
        title: 'Usuários',
        href: route('admin.users.index'),
        icon: UserCog,
        active: 'admin.users.*',
    },
    {
        title: 'Configurações',
        href: route('admin.settings.index'),
        icon: Cog,
        active: 'admin.settings.*',
    },
];

const mainPlansItems = [
    {
        title: "Planos",
        url: "#",
        icon: HandCoins,
        items: [
            {
                title: 'Cadastrar plano',
                url: route('admin.plans.index'),
                icon: Copyright,
                active: 'admin.plans.*',
            },
            {
                title: 'Cadastrar períodos',
                url: route('admin.periods.index'),
                icon: Sparkles,
                active: 'admin.periods.*',
            },
            {
                title: 'Cadastrar característica',
                url: route('admin.features.index'),
                icon: Sparkles,
                active: 'admin.features.*',
            },
        ]
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'MEGB',
        href: 'https://megb.com.br',
        icon: linkmegb,
    },
];

export { mainNavItems, mainUserItems ,mainConfItems, mainRegisterItems,footerNavItems, mainAdminItems, mainPlansItems};