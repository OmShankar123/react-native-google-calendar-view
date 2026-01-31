import {
  processOverlappingEvents,
  getEventsForDay,
  formatDate,
  getMonthGridDays,
} from '../CustomCalendar/utils';

describe('Calendar Utils', () => {
  describe('processOverlappingEvents', () => {
    it('should handle empty events array', () => {
      const result = processOverlappingEvents([]);
      expect(result).toEqual([]);
    });

    it('should handle single event', () => {
      const events = [
        {
          id: '1',
          title: 'Event 1',
          start: new Date(2024, 0, 15, 10, 0),
          duration: 1,
        },
      ];
      const result = processOverlappingEvents(events);
      expect(result).toHaveLength(1);
      expect(result[0].columnIndex).toBe(0);
      expect(result[0].totalColumns).toBe(1);
    });

    it('should handle overlapping events', () => {
      const events = [
        {
          id: '1',
          title: 'Event 1',
          start: new Date(2024, 0, 15, 10, 0),
          duration: 1,
        },
        {
          id: '2',
          title: 'Event 2',
          start: new Date(2024, 0, 15, 10, 30),
          duration: 1,
        },
      ];
      const result = processOverlappingEvents(events);
      expect(result).toHaveLength(2);
      expect(result[0].totalColumns).toBe(2);
      expect(result[1].totalColumns).toBe(2);
      expect(result[0].columnIndex).not.toBe(result[1].columnIndex);
    });

    it('should handle non-overlapping events', () => {
      const events = [
        {
          id: '1',
          title: 'Event 1',
          start: new Date(2024, 0, 15, 10, 0),
          duration: 1,
        },
        {
          id: '2',
          title: 'Event 2',
          start: new Date(2024, 0, 15, 12, 0),
          duration: 1,
        },
      ];
      const result = processOverlappingEvents(events);
      expect(result).toHaveLength(2);
      expect(result[0].totalColumns).toBe(1);
      expect(result[1].totalColumns).toBe(1);
    });
  });

  describe('getEventsForDay', () => {
    it('should return events for specific day', () => {
      const targetDate = new Date(2024, 0, 15);
      const events = [
        {
          id: '1',
          title: 'Event 1',
          start: new Date(2024, 0, 15, 10, 0),
          duration: 1,
        },
        {
          id: '2',
          title: 'Event 2',
          start: new Date(2024, 0, 16, 10, 0),
          duration: 1,
        },
      ];
      const result = getEventsForDay(events, targetDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle multi-day events', () => {
      const targetDate = new Date(2024, 0, 15);
      const events = [
        {
          id: '1',
          title: 'Multi-day Event',
          start: new Date(2024, 0, 14, 20, 0),
          duration: 8, // Spans into next day
        },
      ];
      const result = getEventsForDay(events, targetDate);
      expect(result).toHaveLength(1);
      expect(result[0].isContinued).toBe(true);
    });

    it('should clip events to day boundaries', () => {
      const targetDate = new Date(2024, 0, 15);
      const events = [
        {
          id: '1',
          title: 'Long Event',
          start: new Date(2024, 0, 15, 22, 0),
          duration: 4, // Goes past midnight
        },
      ];
      const result = getEventsForDay(events, targetDate);
      expect(result).toHaveLength(1);
      expect(result[0].duration).toBeLessThan(4);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 0, 15); // Monday
      const result = formatDate(date);
      expect(result.day).toBe(15);
      expect(result.name).toBe('Mon');
      expect(result.fullDate).toEqual(date);
    });

    it('should handle different days of week', () => {
      const sunday = new Date(2024, 0, 14);
      const result = formatDate(sunday);
      expect(result.name).toBe('Sun');
    });
  });

  describe('getMonthGridDays', () => {
    it('should generate correct month grid', () => {
      const result = getMonthGridDays(2024, 0); // January 2024
      expect(result.length).toBeGreaterThan(0);

      // Check that it includes all days of the month
      const daysInMonth = result.filter((d) => d.day !== null);
      expect(daysInMonth.length).toBe(31); // January has 31 days
    });

    it('should add padding for week alignment', () => {
      const result = getMonthGridDays(2024, 0);

      // First element might be null (padding)
      const firstDay = result.find((d) => d.day === 1);
      expect(firstDay).toBeDefined();
      expect(firstDay?.fullDate).toBeDefined();
    });

    it('should handle different months', () => {
      const feb = getMonthGridDays(2024, 1); // February 2024 (leap year)
      const daysInFeb = feb.filter((d) => d.day !== null);
      expect(daysInFeb.length).toBe(29);

      const april = getMonthGridDays(2024, 3); // April 2024
      const daysInApril = april.filter((d) => d.day !== null);
      expect(daysInApril.length).toBe(30);
    });
  });
});
