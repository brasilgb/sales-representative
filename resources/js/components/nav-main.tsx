import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { othersetting } = usePage().props as any;
    const disableParts = !othersetting?.enableparts ? 'parts' : '';
    const isActive = (active?: string) => active?.split('|').some((pattern) => route().current(pattern)) ?? false;
    
    return (
            <SidebarMenu>
                {items.map((item) => (
                    item.enabled !== disableParts &&
                    (
                        <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton  
                            asChild isActive={isActive(item.active)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    )
                ))}
            </SidebarMenu>
    );
}
