'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer, Share2, CheckCircle2, Loader2 } from 'lucide-react';

interface TicketActionsProps {
  onDownload: () => void;
  onPrint: () => void;
  onShare: () => void;
  onMarkAsUsed?: () => void;
  canMarkAsUsed?: boolean;
  loading?: boolean;
  marking?: boolean;
  hasPDF?: boolean;
}

/**
 * Componente para las acciones del boleto (descargar, imprimir, compartir, marcar como usado)
 */
export function TicketActions({
  onDownload,
  onPrint,
  onShare,
  onMarkAsUsed,
  canMarkAsUsed = false,
  loading = false,
  marking = false,
  hasPDF = false,
}: TicketActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t-2 border-border bg-muted/20 -mx-6 -mb-6 px-6 pb-6 sm:rounded-b-lg">
      {hasPDF && (
        <Button
          variant="outline"
          className="flex-1 hover:bg-primary/5 hover:border-primary/30 transition-all"
          onClick={onDownload}
          disabled={loading}
          aria-label="Descargar PDF del boleto"
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Descargar PDF
        </Button>
      )}
      <Button
        variant="outline"
        className="flex-1 hover:bg-primary/5 hover:border-primary/30 transition-all"
        onClick={onPrint}
        disabled={loading}
        aria-label="Imprimir boleto"
      >
        <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
        Imprimir
      </Button>
      <Button
        variant="outline"
        className="flex-1 hover:bg-primary/5 hover:border-primary/30 transition-all"
        onClick={onShare}
        disabled={loading}
        aria-label="Compartir boleto por WhatsApp"
      >
        <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
        Compartir
      </Button>
      {canMarkAsUsed && onMarkAsUsed && (
        <Button
          className="flex-1 hover:shadow-md transition-all"
          onClick={onMarkAsUsed}
          disabled={marking || loading}
          aria-label="Marcar boleto como usado"
        >
          {marking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Marcando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Marcar como Embarcado
            </>
          )}
        </Button>
      )}
    </div>
  );
}
