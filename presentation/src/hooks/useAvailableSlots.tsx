import { useState, useEffect } from "react";
import { addHours, format, setHours, setMinutes, setSeconds } from "date-fns";
import { reservationService } from "../services/reservation.service";

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export function useAvailableSlots(selectedDate: Date | null) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) return;

      setLoading(true);
      try {
        // Configurar o início do dia às 8h
        const startTime = setHours(
          setMinutes(setSeconds(selectedDate, 0), 0),
          8
        );
        // Configurar o fim do dia às 22h
        const endTime = setHours(
          setMinutes(setSeconds(selectedDate, 0), 0),
          22
        );

        const tempSlots: TimeSlot[] = [];
        let currentSlot = startTime;

        while (currentSlot < endTime) {
          const slotEnd = addHours(currentSlot, 2);

          // Formatar as datas no formato esperado pelo backend
          const formattedStart = format(currentSlot, "yyyy-MM-dd HH:mm:ss");
          const formattedEnd = format(slotEnd, "yyyy-MM-dd HH:mm:ss");

          try {
            const availableTables = await reservationService.checkAvailability(
              formattedStart,
              formattedEnd
            );

            tempSlots.push({
              start: currentSlot,
              end: slotEnd,
              available: availableTables.length > 0,
            });
          } catch (error) {
            console.error("Erro ao verificar disponibilidade:", error);
          }

          currentSlot = slotEnd;
        }

        setSlots(tempSlots);
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [selectedDate?.toDateString()]); // Usar toDateString() para evitar loops infinitos

  return { slots, loading };
}
