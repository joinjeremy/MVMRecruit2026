
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { ScheduledEvent, EventType } from '../types';
import { TrashIcon } from './icons';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduledEvent;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event }) => {
    const { state, dispatch } = useAppContext();
    const candidate = state.candidates.find(c => c.id === event.candidateId);

    const [title, setTitle] = useState(event.title);
    const [type, setType] = useState<EventType>(event.type);
    const [date, setDate] = useState(event.date.toISOString().split('T')[0]);
    const [time, setTime] = useState(event.date.toTimeString().split(' ')[0].substring(0, 5));
    const [description, setDescription] = useState(event.description || '');

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setType(event.type);
            setDate(event.date.toISOString().split('T')[0]);
            setTime(event.date.toTimeString().split(' ')[0].substring(0, 5));
            setDescription(event.description || '');
        }
    }, [event, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !time) {
            alert('Please fill in Title, Date, and Time.');
            return;
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const eventDate = new Date(year, month - 1, day, hour, minute);

        const updatedEvent: ScheduledEvent = {
            ...event,
            title,
            type,
            date: eventDate,
            description,
        };

        dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            dispatch({ type: 'DELETE_EVENT', payload: event.id });
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Event: ${candidate ? candidate.name : 'Unknown Candidate'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-brand-gray-dark">Event Title</label>
                    <input type="text" id="edit-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="edit-type" className="block text-sm font-medium text-brand-gray-dark">Event Type</label>
                        <select id="edit-type" value={type} onChange={e => setType(e.target.value as EventType)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                            {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="edit-date" className="block text-sm font-medium text-brand-gray-dark">Date</label>
                        <input type="date" id="edit-date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="edit-time" className="block text-sm font-medium text-brand-gray-dark">Time</label>
                        <input type="time" id="edit-time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-brand-gray-dark">Description (optional)</label>
                    <textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                     <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                        <TrashIcon className="w-4 h-4 mr-1" /> Delete Event
                    </button>
                    <div className="flex space-x-3">
                        <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Save Changes</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default EditEventModal;
