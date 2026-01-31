import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const guidelineBaseWidth = 375;

export const ms = (size: number, factor = 0.5) => {
  const scale = width / guidelineBaseWidth;
  const newSize = size * scale;
  return size + (newSize - size) * factor;
};

export const getMonthGridDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startingDayIndex = firstDay.getDay(); // 0 = Sun

  // Align to Mo-Su grid (Mo=0, Tu=1 ... Su=6)
  const startOffset = (startingDayIndex + 6) % 7;

  const days: {
    day: number;
    fullDate: Date;
    isCurrentMonth: boolean;
  }[] = [];

  // Previous Month Days
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < startOffset; i++) {
    const d = prevMonthTotalDays - (startOffset - 1 - i);
    days.push({
      day: d,
      fullDate: new Date(year, month - 1, d),
      isCurrentMonth: false,
    });
  }

  // Current Month Days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      day: i,
      fullDate: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next Month Days
  let nextDay = 1;
  while (days.length % 7 !== 0) {
    days.push({
      day: nextDay,
      fullDate: new Date(year, month + 1, nextDay),
      isCurrentMonth: false,
    });
    nextDay++;
  }

  return days;
};

export const formatDateDDMMYYYY = (date: Date) => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${y}`;
};

export const formatDate = (date: Date) => {
  const day = date.getDate();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    day: day,
    name: days[date.getDay()] || 'Sun',
    fullDate: date,
  };
};

export const processOverlappingEvents = (events: any[]) => {
  if (!events || events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    return b.duration - a.duration;
  });

  const processed: any[] = [];
  let currentGroup: any[] = [];
  let maxEndTime = 0;

  sorted.forEach((event) => {
    const eventEndTime =
      new Date(event.start).getTime() + event.duration * 60 * 60 * 1000;

    if (
      currentGroup.length > 0 &&
      new Date(event.start).getTime() >= maxEndTime
    ) {
      assignColumns(currentGroup, processed);
      currentGroup = [];
      maxEndTime = 0;
    }

    currentGroup.push({ ...event, endTime: eventEndTime });
    maxEndTime = Math.max(maxEndTime, eventEndTime);
  });

  if (currentGroup.length > 0) {
    assignColumns(currentGroup, processed);
  }

  return processed;
};

const assignColumns = (group: any[], resultList: any[]) => {
  const columns: number[] = [];

  group.forEach((event) => {
    let colIndex = columns.findIndex(
      (endTime) => new Date(event.start).getTime() >= endTime
    );

    if (colIndex === -1) {
      columns.push(event.endTime);
      event.columnIndex = columns.length - 1;
    } else {
      columns[colIndex] = event.endTime;
      event.columnIndex = colIndex;
    }
  });

  group.forEach((event) => {
    event.totalColumns = columns.length;
    resultList.push(event);
  });
};

export const getEventsForDay = (events: any[], targetDate: Date) => {
  const targetStart = new Date(targetDate);
  targetStart.setHours(0, 0, 0, 0);

  // We compare until the start of the NEXT day
  const nextDayStart = new Date(targetStart);
  nextDayStart.setDate(nextDayStart.getDate() + 1);

  const dayEvents: any[] = [];

  events.forEach((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(
      eventStart.getTime() + event.duration * 3600 * 1000
    );

    // Check intersection: start < nextDayStart AND end > targetStart
    if (eventStart < nextDayStart && eventEnd > targetStart) {
      let effectiveStart = eventStart;
      let effectiveDuration = event.duration;

      // 1. If starts before today, clip start to midnight (targetStart)
      if (eventStart < targetStart) {
        effectiveStart = new Date(targetStart);
        // Duration is reduced by the time already passed
        const remainingMillis = eventEnd.getTime() - effectiveStart.getTime();
        effectiveDuration = remainingMillis / (3600 * 1000);
      }

      // 2. If ends after today (nextDayStart), clip duration
      // The effective end is effectiveStart + effectiveDuration
      const effectiveEnd = new Date(
        effectiveStart.getTime() + effectiveDuration * 3600 * 1000
      );

      if (effectiveEnd > nextDayStart) {
        const clampedDuration =
          (nextDayStart.getTime() - effectiveStart.getTime()) / (3600 * 1000);
        effectiveDuration = clampedDuration;
      }

      dayEvents.push({
        ...event,
        start: effectiveStart,
        duration: effectiveDuration,
        originalStart: event.start, // Persist original start for display
        isContinued: eventStart < targetStart, // Flag: started on a previous day
      });
    }
  });

  return dayEvents;
};
