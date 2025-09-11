import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Building, Cog, Copyright, Folder, HandCoins, LayoutGrid, Sparkles, UserCog } from 'lucide-react';
import AppLogo from './app-logo';
import NavMainCollapsible from './nav-main-collapsible';
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

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainAdminItems} />
                <NavMainCollapsible items={mainPlansItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}