
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { SearchIcon } from './icons';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedCandidateId?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, preSelectedCandidateId }) => {
    const { state, dispatch } = useAppContext();
    const { candidates } = state;

    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [candidateId, setCandidateId] = useState(preSelectedCandidateId || '');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDueDate(new Date().toISOString().split('T')[0]);
            setCandidateId(preSelectedCandidateId || '');
            setSearchTerm('');
        }
    }, [isOpen, preSelectedCandidateId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Task title is required.');
            return;
        }

        const newTask: Task = {
            id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title.trim(),
            dueDate,
            status: TaskStatus.TO_DO,
            candidateId,
            history: [{
                timestamp: new Date().toISOString(),
                user: 'Admin',
                fromStatus: null,
                toStatus: TaskStatus.TO_DO
            }]
        };

        dispatch({ type: 'ADD_TASK', payload: newTask });
        onClose();
    };

    const filteredCandidates = candidates.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="task-title" className="block text-sm font-medium text-brand-gray-dark">Task Title</label>
                    <input 
                        type="text" 
                        id="task-title" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="e.g. Chase up references"
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label htmlFor="task-candidate" className="block text-sm font-medium text-brand-gray-dark mb-1">Link to Candidate (Optional)</label>
                    {!preSelectedCandidateId && (
                        <div className="relative mb-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Filter candidates..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                            />
                        </div>
                    )}
                    <select 
                        id="task-candidate" 
                        value={candidateId} 
                        onChange={e => setCandidateId(e.target.value)} 
                        disabled={!!preSelectedCandidateId}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                        size={!preSelectedCandidateId && filteredCandidates.length > 5 ? 5 : undefined}
                    >
                        <option value="">-- General Task --</option>
                        {filteredCandidates.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        {!preSelectedCandidateId && filteredCandidates.length === 0 && (
                            <option disabled>No matching candidates found</option>
                        )}
                    </select>
                    {!preSelectedCandidateId && (
                        <p className="text-xs text-slate-500 mt-1">
                            {filteredCandidates.length} candidate(s) found. Select from list above.
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="task-due-date" className="block text-sm font-medium text-brand-gray-dark">Due Date</label>
                    <input 
                        type="date" 
                        id="task-due-date" 
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)} 
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Create Task</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTaskModal;
