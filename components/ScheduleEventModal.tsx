import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Candidate, ScheduledEvent, EventType } from '../types';
import { CalendarIcon } from './icons';

interface ScheduleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ isOpen, onClose, candidate }) => {
    const { dispatch } = useAppContext();
    const [title, setTitle] = useState('');
    const [type, setType] = useState(EventType.VIDEO_CALL);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [lastCreatedEvent, setLastCreatedEvent] = useState<ScheduledEvent | null>(null);

    const resetForm = () => {
        setTitle('');
        setType(EventType.VIDEO_CALL);
        setDate('');
        setTime('');
        setDescription('');
        setLastCreatedEvent(null);
    }
    
    const handleClose = () => {
        resetForm();
        onClose();
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !time) {
            alert('Please fill in Title, Date, and Time.');
            return;
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const eventDate = new Date(year, month - 1, day, hour, minute);

        const newEvent: ScheduledEvent = {
            id: `e-${Date.now()}`,
            title,
            type,
            date: eventDate,
            description,
            candidateId: candidate.id,
        };

        dispatch({ type: 'ADD_EVENT', payload: newEvent });
        
        const newNote = {
            id: `n-${Date.now()}`,
            content: `Event scheduled: ${title} on ${eventDate.toLocaleString('en-GB')}`,
            author: 'Admin',
            date: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_NOTE', payload: { candidateId: candidate.id, note: newNote }});
        
        setLastCreatedEvent(newEvent);
    };

    const generateICSFile = () => {
        if (!lastCreatedEvent) return;

        const e = lastCreatedEvent;
        const startDate = e.date.toISOString().replace(/-|:|\.\d+/g, '');
        const endDate = new Date(e.date.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, ''); // Assume 1 hr duration

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//RecruitHub//NONSGML v1.0//EN',
            'BEGIN:VEVENT',
            `UID:${e.id}@recruithub.app`,
            `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${e.title}`,
            `DESCRIPTION:${e.description || `Event with ${candidate.name}`}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${e.title.replace(/\s/g, '_')}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Schedule Event with ${candidate.name}`}>
            {!lastCreatedEvent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-brand-gray-dark">Event Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-brand-gray-dark">Event Type</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as EventType)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                                {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium text-brand-gray-dark">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-brand-gray-dark">Time</label>
                            <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-gray-dark">Description (optional)</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={handleClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Schedule Event</button>
                    </div>
                </form>
            ) : (
                 <div className="text-center py-8">
                    <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                        <CalendarIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-brand-charcoal">Event Scheduled!</h3>
                    <p className="mt-2 text-brand-gray-dark">
                        "{lastCreatedEvent.title}" with {candidate.name} has been added to the diary for {lastCreatedEvent.date.toLocaleString('en-GB')}.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                         <button onClick={generateICSFile} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                            Add to Calendar (.ics)
                        </button>
                         <button onClick={handleClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
                           Close
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ScheduleEventModal;