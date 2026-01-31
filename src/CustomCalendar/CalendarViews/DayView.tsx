import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { ms, processOverlappingEvents, getEventsForDay } from '../utils';
import { CalendarEvent } from '../types';

const HOUR_HEIGHT = ms(60);
interface DayViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  styles: any;
  theme: any;
  renderEventCard?: (
    event: CalendarEvent,
    viewMode: 'day' | 'week' | 'month',
    isSelected: boolean,
    toggleSelection: () => void
  ) => React.ReactNode;
  onEventPress?: (event: CalendarEvent) => void;
  daySelectedEventId: string | null;
  setDaySelectedEventId: (id: string | null) => void;
  timeSlots?: string[];

  startHour?: number;
  formatDateDDMMYYYY?: (date: Date) => string;
  getEventContainerStyle?: (event: CalendarEvent) => any;
  renderTimeLabel?: (time: string) => React.ReactNode;
}

const defaultTimeSlots = [
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
  '12 AM',
];

export const DayView: React.FC<DayViewProps> = ({
  events,
  selectedDate,
  styles,
  renderEventCard,
  onEventPress,
  daySelectedEventId,
  setDaySelectedEventId,
  timeSlots = defaultTimeSlots,
  startHour = 1,
  getEventContainerStyle,
  renderTimeLabel,
}) => {
  const dayEvents = useMemo(
    () => getEventsForDay(events, selectedDate),
    [events, selectedDate]
  );

  const processedEvents = useMemo(
    () => processOverlappingEvents(dayEvents),
    [dayEvents]
  );

  const maxTotalColumns = useMemo(
    () => processedEvents.reduce((max, e) => Math.max(max, e.totalColumns), 1),
    [processedEvents]
  );

  const { width: screenWidth } = Dimensions.get('window');
  const TIME_COL_WIDTH = ms(50);
  const AVAIL_WIDTH = screenWidth - TIME_COL_WIDTH;
  const COLUMN_PIXEL_WIDTH = AVAIL_WIDTH / 3;
  const CONTENT_WIDTH = Math.max(
    AVAIL_WIDTH,
    maxTotalColumns * COLUMN_PIXEL_WIDTH
  );

  return (
    <View style={styles.timelineGridRow}>
      <View style={styles.timelineTimeCol}>
        {timeSlots.map((time, index) => (
          <View key={index} style={styles.timelineTimeSlot}>
            {renderTimeLabel ? (
              renderTimeLabel(time)
            ) : (
              <Text style={styles.timeLabel}>{time}</Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: CONTENT_WIDTH + ms(20),
          paddingRight: ms(20),
        }}
      >
        <View style={{ width: '100%', height: '100%' }}>
          {timeSlots.map((_, index) => (
            <View key={index} style={styles.timelineGridLineRow}>
              <View style={[styles.timelineGridCol, { width: '100%' }]} />
            </View>
          ))}

          {[...processedEvents]
            .sort((a, b) => {
              if (a.id === daySelectedEventId) return 1;
              if (b.id === daySelectedEventId) return -1;
              return 0;
            })
            .map((event) => {
              const eventStartHour = event.start.getHours();
              const startMinutes = event.start.getMinutes();
              const topOffset = Math.round(
                (eventStartHour + startMinutes / 60 - startHour) * HOUR_HEIGHT +
                  HOUR_HEIGHT
              );
              const height = Math.ceil(event.duration * HOUR_HEIGHT);
              const isSelected = daySelectedEventId === event.id;

              const { columnIndex, totalColumns } = event;
              const columnWidth = 100 / totalColumns;
              const leftOffset = columnIndex * columnWidth;

              const toggleSelection = () => {
                const newId = isSelected ? null : event.id;
                setDaySelectedEventId(newId);
                if (onEventPress && newId) onEventPress(event);
              };

              const layoutAnimation: any = LinearTransition.mass(0.5)
                .damping(12)
                .stiffness(120);

              return (
                <Animated.View
                  key={event.id}
                  layout={layoutAnimation}
                  style={
                    [
                      {
                        position: 'absolute',
                        top: topOffset,
                        height: isSelected ? undefined : height,
                        left: `${leftOffset}%`,
                        width: isSelected
                          ? maxTotalColumns > 3
                            ? ms(300)
                            : '90%'
                          : `${columnWidth}%`,
                        minHeight: height,
                        zIndex: isSelected ? 9999 : 20,
                        elevation: isSelected ? 10 : 1,
                        overflow: isSelected ? 'visible' : 'hidden',
                        paddingHorizontal: ms(2),
                      },
                      styles.eventCard,
                      getEventContainerStyle?.(event),
                      !getEventContainerStyle &&
                        !renderEventCard &&
                        (event.status?.includes('completed')
                          ? styles.eventCardCompleted
                          : styles.eventCardScheduled),
                    ] as any
                  }
                >
                  <Pressable
                    onPress={toggleSelection}
                    style={styles.eventCardContent}
                  >
                    {(() => {
                      const customRender = renderEventCard?.(
                        event,
                        'day',
                        isSelected,
                        toggleSelection
                      );

                      if (customRender !== undefined && customRender !== null) {
                        return customRender;
                      }

                      return (
                        <View>
                          <Text style={styles.eventIdText}>#{event.id}</Text>
                          <View style={styles.eventRow}>
                            <Text style={styles.eventValue}>
                              {event.start.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                        </View>
                      );
                    })()}
                  </Pressable>
                </Animated.View>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
};
