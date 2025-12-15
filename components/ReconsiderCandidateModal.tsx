import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Candidate, TalentPipelineType } from '../types';

interface ReconsiderCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

const ReconsiderCandidateModal: React.FC<ReconsiderCandidateModalProps> = ({ isOpen, onClose, candidate }) => {
    const { dispatch } = useAppContext();
    const [followUpOn, setFollowUpOn] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!followUpOn) {
            alert('Please select a date for reconsideration.');
            return;
        }

        dispatch({
            type: 'ADD_TO_PIPELINE',
            payload: {
                candidateId: candidate.id,
                followUpOn: new Date(followUpOn).toISOString(),
                type: TalentPipelineType.RECONSIDER,
                notes: notes.trim(),
            }
        });
        
        onClose();
        setFollowUpOn('');
        setNotes('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Reconsider ${candidate.name} Later`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-brand-gray-dark">
                    Add this candidate to the Talent Pipeline to be reminded to review them in the future.
                </p>
                <div>
                    <label htmlFor="followUpOn" className="block text-sm font-medium text-brand-gray-dark">Reconsider On</label>
                    <input
                        type="date"
                        id="followUpOn"
                        value={followUpOn}
                        onChange={e => setFollowUpOn(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-brand-gray-dark">Reason / Notes (optional)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        placeholder="e.g., Great candidate, but not a fit for the current opening. Re-check in Q4 for new roles."
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                        Add to Talent Pipeline
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReconsiderCandidateModal;