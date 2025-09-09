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