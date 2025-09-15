import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    active?: string;
    enabled?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Tenant {
    company: string;
    cnpj: string;
    phone: string;
    whatsapp: string;
    email: string;
    zip_code: string;
    state: string;
    city: string;
    district: string;
    street: string;
    complement: string;
    number: string;
    plan: string;
    status: string;
    payment: boolean;
    observations: string;
    expiration_date: Date;
} 