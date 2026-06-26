import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, BoxIcon, CogIcon, Folder, LayoutGrid, MapPinned, ShoppingCartIcon, User2Icon, UserIcon, UsersIcon } from 'lucide-react';
import AppLogo from './app-logo';

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
        title: 'Regiões',
        href: route('app.regions.index'),
        icon: MapPinned,
        active: 'app.regions.*',
    },
    {
        title: 'Configurações',
        href: route('app.settings.index'),
        icon: CogIcon,
        active: 'admin.settings.*',
    },
    {
        title: 'Usuário',
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
    const visibleNavItems = appNavItems.filter((item) => item.title !== 'Regiões' || auth.canManageTeam);

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
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
