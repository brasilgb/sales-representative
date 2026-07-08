import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpenText,
    BoxIcon,
    BrainCircuit,
    CalendarDays,
    CogIcon,
    HandCoins,
    ReceiptText,
    LayoutGrid,
    ListChecks,
    MapPinned,
    MessageSquareMore,
    Megaphone,
    ShoppingCartIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import AppLogo from './app-logo';
import NavMainCollapsible from './nav-main-collapsible';

const appNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
        icon: LayoutGrid,
        active: 'app.dashboard',
    },
    {
        title: 'Pedidos',
        href: route('app.orders.index'),
        icon: ShoppingCartIcon,
        active: 'app.orders.*',
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
        icon: UserIcon,
        active: 'app.users.*',
    },
    {
        title: 'Clientes',
        href: route('app.customers.index'),
        icon: UsersIcon,
        active: 'app.customers.*',
    },
    {
        title: 'Produtos',
        href: route('app.products.index'),
        icon: BoxIcon,
        active: 'app.products.*',
    },
    {
        title: 'Comissões',
        href: route('app.commissions.index'),
        icon: BarChart3,
        active: 'app.commissions.*',
    },
    {
        title: 'Agenda',
        href: route('app.visits.index'),
        icon: CalendarDays,
        active: 'app.visits.*',
    },
    {
        title: 'Despesas',
        href: route('app.expenses.index'),
        icon: ReceiptText,
        active: 'app.expenses.*',
    },
    {
        title: 'Inteligência',
        href: route('app.intelligence.index'),
        icon: BrainCircuit,
        active: 'app.intelligence.*',
    },
    {
        title: 'Campanhas',
        href: route('app.campaigns.index'),
        icon: Megaphone,
        active: 'app.campaigns.*',
    },
    {
        title: 'Regras comerciais',
        href: route('app.commercial-conditions.index'),
        icon: HandCoins,
        active: 'app.commercial-conditions.*',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentação',
        href: '/documentation/manual-vetorpet.html',
        icon: BookOpenText,
        external: true,
    },
    {
        title: 'Ajustes/Avaliações',
        href: route('app.feedback.index'),
        icon: MessageSquareMore,
        active: 'app.feedback.*',
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const canEditOwnUser = auth.isSeller || !auth.canManageSellers;
    const featureByTitle: Record<string, string> = {
        Comissões: 'commissions',
        Inteligência: 'intelligence',
        Campanhas: 'campaigns',
        'Regras comerciais': 'commercial_conditions',
    };
    const visibleNavItems = appNavItems.filter((item) => {
        if (item.title === 'Equipe' && !auth.canManageSellers) {
            return false;
        }

        if (item.title === 'Regiões' && !auth.canManageTeam) {
            return false;
        }

        if (item.title === 'Regras comerciais' && !auth.canManageTeam) {
            return false;
        }

        const requiredFeature = featureByTitle[item.title];

        return !requiredFeature || auth.planFeatures?.includes(requiredFeature);
    });
    const settingsItems = [
        {
            title: 'Configurações',
            url: '#',
            icon: CogIcon,
            isActive: Boolean(
                route().current('app.company.*') ||
                    (canEditOwnUser && route().current('app.users.*')) ||
                    route().current('app.other-settings.*') ||
                    route().current('app.auxiliary-apps.*') ||
                    route().current('app.subscription.*'),
            ),
            items: [
                ...(canEditOwnUser
                    ? [
                          {
                              title: 'Meu usuário',
                              url: route('app.users.edit', auth.user.id),
                              active: 'app.users.*',
                          },
                      ]
                    : []),
                {
                    title: 'Dados da empresa',
                    url: route('app.company.index'),
                    active: 'app.company.*',
                },
                {
                    title: 'Aplicativos auxiliares',
                    url: route('app.auxiliary-apps.index'),
                    active: 'app.auxiliary-apps.*',
                },
                {
                    title: 'Outras configurações',
                    url: route('app.other-settings.index'),
                    active: 'app.other-settings.*|app.subscription.*',
                },
            ],
        },
    ];
    const reportItems = [
        {
            title: 'Relatórios',
            url: '#',
            icon: ListChecks,
            isActive: Boolean(route().current('app.reports.*') || route().current('app.orders.report')),
            items: [
                { title: 'Vendas', url: route('app.reports.sales'), active: 'app.reports.sales' },
                { title: 'Vendedores', url: route('app.reports.sellers'), active: 'app.reports.sellers' },
                { title: 'Pedidos (PDF)', url: route('app.orders.report'), active: 'app.orders.report' },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('app.dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
                <NavMainCollapsible items={reportItems} />
                <NavMainCollapsible items={settingsItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
