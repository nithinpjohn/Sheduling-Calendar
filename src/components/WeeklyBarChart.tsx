
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarEvent } from './CalendarApp';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

interface WeeklyBarChartProps {
  events: CalendarEvent[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ events }) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const data = weekDays.map(day => {
    const dayEvents = events.filter(event => {
      const eventDate = parseISO(event.start);
      return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });

    return {
      day: format(day, 'EEE'),
      events: dayEvents.length,
      fullDate: format(day, 'MMM d')
    };
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} events`, 'Events']}
            labelFormatter={(label: string) => {
              const dayData = data.find(d => d.day === label);
              return dayData ? `${dayData.day}, ${dayData.fullDate}` : label;
            }}
          />
          <Bar dataKey="events" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
