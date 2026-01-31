import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomCalendar } from '../index';

describe('CustomCalendar', () => {
  it('should render without crashing', () => {
    const { getByText } = render(<CustomCalendar events={[]} />);
    expect(getByText('Day')).toBeTruthy();
    expect(getByText('Week')).toBeTruthy();
    expect(getByText('Month')).toBeTruthy();
  });

  it('should render with events', () => {
    const events = [
      {
        id: '1',
        title: 'Test Event',
        start: new Date(2024, 0, 15, 10, 0),
        duration: 1,
      },
    ];
    const { getByText } = render(<CustomCalendar events={events} />);
    expect(getByText('Day')).toBeTruthy();
  });

  it('should accept custom theme', () => {
    const theme = {
      colors: {
        backgroundColor: '#FFFFFF',
        mainText: '#000000',
      },
    };
    const { getByText } = render(<CustomCalendar events={[]} theme={theme} />);
    expect(getByText('Day')).toBeTruthy();
  });

  it('should accept legend items', () => {
    const legendItems = [
      { label: 'Meeting', color: '#3B82F6' },
      { label: 'Work', color: '#10B981' },
    ];
    const { getByText } = render(
      <CustomCalendar events={[]} legendItems={legendItems} />
    );
    expect(getByText('Meeting')).toBeTruthy();
    expect(getByText('Work')).toBeTruthy();
  });
});
