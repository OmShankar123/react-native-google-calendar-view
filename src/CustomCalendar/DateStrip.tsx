import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { ms } from './utils';
import { CalendarEvent } from './types';

interface DateStripProps {
  days: { day: number; name: string; fullDate: Date }[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  currentDisplayDate: Date;
  theme: any;
  styles: any;
  renderEventMarkers?: (date: Date, events: CalendarEvent[]) => React.ReactNode;
}

export const DateStrip: React.FC<DateStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  events,
  currentDisplayDate,
  theme,
  styles,
  renderEventMarkers,
}) => {
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    if (selectedDate && scrollViewRef.current) {
      const dayIndex = selectedDate.getDate() - 1;
      const itemWidth = ms(58);
      const screenWidth = Dimensions.get('window').width;
      const offset = dayIndex * itemWidth - screenWidth / 2 + itemWidth / 2;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, offset),
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate]);

  return (
    <View style={styles.dateStripContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStripContent}
      >
        {days.map((d, index) => {
          const isSelected =
            d.fullDate.getDate() === selectedDate.getDate() &&
            d.fullDate.getMonth() === selectedDate.getMonth();
          const dayEvents = events.filter(
            (e) =>
              e.start.getDate() === d.day &&
              e.start.getMonth() === currentDisplayDate.getMonth() &&
              e.start.getFullYear() === currentDisplayDate.getFullYear()
          );
          const hasData = dayEvents.length > 0;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateStripItem,
                isSelected
                  ? styles.dateStripItemActive
                  : styles.dateStripItemInactive,
              ]}
              onPress={() => onSelectDate(d.fullDate!)}
            >
              <Text
                style={[
                  styles.dateStripDayText,
                  {
                    color: isSelected
                      ? theme.colors.backgroundColor
                      : theme.colors.mainText,
                  },
                ]}
              >
                {d.day}
              </Text>
              <Text
                style={[
                  styles.dateStripDateText,
                  {
                    color: isSelected
                      ? theme.colors.backgroundColor
                      : theme.colors.secondaryText,
                  },
                ]}
              >
                {d.name.substring(0, 3)}
              </Text>
              {hasData &&
                (renderEventMarkers ? (
                  renderEventMarkers(d.fullDate, dayEvents)
                ) : (
                  <View
                    style={[
                      styles.weekHeaderEventDot,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.backgroundColor
                          : theme.colors.mainText,
                      },
                    ]}
                  />
                ))}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
