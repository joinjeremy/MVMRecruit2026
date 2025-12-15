
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, ChevronRightIcon, VideoIcon, PhoneIcon, CheckCircleIcon, LinkIcon, ArrowPathIcon } from './icons';
import { EventType, ScheduledEvent } from '../types';
import EditEventModal from './EditEventModal';

const DiaryView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { events, candidates, isCalendarSynced } = state;
    const [viewMode, setViewMode] = useState<'2week' | 'week'>('2week');
    
    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);

    // currentDate tracks the reference date.
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEventForEdit, setSelectedEventForEdit] = useState<ScheduledEvent | null>(null);
    
    // Drag and Drop States
    const [isDragOverDate, setIsDragOverDate] = useState<string | null>(null);
    const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

    // Calculate start of the view (Sunday of the current week)
    const startOfView = new Date(currentDate);
    startOfView.setDate(currentDate.getDate() - currentDate.getDay());
    startOfView.setHours(0, 0, 0, 0);

    // Generate days based on view mode
    const days = useMemo(() => {
        const d = [];
        const daysCount = viewMode === '2week' ? 14 : 7;
        for (let i = 0; i < daysCount; i++) {
            const date = new Date(startOfView);
            date.setDate(startOfView.getDate() + i);
            d.push(date);
        }
        return d;
    }, [startOfView, viewMode]);
    
    // Header Label
    const endDate = new Date(days[days.length - 1]);
    const headerLabel = `${startOfView.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const changePeriod = (direction: number) => {
        const newDate = new Date(currentDate);
        const offset = viewMode === '2week' ? 14 : 7;
        newDate.setDate(newDate.getDate() + (direction * offset));
        setCurrentDate(newDate);
    };

    const getEventIcon = (type: EventType) => {
        switch (type) {
            case EventType.VIDEO_CALL: return <VideoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />;
            case EventType.PHONE_CALL: return <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
            case EventType.INDUCTION: return <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />;
            default: return <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400" />;
        }
    }

    const handleDragStart = (e: React.DragEvent, eventId: string) => {
        e.dataTransfer.setData('eventId', eventId);
        e.dataTransfer.effectAllowed = 'move';
    };

    // 2-Week View Drag Handlers
    const handleDayDragOver = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (isDragOverDate !== dateStr) {
            setIsDragOverDate(dateStr);
        }
    };
    
    const handleDayDrop = (e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        setIsDragOverDate(null);
        const eventId = e.dataTransfer.getData('eventId');
        const event = events.find(ev => ev.id === eventId);
        
        if (event) {
             const newDate = new Date(targetDate);
             const originalDate = new Date(event.date);
             // Preserve original time when moving between days in 2-week view
             newDate.setHours(originalDate.getHours());
             newDate.setMinutes(originalDate.getMinutes());
             
             dispatch({
                 type: 'UPDATE_EVENT',
                 payload: { ...event, date: newDate }
             });
        }
    };

    // Week View Drag Handlers
    const handleSlotDragOver = (e: React.DragEvent, slotId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverSlot !== slotId) {
            setDragOverSlot(slotId);
        }
    };

    const handleSlotDrop = (e: React.DragEvent, targetDate: Date, hour: number) => {
        e.preventDefault();
        setDragOverSlot(null);
        const eventId = e.dataTransfer.getData('eventId');
        const event = events.find(ev => ev.id === eventId);
        
        if (event) {
             const newDate = new Date(targetDate);
             newDate.setHours(hour);
             newDate.setMinutes(0); // Snap to start of hour slot
             
             dispatch({
                 type: 'UPDATE_EVENT',
                 payload: { ...event, date: newDate }
             });
        }
    };

    const handleDragLeave = () => {
        setIsDragOverDate(null);
        setDragOverSlot(null);
    }
    
    const handleSync = () => {
        if (isCalendarSynced) return;
        setIsSyncing(true);
        // Simulate API delay
        setTimeout(() => {
            dispatch({ type: 'SET_CALENDAR_SYNC', payload: true });
            setIsSyncing(false);
        }, 1500);
    }

    // Time slots for Week View (8:00 AM to 7:00 PM)
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    // Ensure safe date handling
    const safeEvents = useMemo(() => events.map(e => ({...e, date: new Date(e.date)})), [events]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden h-[calc(100vh-140px)] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white">Diary</h1>
                        <p className="text-xs text-brand-gray-dark dark:text-slate-400 mt-1 hidden sm:block">
                            Drag and drop events to reschedule.
                        </p>
                    </div>
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing || isCalendarSynced}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isCalendarSynced 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default' 
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'}`}
                    >
                        {isSyncing ? (
                            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        ) : isCalendarSynced ? (
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                        ) : (
                            <LinkIcon className="w-4 h-4 mr-2" />
                        )}
                        {isSyncing ? 'Connecting...' : isCalendarSynced ? 'Synced with Google' : 'Connect Calendar'}
                    </button>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-4 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-slate-600 text-brand-accent shadow-sm' : 'text-brand-gray-dark dark:text-slate-300 hover:text-brand-charcoal'}`}
                    >
                        Week
                    </button>
                    <button 
                        onClick={() => setViewMode('2week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === '2week' ? 'bg-white dark:bg-slate-600 text-brand-accent shadow-sm' : 'text-brand-gray-dark dark:text-slate-300 hover:text-brand-charcoal'}`}
                    >
                        2 Weeks
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={() => changePeriod(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Previous">
                        <ChevronLeftIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                    <h2 className="text-sm sm:text-lg font-semibold text-brand-charcoal dark:text-white min-w-[140px] sm:min-w-[220px] text-center">
                        {headerLabel}
                    </h2>
                    <button onClick={() => changePeriod(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Next">
                        <ChevronRightIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Header Row for Days */}
            <div className={`grid ${viewMode === '2week' ? 'grid-cols-7' : 'grid-cols-8'} flex-shrink-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700`}>
                {viewMode === 'week' && <div className="p-2 text-center text-xs font-medium text-brand-gray-dark dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">Time</div>}
                {viewMode === '2week' 
                    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center py-2 sm:py-3 text-xs sm:text-sm font-medium text-brand-gray-dark dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 last:border-r-0">{day}</div>
                    ))
                    : days.map(d => (
                        <div key={d.toISOString()} className={`text-center py-2 sm:py-3 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${d.toDateString() === new Date().toDateString() ? 'bg-brand-accent/5 dark:bg-brand-accent/10' : ''}`}>
                             <div className="text-xs text-brand-gray-dark dark:text-slate-400 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                             <div className={`text-sm font-bold ${d.toDateString() === new Date().toDateString() ? 'text-brand-accent' : 'text-brand-charcoal dark:text-white'}`}>{d.getDate()}</div>
                        </div>
                    ))
                }
            </div>

            {/* Calendar Body */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-slate-800">
                {viewMode === '2week' ? (
                    <div className="grid grid-cols-7 grid-rows-2 h-full min-h-[500px]">
                        {days.map((d, i) => {
                            const dateStr = d.toDateString();
                            const isToday = new Date().toDateString() === dateStr;
                            const eventsForDay = safeEvents
                                .filter(e => e.date.toDateString() === dateStr)
                                .sort((a, b) => a.date.getTime() - b.date.getTime());
                            const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                            const isDragTarget = isDragOverDate === dateStr;
                            
                            return (
                                <div 
                                    key={i} 
                                    onDragOver={(e) => handleDayDragOver(e, dateStr)}
                                    onDrop={(e) => handleDayDrop(e, d)}
                                    onDragLeave={handleDragLeave}
                                    className={`p-1 sm:p-2 border-b border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors ${isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-900/30'} ${isDragTarget ? 'bg-brand-accent/20 ring-inset ring-2 ring-brand-accent' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <div className="flex justify-between items-start mb-1 pointer-events-none">
                                        <span className={`text-xs sm:text-sm font-medium flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full ${isToday ? 'bg-brand-plum text-white' : 'text-brand-charcoal dark:text-slate-300'}`}>
                                            {d.getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-1 sm:space-y-2 overflow-y-auto pr-1">
                                        {eventsForDay.map(event => {
                                            const candidate = candidates.find(c => c.id === event.candidateId);
                                            return (
                                                <div 
                                                    key={event.id} 
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, event.id)}
                                                    onClick={() => setSelectedEventForEdit(event)}
                                                    className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded border-l-4 border-brand-accent shadow-sm hover:bg-white dark:hover:bg-slate-600 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                                                    title={`${event.title} with ${candidate?.name}`}
                                                >
                                                    <div className="flex items-center justify-between mb-0.5 pointer-events-none">
                                                        <span className="text-[10px] font-bold text-brand-charcoal dark:text-slate-200">
                                                            {event.date.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                        {getEventIcon(event.type)}
                                                    </div>
                                                    <div className="font-semibold text-[10px] sm:text-xs text-brand-plum dark:text-brand-accent truncate pointer-events-none">
                                                        {candidate?.name || 'Unknown'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Week View Grid
                    <div className="grid grid-cols-8 relative min-w-[600px]">
                        {/* Time Column */}
                        <div className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            {hours.map(hour => (
                                <div key={hour} className="h-24 border-b border-slate-200 dark:border-slate-700 text-xs text-brand-gray-dark dark:text-slate-400 font-medium p-2 text-center relative">
                                    <span className="relative -top-3">{hour}:00</span>
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {days.map(d => {
                            const dateStr = d.toDateString();
                            return (
                                <div key={dateStr} className="border-r border-slate-200 dark:border-slate-700 relative">
                                    {hours.map(hour => {
                                        const slotId = `${dateStr}-${hour}`;
                                        const isDragTarget = dragOverSlot === slotId;
                                        
                                        // Events in this hour slot
                                        const slotEvents = safeEvents.filter(e => 
                                            e.date.toDateString() === dateStr && 
                                            e.date.getHours() === hour
                                        ).sort((a, b) => a.date.getMinutes() - b.date.getMinutes());

                                        return (
                                            <div 
                                                key={slotId}
                                                onDragOver={(e) => handleSlotDragOver(e, slotId)}
                                                onDrop={(e) => handleSlotDrop(e, d, hour)}
                                                className={`h-24 border-b border-slate-200 dark:border-slate-700 p-1 relative transition-colors ${isDragTarget ? 'bg-brand-accent/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                            >
                                                {slotEvents.map((event, idx) => {
                                                    const candidate = candidates.find(c => c.id === event.candidateId);
                                                    return (
                                                         <div 
                                                            key={event.id} 
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, event.id)}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedEventForEdit(event); }}
                                                            className="absolute left-1 right-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded p-1 shadow-sm text-xs cursor-grab active:cursor-grabbing hover:border-brand-accent hover:shadow-md z-10 overflow-hidden"
                                                            style={{ 
                                                                top: `${(event.date.getMinutes() / 60) * 100}%`,
                                                                height: 'auto',
                                                                minHeight: '40px',
                                                                zIndex: 10 + idx // Stack if multiple
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1 mb-0.5">
                                                                {getEventIcon(event.type)}
                                                                <span className="font-bold text-brand-plum dark:text-brand-accent truncate">{event.date.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</span>
                                                            </div>
                                                            <div className="truncate font-medium text-brand-charcoal dark:text-white">{candidate?.name}</div>
                                                        </div>
                                                    )
                                                })}
                                                {/* Dashed line for half hour guidance? Optional */}
                                                <div className="absolute top-1/2 left-0 right-0 border-t border-slate-100 dark:border-slate-800 pointer-events-none"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {selectedEventForEdit && (
                <EditEventModal 
                    isOpen={!!selectedEventForEdit}
                    onClose={() => setSelectedEventForEdit(null)}
                    event={selectedEventForEdit}
                />
            )}
        </div>
    );
};

export default DiaryView;
