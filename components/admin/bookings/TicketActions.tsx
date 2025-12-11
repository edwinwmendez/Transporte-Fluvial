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
    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
      {hasPDF && (
        <Button
          variant="outline"
          className="flex-1"
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
        className="flex-1"
        onClick={onPrint}
        disabled={loading}
        aria-label="Imprimir boleto"
      >
        <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
        Imprimir
      </Button>
      <Button
        variant="outline"
        className="flex-1"
        onClick={onShare}
        disabled={loading}
        aria-label="Compartir boleto por WhatsApp"
      >
        <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
        Compartir
      </Button>
      {canMarkAsUsed && onMarkAsUsed && (
        <Button
          className="flex-1"
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
