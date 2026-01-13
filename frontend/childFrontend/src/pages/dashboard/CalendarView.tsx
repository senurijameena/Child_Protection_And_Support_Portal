import React, { useState } from 'react';

interface CalendarViewProps {
    events: any[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Create array for the calendar grid
    const calendarDays = [];
    // Padding for days from previous month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }
    // Days of the actual month
    for (let d = 1; d <= totalDays; d++) {
        calendarDays.push(d);
    }

    const getEventsForDay = (day: number | null) => {
        if (!day) return [];
        return events.filter(e => {
            const eventDate = new Date(e.scheduledDate || e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === month &&
                eventDate.getFullYear() === year;
        });
    };

    return (
        <div className="calendar-container p-4 bg-white rounded-3 shadow-sm border">
            <div className="calendar-header d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-primary m-0">
                    {monthNames[month]} {year}
                </h3>
                <div className="calendar-nav">
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={prevMonth}>
                        <i className="bi bi-chevron-left"></i> Prev
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={nextMonth}>
                        Next <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                <div className="calendar-day-label">Sun</div>
                <div className="calendar-day-label">Mon</div>
                <div className="calendar-day-label">Tue</div>
                <div className="calendar-day-label">Wed</div>
                <div className="calendar-day-label">Thu</div>
                <div className="calendar-day-label">Fri</div>
                <div className="calendar-day-label">Sat</div>

                {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = day === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear();

                    return (
                        <div key={index} className={`calendar-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
                            {day && (
                                <>
                                    <span className="day-number">{day}</span>
                                    <div className="event-dots">
                                        {dayEvents.map((e, idx) => (
                                            <div
                                                key={idx}
                                                className={`event-dot ${e.priority === 'HIGH' || e.priority === 'URGENT' ? 'urgent' : 'normal'}`}
                                                title={`${e.type}: ${e.requestId || 'Follow-up'}`}
                                            ></div>
                                        ))}
                                    </div>
                                    {dayEvents.length > 0 && (
                                        <div className="event-list-popover">
                                            {dayEvents.slice(0, 2).map((e, idx) => (
                                                <div key={idx} className="event-mini-tag">
                                                    {e.type.split(' ')[0]}
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && <div className="event-more">+{dayEvents.length - 2} more</div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    background-color: #e9ecef;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .calendar-day-label {
                    background-color: #f8f9fa;
                    padding: 10px;
                    text-align: center;
                    font-weight: bold;
                    color: #495057;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                }
                .calendar-cell {
                    background-color: #fff;
                    min-height: 100px;
                    padding: 8px;
                    position: relative;
                    transition: all 0.2s ease;
                }
                .calendar-cell:not(.empty):hover {
                    background-color: #f1f3f5;
                }
                .calendar-cell.today {
                    background-color: #fff4e6;
                }
                .calendar-cell.today .day-number {
                    background-color: #fd7e14;
                    color: white;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .day-number {
                    font-size: 0.9rem;
                    color: #495057;
                    font-weight: 500;
                }
                .event-dots {
                    display: flex;
                    gap: 2px;
                    margin-top: 4px;
                }
                .event-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .event-dot.normal { background-color: #0d6efd; }
                .event-dot.urgent { background-color: #dc3545; }
                
                .event-list-popover {
                    margin-top: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .event-mini-tag {
                    font-size: 0.7rem;
                    padding: 2px 4px;
                    background-color: #e7f5ff;
                    color: #1971c2;
                    border-radius: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .event-more {
                    font-size: 0.65rem;
                    color: #adb5bd;
                    text-align: center;
                }
                .empty {
                  background-color: #f8f9fa;
                }
            `}</style>
        </div>
    );
};

export default CalendarView;
