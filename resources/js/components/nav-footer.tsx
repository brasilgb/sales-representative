import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const itemStyles = [
        'border-lime-200/80 bg-lime-50 text-lime-950 hover:bg-lime-100 hover:text-lime-950 dark:border-lime-800/70 dark:bg-lime-950/40 dark:text-lime-100 dark:hover:bg-lime-900/60 dark:hover:text-lime-50',
        'border-amber-200/80 bg-amber-50 text-amber-950 hover:bg-amber-100 hover:text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/60 dark:hover:text-amber-50',
    ];

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item, index) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={route().current(item.active ?? '')}
                                tooltip={{ children: item.title }}
                                className={cn('h-10 border shadow-xs', itemStyles[index % itemStyles.length])}
                            >
                                {item.external ? (
                                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </a>
                                ) : (
                                    <Link href={item.href}>
                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
