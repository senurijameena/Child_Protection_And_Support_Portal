import React, { useState, useMemo } from 'react';
import './CalendarView.css';

interface CalendarProps {
    events: any[]; // Using any for simplicity as it matches FollowUp interface effectively
}

const CalendarView: React.FC<CalendarProps> = ({ events }) => {
    // View mode: 'week' or 'month'
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

    // Start date of current view (default to start of current week - Monday for week view, or current day for month tracking)
    const [currentDate, setCurrentDate] = useState(new Date());

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);

    // Generate dates for the week
    const weekDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [startOfWeek]);

    const monthDates = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); // Backtrack to Monday

        const endDate = new Date(lastDayOfMonth);
        if (endDate.getDay() !== 0) {
            endDate.setDate(endDate.getDate() + (7 - endDate.getDay())); // Forward to Sunday
        }

        const dates = [];
        const d = new Date(startDate);
        while (d <= endDate) {
            dates.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return dates;
    }, [currentDate]);

    const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    // Time slots (e.g. 9 AM to 5 PM)
    const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // Hours

    const getEventsForCell = (date: Date, hour?: number) => {
        return events.filter(e => {
            const eDate = new Date(e.scheduledDate);
            const matchesDate = eDate.getDate() === date.getDate() &&
                eDate.getMonth() === date.getMonth() &&
                eDate.getFullYear() === date.getFullYear();

            if (hour !== undefined) {
                return matchesDate && eDate.getHours() === hour;
            }
            return matchesDate;
        });
    };

    const formatDateRange = () => {
        if (viewMode === 'week') {
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    };

    const renderEvent = (event: any) => {
        let priorityClass = 'event-Medium'; // default
        if (event.status === 'COMPLETED') priorityClass = 'event-Completed';
        else if (event.priority === 'HIGH' || event.priority === 'URGENT') priorityClass = 'event-Urgent';
        else if (event.priority === 'LOW') priorityClass = 'event-Low';

        return (
            <div key={event.id} className={`calendar-event ${priorityClass}`} title={`${event.type} for ${event.childName}`}>
                <strong>{event.timeString}</strong> {event.childName} <small>({event.type})</small>
            </div>
        );
    };

    return (
        <div className="calendar-view-container">
            <div className="calendar-utils-header">
                <div className="current-week-label">
                    {viewMode === 'week' ? '📅 WEEKLY CALENDAR' : '🗓️ MONTHLY CALENDAR'} - {formatDateRange()}
                </div>
                <div className="calendar-nav-buttons">
                    <button className="cal-nav-btn" onClick={() => navigate('prev')}>◀ Previous</button>
                    <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button className="cal-nav-btn" onClick={() => navigate('next')}>Next ▶</button>
                    <div className="view-toggle ml-3" style={{ marginLeft: '1rem', display: 'flex', gap: '0.25rem' }}>
                        <button
                            className={`cal-nav-btn ${viewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setViewMode('week')}
                        >Week</button>
                        <button
                            className={`cal-nav-btn ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >Month</button>
                    </div>
                </div>
            </div>

            {viewMode === 'week' ? (
                <div className="calendar-grid">
                    {/* Header Row */}
                    <div className="calendar-header-cell time-header"></div> {/* Empty corner */}
                    {weekDates.map((date, idx) => (
                        <div key={idx} className="calendar-header-cell">
                            <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className={`day-date ${isToday(date) ? 'today' : ''}`}>
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    ))}

                    {/* Time Slots */}
                    {timeSlots.map(hour => (
                        <React.Fragment key={hour}>
                            <div className="time-slot">
                                {hour}:00
                            </div>
                            {weekDates.map((date, dayIdx) => {
                                const cellEvents = getEventsForCell(date, hour);

                                return (
                                    <div key={dayIdx} className="calendar-cell">
                                        {cellEvents.map(renderEvent)}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="month-grid">
                    {/* Weekday Headers */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="calendar-header-cell">{day}</div>
                    ))}

                    {/* Month Cells */}
                    {monthDates.map((date, idx) => {
                        const cellEvents = getEventsForCell(date);
                        return (
                            <div key={idx} className={`month-cell ${!isCurrentMonth(date) ? 'different-month' : ''}`}>
                                <div className="month-cell-header">
                                    <span className={`day-date ${isToday(date) ? 'today' : ''}`} style={{ fontSize: '1rem' }}>
                                        {date.getDate()}
                                    </span>
                                </div>
                                <div className="month-events-list">
                                    {cellEvents.slice(0, 3).map(renderEvent)}
                                    {cellEvents.length > 3 && (
                                        <div className="text-muted small text-center">+{cellEvents.length - 3} more</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="legend-bar">
                <span className="legend-item"><span className="legend-dot" style={{ background: '#dc3545' }}></span> Urgent</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: '#ffc107' }}></span> Medium</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: '#198754' }}></span> Low</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: '#6c757d' }}></span> Completed</span>
            </div>
        </div>
    );
};

export default CalendarView;
