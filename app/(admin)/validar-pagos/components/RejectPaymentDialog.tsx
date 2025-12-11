'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RejectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

/**
 * Dialog para ingresar razón de rechazo de pago
 */
export function RejectPaymentDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: RejectPaymentDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-labelledby="reject-dialog-title" aria-describedby="reject-dialog-description">
        <DialogHeader>
          <DialogTitle id="reject-dialog-title">Rechazar Pago</DialogTitle>
          <DialogDescription id="reject-dialog-description">
            Ingresa la razón por la cual se rechaza este pago
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reject-reason">Razón de rechazo *</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Comprobante no coincide con el monto, número de teléfono incorrecto, etc."
              rows={4}
              required
              aria-required="true"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            aria-label="Cancelar rechazo"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            aria-label="Confirmar rechazo"
          >
            Rechazar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
