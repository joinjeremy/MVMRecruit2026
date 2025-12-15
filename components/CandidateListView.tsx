
import React, { useState, useMemo, useEffect } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import { formatReferralSource } from '../utils/helpers';
import BulkEmailModal from './BulkEmailModal';
import CandidateMapView from './CandidateMapView';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, ChevronDownIcon, ListIcon, MapIcon } from './icons';

interface CandidateListViewProps {
    setView: (view: 'candidate-detail') => void;
}

const getStatusClass = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.HIRED: return 'bg-green-100 text-green-800';
      case CandidateStatus.INDUCTION: return 'bg-blue-100 text-blue-800';
      case CandidateStatus.VIDEO_INTERVIEW: return 'bg-yellow-100 text-yellow-800';
      case CandidateStatus.SCREENING: return 'bg-purple-100 text-purple-800';
      case CandidateStatus.NEW: return 'bg-slate-200 text-slate-800';
      case CandidateStatus.REJECTED: return 'bg-red-100 text-red-800';
      case CandidateStatus.TERMINATED: return 'bg-gray-200 text-gray-800';
      case CandidateStatus.WITHDRAWN: return 'bg-orange-100 text-orange-800';
      case CandidateStatus.LEGACY: return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-800';
    }
};

const CandidateRow: React.FC<{ 
    candidate: Candidate; 
    onSelect: (candidate: Candidate) => void;
    isSelected: boolean;
    onToggleSelection: (candidateId: string) => void;
}> = ({ candidate, onSelect, isSelected, onToggleSelection }) => (
    <tr className={`border-b border-slate-200 dark:border-slate-700 ${isSelected ? 'bg-brand-accent/10 dark:bg-brand-accent/20' : 'hover:bg-brand-light/50 dark:hover:bg-slate-800'} transition-colors`}>
        <td className="p-4 w-4">
             <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand-accent focus:ring-brand-accent"
                checked={isSelected}
                onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelection(candidate.id);
                }}
             />
        </td>
        <td className="p-4 whitespace-nowrap cursor-pointer" onClick={() => onSelect(candidate)}>
            <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 object-contain p-1" src={candidate.avatarUrl} alt={candidate.name} />
                </div>
                <div className="ml-4">
                    <div className="text-sm font-medium text-brand-charcoal dark:text-white">{candidate.name}</div>
                    <div className="text-sm text-brand-gray-dark dark:text-slate-400">{candidate.email}</div>
                </div>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap cursor-pointer" onClick={() => onSelect(candidate)}>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(candidate.status)}`}>
                {candidate.status}
            </span>
        </td>
        <td className="p-4 whitespace-nowrap text-sm text-brand-gray-dark dark:text-slate-400 cursor-pointer" onClick={() => onSelect(candidate)}>{candidate.phone}</td>
        <td className="p-4 whitespace-nowrap text-sm text-brand-gray-dark dark:text-slate-400 cursor-pointer" onClick={() => onSelect(candidate)}>{formatReferralSource(candidate.referralSource)}</td>
        <td className="p-4 whitespace-nowrap text-sm text-brand-gray-dark dark:text-slate-400 cursor-pointer" onClick={() => onSelect(candidate)}>{new Date(candidate.lastContact).toLocaleDateString('en-GB')}</td>
    </tr>
);

type SortableColumn = 'name' | 'status' | 'lastContact' | 'referralSource';

const SortableHeader: React.FC<{
    column: SortableColumn;
    title: string;
    sortColumn: SortableColumn | null;
    sortDirection: 'asc' | 'desc';
    onSort: (column: SortableColumn) => void;
}> = ({ column, title, sortColumn, sortDirection, onSort }) => {
    const isActive = column === sortColumn;
    return (
        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-brand-gray-dark dark:text-slate-400 uppercase tracking-wider cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onClick={() => onSort(column)}>
            <div className="flex items-center space-x-1">
                <span>{title}</span>
                <span className={`transition-all duration-200 flex-shrink-0 ${isActive ? 'opacity-100 text-brand-accent' : 'opacity-0 group-hover:opacity-50 text-slate-400'}`}>
                    <ChevronDownIcon className={`w-4 h-4 transform ${isActive && sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                </span>
            </div>
        </th>
    );
};


const CandidateListView: React.FC<CandidateListViewProps> = ({ setView }) => {
    const { state, dispatch } = useAppContext();
    const { candidates } = state;
    
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Filtering & Sorting State
    const [sortColumn, setSortColumn] = useState<SortableColumn | null>('lastContact');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [referralFilter, setReferralFilter] = useState('');
    
    // Advanced Filters
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [skillSearch, setSkillSearch] = useState('');
    const [regionSearch, setRegionSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);

    const handleSelectCandidate = (candidate: Candidate) => {
        dispatch({ type: 'SELECT_CANDIDATE', payload: candidate });
        setView('candidate-detail');
    };

    const handleSort = (column: SortableColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const referralSources = useMemo(() => [...new Set(candidates.map(c => c.referralSource?.type).filter(Boolean))], [candidates]) as string[];

    const filteredAndSortedCandidates = useMemo(() => {
        let filtered = [...candidates];

        // Status Filter Logic
        if (statusFilter === 'All') {
            // Show all including Legacy
        } else if (statusFilter) {
            filtered = filtered.filter(c => c.status === statusFilter);
        } else {
            // Default behavior: Exclude Legacy candidates unless specifically filtered
            filtered = filtered.filter(c => c.status !== CandidateStatus.LEGACY);
        }

        if (referralFilter) {
            filtered = filtered.filter(c => c.referralSource?.type === referralFilter);
        }
        
        // Advanced Filters
        if (skillSearch) {
            const lowerSkill = skillSearch.toLowerCase();
            filtered = filtered.filter(c => c.keySkills?.some(s => s.toLowerCase().includes(lowerSkill)));
        }
        if (regionSearch) {
            const lowerRegion = regionSearch.toLowerCase();
            filtered = filtered.filter(c => 
                (c.postcode && c.postcode.toLowerCase().includes(lowerRegion)) ||
                (c.address && c.address.toLowerCase().includes(lowerRegion))
            );
        }
        if (dateFrom) {
            filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(dateFrom));
        }
        if (dateTo) {
            // Set dateTo to end of day
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(c => new Date(c.createdAt) <= endDate);
        }

        if (sortColumn) {
            filtered.sort((a, b) => {
                let comparison = 0;
                if (sortColumn === 'lastContact') {
                    comparison = new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
                } else if (sortColumn === 'referralSource') {
                    const valA = a.referralSource?.type || '';
                    const valB = b.referralSource?.type || '';
                    comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
                }
                else {
                    const valA = a[sortColumn as 'name' | 'status'] || '';
                    const valB = b[sortColumn as 'name' | 'status'] || '';
                    comparison = (valA as string).localeCompare(valB as string, undefined, { sensitivity: 'base' });
                }
                
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }
        return filtered;
    }, [candidates, sortColumn, sortDirection, statusFilter, referralFilter, skillSearch, regionSearch, dateFrom, dateTo]);
    
    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedCandidates.length / itemsPerPage);
    const paginatedCandidates = filteredAndSortedCandidates.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setSelectedIds(new Set());
    }, [statusFilter, referralFilter, skillSearch, regionSearch]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, referralFilter, skillSearch, regionSearch, dateFrom, dateTo, itemsPerPage]);
    
    const handleToggleSelection = (candidateId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(candidateId)) {
                newSet.delete(candidateId);
            } else {
                newSet.add(candidateId);
            }
            return newSet;
        });
    };
    
    const handleToggleSelectAll = () => {
        if (selectedIds.size === paginatedCandidates.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedCandidates.map(c => c.id)));
        }
    };

    const handleBulkStatusChange = (status: CandidateStatus) => {
        dispatch({
            type: 'BULK_UPDATE_CANDIDATE_STATUS',
            payload: { candidateIds: Array.from(selectedIds), status },
        });
        setSelectedIds(new Set());
    };
    
    const isAllSelected = paginatedCandidates.length > 0 && selectedIds.size === paginatedCandidates.length;

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white">Candidates</h1>
                            <p className="text-brand-gray-dark dark:text-slate-400 mt-1">Manage and track all applicants.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center">
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow text-brand-accent' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('map')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-600 shadow text-brand-accent' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <MapIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
                                className={`flex items-center text-sm font-medium transition-colors ${showAdvancedFilters ? 'text-brand-accent' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Filters <ChevronDownIcon className={`ml-1 w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}/>
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                                <option value="">Active Candidates (Legacy Hidden)</option>
                                <option value="All">All Statuses (Include Legacy)</option>
                                {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="referral-filter" className="sr-only">Filter by referral source</label>
                            <select id="referral-filter" value={referralFilter} onChange={e => setReferralFilter(e.target.value)} className="form-select w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                                <option value="">All Referral Sources</option>
                                {referralSources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {showAdvancedFilters && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4 border border-slate-200 dark:border-slate-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-medium text-brand-gray-dark dark:text-slate-300 mb-1">Search Skills</label>
                                <div className="relative">
                                    <SearchIcon className="w-4 h-4 text-slate-400 absolute top-2.5 left-2" />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Driving, Customer Service" 
                                        value={skillSearch}
                                        onChange={e => setSkillSearch(e.target.value)}
                                        className="pl-8 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-brand-gray-dark dark:text-slate-300 mb-1">Region / Postcode</label>
                                <div className="relative">
                                    <MapIcon className="w-4 h-4 text-slate-400 absolute top-2.5 left-2" />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. London, LE2, M1" 
                                        value={regionSearch}
                                        onChange={e => setRegionSearch(e.target.value)}
                                        className="pl-8 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-brand-gray-dark dark:text-slate-300 mb-1">Date Added (From)</label>
                                <input 
                                    type="date" 
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-brand-gray-dark dark:text-slate-300 mb-1">Date Added (To)</label>
                                <input 
                                    type="date" 
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {viewMode === 'map' ? (
                    <div className="flex-1 p-4">
                        <CandidateMapView 
                            candidates={filteredAndSortedCandidates} 
                            onSelect={handleSelectCandidate} 
                        />
                    </div>
                ) : (
                    <>
                        {selectedIds.size > 0 && (
                            <div className="bg-brand-accent/10 px-6 py-2 border-y border-brand-accent/20 flex items-center justify-between flex-wrap gap-4">
                                <p className="text-sm font-medium text-brand-accent">{selectedIds.size} candidate(s) selected</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="bulk-status" className="text-sm font-medium text-brand-charcoal dark:text-slate-200">Change status to:</label>
                                        <select
                                            id="bulk-status"
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (value) handleBulkStatusChange(value as CandidateStatus);
                                                e.target.value = '';
                                            }}
                                            className="form-select rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm py-1"
                                        >
                                            <option value="">Select status...</option>
                                            {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setIsBulkEmailModalOpen(true)}
                                        className="bg-brand-plum text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-opacity-90 transition-colors"
                                    >
                                        Send Bulk Email
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-brand-light dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th scope="col" className="p-4 w-4 bg-brand-light dark:bg-slate-800">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand-accent focus:ring-brand-accent"
                                                checked={isAllSelected}
                                                onChange={handleToggleSelectAll}
                                            />
                                        </th>
                                        <SortableHeader column="name" title="Name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                                        <SortableHeader column="status" title="Status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-brand-gray-dark dark:text-slate-400 uppercase tracking-wider bg-brand-light dark:bg-slate-800">Phone</th>
                                        <SortableHeader column="referralSource" title="Referral Source" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                                        <SortableHeader column="lastContact" title="Last Contact" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {paginatedCandidates.length > 0 ? (
                                        paginatedCandidates.map(candidate => (
                                            <CandidateRow 
                                                key={candidate.id} 
                                                candidate={candidate} 
                                                onSelect={handleSelectCandidate}
                                                isSelected={selectedIds.has(candidate.id)}
                                                onToggleSelection={handleToggleSelection}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-sm text-brand-gray-dark dark:text-slate-400">
                                                No candidates found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="bg-white dark:bg-slate-800 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-brand-gray-dark dark:text-slate-400">
                                        Showing <span className="font-medium">{filteredAndSortedCandidates.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedCandidates.length)}</span> of <span className="font-medium">{filteredAndSortedCandidates.length}</span> results
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select 
                                        value={itemsPerPage} 
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="form-select rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm py-1"
                                    >
                                        <option value={10}>10 per page</option>
                                        <option value={20}>20 per page</option>
                                        <option value={50}>50 per page</option>
                                    </select>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-brand-plum border-brand-plum text-white' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <BulkEmailModal
                isOpen={isBulkEmailModalOpen}
                onClose={() => setIsBulkEmailModalOpen(false)}
                recipientIds={Array.from(selectedIds)}
                onSent={() => setSelectedIds(new Set())}
            />
        </>
    );
};

export default CandidateListView;
