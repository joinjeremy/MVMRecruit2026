
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, BellIcon, PlusIcon, MoonIcon, SunIcon } from './icons';
import NotificationCenter from './NotificationCenter';
import { useAppContext } from '../context/AppContext';
import { Candidate } from '../types';
import { View } from '../types';

interface HeaderProps {
  onAddCandidateClick: () => void;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddCandidateClick, setView }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const { state, dispatch } = useAppContext();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);


  const unreadCount = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = state.candidates.filter(c => 
            c.name.toLowerCase().includes(lowercasedQuery) ||
            c.email.toLowerCase().includes(lowercasedQuery) ||
            c.phone.includes(lowercasedQuery)
        );
        setSearchResults(results);
    } else {
        setSearchResults([]);
    }
  }, [searchQuery, state.candidates]);

  const handleSelectCandidate = (candidate: Candidate) => {
    dispatch({ type: 'SELECT_CANDIDATE', payload: candidate });
    setView('candidate-detail');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleThemeToggle = () => {
      dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-colors">
      <div className="flex items-center" ref={searchRef}>
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white dark:bg-slate-700 dark:text-white"
          />
          {searchResults.length > 0 && (
            <div className="absolute mt-2 w-full bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-20 max-h-80 overflow-y-auto">
              <ul>
                {searchResults.map(candidate => (
                  <li key={candidate.id}>
                    <button
                      onClick={() => handleSelectCandidate(candidate)}
                      className="w-full text-left flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                      <img src={candidate.avatarUrl} alt={candidate.name} className="w-9 h-9 rounded-full mr-3 bg-slate-200 object-contain p-1" />
                      <div>
                        <p className="font-medium text-sm text-brand-charcoal dark:text-white">{candidate.name}</p>
                        <p className="text-xs text-brand-gray-dark dark:text-slate-300">{candidate.email}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchQuery.length > 1 && searchResults.length === 0 && (
             <div className="absolute mt-2 w-full bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-20 p-4 text-center text-sm text-brand-gray-dark dark:text-slate-300">
                No candidates found.
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            title={state.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {state.theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
        <div className="relative" ref={notificationsRef}>
            <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors relative"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"></span>
                )}
            </button>
            <NotificationCenter 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)}
                setView={setView}
            />
        </div>
        <button
          id="header-add-candidate"
          onClick={onAddCandidateClick}
          className="flex items-center bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Candidate
        </button>
      </div>
    </header>
  );
};

export default Header;
