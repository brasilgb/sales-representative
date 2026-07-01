import { type NavItem } from '@/types';
import { Building, Cog, Copyright, HandCoins, LayoutGrid, Link as LinkIcon, MapPinned, Sparkles, UserCog, Users2, Wrench } from 'lucide-react';

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
        title: 'Regiões',
        href: route('app.regions.index'),
        icon: MapPinned,
        active: 'app.regions.*',
    },
    {
        title: 'Equipe',
        href: route('app.users.index'),
        icon: UserCog,
        active: 'app.users.*',
    },
    {
        title: 'Pedidos',
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
        title: 'Planos',
        url: '#',
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
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'VetorPet',
        href: 'https://vetorpet.com.br',
        icon: LinkIcon,
    },
];

export { footerNavItems, mainAdminItems, mainNavItems, mainPlansItems };
