import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    width,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    width?: string;
    description: string;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} width={width} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
