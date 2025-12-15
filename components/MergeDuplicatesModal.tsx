import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Candidate } from '../types';

interface MergeGroupProps {
    group: Candidate[];
    onMasterSelect: (masterId: string) => void;
    selectedMasterId: string;
}

const MergeGroup: React.FC<MergeGroupProps> = ({ group, onMasterSelect, selectedMasterId }) => {
    return (
        <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-brand-charcoal mb-3">Duplicate Set for: {group[0].email}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.map(candidate => (
                    <label key={candidate.id} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedMasterId === candidate.id ? 'border-brand-accent ring-2 ring-brand-accent bg-brand-accent/5' : 'border-slate-300'}`}>
                        <div className="flex items-start">
                            <input
                                type="radio"
                                name={`master-for-${group[0].id}`}
                                value={candidate.id}
                                checked={selectedMasterId === candidate.id}
                                onChange={() => onMasterSelect(candidate.id)}
                                className="h-4 w-4 mt-1 border-slate-300 text-brand-accent focus:ring-brand-accent"
                            />
                            <div className="ml-3 text-sm">
                                <p className="font-medium text-brand-charcoal">{candidate.name}</p>
                                <p className="text-brand-gray-dark">{candidate.status}</p>
                                <p className="text-brand-gray-dark">{new Date(candidate.createdAt).toLocaleDateString('en-GB')}</p>
                                <p className="text-brand-gray-dark mt-1">{candidate.notes.length} note(s)</p>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}


const MergeDuplicatesModal: React.FC<{ isOpen: boolean; onClose: () => void; duplicateGroups: Candidate[][] }> = ({ isOpen, onClose, duplicateGroups }) => {
    const { dispatch } = useAppContext();
    const [masterSelections, setMasterSelections] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {};
        duplicateGroups.forEach(group => {
            initialState[group[0].id] = group[0].id; // Default to the first candidate
        });
        return initialState;
    });

    const handleMasterSelect = (groupId: string, masterId: string) => {
        setMasterSelections(prev => ({ ...prev, [groupId]: masterId }));
    };

    const handleMerge = () => {
        duplicateGroups.forEach(group => {
            const groupId = group[0].id;
            const masterCandidateId = masterSelections[groupId];
            const duplicateCandidateIds = group.filter(c => c.id !== masterCandidateId).map(c => c.id);
            dispatch({
                type: 'MERGE_CANDIDATES',
                payload: { masterCandidateId, duplicateCandidateIds }
            });
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Find & Merge Duplicates">
            <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold text-brand-charcoal">Potential Duplicates Found</h3>
                    <p className="text-brand-gray-dark">Review each set of duplicates. Select one candidate to keep as the "master" record. All notes from other records will be merged into the master.</p>
                </div>

                {duplicateGroups.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {duplicateGroups.map(group => (
                            <MergeGroup
                                key={group[0].id}
                                group={group}
                                onMasterSelect={(masterId) => handleMasterSelect(group[0].id, masterId)}
                                selectedMasterId={masterSelections[group[0].id]}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-brand-gray-dark">No duplicate candidates found based on email address.</p>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                    <button onClick={handleMerge} disabled={duplicateGroups.length === 0} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:bg-opacity-50">
                        Merge Selected Duplicates
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MergeDuplicatesModal;