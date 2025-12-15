
import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { TemplateType } from '../types';

interface BulkEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientIds: string[];
    onSent: () => void;
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose, recipientIds, onSent }) => {
    const { state, dispatch } = useAppContext();
    const { templates } = state;
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const emailTemplates = templates.filter(t => t.type === TemplateType.EMAIL);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSubject(template.subject || '');
            setBody(template.content);
        }
    };

    const handleSend = () => {
        if (!subject.trim() || !body.trim()) {
            alert("Subject and body are required.");
            return;
        }

        const noteContent = `Bulk email sent\nSubject: ${subject}\n\nContent:\n${body.substring(0, 150)}${body.length > 150 ? '...' : ''}`;
        
        dispatch({
            type: 'BULK_ADD_NOTE',
            payload: {
                candidateIds: recipientIds,
                note: {
                    content: noteContent,
                    author: 'Admin',
                    date: new Date().toISOString(),
                }
            }
        });

        alert(`Bulk email has been logged for ${recipientIds.length} candidates.`);
        onSent();
        handleClose();
    };
    
    const handleClose = () => {
        setSubject('');
        setBody('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Send Bulk Email to ${recipientIds.length} Candidates`}>
            <div className="space-y-4">
                <div className="flex justify-end items-center">
                    <select onChange={handleTemplateChange} className="form-select text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-slate-700 dark:text-white">
                        <option value="">Use a template...</option>
                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="bulk-subject" className="sr-only">Subject</label>
                    <input
                        type="text"
                        id="bulk-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                    />
                </div>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your email here..."
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                    rows={10}
                />
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-200">
                    <p><strong>Note:</strong> Placeholders like `{"{candidateName}"}` will be personalised for each recipient upon sending. This is a simulation; no actual emails will be sent.</p>
                </div>
                 <div className="flex justify-end space-x-3">
                    <button type="button" onClick={handleClose} className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleSend} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                        Send & Log for {recipientIds.length} Candidates
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkEmailModal;
