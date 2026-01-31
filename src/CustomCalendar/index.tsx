import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { ms } from './utils';
import { CustomCalendarProps } from './types';
import { MonthView } from './CalendarViews/MonthView';
import { WeekView } from './CalendarViews/WeekView';
import { DayView } from './CalendarViews/DayView';
import { DateStrip } from './DateStrip';
import { formatDate } from './utils';
import { createDefaultCalendarStyles } from './defaultStyles';

const HOUR_HEIGHT = ms(60);

const DefaultEventCard: React.FC<{
  event: any;
  viewMode: 'day' | 'week' | 'month';
  styles: any;
  theme: any;
  isSelected?: boolean;
}> = ({ event, viewMode, styles, theme, isSelected }) => {
  const formatDuration = (duration: number) => {
    if (duration < 1) {
      return `${Math.round(duration * 60)}min`;
    }
    return `${duration}h`;
  };

  return (
    <View style={styles.eventCardContent}>
      <Text
        style={styles.eventTitle}
        numberOfLines={isSelected ? undefined : 1}
      >
        {event.title || 'Untitled Event'}
      </Text>
      {event.duration && (
        <Text style={styles.eventIdText}>
          Duration: {formatDuration(event.duration)}
        </Text>
      )}
      {event.status && (
        <Text style={styles.eventIdText}>Status: {event.status}</Text>
      )}
    </View>
  );
};

export * from './types';

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  events = [],
  initialDate,
  viewMode: propViewMode,
  onViewChange,
  theme,
  styles: propStyles = {},
  labels = {},
  renderEventCard,
  renderEventMarkers,
  onEventPress,
  onDateChange,
  legendItems,
  getEventContainerStyle,
  timeSlots,
  startHour = 1,
  headerLayout = 'column',
  legendPosition = 'right',
}) => {
  const styles = useMemo(
    () => ({ ...createDefaultCalendarStyles(theme), ...propStyles }),
    [theme, propStyles]
  );

  const [internalViewMode, setInternalViewMode] = useState<
    'day' | 'week' | 'month'
  >('day');
  const viewMode = propViewMode || internalViewMode;

  const [currentDisplayDate, setCurrentDisplayDate] = useState(
    initialDate || new Date()
  );
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  const [daySelectedEventId, setDaySelectedEventId] = useState<string | null>(
    null
  );
  const [monthViewHeight, setMonthViewHeight] = useState(0);
  const [isManualDateSelect, setIsManualDateSelect] = useState(false);

  const dayScrollRef = useRef<any>(null);
  const monthScrollRef = useRef<any>(null);

  const lightenColor = (hex: string, amount: number = 0.85) => {
    const cleanHex = hex.replace('#', '').substring(0, 6);

    // Parse hex color
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
    if (!result) return '#f0f0f0';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);

    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const autoGetEventContainerStyle = useCallback(
    (event: any) => {
      if (getEventContainerStyle) {
        return getEventContainerStyle(event);
      }

      // 1. Check for direct event color
      if (event.color) {
        const bgColor = lightenColor(event.color, 0.85);
        return {
          backgroundColor: bgColor,
          borderLeftColor: event.color,
          borderLeftWidth: 3,
        };
      }

      // 2. Check legend if available
      if (legendItems && legendItems.length > 0) {
        const eventType = (event.type || event.status || '').toLowerCase();
        const matchedLegend = legendItems.find(
          (item) => item.label.toLowerCase() === eventType
        );

        if (matchedLegend) {
          const bgColor = lightenColor(matchedLegend.color, 0.85);
          return {
            backgroundColor: bgColor,
            borderLeftColor: matchedLegend.color,
            borderLeftWidth: 3,
          };
        }
      }

      // 3. Default fallback
      const defaultColor = theme?.colors?.primary || '#3498db';
      const defaultBgColor = lightenColor(defaultColor, 0.85);
      return {
        backgroundColor: defaultBgColor,
        borderLeftColor: defaultColor,
        borderLeftWidth: 3,
      };
    },
    [legendItems, getEventContainerStyle]
  );

  const autoRenderEventMarkers = useCallback(
    (_date: Date, events: any[]) => {
      if (!events || events.length === 0) return null;

      const limitedEvents = events.slice(0, 3);
      return (
        <View
          style={{ flexDirection: 'row', justifyContent: 'center', gap: 2 }}
        >
          {limitedEvents.map((e, index) => {
            let markerColor = theme?.colors?.mainText || '#000';

            if (e.color) {
              markerColor = e.color;
            } else if (legendItems && legendItems.length > 0) {
              const eventType = (e.type || e.status || '').toLowerCase();
              const matchedLegend = legendItems.find(
                (item) => item.label.toLowerCase() === eventType
              );
              if (matchedLegend) {
                markerColor = matchedLegend.color;
              }
            }

            return (
              <View
                key={index}
                style={{
                  width: ms(4),
                  height: ms(4),
                  borderRadius: ms(2),
                  backgroundColor: markerColor,
                }}
              />
            );
          })}
        </View>
      );
    },
    [legendItems, theme]
  );

  const effectiveRenderEventCard = useMemo(
    () =>
      renderEventCard ||
      ((
        event: any,
        viewMode: any,
        isSelected: boolean,
        toggleSelection: any
      ) => (
        <DefaultEventCard
          event={event}
          viewMode={viewMode}
          styles={styles}
          theme={theme}
          isSelected={isSelected}
        />
      )),
    [renderEventCard, styles, theme]
  );

  // Helper: Date Logic
  const handlePrev = useCallback(() => {
    setCurrentDisplayDate((d) => {
      const n = new Date(d);
      n.setMonth(d.getMonth() - 1);

      const newSelected = new Date(n);
      newSelected.setDate(1);
      setIsManualDateSelect(true);
      setSelectedDate(newSelected);
      if (onDateChange) onDateChange(newSelected);

      return n;
    });
  }, [onDateChange]);

  const handleNext = useCallback(() => {
    setCurrentDisplayDate((d) => {
      const n = new Date(d);
      n.setMonth(d.getMonth() + 1);

      const newSelected = new Date(n);
      newSelected.setDate(1);
      setIsManualDateSelect(true);
      setSelectedDate(newSelected);
      if (onDateChange) onDateChange(newSelected);

      return n;
    });
  }, [onDateChange]);

  const monthYearString = useMemo(
    () =>
      currentDisplayDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
    [currentDisplayDate]
  );

  const daysInMonth = useMemo(() => {
    const days = [];
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
      days.push(formatDate(new Date(year, month, i)));
    }
    return days;
  }, [currentDisplayDate]);

  // Auto-scroll DayView to first event
  useEffect(() => {
    if (viewMode === 'day' && dayScrollRef.current && events.length > 0) {
      const targetDate = selectedDate;
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = events.filter(
        (e) => e.start >= dayStart && e.start <= dayEnd
      );

      if (dayEvents.length > 0) {
        const earliestMinutes = Math.min(
          ...dayEvents.map(
            (e) => e.start.getHours() * 60 + e.start.getMinutes()
          )
        );
        const earliestHour = earliestMinutes / 60;
        const offsetY = (earliestHour - startHour) * HOUR_HEIGHT - ms(20);

        setTimeout(() => {
          dayScrollRef.current?.scrollTo({
            y: Math.max(0, offsetY),
            animated: true,
          });
        }, 100);
      }
    }
  }, [viewMode, selectedDate, events, startHour]);

  const handleViewChange = (mode: 'day' | 'week' | 'month') => {
    let newDate = selectedDate;

    if (mode === 'week') {
      // Find first event in current week
      const currentDay = selectedDate.getDay();
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - currentDay);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weekEvents = events
        .filter((e) => e.start >= startOfWeek && e.start <= endOfWeek)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      if (weekEvents.length > 0) {
        newDate = new Date(weekEvents[0].start);
      }
    }

    if (newDate.getTime() !== selectedDate.getTime()) {
      setSelectedDate(newDate);
      if (onDateChange) onDateChange(newDate);
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsManualDateSelect(false);
    if (onViewChange) onViewChange(mode);

    // If not controlled (propViewMode is undefined), update internal state
    if (!propViewMode) {
      setInternalViewMode(mode);
    }
  };

  useEffect(() => {
    if (viewMode === 'month' && isManualDateSelect) {
      const dayEvents = events.filter(
        (e) =>
          e.start.getDate() === selectedDate.getDate() &&
          e.start.getMonth() === selectedDate.getMonth() &&
          e.start.getFullYear() === selectedDate.getFullYear()
      );

      if (dayEvents.length > 0) {
        const earliestMinutes = dayEvents.reduce((min, e) => {
          const start = e.start.getHours() * 60 + e.start.getMinutes();
          return start < min ? start : min;
        }, 24 * 60);
        const earliestHour = earliestMinutes / 60;
        const offset = Math.max(
          0,
          (earliestHour - startHour) * HOUR_HEIGHT - ms(20)
        );

        if (monthViewHeight > 0) {
          setTimeout(() => {
            monthScrollRef.current?.scrollTo({
              y: monthViewHeight + offset,
              animated: true,
            });
            setIsManualDateSelect(false);
          }, 100);
        }
      }
    }
  }, [
    viewMode,
    selectedDate,
    events,
    monthViewHeight,
    isManualDateSelect,
    startHour,
  ]);

  // Pager Logic
  const [pagerWidth, setPagerWidth] = useState(Dimensions.get('window').width);
  const pagerRef = useRef<ScrollView>(null);

  const isPagingRef = useRef(false);

  useEffect(() => {
    if (viewMode === 'month' && pagerRef.current) {
      if (Platform.OS === 'android') {
        setTimeout(() => {
          pagerRef.current?.scrollTo({ x: pagerWidth, animated: false });
          isPagingRef.current = false;
        }, 50);
      } else {
        pagerRef.current.scrollTo({ x: pagerWidth, animated: false });
        isPagingRef.current = false;
      }
    }
  }, [currentDisplayDate, pagerWidth, viewMode]);

  const handleMomentumScrollEnd = (e: any) => {
    if (isPagingRef.current) return;

    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / pagerWidth);

    if (page === 0) {
      isPagingRef.current = true;
      handlePrev();
    } else if (page === 2) {
      isPagingRef.current = true;
      handleNext();
    }
  };

  return (
    <View
      style={[
        styles.container || {
          flex: 1,
          backgroundColor: theme?.colors?.backgroundColor,
        },
        { paddingHorizontal: 0 },
      ]}
    >
      <View style={styles.viewSwitcherContainer}>
        <View style={styles.viewSwitcher}>
          {['Day', 'Week', 'Month'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewTab,
                viewMode === mode.toLowerCase() && styles.activeViewTab,
              ]}
              onPress={() => handleViewChange(mode.toLowerCase() as any)}
            >
              <Text
                style={[
                  styles.viewTabText,
                  viewMode === mode.toLowerCase() && styles.activeViewTabText,
                ]}
              >
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.legendContainer,
          headerLayout === 'column'
            ? { flexDirection: 'column', alignItems: 'stretch', gap: ms(10) }
            : {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: ms(15),
              },
        ]}
      >
        {headerLayout === 'row' && legendPosition === 'left' && legendItems && (
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              flex: 1,
            }}
          >
            {legendItems.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.dateNavigator,
            { marginBottom: 0 },
            headerLayout === 'row' && {
              flex: 1,
              justifyContent:
                legendPosition === 'left' ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <TouchableOpacity onPress={handlePrev}>
            <View
              style={{
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderTopWidth: ms(6),
                borderRightWidth: ms(10),
                borderBottomWidth: ms(6),
                borderLeftWidth: 0,
                borderTopColor: 'transparent',
                borderRightColor: theme?.colors?.mainText,
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
              }}
            />
          </TouchableOpacity>
          <Text style={styles.dateNavTitle}>{monthYearString}</Text>
          <TouchableOpacity onPress={handleNext}>
            <View
              style={{
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderTopWidth: ms(6),
                borderRightWidth: 0,
                borderBottomWidth: ms(6),
                borderLeftWidth: ms(10),
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: theme?.colors?.mainText,
              }}
            />
          </TouchableOpacity>
        </View>

        {(headerLayout === 'column' || legendPosition === 'right') &&
          legendItems && (
            <View
              style={{
                flexDirection: headerLayout === 'row' ? 'column' : 'row',
                alignItems: headerLayout === 'row' ? 'flex-start' : 'center',
                alignSelf:
                  headerLayout === 'row' && legendPosition === 'right'
                    ? 'flex-end'
                    : undefined,
                flexWrap: headerLayout === 'column' ? 'wrap' : undefined,
                justifyContent:
                  headerLayout === 'column' ? 'center' : 'flex-start',
                flex: headerLayout === 'row' ? undefined : undefined,
              }}
            >
              {legendItems.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
      </View>

      {/* @ts-ignore - Reanimated type definitions issue */}
      <Animated.View
        key={viewMode}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={(styles.screenContent || { flex: 1 }) as any}
      >
        {viewMode === 'day' && (
          <>
            <DateStrip
              days={daysInMonth}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                if (onDateChange) onDateChange(d);
              }}
              events={events}
              currentDisplayDate={currentDisplayDate}
              theme={theme}
              styles={styles}
              renderEventMarkers={renderEventMarkers || autoRenderEventMarkers}
            />
            <ScrollView
              ref={dayScrollRef}
              style={[styles.gridContainer, styles.noMarginTop]}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <DayView
                events={events}
                selectedDate={selectedDate}
                theme={theme}
                styles={styles}
                renderEventCard={effectiveRenderEventCard}
                onEventPress={onEventPress}
                daySelectedEventId={daySelectedEventId}
                setDaySelectedEventId={setDaySelectedEventId}
                timeSlots={timeSlots}
                startHour={startHour}
                getEventContainerStyle={autoGetEventContainerStyle}
              />
            </ScrollView>
          </>
        )}

        {viewMode === 'week' && (
          <WeekView
            days={daysInMonth}
            events={events}
            theme={theme}
            styles={styles}
            selectedDate={selectedDate}
            renderEventCard={effectiveRenderEventCard}
            onDatePress={(d) => {
              setSelectedDate(d);
              if (onDateChange) onDateChange(d);
            }}
            timeSlots={timeSlots}
            startHour={startHour}
            getEventContainerStyle={autoGetEventContainerStyle}
          />
        )}

        {viewMode === 'month' && (
          <ScrollView
            ref={monthScrollRef}
            style={[styles.gridContainer, styles.noMarginTop]}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View
              onLayout={(event) => {
                setMonthViewHeight(event.nativeEvent.layout.height);
                setPagerWidth(event.nativeEvent.layout.width);
              }}
              style={{ width: '100%' }}
            >
              <ScrollView
                ref={pagerRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: pagerWidth, y: 0 }}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                style={{ width: '100%' }}
              >
                {[
                  new Date(
                    currentDisplayDate.getFullYear(),
                    currentDisplayDate.getMonth() - 1,
                    1
                  ),
                  currentDisplayDate,
                  new Date(
                    currentDisplayDate.getFullYear(),
                    currentDisplayDate.getMonth() + 1,
                    1
                  ),
                ].map((date, index) => (
                  <View key={index} style={{ width: pagerWidth }}>
                    <MonthView
                      currentDisplayDate={date}
                      selectedDate={selectedDate}
                      setSelectedDate={(d) => {
                        setIsManualDateSelect(true);
                        setSelectedDate(d);
                        if (onDateChange) onDateChange(d);
                      }}
                      events={events}
                      theme={theme}
                      styles={styles}
                      renderEventMarkers={
                        renderEventMarkers || autoRenderEventMarkers
                      }
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
            <DayView
              events={events}
              selectedDate={selectedDate}
              theme={theme}
              styles={styles}
              renderEventCard={effectiveRenderEventCard}
              onEventPress={onEventPress}
              daySelectedEventId={daySelectedEventId}
              setDaySelectedEventId={setDaySelectedEventId}
              timeSlots={timeSlots}
              startHour={startHour}
              getEventContainerStyle={autoGetEventContainerStyle}
            />
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
};
