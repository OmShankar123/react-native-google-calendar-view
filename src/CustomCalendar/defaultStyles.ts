import { StyleSheet } from 'react-native';
import { ms } from './utils';
import { CalendarTheme } from './types';

export const createDefaultCalendarStyles = (
  theme: Partial<CalendarTheme> = {}
) => {
  const colors = {
    backgroundColor: theme.colors?.backgroundColor || '#fff',
    cardBackground: theme.colors?.cardBackground || '#fff',
    switcherBackground: theme.colors?.switcherBackground || '#f0f0f0',
    stripBackground: theme.colors?.stripBackground || '#f0f0f0',
    mainText: theme.colors?.mainText || '#000',
    secondaryText: theme.colors?.secondaryText || '#666',
    borderColor: theme.colors?.borderColor || '#eee',
    primary: theme.colors?.primary || '#000',
    completedBackground: '#e0f7fa',
    completedBorder: '#00acc1',
  };

  const fonts = {
    regular: theme.fonts?.regular,
    bold: theme.fonts?.bold,
    medium: theme.fonts?.medium,
    semiBold: theme.fonts?.semiBold,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerContainer: {
      marginBottom: ms(20),
      paddingHorizontal: ms(20),
    },
    viewSwitcherContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: ms(20),
    },
    viewSwitcher: {
      flexDirection: 'row',
      backgroundColor: colors.switcherBackground,
      borderRadius: ms(8),
      padding: ms(4),
    },
    viewTab: {
      paddingVertical: ms(8),
      paddingHorizontal: ms(12),
      borderRadius: ms(6),
    },
    activeViewTab: {
      backgroundColor: colors.mainText,
    },
    viewTabText: {
      fontSize: ms(14),
      color: colors.secondaryText,
      fontFamily: fonts.medium || fonts.regular,
    },
    activeViewTabText: {
      color: colors.backgroundColor,
      fontWeight: 'bold',
      fontFamily: fonts.bold || fonts.medium,
    },

    legendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 0,
      paddingHorizontal: ms(20),
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: ms(20),
    },
    legendDot: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      marginRight: ms(8),
    },
    legendText: {
      fontSize: ms(12),
      color: colors.mainText,
      fontFamily: fonts.regular,
    },

    dateNavigator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: ms(5),
    },
    dateNavTitle: {
      color: colors.mainText,
      marginHorizontal: ms(10),
      fontSize: ms(16),
      fontWeight: 'bold',
      minWidth: ms(100),
      textAlign: 'center',
      fontFamily: fonts.bold,
    },

    gridContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      paddingLeft: ms(50),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      paddingBottom: ms(10),
    },
    dayColumnHeader: {
      flex: 1,
      alignItems: 'center',
    },
    dayNumber: {
      fontSize: ms(18),
      color: colors.mainText,
      fontWeight: 'bold',
      marginBottom: ms(4),
      fontFamily: fonts.bold,
    },
    dayName: {
      fontSize: ms(12),
      color: colors.secondaryText,
      fontFamily: fonts.regular,
    },
    timelineGridRow: {
      flexDirection: 'row',
    },
    timelineTimeCol: {
      width: ms(50),
    },
    timelineTimeSlot: {
      height: ms(60),
      justifyContent: 'flex-end', // Align text to bottom
      alignItems: 'center',
      paddingTop: 0,
    },
    timeLabel: {
      fontSize: ms(12),
      color: colors.secondaryText,
      fontFamily: fonts.regular,
      transform: [{ translateY: ms(8) }], // Shift down to center on the line
    },
    timelineGridLineRow: {
      flexDirection: 'row',
      height: ms(60),
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    timelineGridCol: {
      borderLeftWidth: 1,
      borderLeftColor: colors.borderColor,
      height: '100%',
    },

    eventCard: {
      position: 'absolute',
      borderRadius: ms(8),
      padding: ms(8),
      borderLeftWidth: 3,
      justifyContent: 'flex-start',
      zIndex: 10,
      overflow: 'hidden',
    },
    eventCardScheduled: {
      backgroundColor: colors.cardBackground,
      borderLeftColor: colors.borderColor,
    },
    eventCardCompleted: {
      backgroundColor: colors.completedBackground,
      borderColor: colors.completedBorder,
      borderWidth: 1,
      borderLeftColor: colors.completedBorder,
      borderLeftWidth: ms(3),
    },
    eventTitle: {
      fontSize: ms(11),
      color: colors.mainText,
      fontWeight: 'bold',
      fontFamily: fonts.bold || fonts.semiBold,
    },

    scrollContentContainer: {
      paddingBottom: ms(100),
      flexGrow: 1,
    },
    eventCardContent: {
      flex: 1,
      padding: ms(2),
    },
    screenContent: {
      flex: 1,
    },

    weekHeaderRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    weekHeaderTimeSpacer: {
      width: ms(50),
      height: ms(60),
    },
    weekHeaderContent: {
      flexDirection: 'row',
      height: ms(60),
    },
    weekHeaderPressable: {
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 1,
      borderLeftColor: 'transparent',
    },
    weekHeaderEventDot: {
      width: ms(4),
      height: ms(4),
      borderRadius: ms(2),
      backgroundColor: colors.mainText,
      marginTop: ms(2),
    },

    monthViewContainer: {
      paddingBottom: ms(20),
    },
    monthHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: ms(10),
    },
    monthHeaderText: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: colors.secondaryText,
      fontSize: ms(12),
      fontFamily: fonts.medium || fonts.bold,
    },
    monthGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    monthPressable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    monthDateCircle: {
      width: ms(32),
      height: ms(32),
      borderRadius: ms(10),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    monthDateText: {
      fontWeight: 'bold',
      fontSize: ms(14),
      fontFamily: fonts.bold,
    },
    monthEventDot: {
      width: ms(4),
      height: ms(4),
      borderRadius: ms(2),
      marginTop: ms(2),
    },

    dateStripContainer: {
      height: ms(70),
    },
    dateStripContent: {
      paddingHorizontal: ms(10),
      paddingBottom: ms(2),
    },
    dateStripItem: {
      width: ms(50),
      height: ms(70),
      marginHorizontal: ms(4),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: ms(10),
    },
    dateStripItemActive: {
      backgroundColor: colors.mainText,
    },
    dateStripItemInactive: {
      backgroundColor: colors.stripBackground,
    },
    dateStripDayText: {
      fontSize: ms(14),
      fontWeight: 'bold',
      fontFamily: fonts.bold,
    },
    dateStripDateText: {
      fontSize: ms(12),
      marginTop: ms(4),
      fontFamily: fonts.regular,
    },

    noMarginTop: {
      marginTop: 0,
    },

    eventIdText: {
      fontSize: ms(10),
      color: colors.secondaryText,
      marginBottom: 0,
      fontFamily: fonts.regular,
    },
    eventRow: {
      flexDirection: 'row',
      marginTop: ms(2),
    },
    eventValue: {
      fontSize: ms(11),
      color: colors.mainText,
      fontWeight: 'bold',
      fontFamily: fonts.semiBold || fonts.bold,
    },
  });
};
