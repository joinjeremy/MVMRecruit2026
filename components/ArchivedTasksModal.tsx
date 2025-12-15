import React from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { TaskStatus } from '../types';
import { ArrowPathIcon } from './icons';

const ArchivedTasksModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useAppContext();
    const archivedTasks = state.tasks
        .filter(task => task.status === TaskStatus.ARCHIVED)
        .sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime());

    const handleRestoreTask = (taskId: string) => {
        dispatch({ type: 'RESTORE_TASK', payload: { taskId } });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Archived Tasks History">
            {archivedTasks.length > 0 ? (
                <div className="space-y-4">
                    {archivedTasks.map(task => {
                        const candidate = state.candidates.find(c => c.id === task.candidateId);
                        return (
                            <div key={task.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-brand-charcoal">{task.title}</p>
                                    {candidate && <p className="text-sm text-brand-gray-dark">Related to: {candidate.name}</p>}
                                    <p className="text-xs text-slate-500 mt-1">
                                        Archived by {task.archivedBy} on {new Date(task.archivedAt!).toLocaleString('en-GB')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRestoreTask(task.id)}
                                    className="flex items-center bg-white border border-slate-300 text-brand-gray-dark px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors"
                                    aria-label="Restore task"
                                >
                                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                                    Restore
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-brand-gray-dark">No tasks have been archived yet.</p>
            )}
        </Modal>
    );
};

export default ArchivedTasksModal;