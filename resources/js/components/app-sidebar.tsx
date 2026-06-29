import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BoxIcon, BrainCircuit, CalendarDays, CogIcon, HandCoins, LayoutGrid, MapPinned, ShoppingCartIcon, UserIcon, UsersIcon } from 'lucide-react';
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
        title: 'Agenda',
        href: route('app.visits.index'),
        icon: CalendarDays,
        active: 'app.visits.*',
    },
    {
        title: 'Produtos',
        href: route('app.products.index'),
        icon: BoxIcon,
        active: 'app.products.*',
    },
    {
        title: 'Clientes',
        href: route('app.customers.index'),
        icon: UsersIcon,
        active: 'app.customers.*',
    },
    {
        title: 'Inteligência',
        href: route('app.intelligence.index'),
        icon: BrainCircuit,
        active: 'app.intelligence.*|app.campaigns.*',
    },
    {
        title: 'Regiões',
        href: route('app.regions.index'),
        icon: MapPinned,
        active: 'app.regions.*',
    },
    {
        title: 'Condições',
        href: route('app.commercial-conditions.index'),
        icon: HandCoins,
        active: 'app.commercial-conditions.*|app.commissions.*',
    },
    {
        title: 'Equipe',
        href: route('app.users.index'),
        icon: UserIcon,
        active: 'app.users.*',
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const canEditOwnUser = auth.isSeller || !auth.canManageSellers;
    const featureByTitle: Record<string, string> = {
        Condições: 'commercial_conditions',
        Inteligência: 'intelligence',
    };
    const visibleNavItems = appNavItems.filter((item) => {
        if (item.title === 'Equipe' && !auth.canManageSellers) {
            return false;
        }

        if (['Regiões', 'Condições'].includes(item.title) && !auth.canManageTeam) {
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
                    title: 'Outras configurações',
                    url: route('app.other-settings.index'),
                    active: 'app.other-settings.*|app.subscription.*',
                },
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
                <NavMainCollapsible items={settingsItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
