import React from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { CsvPreviewData, Candidate } from '../types';

const CsvPreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; previewData: CsvPreviewData }> = ({ isOpen, onClose, previewData }) => {
    const { dispatch } = useAppContext();

    const handleConfirmImport = () => {
        dispatch({ type: 'ADD_CANDIDATES', payload: previewData.newCandidates });
        onClose();
    };

    const totalRecords = previewData.newCandidates.length + previewData.duplicateCandidates.length + previewData.invalidRows.length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="CSV Import Preview">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-brand-charcoal">Import Summary</h3>
                    <p className="text-brand-gray-dark">Please review the data before importing. Only new, valid candidates will be added.</p>
                    <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                        <div className="p-4 bg-slate-100 rounded-lg">
                            <p className="text-2xl font-bold text-brand-charcoal">{totalRecords}</p>
                            <p className="text-sm font-medium text-brand-gray-dark">Total Rows</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-lg">
                            <p className="text-2xl font-bold text-green-800">{previewData.newCandidates.length}</p>
                            <p className="text-sm font-medium text-green-700">New Candidates</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-800">{previewData.duplicateCandidates.length}</p>
                            <p className="text-sm font-medium text-yellow-700">Duplicates (Skipped)</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded-lg">
                            <p className="text-2xl font-bold text-red-800">{previewData.invalidRows.length}</p>
                            <p className="text-sm font-medium text-red-700">Invalid Rows</p>
                        </div>
                    </div>
                </div>

                {previewData.newCandidates.length > 0 && (
                     <div>
                        <h3 className="text-lg font-semibold text-brand-charcoal mb-2">New Candidates to be Imported</h3>
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                             <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50"><tr><th className="p-2 text-left text-sm">Name</th><th className="p-2 text-left text-sm">Email</th></tr></thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {previewData.newCandidates.map((c, i) => <tr key={i}>
                                        <td className="p-2 text-sm">{c.name}</td><td className="p-2 text-sm">{c.email}</td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
               
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                    <button onClick={handleConfirmImport} disabled={previewData.newCandidates.length === 0} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:bg-opacity-50">
                        Confirm & Import {previewData.newCandidates.length} Candidates
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CsvPreviewModal;
