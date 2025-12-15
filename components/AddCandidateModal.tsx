
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Candidate, CandidateStatus, ReferralSourceType, ReferralSource, Note, PaymentStatus, CostPart } from '../types';
import { UploadIcon, DocumentTextIcon, XMarkIcon, SparklesIcon, ArrowPathIcon } from './icons';
import { parseCvWithAI } from '../services/geminiService';
import { MVM_LOGO_URL } from '../utils/helpers';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const getMimeType = (file: File): string => {
    if (file.type) return file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch(extension) {
        case 'pdf': return 'application/pdf';
        case 'txt': return 'text/plain';
        case 'jpg': case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'doc': return 'application/msword';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default: return '';
    }
};

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    postcode: '',
    licensePoints: 0,
    offRoadParking: false,
    referralSourceType: '',
    referralSourceDetail: '',
    costInduction: '',
    costFinal: '',
    costProvider: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [aiSummary, setAiSummary] = useState<{ skills: string[], synopsis: string } | null>(null);

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', dateOfBirth: '', address: '', postcode: '', licensePoints: 0, offRoadParking: false, referralSourceType: '', referralSourceDetail: '', costInduction: '', costFinal: '', costProvider: '',
    });
    setCvFile(null);
    setParseError('');
    setIsParsing(false);
    setAiSummary(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Auto-fill costs when TPJ is selected
  useEffect(() => {
      if (formData.referralSourceType === ReferralSourceType.TPJ) {
          setFormData(prev => ({
              ...prev,
              costInduction: state.costSettings.tpjInductionFee.toString(),
              costFinal: state.costSettings.tpjFinalFee.toString()
          }));
      }
  }, [formData.referralSourceType, state.costSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(entering);
  };
  
  const processCvFile = async (file: File) => {
    setCvFile(file);
    setIsParsing(true);
    setParseError('');
    setAiSummary(null);
    try {
        const fileData = await fileToBase64(file);
        
        const mimeType = getMimeType(file);
        
        if (!mimeType) {
             throw new Error("Could not determine file type. Please upload a PDF.");
        }
        
        // Gemini Inline Data supports PDF, text, and images, but usually not raw Word docs.
        if (mimeType.includes('word') || mimeType.includes('officedocument') || mimeType === 'application/msword') {
             throw new Error("Word documents cannot be auto-parsed by AI. Please save as PDF and re-upload, or fill details manually.");
        }

        const parsedData = await parseCvWithAI(fileData, mimeType);
        setFormData(prev => ({
            ...prev,
            name: parsedData.name || prev.name,
            email: parsedData.email || prev.email,
            phone: parsedData.phone || prev.phone,
            address: parsedData.address ? parsedData.address.split(',')[0].trim() : prev.address,
            postcode: parsedData.address ? parsedData.address.split(',').pop()?.trim() : prev.postcode,
        }));

        if (parsedData.skills && parsedData.synopsis) {
            setAiSummary({ skills: parsedData.skills, synopsis: parsedData.synopsis });
        }

    } catch (error: any) {
        console.error(error);
        setParseError(error.message || "Could not automatically parse CV. Please fill in the details manually.");
    } finally {
        setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || (!formData.email.trim() && !formData.phone.trim())) {
        alert('A name and a telephone number or email is required to save a candidate.');
        return;
    }

    const referralSource: ReferralSource | undefined = formData.referralSourceType
        ? {
            type: formData.referralSourceType as ReferralSourceType,
            detail: formData.referralSourceDetail,
          }
        : undefined;

    let providerCost: CostPart[] = [];
    if (formData.referralSourceType === ReferralSourceType.TPJ) {
        if (formData.costInduction) {
             const amount = parseFloat(formData.costInduction);
             if(!isNaN(amount)) {
                providerCost.push({ id: `cp-ind-${Date.now()}`, type: 'Induction Fee', amount, status: PaymentStatus.UNPAID });
             }
        }
        if (formData.costFinal) {
             const amount = parseFloat(formData.costFinal);
             if(!isNaN(amount)) {
                providerCost.push({ id: `cp-fin-${Date.now()}`, type: 'Final Fee', amount, status: PaymentStatus.UNPAID });
             }
        }
    } else if (formData.referralSourceType === ReferralSourceType.STPJ && formData.costProvider) {
        const amount = parseFloat(formData.costProvider);
        if(!isNaN(amount)) {
            providerCost.push({ id: `cp-prov-${Date.now()}`, type: 'Provider Fee', amount, status: PaymentStatus.UNPAID });
        }
    }

    const newCandidate: Candidate = {
      ...formData,
      id: `c-${Date.now()}`,
      status: CandidateStatus.NEW,
      lastContact: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      notes: [],
      avatarUrl: MVM_LOGO_URL,
      licensePoints: Number(formData.licensePoints),
      cvFilename: cvFile?.name,
      referralSource,
      keySkills: aiSummary?.skills,
      workHistorySummary: aiSummary?.synopsis,
      providerCost: providerCost.length > 0 ? providerCost : undefined,
    };

    dispatch({ type: 'ADD_CANDIDATE', payload: newCandidate });
    handleClose();
  };
  
  const showReferralDetail = formData.referralSourceType === ReferralSourceType.REFERRAL || formData.referralSourceType === ReferralSourceType.OTHER;
  const isTPJ = formData.referralSourceType === ReferralSourceType.TPJ;
  const isSTPJ = formData.referralSourceType === ReferralSourceType.STPJ;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Candidate">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-brand-charcoal border-b border-slate-200 pb-2 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-gray-dark">Full Name</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-gray-dark">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-brand-gray-dark">Phone</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-brand-gray-dark">Date of Birth</label>
                  <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-brand-charcoal border-b border-slate-200 pb-2 mb-4">Address & Driving Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-brand-gray-dark">Address</label>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-medium text-brand-gray-dark">Postcode</label>
                    <input type="text" name="postcode" id="postcode" value={formData.postcode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="licensePoints" className="block text-sm font-medium text-brand-gray-dark">Licence Points</label>
                    <input type="number" name="licensePoints" id="licensePoints" value={formData.licensePoints} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <input id="offRoadParking" name="offRoadParking" type="checkbox" checked={formData.offRoadParking} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent" />
                  <label htmlFor="offRoadParking" className="ml-3 text-sm font-medium text-brand-gray-dark">Off-road Parking Available</label>
                </div>
              </div>
            </section>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-brand-charcoal border-b border-slate-200 pb-2 mb-4">Application Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="referralSourceType" className="block text-sm font-medium text-brand-gray-dark">Referral Source</label>
                  <select name="referralSourceType" id="referralSourceType" value={formData.referralSourceType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                      <option value="">Select a source...</option>
                      {Object.values(ReferralSourceType).map(source => (
                      <option key={source} value={source}>{source}</option>
                      ))}
                  </select>
                </div>
                {showReferralDetail && (
                  <div>
                      <label htmlFor="referralSourceDetail" className="block text-sm font-medium text-brand-gray-dark">
                          {formData.referralSourceType === ReferralSourceType.REFERRAL ? 'Referred by whom?' : 'Please specify'}
                      </label>
                      <input type="text" name="referralSourceDetail" id="referralSourceDetail" value={formData.referralSourceDetail} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                )}
                {isTPJ && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-brand-light rounded-lg border border-slate-200">
                        <div>
                            <label htmlFor="costInduction" className="block text-sm font-medium text-brand-gray-dark">Induction Fee (£)</label>
                            <input type="number" min="0" name="costInduction" id="costInduction" value={formData.costInduction} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="costFinal" className="block text-sm font-medium text-brand-gray-dark">Final Fee (£)</label>
                            <input type="number" min="0" name="costFinal" id="costFinal" value={formData.costFinal} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                        </div>
                    </div>
                )}
                {isSTPJ && (
                    <div className="p-4 bg-brand-light rounded-lg border border-slate-200">
                        <label htmlFor="costProvider" className="block text-sm font-medium text-brand-gray-dark">Provider Fee (£)</label>
                        <input type="number" min="0" name="costProvider" id="costProvider" value={formData.costProvider} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    </div>
                )}
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-charcoal">Upload CV</h3>
                {isParsing && <span className="flex items-center text-sm text-brand-accent"><ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />Parsing...</span>}
              </div>
              {!cvFile ? (
                  <div
                      onDragEnter={(e) => handleDragEvent(e, true)}
                      onDragOver={(e) => handleDragEvent(e, true)}
                      onDragLeave={(e) => handleDragEvent(e, false)}
                      onDrop={handleDrop}
                      className={`flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-slate-300'}`}
                  >
                      <div className="space-y-1 text-center">
                          <SparklesIcon className="mx-auto h-10 w-10 text-brand-accent" />
                          <div className="flex text-sm text-slate-600">
                              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-accent focus-within:ring-offset-2 hover:text-brand-accent/80">
                                  <span>Upload CV to parse with AI</span>
                                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept=".pdf,.doc,.docx" />
                              </label>
                          </div>
                          <p className="text-xs text-slate-500">or drag and drop to pre-fill form</p>
                      </div>
                  </div>
               ) : (
                  <div className="mt-2 flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 p-3">
                      <div className="flex items-center min-w-0">
                          <DocumentTextIcon className="h-6 w-6 text-brand-accent flex-shrink-0" />
                          <span className="ml-3 text-sm font-medium text-brand-charcoal truncate">{cvFile.name}</span>
                      </div>
                      <button type="button" onClick={() => { setCvFile(null); setParseError(''); setAiSummary(null); }} className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 flex-shrink-0">
                          <XMarkIcon className="h-5 w-5" />
                      </button>
                  </div>
              )}
              {parseError && <p className="text-sm text-red-600 mt-2">{parseError}</p>}
            </section>
          </div>

        </div>

        <div className="flex justify-end space-x-3 pt-8 mt-8 border-t border-slate-200">
          <button type="button" onClick={handleClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
          <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Add Candidate</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCandidateModal;
