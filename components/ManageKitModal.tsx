
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Candidate, KitItemType, AssignedKitItem } from '../types';
import { PlusIcon } from './icons';

interface ManageKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

const essentialKitItems = [
    KitItemType.TRADE_PLATES,
    KitItemType.TABLET,
    KitItemType.DASHCAM,
    KitItemType.FUEL_CARD,
    KitItemType.ID_CARD_LANYARD,
];

const clothingItems = [
    KitItemType.POLO_SHIRT,
    KitItemType.JACKET,
    KitItemType.HI_VIS
];

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

const formatKitItemName = (item: KitItemType) => {
    switch(item) {
        case KitItemType.HI_VIS: return 'Hi-Vis Vest';
        case KitItemType.ID_CARD_LANYARD: return 'ID Card & Lanyard';
        case KitItemType.FUEL_CARD: return 'Fuel Card';
        case KitItemType.TRADE_PLATES: return 'Trade Plates';
        case KitItemType.POLO_SHIRT: return 'Polo Shirt';
        case KitItemType.DASHCAM: return 'Dash Cam';
        case KitItemType.JACKET: return 'Jacket';
        case KitItemType.TABLET: return 'Tablet';
        default: return item;
    }
}

// Icon for minus since it's not in the main icon export
const MinusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
);

const ManageKitModal: React.FC<ManageKitModalProps> = ({ isOpen, onClose, candidate }) => {
    const { dispatch } = useAppContext();
    
    // Essential kit is simple boolean state for selection
    const [selectedEssentials, setSelectedEssentials] = useState<Set<KitItemType>>(new Set());
    
    // State to store details like numbers/IMEI for essentials
    const [essentialDetails, setEssentialDetails] = useState<Partial<Record<KitItemType, Partial<AssignedKitItem>>>>({});

    // Uniform is tracked by ItemType -> Size -> Quantity
    const [uniformQuantities, setUniformQuantities] = useState<Record<string, Record<string, number>>>({});

    useEffect(() => {
        if (candidate?.assignedKit && isOpen) {
            // 1. Load Essentials
            const essentials = new Set<KitItemType>();
            const details: Partial<Record<KitItemType, Partial<AssignedKitItem>>> = {};

            candidate.assignedKit.forEach(item => {
                if (essentialKitItems.includes(item.type)) {
                    essentials.add(item.type);
                    // Load existing details
                    details[item.type] = {
                        plateNumber: item.plateNumber || '',
                        fuelCardNumber: item.fuelCardNumber || '',
                        tabletImei: item.tabletImei || '',
                        simNumber: item.simNumber || '',
                        simProvider: item.simProvider || 'O2',
                    };
                }
            });
            setSelectedEssentials(essentials);
            setEssentialDetails(details);

            // 2. Load Uniform Quantities
            const quantities: Record<string, Record<string, number>> = {};
            
            // Initialize structure
            clothingItems.forEach(type => {
                quantities[type] = {};
                availableSizes.forEach(size => {
                    quantities[type][size] = 0;
                });
            });

            // Count existing items
            candidate.assignedKit.forEach(item => {
                if (clothingItems.includes(item.type) && item.size) {
                    if (!quantities[item.type]) quantities[item.type] = {};
                    const currentQty = quantities[item.type][item.size] || 0;
                    quantities[item.type][item.size] = currentQty + 1;
                }
            });
            
            setUniformQuantities(quantities);
        } else if (isOpen) {
            // Reset if no candidate or fresh open
            setSelectedEssentials(new Set());
            setEssentialDetails({});
            const quantities: Record<string, Record<string, number>> = {};
            clothingItems.forEach(type => {
                quantities[type] = {};
            });
            setUniformQuantities(quantities);
        }
    }, [candidate, isOpen]);

    const handleEssentialToggle = (item: KitItemType) => {
        setSelectedEssentials(prev => {
            const newSet = new Set(prev);
            if (newSet.has(item)) {
                newSet.delete(item);
            } else {
                newSet.add(item);
                // Initialize details if empty
                if (!essentialDetails[item]) {
                    setEssentialDetails(prevDetails => ({
                        ...prevDetails,
                        [item]: { simProvider: 'O2' } // Default value
                    }));
                }
            }
            return newSet;
        });
    };

    const handleDetailChange = (type: KitItemType, field: keyof AssignedKitItem, value: string) => {
        setEssentialDetails(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleQuantityChange = (type: KitItemType, size: string, delta: number) => {
        setUniformQuantities(prev => {
            const typeState = { ...prev[type] };
            const currentQty = typeState[size] || 0;
            const newQty = Math.max(0, currentQty + delta);
            
            return {
                ...prev,
                [type]: {
                    ...typeState,
                    [size]: newQty
                }
            };
        });
    };

    const handleSaveChanges = () => {
        const kitToSave: Partial<AssignedKitItem>[] = [];

        // Add Essentials with details
        selectedEssentials.forEach(type => {
            const details = essentialDetails[type] || {};
            kitToSave.push({ 
                type,
                ...details
            });
        });

        // Add Uniforms (Explode quantities into individual items)
        Object.entries(uniformQuantities).forEach(([type, sizes]) => {
            Object.entries(sizes).forEach(([size, qty]) => {
                for (let i = 0; i < qty; i++) {
                    kitToSave.push({ 
                        type: type as KitItemType, 
                        size 
                    });
                }
            });
        });

        dispatch({
            type: 'UPDATE_CANDIDATE_KIT',
            payload: {
                candidateId: candidate.id,
                kit: kitToSave,
            }
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Kit for ${candidate.name}`}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                
                {/* Section 1: Essential Kit */}
                <div>
                    <h3 className="text-sm font-semibold text-brand-charcoal uppercase tracking-wider mb-3">Essential Equipment</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {essentialKitItems.map(item => {
                            const isSelected = selectedEssentials.has(item);
                            const details = essentialDetails[item] || {};

                            return (
                                <div key={item} className={`border rounded-lg transition-colors ${isSelected ? 'bg-white border-brand-accent shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
                                    <label className="flex items-center p-3 cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleEssentialToggle(item)}
                                            className="h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                                        />
                                        <span className={`ml-3 text-sm font-medium ${isSelected ? 'text-brand-charcoal' : 'text-slate-500'}`}>{formatKitItemName(item)}</span>
                                    </label>
                                    
                                    {/* Collapsible Details Section */}
                                    {isSelected && (
                                        <div className="px-3 pb-3 pl-10 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                            {item === KitItemType.TRADE_PLATES && (
                                                <div>
                                                    <label className="block text-xs font-medium text-brand-gray-dark mb-1">Plate Number</label>
                                                    <input 
                                                        type="text" 
                                                        value={details.plateNumber || ''} 
                                                        onChange={e => handleDetailChange(item, 'plateNumber', e.target.value)}
                                                        placeholder="e.g. 12345"
                                                        className="w-full text-sm rounded border-slate-300 focus:border-brand-accent focus:ring-brand-accent"
                                                    />
                                                </div>
                                            )}
                                            {item === KitItemType.FUEL_CARD && (
                                                <div>
                                                    <label className="block text-xs font-medium text-brand-gray-dark mb-1">Last 4 Digits</label>
                                                    <input 
                                                        type="text" 
                                                        maxLength={4}
                                                        value={details.fuelCardNumber || ''} 
                                                        onChange={e => handleDetailChange(item, 'fuelCardNumber', e.target.value)}
                                                        placeholder="e.g. 9876"
                                                        className="w-full text-sm rounded border-slate-300 focus:border-brand-accent focus:ring-brand-accent"
                                                    />
                                                </div>
                                            )}
                                            {item === KitItemType.TABLET && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs font-medium text-brand-gray-dark mb-1">Tablet IMEI</label>
                                                        <input 
                                                            type="text" 
                                                            value={details.tabletImei || ''} 
                                                            onChange={e => handleDetailChange(item, 'tabletImei', e.target.value)}
                                                            className="w-full text-sm rounded border-slate-300 focus:border-brand-accent focus:ring-brand-accent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-brand-gray-dark mb-1">SIM Number</label>
                                                        <input 
                                                            type="text" 
                                                            value={details.simNumber || ''} 
                                                            onChange={e => handleDetailChange(item, 'simNumber', e.target.value)}
                                                            className="w-full text-sm rounded border-slate-300 focus:border-brand-accent focus:ring-brand-accent"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-brand-gray-dark mb-1">SIM Provider</label>
                                                        <select 
                                                            value={details.simProvider || 'O2'} 
                                                            onChange={e => handleDetailChange(item, 'simProvider', e.target.value)}
                                                            className="w-full text-sm rounded border-slate-300 focus:border-brand-accent focus:ring-brand-accent"
                                                        >
                                                            <option value="O2">O2</option>
                                                            <option value="Vodafone">Vodafone</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 2: Uniforms with Quantities */}
                <div>
                    <h3 className="text-sm font-semibold text-brand-charcoal uppercase tracking-wider mb-3">Uniform & Clothing</h3>
                    <div className="space-y-4">
                        {clothingItems.map(type => (
                            <div key={type} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <h4 className="font-medium text-brand-charcoal mb-3">{formatKitItemName(type)}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {availableSizes.map(size => {
                                        const qty = uniformQuantities[type]?.[size] || 0;
                                        return (
                                            <div key={size} className={`flex flex-col items-center p-2 rounded border ${qty > 0 ? 'bg-white border-brand-accent shadow-sm' : 'border-slate-200'}`}>
                                                <span className="text-xs font-semibold text-brand-gray-dark mb-2">{size}</span>
                                                <div className="flex items-center space-x-2">
                                                    <button 
                                                        onClick={() => handleQuantityChange(type, size, -1)}
                                                        className={`p-1 rounded-full ${qty > 0 ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-100 text-slate-300 cursor-default'}`}
                                                        disabled={qty === 0}
                                                    >
                                                        <MinusIcon className="w-3 h-3" />
                                                    </button>
                                                    <span className={`text-sm font-bold w-4 text-center ${qty > 0 ? 'text-brand-charcoal' : 'text-slate-400'}`}>{qty}</span>
                                                    <button 
                                                        onClick={() => handleQuantityChange(type, size, 1)}
                                                        className="p-1 rounded-full bg-brand-plum/10 text-brand-plum hover:bg-brand-plum/20"
                                                    >
                                                        <PlusIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-4">
                <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                <button onClick={handleSaveChanges} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                    Save Changes
                </button>
            </div>
        </Modal>
    );
};

export default ManageKitModal;
