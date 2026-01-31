export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  duration: number;
  status?: string;
  [key: string]: any;
}

export interface CalendarTheme {
  colors: {
    backgroundColor?: string;
    cardBackground?: string;
    mainText?: string;
    secondaryText?: string;
    borderColor?: string;
    primary?: string;
    timeLabel?: string;
    gridLine?: string;
    activeTabHtmlColor?: string;
    inactiveTabHtmlColor?: string;
    todayHighlight?: string;
    switcherBackground?: string;
    stripBackground?: string;
    activeTextColor?: string;
    [key: string]: any;
  };
  fonts: {
    regular?: string;
    bold?: string;
    medium?: string;
    semiBold?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CalendarLabels {
  headerTitle: string;
  scheduled: string;
  completed: string;
  inProgress?: string;
}

export interface LegendItem {
  label: string;
  color: string;
}

export interface CalendarStyles {
  container?: any;
  headerContainer?: any;
  eventCard?: any;
  viewSwitcherContainer?: any;
  viewSwitcher?: any;
  viewTab?: any;
  activeViewTab?: any;
  viewTabText?: any;
  activeViewTabText?: any;
  [key: string]: any;
}

export interface CustomCalendarProps {
  events?: CalendarEvent[];
  initialDate?: Date;
  viewMode?: 'day' | 'week' | 'month';
  theme?: Partial<CalendarTheme>;
  styles?: CalendarStyles;
  labels?: Partial<CalendarLabels>;
  legendItems?: LegendItem[]; // For flexible statuses
  getEventContainerStyle?: (event: CalendarEvent) => any;
  renderEventCard?: (
    event: CalendarEvent,
    viewMode: 'day' | 'week' | 'month',
    isSelected: boolean,
    toggleSelection: () => void
  ) => React.ReactNode;
  renderHeaderRight?: () => React.ReactNode;
  renderEventMarkers?: (date: Date, events: CalendarEvent[]) => React.ReactNode;
  onEventPress?: (event: CalendarEvent) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'day' | 'week' | 'month') => void;

  timeSlots?: string[];
  startHour?: number;
  headerLayout?: 'row' | 'column';
  legendPosition?: 'left' | 'right';

  // Custom Renderers for specialized parts
  renderTimeLabel?: (time: string) => React.ReactNode;
}
