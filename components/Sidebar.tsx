
import React from 'react';
import { UsersIcon, CalendarIcon, CogIcon, InboxIcon, ChartBarIcon, HomeIcon, ClipboardCheckIcon, SparklesIcon, ArrowPathIcon } from './icons';
import { View } from '../types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  setView: (view: View) => void;
  activeView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ setView, activeView }) => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, view: 'dashboard' },
    { name: 'Candidates', icon: UsersIcon, view: 'candidates' },
    { name: 'Tasks', icon: ClipboardCheckIcon, view: 'tasks' },
    { name: 'Talent Pipeline', icon: SparklesIcon, view: 'talent-pipeline' },
    { name: 'Diary', icon: CalendarIcon, view: 'diary' },
    { name: 'Email Centre', icon: InboxIcon, view: 'email' },
    { name: 'Reporting', icon: ChartBarIcon, view: 'reporting' },
    { name: 'Maintenance', icon: CogIcon, view: 'maintenance' },
  ];
  
  const baseClasses = 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200';
  const activeClasses = 'bg-white/10 text-white border-l-4 border-brand-accent pl-3';
  const inactiveClasses = 'text-gray-300 hover:bg-white/10 hover:text-white';

  const isActive = (view: string) => activeView.startsWith(view);
  const MVM_LOGO_URL = 'https://mvm-ltd.co.uk/wp-content/themes/mvm-ltd/assets/images/mvm-logo.svg';

  const handleLogout = (e: React.MouseEvent) => {
      e.preventDefault();
      // Direct logout without confirmation for smoother UX and to avoid browser blocking issues
      dispatch({ type: 'LOGOUT' });
  };

  return (
    <div id="sidebar" className="w-64 bg-brand-green dark:bg-slate-950 text-white flex-shrink-0 flex flex-col h-full transition-colors duration-200">
      <div className="h-16 flex items-center justify-center px-4 border-b border-white/10 flex-shrink-0">
        <img src={MVM_LOGO_URL} alt="MVM Logo" className="h-10" />
      </div>
      
      {/* Added overflow-y-auto to nav to ensure it scrolls if items exceed height, keeping footer visible */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {navItems.map((item) => (
          <a
            key={item.name}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView(item.view as View);
            }}
            className={`${baseClasses} ${isActive(item.view) ? activeClasses : inactiveClasses}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </a>
        ))}
      </nav>

      {currentUser && (
        <div className="px-4 py-4 border-t border-white/10 flex-shrink-0 bg-brand-green dark:bg-slate-950 transition-colors">
            <div className="flex items-center mb-3">
                <img className="h-10 w-10 rounded-full bg-white p-1 object-contain" src={currentUser.avatarUrl} alt={currentUser.name} />
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-400 truncate">{currentUser.role}</p>
                </div>
            </div>
            <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
            >
                <ArrowPathIcon className="w-4 h-4 mr-2" /> Logout
            </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
