import { ReactNode } from "react";

interface SiteLayoutProps {
    children: ReactNode;
}
    
export default function SiteLayout({ children }: SiteLayoutProps) {
    return (
        <div className=" bg-gray-100">
            {children}
        </div>
    )
}
