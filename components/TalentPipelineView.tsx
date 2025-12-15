
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { View, TalentPipelineType, Note } from '../types';
import { ClockIcon, CheckCircleIcon, ChevronDownIcon, SearchIcon, SparklesIcon, PencilSquareIcon, ArrowPathIcon } from './icons';
import Modal from './Modal';

interface TalentPipelineViewProps {
    setView: (view: View) => void;
}

const TalentPipelineView: React.FC<TalentPipelineViewProps> = ({ setView }) => {
    const { state, dispatch } = useAppContext();
    const { talentPipeline, candidates } = state;

    // Filter & Sort State
    const [filterType, setFilterType] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Quick Note State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedEntryForNote, setSelectedEntryForNote] = useState<string | null>(null); // candidateId
    const [quickNote, setQuickNote] = useState('');

    const pipelineWithCandidates = useMemo(() => {
        let data = talentPipeline
            .map(entry => {
                const candidate = candidates.find(c => c.id === entry.candidateId);
                return { ...entry, candidate };
            })
            .filter(entry => entry.candidate); // Filter out entries where candidate not found

        // Filtering
        if (filterType !== 'all') {
            data = data.filter(entry => entry.type === filterType);
        }

        // Sorting
        data.sort((a, b) => {
            const dateA = new Date(a.followUpOn).getTime();
            const dateB = new Date(b.followUpOn).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        return data;
    }, [talentPipeline, candidates, filterType, sortOrder]);
        
    const handleProcessCandidate = (entry: typeof pipelineWithCandidates[0]) => {
        const candidate = entry.candidate!;
        const actionText = entry.type === TalentPipelineType.RE_ENGAGE ? 're-engage with' : 'review';

        if (window.confirm(`Are you sure you want to ${actionText} ${candidate.name}? They will be processed from the pipeline.`)) {
            dispatch({ type: 'PROCESS_PIPELINE_CANDIDATE', payload: { candidateId: candidate.id } });
            dispatch({ type: 'SELECT_CANDIDATE', payload: candidate });
            setView('candidate-detail');
        }
    };

    const handleSnooze = (entry: typeof pipelineWithCandidates[0]) => {
        const current = new Date(entry.followUpOn);
        current.setMonth(current.getMonth() + 1);
        
        dispatch({
            type: 'ADD_TO_PIPELINE',
            payload: {
                candidateId: entry.candidateId,
                followUpOn: current.toISOString(),
                type: entry.type,
                notes: entry.notes
            }
        });
    };

    const handleOpenNoteModal = (candidateId: string) => {
        setSelectedEntryForNote(candidateId);
        setQuickNote('');
        setIsNoteModalOpen(true);
    };

    const handleSubmitNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEntryForNote && quickNote.trim()) {
            const note: Note = {
                id: `n-${Date.now()}`,
                content: quickNote.trim(),
                author: 'Admin', // In a real app, this would be current user
                date: new Date().toISOString()
            };
            dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedEntryForNote, note } });
            setIsNoteModalOpen(false);
            setQuickNote('');
            setSelectedEntryForNote(null);
        }
    };

    const getUrgencyStyles = (dateStr: string) => {
        const due = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        due.setHours(0,0,0,0);
        
        if (due < today) return 'bg-red-50 border-l-4 border-red-500'; // Overdue
        if (due.getTime() === today.getTime()) return 'bg-green-50 border-l-4 border-green-500'; // Due today
        return 'hover:bg-brand-light/50 border-l-4 border-transparent'; // Default
    };

    const selectedCandidateName = selectedEntryForNote 
        ? candidates.find(c => c.id === selectedEntryForNote)?.name 
        : '';

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-charcoal">Talent Pipeline</h1>
                    <p className="text-brand-gray-dark mt-1">Candidates marked for future re-engagement or reconsideration.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-brand-accent focus:border-brand-accent"
                        >
                            <option value="all">All Types</option>
                            <option value={TalentPipelineType.RE_ENGAGE}>Re-engage</option>
                            <option value={TalentPipelineType.RECONSIDER}>Reconsider</option>
                        </select>
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-brand-gray-dark"
                            title="Sort by Date"
                        >
                            <ArrowPathIcon className={`w-5 h-5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {pipelineWithCandidates.length > 0 ? (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-brand-light sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-dark uppercase tracking-wider">Candidate & Context</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-dark uppercase tracking-wider">Reason / Notes</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-dark uppercase tracking-wider">Follow-up On</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-gray-dark uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {pipelineWithCandidates.map((entry) => {
                                const urgencyClass = getUrgencyStyles(entry.followUpOn);
                                const candidate = entry.candidate!;
                                
                                return (
                                    <tr key={candidate.id} className={urgencyClass}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 h-10 w-10 mt-1">
                                                    <img className="h-10 w-10 rounded-full bg-slate-200 object-contain p-1" src={candidate.avatarUrl} alt={candidate.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
                                                        {candidate.name}
                                                        <span className="px-2 py-0.5 text-[10px] font-normal rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                            {candidate.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-brand-gray-dark">{candidate.email}</div>
                                                    {candidate.keySkills && candidate.keySkills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {candidate.keySkills.slice(0, 3).map((skill, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 text-[10px] bg-brand-accent/5 text-brand-accent rounded border border-brand-accent/20">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {candidate.keySkills.length > 3 && (
                                                                <span className="text-[10px] text-slate-400">+{candidate.keySkills.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-sm align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className={`self-start inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${entry.type === TalentPipelineType.RE_ENGAGE ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {entry.type}
                                                </span>
                                                <p className="text-sm text-brand-gray-dark mt-1">
                                                    {entry.notes || <span className="italic text-slate-400">No specific notes.</span>}
                                                </p>
                                                {entry.type === TalentPipelineType.RE_ENGAGE && (
                                                    <p className="text-xs text-slate-500 italic mt-0.5">Reason: Took another job (Auto-added)</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-dark align-top">
                                            <div className="font-medium">{new Date(entry.followUpOn).toLocaleDateString('en-GB')}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Added: {new Date(entry.addedAt).toLocaleDateString('en-GB')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                            <div className="flex flex-col items-end gap-2">
                                                <button 
                                                    onClick={() => handleProcessCandidate(entry)}
                                                    className="bg-brand-plum text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-opacity-90 w-28 shadow-sm"
                                                >
                                                    Process Now
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleSnooze(entry)}
                                                        className="text-slate-500 hover:text-brand-accent bg-white border border-slate-200 hover:border-brand-accent p-1.5 rounded transition-colors"
                                                        title="Snooze 1 Month"
                                                    >
                                                        <ClockIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenNoteModal(candidate.id)}
                                                        className="text-slate-500 hover:text-brand-accent bg-white border border-slate-200 hover:border-brand-accent p-1.5 rounded transition-colors"
                                                        title="Add Quick Note"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <SparklesIcon className="w-12 h-12 text-slate-200 mb-4" />
                        <h3 className="text-lg font-medium text-brand-charcoal">Pipeline is empty</h3>
                        <p className="text-brand-gray-dark mt-1 max-w-sm">
                            Candidates appear here when you choose "Reconsider Later" or when they withdraw due to taking another job.
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Note Modal */}
            <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={`Add Note for ${selectedCandidateName}`}>
                <form onSubmit={handleSubmitNote} className="space-y-4">
                    <div>
                        <label htmlFor="quick-note" className="block text-sm font-medium text-brand-gray-dark">Note Content</label>
                        <textarea
                            id="quick-note"
                            rows={4}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                            placeholder="e.g. Left voicemail, candidate is still interested..."
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={() => setIsNoteModalOpen(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                        <button type="submit" disabled={!quickNote.trim()} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50">Add Note</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TalentPipelineView;
