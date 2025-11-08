import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

const PLAIN_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDateValue = (value?: string | Date | null): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    if (PLAIN_DATE_PATTERN.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

interface DateSelectionPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onDateSelected?: (date: Date) => void;
  initialDate?: string; // YYYY-MM-DD
  isEditing?: boolean;
}

export const DateSelectionPage: React.FC<DateSelectionPageProps> = ({ 
  onTabChange, 
  onBack, 
  onDateSelected,
  initialDate,
  isEditing = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => parseDateValue(initialDate));
  const [currentMonth] = useState(() => parseDateValue(initialDate) ?? new Date());
  
  useEffect(() => {
    setSelectedDate(parseDateValue(initialDate));
  }, [initialDate]);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelected?.(date);
  };

  // Função para gerar dias do mês
  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Começar do domingo

    const days = [];
    const currentDate = new Date(startDate);

    // Gerar 6 semanas (42 dias)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Função para verificar se a data é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Função para verificar se a data é do mês atual
  const isCurrentMonth = (date: Date, month: number) => {
    return date.getMonth() === month;
  };

  // Função para verificar se a data está selecionada
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };


  // Nomes dos meses em português
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Dias da semana em português
  const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const calendarDays = generateCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth());

  const handleContinue = () => {
    if (!selectedDate) {
      return;
    }

    onDateSelected?.(selectedDate);
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      {/* Header com botão voltar */}
      <div className="flex items-center p-3">
        <button 
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Quando você vai?</h1>
      </div>

      {/* Calendário */}
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Mês e ano */}
        <div className="text-center text-lg font-medium text-gray-900 mb-4">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {calendarDays.map((date, index) => {
            const isCurrentMonthDay = isCurrentMonth(date, currentMonth.getMonth());
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date);

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`
                  aspect-square flex items-center justify-center text-sm font-medium rounded-full
                  ${!isCurrentMonthDay 
                    ? 'text-gray-300' 
                    : isSelectedDate
                    ? 'bg-blue-600 text-white'
                    : isTodayDate
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Segundo mês (próximo mês) */}
        <div className="mt-8">
          <div className="text-center text-lg font-medium text-gray-900 mb-4">
            {monthNames[(currentMonth.getMonth() + 1) % 12]} {currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear()}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays(
              currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear(),
              (currentMonth.getMonth() + 1) % 12
            ).map((date, index) => {
              const isCurrentMonthDay = isCurrentMonth(date, (currentMonth.getMonth() + 1) % 12);
              const isTodayDate = isToday(date);
              const isSelectedDate = isSelected(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    aspect-square flex items-center justify-center text-sm font-medium rounded-full
                    ${!isCurrentMonthDay 
                      ? 'text-gray-300' 
                      : isSelectedDate
                      ? 'bg-blue-600 text-white'
                      : isTodayDate
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative">
        {isEditing && (
          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-blue-600 text-white py-4 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        )}

        <BottomNav 
          activeTab="create"
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
};
