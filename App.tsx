
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CandidateListView from './components/CandidateListView';
import CandidateDetailView from './components/CandidateDetailView';
import DiaryView from './components/DiaryView';
import AddCandidateModal from './components/AddCandidateModal';
import MaintenanceView from './components/MaintenanceView';
import EmailCenterView from './components/EmailCenterView';
import ReportingView from './components/ReportingView';
import DashboardView from './components/DashboardView';
import TaskBoardView from './components/TaskBoardView';
import TalentPipelineView from './components/TalentPipelineView';
import LoginView from './components/LoginView';
import OnboardingTour from './components/OnboardingTour';
import { AppProvider, useAppContext } from './context/AppContext';
import { View } from './types';

const MainContent: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
    const { state } = useAppContext();

    if (!state.currentUser) {
        return <LoginView />;
    }

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <DashboardView setView={setView} />;
            case 'tasks':
                return <TaskBoardView />;
            case 'candidates':
                return <CandidateListView setView={setView} />;
            case 'candidate-detail':
                return state.selectedCandidate ? <CandidateDetailView setView={setView} /> : <CandidateListView setView={setView} />;
            case 'diary':
                return <DiaryView />;
            case 'maintenance':
                return <MaintenanceView />;
            case 'email':
                return <EmailCenterView />;
            case 'reporting':
                return <ReportingView />;
            case 'talent-pipeline':
                return <TalentPipelineView setView={setView} />;
            default:
                return <DashboardView setView={setView}/>;
        }
    };

    return (
        <div className="flex h-screen bg-brand-light dark:bg-slate-900 font-sans transition-colors duration-200">
            <Sidebar setView={setView} activeView={view} />
            <div id="view-container" className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onAddCandidateClick={() => setIsAddCandidateModalOpen(true)}
                    setView={setView}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-light dark:bg-slate-900 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
                    {renderView()}
                </main>
                <AddCandidateModal
                    isOpen={isAddCandidateModalOpen}
                    onClose={() => setIsAddCandidateModalOpen(false)}
                />
                <OnboardingTour />
            </div>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AppProvider>
        <MainContent />
    </AppProvider>
  );
};

export default App;
