import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Package, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: ClipboardList, label: 'Comandas', path: '/comandas' },
    { icon: Package, label: 'Produtos', path: '/produtos' },
    { icon: BarChart3, label: 'Relat.', path: '/relatorios' },
];

export function MobileNav() {
    const location = useLocation();
    const { signOut } = useAuth();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 md:hidden z-50 px-4 pb-4 pt-2">
            <nav className="flex justify-between items-center">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 p-2">
                            <div className={cn(
                                "p-2 rounded-xl transition-colors",
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
                <button
                    onClick={() => signOut()}
                    className="flex flex-col items-center gap-1 p-2"
                >
                    <div className="p-2 rounded-xl text-destructive/70">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-destructive/70">Sair</span>
                </button>
            </nav>
        </div>
    );
}
