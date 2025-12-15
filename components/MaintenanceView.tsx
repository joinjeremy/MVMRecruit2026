
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Candidate, CandidateStatus, ReferralSource, ReferralSourceType, Template, CsvPreviewData } from '../types';
import { UploadIcon, DownloadIcon, DocumentDuplicateIcon, PencilSquareIcon, PlusIcon, XMarkIcon, BanknotesIcon } from './icons';
import CsvPreviewModal from './CsvPreviewModal';
import MergeDuplicatesModal from './MergeDuplicatesModal';
import TemplateEditorModal from './TemplateEditorModal';
import CostSettingsModal from './CostSettingsModal';

const CsvImporter: React.FC<{ onPreview: (data: CsvPreviewData) => void }> = ({ onPreview }) => {
    const { state } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setMessage('');

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const rows = text.split('\n').filter(row => row.trim() !== '');
                if (rows.length < 2) throw new Error("CSV file is empty or has no data rows.");

                const header = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const requiredHeaders = ['Name', 'Own phone or recruiter number', 'Postcode', 'Referral source', 'Application status', 'Own email'];
                const headerIndices: { [key: string]: number } = {};
                requiredHeaders.forEach(reqHeader => {
                    const index = header.findIndex(h => h.toLowerCase() === reqHeader.toLowerCase());
                    if (index === -1) throw new Error(`Missing required header: ${reqHeader}`);
                    headerIndices[reqHeader] = index;
                });

                const existingEmails = new Set(state.candidates.map(c => c.email.toLowerCase().trim()));
                const previewData: CsvPreviewData = { newCandidates: [], duplicateCandidates: [], invalidRows: [] };

                rows.slice(1).forEach((rowStr, index) => {
                    // Simple split by comma (note: does not handle commas inside quotes standardly, but sufficient for this context if no address commas)
                    const values = rowStr.split(',').map(v => v.trim().replace(/"/g, ''));
                    
                    // Safety check for row length
                    if (values.length < requiredHeaders.length) {
                         // Skip empty or malformed rows without throwing
                         return;
                    }

                    const name = values[headerIndices['Name']];
                    const email = values[headerIndices['Own email']] || '';

                    if (!name || !email) {
                        previewData.invalidRows.push({ row: index + 2, data: values, reason: 'Missing name or email' });
                        return;
                    }
                    
                    const referralString = values[headerIndices['Referral source']];
                    let referralSource: ReferralSource | undefined;
                    if (referralString) {
                         const lowerReferralString = referralString.toLowerCase();
                        if (lowerReferralString.includes('tpj')) referralSource = { type: ReferralSourceType.TPJ };
                        else if (lowerReferralString.includes('website')) referralSource = { type: ReferralSourceType.WEBSITE };
                        else if (lowerReferralString.includes('cold call')) referralSource = { type: ReferralSourceType.COLD_CALL };
                        else referralSource = { type: ReferralSourceType.OTHER, detail: referralString };
                    }

                    const rawPostcode = values[headerIndices['Postcode']] || '';
                    // Aggressively remove any leading non-alphanumeric characters (dots, commas, spaces, bullets, BOMs)
                    // UK Postcodes always start with a letter.
                    const postcode = rawPostcode.replace(/^[^a-zA-Z0-9]+/, '').trim();

                    const candidateData: Candidate = {
                        id: `c-import-${Date.now()}-${index}`, name, email,
                        phone: values[headerIndices['Own phone or recruiter number']] || '',
                        status: CandidateStatus.LEGACY,
                        postcode: postcode,
                        referralSource,
                        lastContact: new Date().toISOString().split('T')[0],
                        createdAt: new Date().toISOString(),
                        notes: [], avatarUrl: 'https://mvm-ltd.co.uk/wp-content/themes/mvm-ltd/assets/images/mvm-logo.svg',
                        dateOfBirth: '', address: '', licensePoints: 0, offRoadParking: false
                    };

                    if (existingEmails.has(email.toLowerCase().trim())) {
                        previewData.duplicateCandidates.push(candidateData);
                    } else {
                        previewData.newCandidates.push(candidateData);
                    }
                });

                onPreview(previewData);

            } catch (error: any) {
                setMessage(`Error processing file: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-colors">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-brand-accent/10 rounded-full mr-4"><UploadIcon className="w-6 h-6 text-brand-accent"/></div>
                <div>
                    <h2 className="text-lg font-semibold text-brand-charcoal dark:text-white">Import Candidates via CSV</h2>
                    <p className="text-sm text-brand-gray-dark dark:text-slate-400">Preview and validate before importing.</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <label htmlFor="csv-upload" className="w-full text-center cursor-pointer bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Processing...' : 'Select CSV File'}
                </label>
                <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="sr-only" disabled={isLoading} />
                {message && <div className="mt-4 p-3 rounded-md text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 w-full">{message}</div>}
            </div>
        </div>
    );
};

const DataCleaning: React.FC<{ onFindDuplicates: () => void }> = ({ onFindDuplicates }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-colors">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-brand-accent/10 rounded-full mr-4"><DocumentDuplicateIcon className="w-6 h-6 text-brand-accent"/></div>
            <div>
                <h2 className="text-lg font-semibold text-brand-charcoal dark:text-white">Data Cleaning</h2>
                <p className="text-sm text-brand-gray-dark dark:text-slate-400">Find and merge duplicate candidates.</p>
            </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
            <button onClick={onFindDuplicates} className="w-full bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                Find & Merge Duplicates
            </button>
        </div>
    </div>
);

const TemplateManager: React.FC<{ onEditTemplate: (template?: Template) => void }> = ({ onEditTemplate }) => {
    const { state, dispatch } = useAppContext();
    const { templates } = state;

    const handleDelete = (templateId: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-brand-accent/10 rounded-full mr-4"><PencilSquareIcon className="w-6 h-6 text-brand-accent"/></div>
                    <div>
                        <h2 className="text-lg font-semibold text-brand-charcoal dark:text-white">Template Manager</h2>
                        <p className="text-sm text-brand-gray-dark dark:text-slate-400">Create and edit communication templates.</p>
                    </div>
                </div>
                <button onClick={() => onEditTemplate()} className="flex items-center bg-brand-plum text-white p-2 rounded-full text-sm font-medium hover:bg-opacity-90">
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                {templates.map(template => (
                    <div key={template.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-brand-charcoal dark:text-white">{template.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{template.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => onEditTemplate(template)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-brand-accent"><PencilSquareIcon className="w-5 h-5"/></button>
                             <button onClick={() => handleDelete(template.id)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500"><XMarkIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BackupAndRestore: React.FC = () => {
    const { state, dispatch } = useAppContext();
    
    const handleBackup = () => {
        const backupData = {
            candidates: state.candidates,
            events: state.events.map(e => ({...e, date: e.date.toISOString()})),
            tasks: state.tasks,
            templates: state.templates,
            costSettings: state.costSettings,
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recruithub_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("ARE YOU SURE?\nRestoring will overwrite all existing data.")) {
            e.target.value = ''; return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const restoredData = JSON.parse(event.target?.result as string);
            const eventsWithDateObjects = restoredData.events.map((e: any) => ({...e, date: new Date(e.date)}));
            dispatch({ type: 'RESTORE_STATE', payload: { ...restoredData, events: eventsWithDateObjects } });
            alert('Data restored successfully!');
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-colors">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-brand-accent/10 rounded-full mr-4"><DownloadIcon className="w-6 h-6 text-brand-accent" /></div>
                <div>
                    <h2 className="text-lg font-semibold text-brand-charcoal dark:text-white">Backup & Restore</h2>
                    <p className="text-sm text-brand-gray-dark dark:text-slate-400">Save or load your application data.</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
                <button onClick={handleBackup} className="w-full bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                    Download Full Backup
                </button>
                <div className="w-full">
                    <label htmlFor="restore-upload" className="w-full text-center cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 block">
                        Restore from Backup File
                    </label>
                    <input id="restore-upload" type="file" accept=".json" onChange={handleRestore} className="sr-only" />
                </div>
            </div>
        </div>
    );
};

const CostManager: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-colors">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-brand-accent/10 rounded-full mr-4"><BanknotesIcon className="w-6 h-6 text-brand-accent"/></div>
            <div>
                <h2 className="text-lg font-semibold text-brand-charcoal dark:text-white">Cost Settings</h2>
                <p className="text-sm text-brand-gray-dark dark:text-slate-400">Manage default costs for Kit and Provider Fees.</p>
            </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
            <button onClick={onOpenSettings} className="w-full bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                Manage Costs
            </button>
        </div>
    </div>
);

const MaintenanceView: React.FC = () => {
    const { state } = useAppContext();
    const [previewData, setPreviewData] = useState<CsvPreviewData | null>(null);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isCostSettingsModalOpen, setIsCostSettingsModalOpen] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState<Candidate[][]>([]);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null | undefined>(undefined);

    const findDuplicates = () => {
        const emailMap = new Map<string, Candidate[]>();
        state.candidates.forEach(candidate => {
            const email = candidate.email.toLowerCase().trim();
            if (!emailMap.has(email)) {
                emailMap.set(email, []);
            }
            emailMap.get(email)!.push(candidate);
        });

        const foundDuplicates = Array.from(emailMap.values()).filter(group => group.length > 1);
        setDuplicateGroups(foundDuplicates);
        setIsMergeModalOpen(true);
    };

    const handleEditTemplate = (template?: Template) => {
        setTemplateToEdit(template);
    }
    
    return (
        <>
            <div className="mb-6">
                 <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white">Maintenance</h1>
                 <p className="text-brand-gray-dark dark:text-slate-400 mt-1">Manage application data, including imports, backups, and restores.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                <CsvImporter onPreview={setPreviewData} />
                <BackupAndRestore />
                <DataCleaning onFindDuplicates={findDuplicates} />
                <TemplateManager onEditTemplate={handleEditTemplate} />
                <CostManager onOpenSettings={() => setIsCostSettingsModalOpen(true)} />
            </div>
            {previewData && (
                <CsvPreviewModal 
                    isOpen={!!previewData}
                    onClose={() => setPreviewData(null)}
                    previewData={previewData}
                />
            )}
            {isMergeModalOpen && (
                <MergeDuplicatesModal
                    isOpen={isMergeModalOpen}
                    onClose={() => setIsMergeModalOpen(false)}
                    duplicateGroups={duplicateGroups}
                />
            )}
            {templateToEdit !== undefined && (
                <TemplateEditorModal
                    isOpen={templateToEdit !== undefined}
                    onClose={() => setTemplateToEdit(undefined)}
                    template={templateToEdit}
                />
            )}
            {isCostSettingsModalOpen && (
                <CostSettingsModal
                    isOpen={isCostSettingsModalOpen}
                    onClose={() => setIsCostSettingsModalOpen(false)}
                />
            )}
        </>
    );
};

export default MaintenanceView;
