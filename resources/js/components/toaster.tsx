import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ToastKind = 'success' | 'error';

type Toast = {
    id: number;
    kind: ToastKind;
    message: string;
};

type ToastApi = {
    success: (message: string) => void;
    error: (message: string) => void;
};

export type Flash = {
    message?: string | null;
    error?: string | null;
};

const ToastContext = createContext<ToastApi | null>(null);

export function Toaster({ children, initialFlash }: PropsWithChildren<{ initialFlash?: Flash }>) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(0);
    const initialFlashShown = useRef(false);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const show = useCallback(
        (kind: ToastKind, message: string) => {
            const id = ++nextId.current;
            setToasts((current) => [...current, { id, kind, message }]);
            window.setTimeout(() => dismiss(id), 5000);
        },
        [dismiss],
    );

    const api = useMemo<ToastApi>(
        () => ({
            success: (message) => show('success', message),
            error: (message) => show('error', message),
        }),
        [show],
    );

    useEffect(() => {
        if (initialFlashShown.current) return;
        initialFlashShown.current = true;
        if (initialFlash?.message) api.success(initialFlash.message);
        if (initialFlash?.error) api.error(initialFlash.error);
    }, [api, initialFlash]);

    useEffect(
        () =>
            router.on('success', (event) => {
                const flash = event.detail.page.props.flash as Flash | undefined;
                if (flash?.message) api.success(flash.message);
                if (flash?.error) api.error(flash.error);
            }),
        [api],
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
                {toasts.map((toast) => {
                    const success = toast.kind === 'success';
                    const Icon = success ? CheckCircle2 : AlertCircle;

                    return (
                        <div
                            key={toast.id}
                            role={success ? 'status' : 'alert'}
                            className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-4 text-sm shadow-lg ${
                                success ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'
                            }`}
                        >
                            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                            <span className="flex-1">{toast.message}</span>
                            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Fechar notificação" className="rounded-sm opacity-70 hover:opacity-100">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastApi {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast deve ser usado dentro de Toaster.');
    return context;
}
