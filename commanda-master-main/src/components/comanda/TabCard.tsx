import { Tab } from '@/types/comanda';
import { Clock, User, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TabCardProps {
  tab: Tab;
  onClick: () => void;
}

export function TabCard({ tab, onClick }: TabCardProps) {
  const isOpen = tab.status === 'open';

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card p-5 w-full text-left transition-all duration-300 hover:scale-[1.02] glow-border",
        "animate-fade-in"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg",
            isOpen 
              ? "bg-gradient-to-br from-primary to-amber-400 text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            #{tab.number}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{tab.customer.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {formatDistanceToNow(new Date(tab.createdAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
          </div>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          isOpen 
            ? "bg-success/20 text-success" 
            : "bg-muted text-muted-foreground"
        )}>
          {isOpen ? 'Aberta' : 'Fechada'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        {tab.customer.table && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>Mesa {tab.customer.table}</span>
          </div>
        )}
        {tab.customer.identity && (
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>{tab.customer.identity}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-sm text-muted-foreground">
          {tab.items.length} {tab.items.length === 1 ? 'item' : 'itens'}
        </span>
        <span className="font-display font-bold text-xl gradient-text">
          R$ {tab.total.toFixed(2)}
        </span>
      </div>
    </button>
  );
}
