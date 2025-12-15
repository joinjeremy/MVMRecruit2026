
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Candidate, ScheduledEvent, EventType, CandidateStatus } from '../types';
import { VideoIcon, PhoneIcon, CheckCircleIcon, ArchiveBoxIcon, PlusIcon } from './icons';
import AddTaskModal from './AddTaskModal';

const getEventIcon = (type: EventType) => {
    switch (type) {
        case EventType.VIDEO_CALL: return <VideoIcon className="w-5 h-5 text-blue-500" />;
        case EventType.PHONE_CALL: return <PhoneIcon className="w-5 h-5 text-green-500" />;
        case EventType.INDUCTION: return <CheckCircleIcon className="w-5 h-5 text-purple-500" />;
        default: return <div className="w-5 h-5 rounded-full bg-gray-400" />;
    }
}

const DashboardView: React.FC<{setView: (view: 'tasks' | 'diary' | 'candidate-detail' | 'candidates') => void}> = ({ setView }) => {
    const { state, dispatch } = useAppContext();
    const { candidates, tasks, events } = state;
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

    const dashboardData = useMemo(() => {
        const todayStr = new Date().toDateString();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tasksDueToday = tasks.filter(t => new Date(t.dueDate).toDateString() === todayStr && t.status !== 'Done' && t.status !== 'Archived');
        
        const todaysAgenda = events
            .filter(e => e.date.toDateString() === todayStr)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const recentCandidates = candidates
            .filter(c => new Date(c.createdAt) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const outstandingKitCandidates = candidates.filter(c =>
            c.status === CandidateStatus.TERMINATED && c.assignedKit?.some(item => !item.returnedAt)
        );

        return { tasksDueToday, todaysAgenda, recentCandidates, outstandingKitCandidates };
    }, [candidates, tasks, events]);
    
    const handleSelectCandidate = (candidate: Candidate) => {
        dispatch({ type: 'SELECT_CANDIDATE', payload: candidate });
        setView('candidate-detail');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-charcoal">Today's Plan</h1>
                <p className="text-brand-gray-dark mt-1">Your priority actions and new candidates for today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Today's Agenda</h2>
                        {dashboardData.todaysAgenda.length > 0 ? (
                            <ul className="space-y-4">
                                {dashboardData.todaysAgenda.map(event => {
                                    const candidate = candidates.find(c => c.id === event.candidateId);
                                    return (
                                        <li key={event.id} className="flex items-center">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <p className="text-base font-bold text-brand-accent">{event.date.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                            <div className="ml-4 flex items-center flex-1">
                                                <div className="p-2 bg-slate-100 rounded-full mr-3">
                                                   {getEventIcon(event.type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-brand-charcoal">{event.type} with {candidate?.name || 'N/A'}</p>
                                                    <p className="text-xs text-brand-gray-dark">{event.title}</p>
                                                </div>
                                            </div>
                                            {candidate && <button onClick={() => handleSelectCandidate(candidate)} className="text-sm font-medium text-brand-accent hover:underline ml-4">View</button>}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-brand-gray-dark text-center py-8">No events scheduled for today.</p>
                        )}
                        <button onClick={() => setView('diary')} className="text-sm font-medium text-brand-accent hover:underline mt-4">View Full Diary</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-brand-charcoal">Tasks Due Today</h2>
                            <button 
                                onClick={() => setIsAddTaskModalOpen(true)}
                                className="p-1 rounded-md text-brand-accent hover:bg-brand-accent/10 transition-colors"
                                title="Add Quick Task"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {dashboardData.tasksDueToday.length > 0 ? (
                            <ul className="space-y-3">
                                {dashboardData.tasksDueToday.map(task => {
                                    const candidate = candidates.find(c => c.id === task.candidateId);
                                    return (
                                        <li key={task.id} className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-brand-charcoal">{task.title}</p>
                                                {candidate && <p className="text-xs text-brand-gray-dark">For: {candidate.name}</p>}
                                            </div>
                                            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">{task.status}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-brand-gray-dark">No tasks due today. Great job!</p>
                        )}
                        <button onClick={() => setView('tasks')} className="text-sm font-medium text-brand-accent hover:underline mt-4">View Task Board</button>
                    </div>
                    
                    {dashboardData.outstandingKitCandidates.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-red-100 rounded-full mr-3">
                                    <ArchiveBoxIcon className="w-6 h-6 text-red-600"/>
                                </div>
                                <h2 className="text-lg font-semibold text-brand-charcoal">Outstanding Kit Returns</h2>
                            </div>
                            <ul className="divide-y divide-slate-200">
                                {dashboardData.outstandingKitCandidates.map(candidate => {
                                    const unreturnedItems = candidate.assignedKit?.filter(item => !item.returnedAt).map(item => item.type).join(', ');
                                    return (
                                        <li key={candidate.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-brand-charcoal">{candidate.name}</p>
                                                <p className="text-sm text-red-600 font-medium">Outstanding: {unreturnedItems}</p>
                                            </div>
                                            <button onClick={() => handleSelectCandidate(candidate)} className="text-sm font-medium text-brand-accent hover:underline ml-4">View Profile</button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-md h-full">
                         <h2 className="text-lg font-semibold text-brand-charcoal mb-4">New & Recent Candidates</h2>
                         {dashboardData.recentCandidates.length > 0 ? (
                            <ul className="divide-y divide-slate-200">
                                {dashboardData.recentCandidates.map(candidate => (
                                    <li key={candidate.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full mr-3 bg-slate-200 object-contain p-1" />
                                            <div>
                                                <p className="font-medium text-brand-charcoal">{candidate.name}</p>
                                                <p className="text-sm text-brand-gray-dark">Added: {new Date(candidate.createdAt).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleSelectCandidate(candidate)} className="text-sm font-medium text-brand-accent hover:underline ml-4">View</button>
                                    </li>
                                ))}
                            </ul>
                         ) : (
                             <p className="text-sm text-brand-gray-dark">No new candidates in the last 7 days.</p>
                         )}
                         <button onClick={() => setView('candidates')} className="text-sm font-medium text-brand-accent hover:underline mt-4">View All Candidates</button>
                    </div>
                </div>
            </div>
            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />
        </div>
    );
};

export default DashboardView;
