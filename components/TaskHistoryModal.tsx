import React from 'react';
import Modal from './Modal';
import { Task } from '../types';

const TaskHistoryModal: React.FC<{ isOpen: boolean; onClose: () => void; task: Task; }> = ({ isOpen, onClose, task }) => {
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`History for: ${task.title}`}>
            {task.history && task.history.length > 0 ? (
                <ul className="space-y-4">
                    {[...task.history].reverse().map((entry, index) => (
                        <li key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-sm text-brand-charcoal">
                                    Status changed from <span className="font-semibold">{entry.fromStatus || 'None'}</span> to <span className="font-semibold">{entry.toStatus}</span>
                                </p>
                                <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString('en-GB')}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                By: {entry.user}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-brand-gray-dark">No history recorded for this task yet.</p>
            )}
        </Modal>
    );
};

export default TaskHistoryModal;