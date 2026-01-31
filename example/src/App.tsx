import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import {
  CustomCalendar,
  CalendarEvent,
  CalendarTheme,
  LegendItem,
} from 'react-native-google-calendar-view';

const generateSampleEvents = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [];

  events.push({
    id: '1',
    title: 'Team Standup',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      0
    ),
    duration: 0.5,
    status: 'scheduled',
    type: 'meeting',
  });

  events.push({
    id: '2',
    title: 'Product Review',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      30
    ),
    duration: 1.5,
    status: 'scheduled',
    type: 'meeting',
  });

  events.push({
    id: '3',
    title: 'Lunch Break',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0
    ),
    duration: 1,
    status: 'completed',
    type: 'personal',
  });

  events.push({
    id: '4',
    title: 'Code Review',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      14,
      0
    ),
    duration: 1,
    status: 'scheduled',
    type: 'work',
  });

  events.push({
    id: '5',
    title: 'Client Call',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      16,
      0
    ),
    duration: 0.5,
    status: 'scheduled',
    type: 'meeting',
  });

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  events.push({
    id: '6',
    title: 'Sprint Planning',
    start: new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      9,
      0
    ),
    duration: 2,
    status: 'scheduled',
    type: 'meeting',
  });

  events.push({
    id: '7',
    title: 'Development Time',
    start: new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      11,
      0
    ),
    duration: 3,
    status: 'scheduled',
    type: 'work',
  });

  // Day after tomorrow
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  events.push({
    id: '8',
    title: 'Workshop',
    start: new Date(
      dayAfter.getFullYear(),
      dayAfter.getMonth(),
      dayAfter.getDate(),
      10,
      0
    ),
    duration: 2.5,
    status: 'scheduled',
    type: 'training',
  });

  // Add some events in the past
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  events.push({
    id: '9',
    title: 'Design Review',
    start: new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      15,
      0
    ),
    duration: 1,
    status: 'completed',
    type: 'meeting',
  });

  // Middle of the Month Events (15th)
  const middleOfMonth = new Date(today.getFullYear(), today.getMonth(), 15);

  events.push({
    id: 'mid-1',
    title: 'Mid-Month Review',
    start: new Date(
      middleOfMonth.getFullYear(),
      middleOfMonth.getMonth(),
      middleOfMonth.getDate(),
      11,
      0
    ),
    duration: 1.5,
    status: 'scheduled',
    type: 'work',
  });

  events.push({
    id: 'mid-2',
    title: 'Team Lunch',
    start: new Date(
      middleOfMonth.getFullYear(),
      middleOfMonth.getMonth(),
      middleOfMonth.getDate(),
      13,
      0
    ),
    duration: 1,
    status: 'completed',
    type: 'personal',
  });

  // Add overlapping events for testing
  events.push({
    id: '10',
    title: 'Overlapping Event 1',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      0
    ),
    duration: 1.5,
    status: 'scheduled',
    type: 'work',
  });

  events.push({
    id: '11',
    title: 'Overlapping Event 2',
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      30
    ),
    duration: 1.5,
    status: 'scheduled',
    type: 'personal',
  });

  return events;
};

export default function App() {
  const [events] = useState<CalendarEvent[]>(generateSampleEvents());

  const theme: Partial<CalendarTheme> = {
    colors: {
      backgroundColor: '#FFFFFF',
      cardBackground: '#F8F9FA',
      mainText: '#1A1A1A',
      secondaryText: '#6B7280',
      borderColor: '#E5E7EB',
      primary: '#3B82F6',
      switcherBackground: '#F3F4F6',
      stripBackground: '#F9FAFB',
    },
    fonts: {
      regular: 'System',
      bold: 'System',
      medium: 'System',
      semiBold: 'System',
    },
  };

  const legendItems: LegendItem[] = [
    { label: 'Meeting', color: '#3B82F6' },
    { label: 'Work', color: '#10B981' },
    { label: 'Personal', color: '#F59E0B' },
    { label: 'Training', color: '#8B5CF6' },
    { label: 'Completed', color: '#6B7280' },
  ];

  const handleEventPress = (event: CalendarEvent) => {
    console.log('Event pressed:', event.title);
  };

  const handleDateChange = (date: Date) => {
    console.log('Date changed:', date.toLocaleDateString());
  };

  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    console.log('View changed:', view);
  };

  const renderCustomEventCard = (
    event: CalendarEvent,
    viewMode: 'day' | 'week' | 'month',
    isSelected: boolean,
    toggleSelection: () => void
  ) => {
    const eventColor =
      legendItems.find(
        (item) => item.label.toLowerCase() === event.type?.toLowerCase()
      )?.color || '#3B82F6';

    if (event.type === 'meeting') {
      return (
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#1E40AF',
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            📅 {event.title || event.id}
          </Text>
          <Text style={{ fontSize: 10, color: '#60A5FA' }}>
            {event.duration}h • {event.status}
          </Text>
          <Text style={{ fontSize: 9, color: '#93C5FD', marginTop: 2 }}>
            👥 5 attendees
          </Text>
        </View>
      );
    }

    if (event.type === 'training') {
      return (
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#6D28D9',
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            🎓 {event.title || event.id}
          </Text>
          <View
            style={{
              height: 4,
              backgroundColor: '#DDD6FE',
              borderRadius: 2,
              marginTop: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: '60%',
                backgroundColor: eventColor,
              }}
            />
          </View>
          <Text style={{ fontSize: 9, color: '#A78BFA', marginTop: 2 }}>
            60% complete
          </Text>
        </View>
      );
    }

    if (event.type === 'personal') {
      return (
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#D97706',
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            ⭐ {event.title || event.id}
          </Text>
          <Text style={{ fontSize: 10, color: '#F59E0B' }}>
            {event.duration}h
          </Text>
        </View>
      );
    }

    return undefined;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.calendarContainer}>
        <CustomCalendar
          events={events}
          initialDate={new Date()}
          theme={theme}
          legendItems={legendItems}
          onEventPress={handleEventPress}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          startHour={1}
          headerLayout="column"
          legendPosition="right"
          renderEventCard={renderCustomEventCard}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  calendarContainer: {
    flex: 1,
    paddingTop: 10,
  },
});
