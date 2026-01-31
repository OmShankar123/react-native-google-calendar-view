import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedScrollHandler,
  scrollTo,
  runOnUI,
  LinearTransition,
} from 'react-native-reanimated';
import { ms, processOverlappingEvents, getEventsForDay } from '../utils';
import { CalendarEvent, CustomCalendarProps } from '../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { width } = Dimensions.get('window');
const HOUR_HEIGHT = ms(60);
const TIME_COL_WIDTH = ms(50);

interface WeekViewProps {
  days: { day: number | null; fullDate: Date; name: string }[];
  events: CalendarEvent[];
  theme: any;
  styles: any;
  selectedDate: Date;
  renderEventCard?: CustomCalendarProps['renderEventCard'];
  onDatePress?: (date: Date) => void;
  timeSlots?: string[];
  startHour?: number;
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
];

export const WeekView: React.FC<WeekViewProps> = ({
  days,
  events,
  theme,
  styles,
  selectedDate,
  renderEventCard,
  onDatePress,
  timeSlots = defaultTimeSlots,
  startHour = 1,
  getEventContainerStyle,
  renderTimeLabel,
}) => {
  const headerScrollRef = useAnimatedRef<any>();
  const gridScrollRef = useAnimatedRef<any>();
  const verticalScrollRef = useRef<any>(null);
  const isHeaderScrolling = useSharedValue(false);
  const isGridScrolling = useSharedValue(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Sync Scrolling
  const scrollHandlerHeader = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isHeaderScrolling.value) {
        scrollTo(gridScrollRef, event.contentOffset.x, 0, false);
      }
    },
    onBeginDrag: () => {
      isHeaderScrolling.value = true;
      isGridScrolling.value = false;
    },
  });

  const scrollHandlerGrid = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isGridScrolling.value) {
        scrollTo(headerScrollRef, event.contentOffset.x, 0, false);
      }
    },
    onBeginDrag: () => {
      isGridScrolling.value = true;
      isHeaderScrolling.value = false;
    },
  });

  const AVAIL_WIDTH = width - TIME_COL_WIDTH - ms(10);
  const COL_WIDTH = AVAIL_WIDTH / 3.5;

  useEffect(() => {
    let offsetX = 0;
    const dayIndex = days.findIndex(
      (d) =>
        d.fullDate.getDate() === selectedDate.getDate() &&
        d.fullDate.getMonth() === selectedDate.getMonth()
    );
    if (dayIndex !== -1) {
      offsetX = dayIndex * COL_WIDTH;
    }

    let offsetY = 0;
    if (events.length > 0 && days.length > 0) {
      const weeklyEvents = events.filter((e) =>
        days.some(
          (d) =>
            d.fullDate.getDate() === e.start.getDate() &&
            d.fullDate.getMonth() === e.start.getMonth()
        )
      );

      if (weeklyEvents.length > 0) {
        const earliestMinutes = weeklyEvents.reduce((min, e) => {
          const start = e.start.getHours() * 60 + e.start.getMinutes();
          return start < min ? start : min;
        }, 24 * 60);
        const earliestHour = earliestMinutes / 60;
        offsetY = Math.max(
          0,
          (earliestHour - startHour) * HOUR_HEIGHT - ms(20)
        );
      }
    }

    // Use setTimeout to ensure ScrollView is measured/layout before scrolling
    setTimeout(() => {
      runOnUI(() => {
        scrollTo(headerScrollRef, offsetX, 0, true);
        scrollTo(gridScrollRef, offsetX, 0, true);
      })();
    }, 100);

    setTimeout(() => {
      verticalScrollRef.current?.scrollTo({ y: offsetY, animated: true });
    }, 100);
  }, [events, days, selectedDate]);

  return (
    <View style={styles.screenContent || { flex: 1 }}>
      <View style={styles.weekHeaderRow}>
        <View style={styles.weekHeaderTimeSpacer} />

        <Animated.ScrollView
          horizontal
          ref={headerScrollRef}
          onScroll={scrollHandlerHeader}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: ms(20) }}
        >
          <View style={styles.weekHeaderContent}>
            {days.map((d, index) => {
              const hasEvent = events.some(
                (e) =>
                  e.start.getDate() === d.fullDate.getDate() &&
                  e.start.getMonth() === d.fullDate.getMonth() &&
                  e.start.getFullYear() === d.fullDate.getFullYear()
              );
              return (
                <Pressable
                  key={index}
                  style={[styles.weekHeaderPressable, { width: COL_WIDTH }]}
                  onPress={() => {
                    runOnUI(() => {
                      scrollTo(headerScrollRef, index * COL_WIDTH, 0, true);
                      scrollTo(gridScrollRef, index * COL_WIDTH, 0, true);
                    })();
                    if (onDatePress) onDatePress(d.fullDate);
                  }}
                >
                  <Text style={styles.dayNumber}>{d.day}</Text>
                  <Text style={styles.dayName}>{d.name.substring(0, 3)}</Text>
                  {hasEvent && <View style={styles.weekHeaderEventDot} />}
                </Pressable>
              );
            })}
          </View>
        </Animated.ScrollView>
      </View>

      <ScrollView
        ref={verticalScrollRef}
        style={styles.gridContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
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

          <Animated.ScrollView
            horizontal
            ref={gridScrollRef}
            onScroll={scrollHandlerGrid}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: ms(20) }}
          >
            <View style={{ width: days.length * COL_WIDTH }}>
              {timeSlots.map((_, index) => (
                <View key={index} style={styles.timelineGridLineRow}>
                  {days.map((_, colIndex) => (
                    <View
                      key={colIndex}
                      style={[styles.timelineGridCol, { width: COL_WIDTH }]}
                    />
                  ))}
                </View>
              ))}

              {(() => {
                // 1. Collect all events for all days in the week view
                const allWeekEvents: any[] = [];
                days.forEach((d, dayIdx) => {
                  const dayEvents = getEventsForDay(events, d.fullDate);
                  const processed = processOverlappingEvents(dayEvents);
                  processed.forEach((e) => {
                    allWeekEvents.push({ ...e, dayIdx });
                  });
                });

                // 2. Sort globally so the selected event is RENDERED LAST (on top)
                return allWeekEvents
                  .sort((a, b) => {
                    if (a.id === selectedEventId) return 1;
                    if (b.id === selectedEventId) return -1;
                    return 0;
                  })
                  .map((event) => {
                    const eventStartHour = event.start.getHours();
                    const startMinutes = event.start.getMinutes();
                    const topOffset = Math.round(
                      (eventStartHour + startMinutes / 60 - startHour) *
                        HOUR_HEIGHT
                    );
                    const height = Math.ceil(event.duration * HOUR_HEIGHT);
                    const isSelected = selectedEventId === event.id;

                    const { columnIndex, totalColumns, dayIdx } = event;
                    const eventWidth = (COL_WIDTH - ms(4)) / totalColumns;
                    const leftOffset =
                      COL_WIDTH * dayIdx + ms(2) + columnIndex * eventWidth;

                    const toggleSelection = () => {
                      setSelectedEventId(isSelected ? null : event.id);
                    };

                    // Extract style logic to help TypeScript type inference
                    const baseStyle: any = {
                      position: 'absolute' as const,
                      top: topOffset,
                      left: leftOffset,
                      width: isSelected ? COL_WIDTH * 0.9 : eventWidth,
                      height: isSelected ? undefined : height,
                      minHeight: height,
                      zIndex: isSelected ? 9999 : 20,
                      elevation: isSelected ? 10 : 1,
                      overflow: (isSelected ? 'visible' : 'hidden') as
                        | 'visible'
                        | 'hidden',
                    };

                    const customContainerStyle =
                      getEventContainerStyle?.(event);

                    const statusStyle =
                      !getEventContainerStyle && !renderEventCard
                        ? event.status?.includes('completed')
                          ? styles.eventCardCompleted
                          : styles.eventCardScheduled
                        : undefined;

                    const combinedStyles = [
                      baseStyle,
                      styles.eventCard,
                      customContainerStyle,
                      statusStyle,
                    ].filter(Boolean);

                    return (
                      <AnimatedPressable
                        key={event.id}
                        layout={LinearTransition.mass(0.5)
                          .damping(12)
                          .stiffness(120)}
                        style={combinedStyles as any}
                        onPress={toggleSelection}
                      >
                        <View style={styles.eventCardContent}>
                          {(() => {
                            const customRender = renderEventCard?.(
                              event,
                              'week',
                              isSelected,
                              toggleSelection
                            );

                            if (
                              customRender !== undefined &&
                              customRender !== null
                            ) {
                              return customRender;
                            }

                            return (
                              <Text style={styles.eventTitle}>
                                {event.title || event.id}
                              </Text>
                            );
                          })()}
                        </View>
                      </AnimatedPressable>
                    );
                  });
              })()}
            </View>
          </Animated.ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};
