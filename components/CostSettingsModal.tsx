


import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { CostSettings } from '../types';

interface CostSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CostSettingsModal: React.FC<CostSettingsModalProps> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useAppContext();
    const [settings, setSettings] = useState<CostSettings>(state.costSettings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'UPDATE_COST_SETTINGS', payload: settings });
        onClose();
        alert('Cost settings updated successfully.');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cost Management">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Provider Fees */}
                <div>
                    <h3 className="text-lg font-semibold text-brand-charcoal mb-3 border-b border-slate-200 pb-2">TPJ Provider Fees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tpjInductionFee" className="block text-sm font-medium text-brand-gray-dark">Induction Fee (£)</label>
                            <input type="number" name="tpjInductionFee" id="tpjInductionFee" value={settings.tpjInductionFee} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="tpjFinalFee" className="block text-sm font-medium text-brand-gray-dark">Final Fee (£)</label>
                            <input type="number" name="tpjFinalFee" id="tpjFinalFee" value={settings.tpjFinalFee} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Termination / Replacement Charges */}
                <div>
                    <h3 className="text-lg font-semibold text-brand-charcoal mb-3 border-b border-slate-200 pb-2">Termination & Replacement Charges</h3>
                    <p className="text-sm text-brand-gray-dark mb-4">Values used for penalties or lost equipment charges deducted from final payments.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                             <label htmlFor="kitTradePlates" className="block text-sm font-medium text-brand-charcoal">Trade Plates (Missing) (£)</label>
                             <input type="number" name="kitTradePlates" id="kitTradePlates" value={settings.kitTradePlates} onChange={handleChange} className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm" />
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                             <label htmlFor="kitTradePlatesDamaged" className="block text-sm font-medium text-brand-charcoal">Trade Plates (Damaged) (£)</label>
                             <input type="number" name="kitTradePlatesDamaged" id="kitTradePlatesDamaged" value={settings.kitTradePlatesDamaged} onChange={handleChange} className="mt-1 block w-full rounded-md border-orange-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                        </div>
                        <div>
                             <label htmlFor="kitUniform" className="block text-sm font-medium text-brand-gray-dark">Uniform (Full Replacement) (£)</label>
                             <input type="number" name="kitUniform" id="kitUniform" value={settings.kitUniform} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="kitTablet" className="block text-sm font-medium text-brand-gray-dark">Tablet, Charger & Case (£)</label>
                            <input type="number" name="kitTablet" id="kitTablet" value={settings.kitTablet} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="kitDashCam" className="block text-sm font-medium text-brand-gray-dark">Dash Cam Kit (£)</label>
                            <input type="number" name="kitDashCam" id="kitDashCam" value={settings.kitDashCam} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                             <label htmlFor="kitFuelCard" className="block text-sm font-medium text-brand-gray-dark">Fuel Card (Missing) (£)</label>
                             <input type="number" name="kitFuelCard" id="kitFuelCard" value={settings.kitFuelCard} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                             <label htmlFor="kitLanyard" className="block text-sm font-medium text-brand-gray-dark">Lanyard & ID (£)</label>
                             <input type="number" name="kitLanyard" id="kitLanyard" value={settings.kitLanyard} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Individual Kit Issue Values */}
                <div>
                    <h3 className="text-lg font-semibold text-brand-charcoal mb-3 border-b border-slate-200 pb-2">Individual Kit Issue Values</h3>
                    <p className="text-sm text-brand-gray-dark mb-4">Base costs for individual items (if charged separately).</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="kitPoloShirt" className="block text-sm font-medium text-brand-gray-dark">Polo Shirt (£)</label>
                            <input type="number" name="kitPoloShirt" id="kitPoloShirt" value={settings.kitPoloShirt} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="kitJacket" className="block text-sm font-medium text-brand-gray-dark">Jacket (£)</label>
                            <input type="number" name="kitJacket" id="kitJacket" value={settings.kitJacket} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="kitHiVis" className="block text-sm font-medium text-brand-gray-dark">Hi-Vis Vest (£)</label>
                            <input type="number" name="kitHiVis" id="kitHiVis" value={settings.kitHiVis} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="insurance" className="block text-sm font-medium text-brand-gray-dark">Insurance Cost (£)</label>
                            <input type="number" name="insurance" id="insurance" value={settings.insurance} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                    </div>
                </div>

                 {/* Section 4: Recurring */}
                <div>
                    <h3 className="text-lg font-semibold text-brand-charcoal mb-3 border-b border-slate-200 pb-2">Recurring Costs</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="kitTradePlatesYearly" className="block text-sm font-medium text-brand-gray-dark">Trade Plates (Per Year) (£)</label>
                            <input type="number" name="kitTradePlatesYearly" id="kitTradePlatesYearly" value={settings.kitTradePlatesYearly} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="kitFuelCardWeekly" className="block text-sm font-medium text-brand-gray-dark">Fuel Card (Per Week) (£)</label>
                            <input type="number" name="kitFuelCardWeekly" id="kitFuelCardWeekly" value={settings.kitFuelCardWeekly} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Save All Costs</button>
                </div>
            </form>
        </Modal>
    );
};

export default CostSettingsModal;
