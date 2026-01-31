import React, { useMemo } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ms } from '../utils';
import { getMonthGridDays } from '../utils';
import { CalendarEvent } from '../types';

const { width } = Dimensions.get('window');

interface MonthViewProps {
  currentDisplayDate: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: CalendarEvent[];
  theme: any;
  styles: any;
  renderEventMarkers?: (date: Date, events: CalendarEvent[]) => React.ReactNode;
}

export const MonthView = React.memo(
  ({
    currentDisplayDate,
    selectedDate,
    setSelectedDate,
    events,
    theme,
    styles,
    renderEventMarkers,
  }: MonthViewProps) => {
    const weekHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const itemWidth = (width - ms(32)) / 7;

    const monthGridDays = useMemo(
      () =>
        getMonthGridDays(
          currentDisplayDate.getFullYear(),
          currentDisplayDate.getMonth()
        ),
      [currentDisplayDate]
    );

    return (
      <View style={styles.monthViewContainer}>
        <View
          style={[styles.monthHeaderContainer, { justifyContent: 'center' }]}
        >
          {weekHeaders.map((h) => (
            <Text
              key={h}
              style={[styles.monthHeaderText, { width: itemWidth }]}
            >
              {h}
            </Text>
          ))}
        </View>
        <View style={[styles.monthGridContainer, { justifyContent: 'center' }]}>
          {monthGridDays.map((d: any, i: number) => {
            // If not current month, render empty cell to maintain grid alignment
            if (!d.isCurrentMonth) {
              return (
                <View
                  key={i}
                  style={[
                    styles.monthGridCell,
                    { width: itemWidth, minHeight: ms(40) },
                  ]}
                />
              );
            }

            const isSameDate =
              d.fullDate.getDate() === selectedDate.getDate() &&
              d.fullDate.getMonth() === selectedDate.getMonth() &&
              d.fullDate.getFullYear() === selectedDate.getFullYear();

            const isSelected = isSameDate;

            const dayEvents = events.filter(
              (e) =>
                e.start.getDate() === d.fullDate.getDate() &&
                e.start.getMonth() === d.fullDate.getMonth() &&
                e.start.getFullYear() === d.fullDate.getFullYear()
            );
            const hasEvent = dayEvents && dayEvents.length > 0;
            return (
              <Animated.View
                key={i}
                entering={FadeIn}
                style={[
                  styles.monthGridCell,
                  { width: itemWidth, minHeight: ms(40) },
                ]}
              >
                <Pressable
                  android_ripple={{ color: 'transparent' }}
                  style={styles.monthPressable}
                  onPress={() => {
                    setSelectedDate(d.fullDate);
                  }}
                >
                  <View
                    style={[
                      styles.monthDateCircle,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.mainText
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthDateText,
                        {
                          color: isSelected
                            ? theme.colors.backgroundColor
                            : d.isCurrentMonth
                            ? theme.colors.mainText
                            : theme.colors.secondaryText || '#ccc',
                        },
                      ]}
                    >
                      {d.day}
                    </Text>
                  </View>
                  {/* Event Markers */}
                  {hasEvent &&
                    (renderEventMarkers ? (
                      renderEventMarkers(d.fullDate, dayEvents)
                    ) : (
                      <View
                        style={[
                          styles.monthEventDot,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.backgroundColor
                              : theme.colors.mainText,
                          },
                        ]}
                      />
                    ))}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  }
);
