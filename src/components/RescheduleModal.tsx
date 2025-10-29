import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { checkReservationAvailability, rescheduleReservation } from '../services/reservationService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    id: string;
    reservationDate: string;
    reservationTime: string;
    restaurantName: string | null;
    guestsCount: number;
  };
  onSuccess: () => void;
}

export function RescheduleModal({
  isOpen,
  onClose,
  reservation,
  onSuccess,
}: RescheduleModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && reservation) {
      // Inicializar con los valores actuales
      setDate(reservation.reservationDate);
      const timeFormatted = reservation.reservationTime.substring(0, 5);
      setTime(timeFormatted);
      setReason('');
      setAvailabilityMessage('');
      setIsAvailable(null);
    }
  }, [isOpen, reservation]);

  // Verificar disponibilidad cuando cambia fecha o hora
  useEffect(() => {
    const checkAvailability = async () => {
      if (date && time && reservation) {
        // No verificar si es la misma fecha y hora
        const currentDateTime = `${reservation.reservationDate} ${reservation.reservationTime.substring(0, 5)}`;
        const newDateTime = `${date} ${time}`;
        
        if (currentDateTime === newDateTime) {
          setAvailabilityMessage('');
          setIsAvailable(null);
          return;
        }

        setCheckingAvailability(true);
        try {
          const result = await checkReservationAvailability(
            reservation.id,
            date,
            time
          );
          
          setIsAvailable(result.available);
          setAvailabilityMessage(
            result.available 
              ? '✅ Horario disponible'
              : `⚠️ ${result.message} (${result.existing_reservations} reservas existentes)`
          );
        } catch (error) {
          console.error('Error verificando disponibilidad:', error);
          setAvailabilityMessage('Error al verificar disponibilidad');
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [date, time, reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAvailable && isAvailable !== null) {
      toast.error('Por favor selecciona un horario disponible');
      return;
    }

    setLoading(true);
    
    try {
      const result = await rescheduleReservation(reservation.id, {
        reservation_date: date,
        reservation_time: time,
        reason: reason || undefined,
      });

      toast.success(
        <div>
          <p className="font-medium">Reservación modificada exitosamente</p>
          <p className="text-sm mt-1">
            Nueva fecha: {date} a las {time}
          </p>
          {result.emails_sent?.customer && (
            <p className="text-xs mt-1 text-gray-500">
              ✉️ Confirmación enviada por email
            </p>
          )}
        </div>
      );
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al modificar la reservación');
    } finally {
      setLoading(false);
    }
  };

  // Generar horarios disponibles (12:00 PM - 9:30 PM)
  const timeSlots: string[] = [];
  for (let hour = 12; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Fecha mínima (mañana) y máxima (90 días)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Modificar Reservación
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Info actual */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {reservation.restaurantName || 'Restaurante'}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {reservation.reservationDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {reservation.reservationTime.substring(0, 5)}
              </span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Nueva Fecha */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nueva Fecha
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                max={maxDateStr}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Nueva Hora */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nueva Hora
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selecciona una hora</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Mensaje de disponibilidad */}
            {(availabilityMessage || checkingAvailability) && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${
                isAvailable === true 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : isAvailable === false
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                  : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {checkingAvailability ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Verificando disponibilidad...
                  </span>
                ) : (
                  availabilityMessage
                )}
              </div>
            )}

            {/* Motivo */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Motivo del cambio (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder="Ej: Cambio de planes, conflicto de horario..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Advertencia de 24 horas */}
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Los cambios deben realizarse con al menos 24 horas de anticipación.
                Se enviará una confirmación por email.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || checkingAvailability || (isAvailable === false)}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Modificando...
                  </span>
                ) : (
                  'Confirmar Cambio'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}