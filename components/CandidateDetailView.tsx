
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CandidateStatus, Note, TemplateType, TerminationReasonType, AssignedKitItem, Task, TaskStatus, WithdrawalReasonType, PaymentStatus, KitItemType, ScreeningRatings } from '../types';
import { EmailIcon, PhoneIcon, VideoIcon, PlusIcon, ChevronLeftIcon, WhatsAppIcon, ClockIcon, CalendarIcon, SparklesIcon, DocumentTextIcon, UploadIcon, CheckCircleIcon, BookmarkSquareIcon, CurrencyPoundIcon, ClipboardCheckIcon, StarIcon, ArchiveBoxIcon, ChevronDownIcon, BanknotesIcon, PencilSquareIcon } from './icons';
import Modal from './Modal';
import ScheduleEventModal from './ScheduleEventModal';
import ManageKitModal from './ManageKitModal';
import { formatReferralSource } from '../utils/helpers';
import ReconsiderCandidateModal from './ReconsiderCandidateModal';
import EditCandidateModal from './EditCandidateModal';
import AddTaskModal from './AddTaskModal';

interface CandidateDetailViewProps {
  setView: (view: 'candidates') => void;
}

const statusOptions = Object.values(CandidateStatus);

const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

interface InterviewScriptProps {
    onConfirm: () => void;
    isConfirmed: boolean;
    canConfirm: boolean;
}

const InterviewScript: React.FC<InterviewScriptProps> = ({ onConfirm, isConfirmed, canConfirm }) => {
    const [isOpen, setIsOpen] = useState(!isConfirmed);

    useEffect(() => {
        if (isConfirmed) {
            setIsOpen(false);
        }
    }, [isConfirmed]);

    return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl mb-6 shadow-sm overflow-hidden transition-all dark:bg-indigo-900/20 dark:border-indigo-800">
            <div 
                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center">
                    <ClipboardCheckIcon className="w-6 h-6 mr-2 text-indigo-700 dark:text-indigo-400" />
                    Recruiter Script: Key Information
                </h3>
                <div className="flex items-center gap-3">
                    {isConfirmed ? (
                        <span className="flex items-center text-green-700 dark:text-green-400 font-bold text-xs bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 shadow-sm">
                            <CheckCircleIcon className="w-3 h-3 mr-1.5" />
                            Confirmed
                        </span>
                    ) : (
                        canConfirm && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onConfirm(); }} 
                                className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                            >
                                Confirm Info Given
                            </button>
                        )
                    )}
                    <ChevronDownIcon className={`w-5 h-5 text-indigo-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </div>
            
            {isOpen && (
                <div className="p-6 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm uppercase tracking-wide">Wages & Probation</h4>
                            <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">
                                • <strong>46%</strong> of job costs for the first <strong>3 months (12 weeks)</strong> probation period.<br/>
                                • Increases to <strong>51%</strong> of job costs thereafter.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm uppercase tracking-wide">Self-Funding</h4>
                            <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">
                                • You must be <strong>self-funded for the first 10 days</strong>.<br/>
                                • If assistance is needed, Accounts <em>may</em> be able to sub an amount against expenses.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm uppercase tracking-wide">Equipment</h4>
                            <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">
                                • We provide full uniform and equipment.<br/>
                                • Uniform <strong>must always be worn</strong> while working.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm uppercase tracking-wide">Payment Schedule</h4>
                            <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">
                                • Paid <strong>twice monthly</strong> (1st and 16th).<br/>
                                • Worked on a <strong>4-week in arrears</strong> basis.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm uppercase tracking-wide">Expense Payments</h4>
                            <div className="bg-white/60 dark:bg-black/20 p-2 rounded border border-indigo-100 dark:border-indigo-800 mt-1">
                                <p className="text-indigo-900 dark:text-indigo-100 text-xs">
                                    <strong>Expenses 1st - 15th:</strong> Paid on 1st of <em>next</em> month.<br/>
                                    <strong>Expenses 16th - End:</strong> Paid on 16th of <em>next</em> month.
                                </p>
                            </div>
                        </div>
                        <div className="bg-indigo-100/50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm uppercase tracking-wide flex items-center">
                                <CheckCircleIcon className="w-4 h-4 mr-1.5 text-indigo-700 dark:text-indigo-400"/>
                                Parking Confirmation
                            </h4>
                            <p className="text-indigo-900 dark:text-indigo-100 text-sm mt-1">
                                <strong>Mandatory Check:</strong> Confirm the candidate has appropriate <strong>off-road parking</strong> available for safe vehicle storage.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoInterviewQuestions: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl mb-6 shadow-sm overflow-hidden transition-all">
            <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-sky-100/50 dark:hover:bg-sky-900/40 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    <VideoIcon className="w-6 h-6 mr-2 text-sky-700 dark:text-sky-400" />
                    <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100">Suggested Video Interview Questions</h3>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-sky-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="p-6 pt-2 border-t border-sky-200/50 dark:border-sky-800/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "This role often requires very early starts and late finishes with no fixed return time. Can you commit to full-day availability without conflicting after-work plans?",
                        "How would you handle a 'dead end' where you deliver a car far from home and have no return vehicle booked?",
                        "Are you willing to undergo a basic DBS (criminal record) check?",
                        "Are you comfortable completing detailed vehicle appraisals on an app, including taking photos of damage?",
                        "How confident are you in planning your own public transport routes using apps like Split Ticketing or Google Maps?",
                        "Are you fully aware that this is a self-employed role where you are responsible for your own taxes, National Insurance, and annual accounts?"
                    ].map((question, index) => (
                        <div key={index} className="flex items-start p-3 bg-white dark:bg-slate-800 rounded-lg border border-sky-100 dark:border-sky-800 shadow-sm">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-100 text-xs font-bold mr-3 mt-0.5">
                                {index + 1}
                            </span>
                            <p className="text-sky-900 dark:text-sky-100 text-sm font-medium leading-relaxed">{question}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StarRatingInput: React.FC<{ value: number; onChange?: (val: number) => void; readOnly?: boolean }> = ({ value, onChange, readOnly }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readOnly && onChange && onChange(star)}
                    disabled={readOnly}
                    className={`p-1 focus:outline-none transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
                >
                    <StarIcon 
                        className={`w-5 h-5 ${star <= value ? 'text-yellow-400 fill-current' : 'text-slate-300 dark:text-slate-600'}`} 
                    />
                </button>
            ))}
        </div>
    );
};

const ScreeningAssessment: React.FC<{ 
    ratings?: ScreeningRatings; 
    onUpdate: (ratings: ScreeningRatings) => void; 
    onComplete: (ratings: ScreeningRatings) => void; 
}> = ({ ratings, onUpdate, onComplete }) => {
    const currentRatings = ratings || {
        financialViability: 0,
        logisticsAvailability: 0,
        complianceTech: 0,
        attitudeExperience: 0,
        completed: false
    };

    const isCompleted = currentRatings.completed;
    const [isOpen, setIsOpen] = useState(!isCompleted);

    useEffect(() => {
        if (isCompleted) {
            setIsOpen(false);
        }
    }, [isCompleted]);

    const handleRatingChange = (category: keyof ScreeningRatings, value: number) => {
        if (isCompleted) return;
        onUpdate({
            ...currentRatings,
            [category]: value
        });
    };

    const totalScore = (Object.values(currentRatings).filter(v => typeof v === 'number') as number[]).reduce((a, b) => a + b, 0);
    const maxScore = 20;
    const percentage = (totalScore / maxScore) * 100;
    
    let scoreColor = 'text-slate-500 dark:text-slate-400';
    if (percentage > 75) scoreColor = 'text-green-600 dark:text-green-400';
    else if (percentage > 50) scoreColor = 'text-yellow-600 dark:text-yellow-400';
    else if (percentage > 0) scoreColor = 'text-red-600 dark:text-red-400';

    const containerClasses = isCompleted 
        ? "bg-white dark:bg-slate-800 rounded-xl shadow-md mb-6 border-l-4 border-green-500 overflow-hidden" 
        : "bg-white dark:bg-slate-800 rounded-xl shadow-md mb-6 border border-slate-200 dark:border-slate-700 overflow-hidden";

    return (
        <div className={containerClasses}>
            <div 
                className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                    ) : (
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                            <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-current" />
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-brand-charcoal dark:text-white">
                        {isCompleted ? "Screening Completed" : "Screening Assessment"}
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${scoreColor}`}>{totalScore}</span>
                        <span className="text-sm text-slate-400 font-medium"> / {maxScore}</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </div>
            
            {isOpen && (
                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                        <div className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold text-brand-gray-dark dark:text-slate-300">Financial & Employment Viability</span>
                            <StarRatingInput 
                                value={currentRatings.financialViability} 
                                onChange={(val) => handleRatingChange('financialViability', val)}
                                readOnly={isCompleted}
                            />
                            {!isCompleted && <p className="text-xs text-slate-400">Can they self-fund? Aware of self-employed status?</p>}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold text-brand-gray-dark dark:text-slate-300">Logistics & Availability</span>
                            <StarRatingInput 
                                value={currentRatings.logisticsAvailability} 
                                onChange={(val) => handleRatingChange('logisticsAvailability', val)}
                                readOnly={isCompleted}
                            />
                            {!isCompleted && <p className="text-xs text-slate-400">Public transport confident? Flexible hours?</p>}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold text-brand-gray-dark dark:text-slate-300">Compliance & Tech</span>
                            <StarRatingInput 
                                value={currentRatings.complianceTech} 
                                onChange={(val) => handleRatingChange('complianceTech', val)}
                                readOnly={isCompleted}
                            />
                            {!isCompleted && <p className="text-xs text-slate-400">Clean licence? Parking? Comfortable with apps?</p>}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold text-brand-gray-dark dark:text-slate-300">Attitude & Experience</span>
                            <StarRatingInput 
                                value={currentRatings.attitudeExperience} 
                                onChange={(val) => handleRatingChange('attitudeExperience', val)}
                                readOnly={isCompleted}
                            />
                            {!isCompleted && <p className="text-xs text-slate-400">Professional demeanor? Relevant driving history?</p>}
                        </div>
                    </div>
                    {!isCompleted && (
                        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-end">
                            <button 
                                onClick={() => onComplete(currentRatings)}
                                className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center shadow-sm"
                            >
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Complete Assessment
                            </button>
                        </div>
                    )}
                    {isCompleted && (
                        <div className="mt-4 text-xs text-right text-slate-400 italic">
                            Result logged in notes.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({ setView }) => {
  const { state, dispatch } = useAppContext();
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'kit' | 'costs'>('notes');
  
  // Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppMessageModalOpen, setIsWhatsAppMessageModalOpen] = useState(false);
  const [isWhatsAppCallModalOpen, setIsWhatsAppCallModalOpen] = useState(false);
  const [isScheduleEventModalOpen, setIsScheduleEventModalOpen] = useState(false);
  const [isTerminationReasonModalOpen, setIsTerminationReasonModalOpen] = useState(false);
  const [isWithdrawalReasonModalOpen, setIsWithdrawalReasonModalOpen] = useState(false);
  const [isManageKitModalOpen, setIsManageKitModalOpen] = useState(false);
  const [isReconsiderModalOpen, setIsReconsiderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Form States
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [whatsAppCallNotes, setWhatsAppCallNotes] = useState('');
  const [terminationReasonType, setTerminationReasonType] = useState<TerminationReasonType | ''>('');
  const [terminationReasonOther, setTerminationReasonOther] = useState('');
  const [withdrawalReasonType, setWithdrawalReasonType] = useState<WithdrawalReasonType | ''>('');
  const [withdrawalReasonOther, setWithdrawalReasonOther] = useState('');
  const [isCompletingTermination, setIsCompletingTermination] = useState(false);

  const { selectedCandidate, templates, tasks } = state;

  useEffect(() => {
    if (selectedCandidate) {
        setEmailTo(selectedCandidate.email);
    }
  }, [selectedCandidate]);

  if (!selectedCandidate) {
    return <div className="text-center text-slate-500">No candidate selected.</div>;
  }
  
  const candidateTasks = tasks.filter(task => task.candidateId === selectedCandidate.id && task.status !== 'Archived');
  
  const activeStageTask = candidateTasks.find(t => {
      const title = t.title.toLowerCase();
      if (selectedCandidate.status === CandidateStatus.SCREENING) return title.includes('screening') && t.status !== TaskStatus.DONE;
      if (selectedCandidate.status === CandidateStatus.VIDEO_INTERVIEW) return title.includes('video interview') && t.status !== TaskStatus.DONE;
      return false;
  });

  const completedStageTask = candidateTasks.find(t => {
      const title = t.title.toLowerCase();
      if (selectedCandidate.status === CandidateStatus.SCREENING) return title.includes('screening') && t.status === TaskStatus.DONE;
      if (selectedCandidate.status === CandidateStatus.VIDEO_INTERVIEW) return title.includes('video interview') && t.status === TaskStatus.DONE;
      return false;
  });

  const handleConfirmInfo = () => {
      if (activeStageTask) {
          dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId: activeStageTask.id, status: TaskStatus.DONE } });
          const note: Note = {
            id: `n-${Date.now()}`,
            content: `Recruiter Script information confirmed given to candidate during ${selectedCandidate.status} stage. Task "${activeStageTask.title}" marked as Done.`,
            author: 'Admin',
            date: new Date().toISOString(),
          };
          dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note } });
      }
  };

  const handleUpdateRatings = (ratings: ScreeningRatings) => {
      dispatch({
          type: 'UPDATE_CANDIDATE_RATING',
          payload: { candidateId: selectedCandidate.id, ratings }
      });
  };

  const handleCompleteAssessment = (ratings: ScreeningRatings) => {
      const completedRatings = { ...ratings, completed: true };
      
      // 1. Update Ratings to completed state
      dispatch({
          type: 'UPDATE_CANDIDATE_RATING',
          payload: { candidateId: selectedCandidate.id, ratings: completedRatings }
      });

      // 2. Create Note
      const totalScore = (Object.values(ratings).filter(v => typeof v === 'number') as number[]).reduce((a,b) => a+b, 0);
      const noteContent = `Screening Assessment Completed.
Total Score: ${totalScore} / 20

Breakdown:
- Financial Viability: ${ratings.financialViability}/5
- Logistics: ${ratings.logisticsAvailability}/5
- Compliance: ${ratings.complianceTech}/5
- Attitude: ${ratings.attitudeExperience}/5`;

      const note: Note = {
          id: `n-${Date.now()}`,
          content: noteContent,
          author: 'Admin',
          date: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note } });

      // 3. Mark "Screening" task as done if it exists
      const screeningTask = tasks.find(t => 
          t.candidateId === selectedCandidate.id && 
          t.status !== TaskStatus.DONE &&
          t.title.toLowerCase().includes('screening')
      );

      if (screeningTask) {
          dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId: screeningTask.id, status: TaskStatus.DONE } });
      }
  };

  const applyTemplate = (content: string, subject?: string) => {
    const processedContent = content
      .replace(/\{candidateName\}/g, selectedCandidate.name)
      .replace(/\{jobTitle\}/g, 'Trade Plate Driver');
    
    const processedSubject = subject
      ? subject.replace(/\{candidateName\}/g, selectedCandidate.name)
      : '';
      
    return { content: processedContent, subject: processedSubject };
  };

  const handleEmailTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    if (template) {
        const { content, subject } = applyTemplate(template.content, template.subject);
        setEmailSubject(subject);
        setEmailContent(content);
    }
  };
  
  const handleWhatsAppTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    if (template) {
        const { content } = applyTemplate(template.content);
        setWhatsAppMessage(content);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CandidateStatus;

    if (newStatus === CandidateStatus.TERMINATED) {
        setIsCompletingTermination(true);
        setIsTerminationReasonModalOpen(true);
    } else if (newStatus === CandidateStatus.WITHDRAWN) {
        setIsWithdrawalReasonModalOpen(true);
    } else {
        setIsCompletingTermination(false);
        dispatch({
          type: 'UPDATE_CANDIDATE_STATUS',
          payload: { candidateId: selectedCandidate.id, status: newStatus },
        });
    }
  };
  
  const handleAddNote = () => {
    if (note.trim()) {
      const newNote: Note = {
        id: `n-${Date.now()}`,
        content: note.trim(),
        author: 'Admin',
        date: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note: newNote } });
      setNote('');
    }
  };

  const handleSendEmail = () => {
      if (isCompletingTermination) {
           dispatch({
              type: 'UPDATE_CANDIDATE_STATUS',
              payload: { candidateId: selectedCandidate.id, status: CandidateStatus.TERMINATED },
            });
           setIsCompletingTermination(false);
      }

      // Use mailto to open Outlook/default client
      const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailContent)}`;
      window.location.href = mailtoLink;

      const newNote: Note = {
        id: `n-${Date.now()}`,
        content: `Email opened in default client to ${emailTo}\nSubject: ${emailSubject}\n\nContent:\n${emailContent.substring(0, 150)}${emailContent.length > 150 ? '...' : ''}`,
        author: 'Admin',
        date: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note: newNote } });
      setIsEmailModalOpen(false);
      setEmailContent('');
      setEmailSubject('');
  };
  
  const formatPhoneNumberForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/[\s()+-]/g, '');
    if (cleaned.startsWith('07')) {
        return '44' + cleaned.substring(1);
    }
    return cleaned;
  }

  const handleSendWhatsApp = () => {
      if (!whatsAppMessage.trim()) return;

      const phoneNumber = formatPhoneNumberForWhatsApp(selectedCandidate.phone);
      const encodedMessage = encodeURIComponent(whatsAppMessage);
      const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      window.open(url, '_blank');

      const newNote: Note = {
        id: `n-${Date.now()}`,
        content: `WhatsApp message sent: "${whatsAppMessage}"`,
        author: 'Admin',
        date: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note: newNote } });
      
      setIsWhatsAppMessageModalOpen(false);
      setWhatsAppMessage('');
  };

  const handleLogCall = () => {
      const noteContent = `Logged WhatsApp video call. Notes: ${whatsAppCallNotes.trim() ? whatsAppCallNotes.trim() : 'No additional notes.'}`;
      const newNote: Note = {
        id: `n-${Date.now()}`,
        content: noteContent,
        author: 'Admin',
        date: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note: newNote } });

      setIsWhatsAppCallModalOpen(false);
      setWhatsAppCallNotes('');
  };

  const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(entering);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e, false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (readEvent) => {
            dispatch({
                type: 'UPDATE_CANDIDATE_AVATAR',
                payload: { candidateId: selectedCandidate.id, avatarUrl: readEvent.target?.result as string }
            });
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleTerminationReasonSubmit = () => {
    const finalReason = terminationReasonType === TerminationReasonType.OTHER 
        ? terminationReasonOther.trim() 
        : terminationReasonType;
        
    if (!finalReason) {
        alert("Please provide a reason for termination.");
        return;
    }
    
    // Automated task creation for "Took another job"
    if (terminationReasonType === TerminationReasonType.TOOK_ANOTHER_JOB) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 3);
        const followUpTask: Task = {
            id: `t-${Date.now()}`,
            title: `Follow up with ${selectedCandidate.name} (took another job)`,
            dueDate: dueDate.toISOString().split('T')[0],
            status: TaskStatus.TO_DO,
            candidateId: selectedCandidate.id,
            history: [],
        };
        dispatch({ type: 'ADD_TASK', payload: followUpTask });
    }
    
    const terminationTemplate = templates.find(t => t.name === 'Termination');
    if (terminationTemplate) {
        const currentDate = new Date().toLocaleDateString('en-GB');
        
        const content = terminationTemplate.content
            .replace(/\{candidateName\}/g, selectedCandidate.name)
            .replace(/\{currentDate\}/g, currentDate)
            .replace(/\{terminationReason\}/g, finalReason);
            
        const subject = terminationTemplate.subject
            ? terminationTemplate.subject.replace(/\{candidateName\}/g, selectedCandidate.name)
            : '';

        setEmailSubject(subject);
        setEmailContent(content);
        setEmailTo(selectedCandidate.email);
    }
    
    setTerminationReasonType('');
    setTerminationReasonOther('');
    setIsTerminationReasonModalOpen(false);
    setIsEmailModalOpen(true);
  };
  
  const handleWithdrawalReasonSubmit = () => {
    const finalReason = withdrawalReasonType === WithdrawalReasonType.OTHER 
        ? withdrawalReasonOther.trim() 
        : withdrawalReasonType;
        
    if (!finalReason) {
        alert("Please provide a reason for withdrawal.");
        return;
    }
    
    dispatch({ 
        type: 'WITHDRAW_CANDIDATE',
        payload: { candidateId: selectedCandidate.id, reason: finalReason }
    });

    setWithdrawalReasonType('');
    setWithdrawalReasonOther('');
    setIsWithdrawalReasonModalOpen(false);
  }

  const handleMarkKitReturned = (kitItemId: string) => {
    dispatch({
        type: 'MARK_KIT_RETURNED',
        payload: { candidateId: selectedCandidate.id, kitItemId }
    });
  }

  const handleMarkCostPaid = (costId: string) => {
      dispatch({
          type: 'MARK_COST_PAID',
          payload: { candidateId: selectedCandidate.id, costId }
      });
  }

  const generateReturnEmail = () => {
      const kit = selectedCandidate.assignedKit || [];
      
      const essentialTypes = [
          KitItemType.TRADE_PLATES,
          KitItemType.TABLET,
          KitItemType.DASHCAM,
          KitItemType.FUEL_CARD,
          KitItemType.ID_CARD_LANYARD
      ];

      const returnedItems: string[] = [];
      const missingItems: string[] = [];
      const notIssuedItems: string[] = [];

      // Process Essentials
      essentialTypes.forEach(type => {
          const item = kit.find(k => k.type === type);
          let label = type as string;
          
          if (item) {
              const details: string[] = [];
              if (item.plateNumber) details.push(`Plate: ${item.plateNumber}`);
              if (item.fuelCardNumber) details.push(`Last 4: ${item.fuelCardNumber}`);
              if (item.tabletImei) details.push(`IMEI: ${item.tabletImei}`);
              if (item.simNumber) details.push(`SIM: ${item.simProvider || ''} ${item.simNumber}`);
              
              if (details.length > 0) label += ` (${details.join(', ')})`;

              if (item.returnedAt) {
                  returnedItems.push(`- ${label}`);
              } else {
                  missingItems.push(`- ${label}`);
              }
          } else {
              notIssuedItems.push(`- ${label}`);
          }
      });

      // Hardcoded items from previous requirement
      notIssuedItems.push(`- Power Bank Kit`);
      notIssuedItems.push(`- AA Card`);

      const uniformCounts = kit.reduce((acc, item) => {
          if ([KitItemType.POLO_SHIRT, KitItemType.HI_VIS, KitItemType.JACKET].includes(item.type)) {
             const key = `${item.type}${item.size ? ` (${item.size})` : ''}`;
             acc[key] = (acc[key] || 0) + 1;
          }
          return acc;
      }, {} as Record<string, number>);

      const uniformList = Object.entries(uniformCounts).map(([name, count]) => `${count}x ${name}`).join('\n');

      return `Dear Accounts,

${selectedCandidate.name} has returned their equipment.

=== ⚠️ OUTSTANDING / MISSING ITEMS ===
${missingItems.length > 0 ? missingItems.join('\n') : 'NONE - All essentials returned'}

=== ✅ RETURNED ITEMS ===
${returnedItems.length > 0 ? returnedItems.join('\n') : 'None'}

=== ℹ️ NOT ISSUED / N/A ===
${notIssuedItems.join('\n')}

=== 👕 UNIFORM ===
${uniformList || 'None assigned'}

Other Notes:
`;
  };

  const generateJoinerEmail = () => {
      const kit = selectedCandidate.assignedKit || [];
      const kitList = kit.length > 0
          ? kit.map(k => {
              let details = '';
              if(k.plateNumber) details += ` (Plate: ${k.plateNumber})`;
              if(k.fuelCardNumber) details += ` (Fuel: ...${k.fuelCardNumber})`;
              if(k.tabletImei) details += ` (IMEI: ${k.tabletImei})`;
              return `- ${k.type}${k.size ? ` (${k.size})` : ''}${details}`;
          }).join('\n')
          : 'No kit assigned in system yet.';

      const startDate = selectedCandidate.hiredAt
        ? new Date(selectedCandidate.hiredAt).toLocaleDateString('en-GB')
        : new Date().toLocaleDateString('en-GB');

      return `Dear Accounts,

Please be advised of a new starter.

Candidate Name: ${selectedCandidate.name}
Start Date: ${startDate}

Location:
${selectedCandidate.address || 'N/A'}
${selectedCandidate.postcode || 'N/A'}

Recruitment Source: ${formatReferralSource(selectedCandidate.referralSource)}

Equipment Issued:
${kitList}

Regards,
Recruitment Team`;
  };

  const handleNotifyAccountsJoiner = () => {
      setEmailTo('accounts@simplydrivenlogistics.com');
      setEmailSubject(`New Starter Notification - ${selectedCandidate.name}`);
      setEmailContent(generateJoinerEmail());
      setIsEmailModalOpen(true);
  };

  const handleNotifyAccounts = () => {
      setEmailTo('accounts@simplydrivenlogistics.com');
      setEmailSubject(`Equipment Return - ${selectedCandidate.name}`);
      setEmailContent(generateReturnEmail());
      setIsEmailModalOpen(true);
  };

  const emailTemplates = templates.filter(t => t.type === TemplateType.EMAIL);
  const whatsAppTemplates = templates.filter(t => t.type === TemplateType.WHATSAPP);

  const DetailSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4">
        <h4 className="text-xs font-semibold uppercase text-brand-gray-dark dark:text-slate-400 tracking-wider mb-3">{title}</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </dl>
    </div>
  );

  const DetailItem: React.FC<{ label: string, children: React.ReactNode, fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
        <dt className="text-sm font-medium text-brand-gray-dark dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-brand-charcoal dark:text-white">{children}</dd>
    </div>
  );
  
  const age = calculateAge(selectedCandidate.dateOfBirth);
  const hasAiSummary = selectedCandidate.keySkills || selectedCandidate.workHistorySummary;
  
  const showInterviewScript = selectedCandidate.status === CandidateStatus.SCREENING || selectedCandidate.status === CandidateStatus.VIDEO_INTERVIEW;

  // Sort kit items by type so multiples appear together and then by size
  const sortedKitItems = selectedCandidate.assignedKit 
    ? [...selectedCandidate.assignedKit].sort((a, b) => {
        const typeCompare = a.type.localeCompare(b.type);
        if (typeCompare !== 0) return typeCompare;
        return (a.size || '').localeCompare(b.size || '');
    }) 
    : [];

  const renderTabContent = () => {
      switch (activeTab) {
          case 'notes':
              return (
                  <div className="space-y-4">
                      <div>
                          <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Add a new note..."
                              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400"
                              rows={3}
                          ></textarea>
                          <div className="flex justify-end mt-2">
                              <button onClick={handleAddNote} className="flex items-center bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
                                  <PlusIcon className="w-5 h-5 mr-2" /> Add Note
                              </button>
                          </div>
                      </div>
                      <div className="flow-root">
                          <ul role="list" className="-mb-8 max-h-[500px] overflow-y-auto pr-2">
                              {selectedCandidate.notes.map((noteItem, noteIdx) => (
                                  <li key={noteItem.id}>
                                      <div className="relative pb-8">
                                          {noteIdx !== selectedCandidate.notes.length - 1 ? (
                                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                                          ) : null}
                                          <div className="relative flex space-x-3">
                                              <div>
                                                  <span className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-8 ring-white dark:ring-slate-800">
                                                      <ClockIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                                  </span>
                                              </div>
                                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                  <div>
                                                      <p className="text-sm text-brand-gray-dark dark:text-slate-300 whitespace-pre-wrap">{noteItem.content}</p>
                                                  </div>
                                                  <div className="whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                                                      <time dateTime={noteItem.date}>{new Date(noteItem.date).toLocaleString('en-GB')}</time>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              );
          case 'tasks':
              return (
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-semibold text-brand-gray-dark dark:text-slate-400 uppercase tracking-wider">Candidate Tasks</h3>
                          <button 
                              onClick={() => setIsAddTaskModalOpen(true)}
                              className="text-xs font-medium text-brand-accent hover:underline flex items-center"
                          >
                              <PlusIcon className="w-4 h-4 mr-1"/> Add Task
                          </button>
                      </div>
                      {candidateTasks.length > 0 ? (
                          <ul className="space-y-3">
                              {candidateTasks.map(task => {
                                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
                                  return (
                                      <li key={task.id} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                          <div>
                                              <p className="text-sm font-medium text-brand-charcoal dark:text-white">{task.title}</p>
                                              <p className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-brand-gray-dark dark:text-slate-400'}`}>
                                                  Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                                              </p>
                                          </div>
                                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 font-semibold px-2 py-0.5 rounded-full">{task.status}</span>
                                      </li>
                                  );
                              })}
                          </ul>
                      ) : (
                          <p className="text-sm text-brand-gray-dark dark:text-slate-400 text-center py-4">No active tasks for this candidate.</p>
                      )}
                  </div>
              );
          case 'kit':
              return (
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-semibold text-brand-gray-dark dark:text-slate-400 uppercase tracking-wider">Assigned Equipment</h3>
                          <div className="flex gap-2">
                              <button onClick={() => setIsManageKitModalOpen(true)} className="text-xs font-medium text-brand-accent hover:underline">Manage Kit</button>
                              <button
                                  onClick={handleNotifyAccounts}
                                  className="text-xs font-medium text-brand-charcoal dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded"
                              >
                                  Notify Accounts (Return)
                              </button>
                          </div>
                      </div>
                      {sortedKitItems && sortedKitItems.length > 0 ? (
                          <ul className="space-y-3">
                              {sortedKitItems.map((item: AssignedKitItem) => {
                                  const isUnreturnedAndTerminated = selectedCandidate.status === CandidateStatus.TERMINATED && !item.returnedAt;
                                  return (
                                      <li key={item.id} className={`p-3 rounded-lg flex flex-col gap-2 justify-between ${isUnreturnedAndTerminated ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <p className="text-sm font-medium text-brand-charcoal dark:text-white">
                                                      {item.type}
                                                      {item.size && <span className="ml-1 text-xs text-brand-gray-dark dark:text-slate-400 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-1.5 py-0.5">Size: {item.size}</span>}
                                                  </p>
                                                  <p className="text-xs text-brand-gray-dark dark:text-slate-400 mt-0.5">
                                                      {item.returnedAt
                                                          ? `Returned: ${new Date(item.returnedAt).toLocaleDateString('en-GB')}`
                                                          : `Assigned: ${new Date(item.assignedAt).toLocaleDateString('en-GB')}`
                                                      }
                                                  </p>
                                              </div>
                                              {!item.returnedAt && (
                                                  <button onClick={() => handleMarkKitReturned(item.id)} className="flex items-center bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 text-brand-gray-dark dark:text-slate-200 px-2 py-1 rounded-md text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-500">
                                                      <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" /> Return
                                                  </button>
                                              )}
                                          </div>
                                          
                                          {/* Details Section */}
                                          {(item.plateNumber || item.fuelCardNumber || item.tabletImei || item.simNumber) && (
                                              <div className="bg-white/60 dark:bg-black/20 p-2 rounded border border-slate-200 dark:border-slate-600 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-brand-gray-dark dark:text-slate-300">
                                                  {item.plateNumber && (
                                                      <div><span className="font-semibold">Plate:</span> {item.plateNumber}</div>
                                                  )}
                                                  {item.fuelCardNumber && (
                                                      <div><span className="font-semibold">Fuel:</span> ...{item.fuelCardNumber}</div>
                                                  )}
                                                  {item.tabletImei && (
                                                      <div className="col-span-2"><span className="font-semibold">IMEI:</span> {item.tabletImei}</div>
                                                  )}
                                                  {item.simNumber && (
                                                      <div className="col-span-2"><span className="font-semibold">SIM:</span> {item.simProvider} - {item.simNumber}</div>
                                                  )}
                                              </div>
                                          )}
                                      </li>
                                  )
                              })}
                          </ul>
                      ) : (
                          <p className="text-sm text-brand-gray-dark dark:text-slate-400 text-center py-4">No kit assigned to this candidate.</p>
                      )}
                  </div>
              );
          case 'costs':
              return (
                  <div>
                      {selectedCandidate.providerCost && selectedCandidate.providerCost.length > 0 ? (
                          <ul className="space-y-3">
                              {selectedCandidate.providerCost.map((cost) => (
                                  <li key={cost.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
                                      <div>
                                          <p className="text-sm font-medium text-brand-charcoal dark:text-white">{cost.type}</p>
                                          <p className="text-sm font-bold text-brand-accent">£{isNaN(cost.amount) ? '0.00' : cost.amount.toFixed(2)}</p>
                                          {cost.status === PaymentStatus.PAID && (
                                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Paid on {new Date(cost.paidAt!).toLocaleDateString('en-GB')}</p>
                                          )}
                                      </div>
                                      {cost.status === PaymentStatus.UNPAID ? (
                                          <button onClick={() => handleMarkCostPaid(cost.id)} className="flex items-center bg-white dark:bg-slate-600 border border-brand-accent text-brand-accent px-2 py-1 rounded-md text-xs font-medium hover:bg-brand-accent/10">
                                              Mark Paid
                                          </button>
                                      ) : (
                                          <span className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-xs font-medium">
                                              <CheckCircleIcon className="w-3 h-3 mr-1" /> Paid
                                          </span>
                                      )}
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <p className="text-sm text-brand-gray-dark dark:text-slate-400 text-center py-4">No provider costs recorded.</p>
                      )}
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div>
        <button onClick={() => setView('candidates')} className="flex items-center text-sm font-medium text-brand-gray-dark hover:text-brand-charcoal dark:text-slate-400 dark:hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to Candidates
        </button>
        
        {showInterviewScript && (
            <InterviewScript 
                onConfirm={handleConfirmInfo} 
                isConfirmed={!!completedStageTask} 
                canConfirm={!!activeStageTask}
            />
        )}

        <ScreeningAssessment 
            ratings={selectedCandidate.screeningRatings} 
            onUpdate={handleUpdateRatings}
            onComplete={handleCompleteAssessment}
        />

        {selectedCandidate.status === CandidateStatus.VIDEO_INTERVIEW && (
            <VideoInterviewQuestions />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                        <div
                            className="relative group cursor-pointer"
                            onDragEnter={(e) => handleDragEvent(e, true)}
                            onDragOver={(e) => handleDragEvent(e, true)}
                            onDragLeave={(e) => handleDragEvent(e, false)}
                            onDrop={handleDrop}
                        >
                            <img
                                className={`h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 object-contain p-2 transition-all duration-300 ${isDragging ? 'ring-4 ring-brand-accent ring-offset-2' : 'group-hover:ring-4 group-hover:ring-brand-accent/50'}`}
                                src={selectedCandidate.avatarUrl}
                                alt={selectedCandidate.name}
                            />
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="text-center text-white">
                                    <UploadIcon className="w-6 h-6 mx-auto" />
                                    <p className="text-xs mt-1">Drop image</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-3xl font-bold text-brand-charcoal dark:text-white">{selectedCandidate.name}</h2>
                                <select value={selectedCandidate.status} onChange={handleStatusChange} className="form-select rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-50">
                                    {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-wrap gap-3">
                        <button onClick={() => { setEmailTo(selectedCandidate.email); setIsEmailModalOpen(true); }} className="flex items-center bg-white dark:bg-slate-700 border border-brand-plum dark:border-slate-600 text-brand-plum dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-plum/10 dark:hover:bg-slate-600 transition-colors">
                            <EmailIcon className="w-5 h-5 mr-2" /> Send Email
                        </button>
                        <button onClick={() => setIsWhatsAppMessageModalOpen(true)} className="flex items-center bg-white dark:bg-slate-700 border border-brand-plum dark:border-slate-600 text-brand-plum dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-plum/10 dark:hover:bg-slate-600 transition-colors">
                            <WhatsAppIcon className="w-5 h-5 mr-2" /> Send WhatsApp
                        </button>
                        <button onClick={() => setIsWhatsAppCallModalOpen(true)} className="flex items-center bg-white dark:bg-slate-700 border border-brand-plum dark:border-slate-600 text-brand-plum dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-plum/10 dark:hover:bg-slate-600 transition-colors">
                            <VideoIcon className="w-5 h-5 mr-2" /> Log WhatsApp Call
                        </button>
                        <button onClick={() => setIsReconsiderModalOpen(true)} className="flex items-center bg-white dark:bg-slate-700 border border-brand-plum dark:border-slate-600 text-brand-plum dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-plum/10 dark:hover:bg-slate-600 transition-colors">
                            <BookmarkSquareIcon className="w-5 h-5 mr-2" /> Reconsider Later
                        </button>
                        {selectedCandidate.status === CandidateStatus.HIRED && (
                            <button onClick={handleNotifyAccountsJoiner} className="flex items-center bg-white dark:bg-slate-700 border border-brand-plum dark:border-slate-600 text-brand-plum dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-plum/10 dark:hover:bg-slate-600 transition-colors">
                                <BanknotesIcon className="w-5 h-5 mr-2" /> Notify Accounts (Joiner)
                            </button>
                        )}
                        <button onClick={() => setIsScheduleEventModalOpen(true)} className="flex items-center bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
                            <CalendarIcon className="w-5 h-5 mr-2" /> Schedule Event
                        </button>
                    </div>
                </div>
                
                {hasAiSummary && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md transition-colors">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
                            <SparklesIcon className="w-6 h-6 text-brand-accent mr-3" />
                            <h3 className="text-lg font-semibold text-brand-charcoal dark:text-white">AI CV Summary</h3>
                        </div>
                        <div className="p-6">
                            {selectedCandidate.workHistorySummary && (
                                <div>
                                    <h4 className="text-sm font-semibold uppercase text-brand-gray-dark dark:text-slate-400 tracking-wider mb-2">Work History Synopsis</h4>
                                    <p className="text-sm text-brand-charcoal dark:text-slate-300 italic">{selectedCandidate.workHistorySummary}</p>
                                </div>
                            )}
                            {selectedCandidate.keySkills && selectedCandidate.keySkills.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold uppercase text-brand-gray-dark dark:text-slate-400 tracking-wider mb-2">Key Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.keySkills.map((skill, index) => (
                                            <span key={index} className="px-2 py-1 text-xs font-medium bg-brand-accent/10 dark:bg-brand-accent/20 text-brand-accent rounded-full">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Consolidated Details Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md transition-colors">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-brand-charcoal dark:text-white">Candidate Details</h3>
                        <button onClick={() => setIsEditModalOpen(true)} className="text-sm font-medium text-brand-accent hover:underline flex items-center">
                            <PencilSquareIcon className="w-4 h-4 mr-1"/> Edit
                        </button>
                    </div>
                    <div className="p-6 divide-y divide-slate-200 dark:divide-slate-700">
                       <DetailSection title="Contact Information">
                            <DetailItem label="Email Address">
                                <a href={`mailto:${selectedCandidate.email}`} className="text-brand-accent hover:underline">
                                    {selectedCandidate.email}
                                </a>
                            </DetailItem>
                             <DetailItem label="Phone Number">
                                <a href={`tel:${selectedCandidate.phone}`} className="text-brand-accent hover:underline">
                                    {selectedCandidate.phone}
                                </a>
                            </DetailItem>
                            <DetailItem label="Address" fullWidth>
                                {[selectedCandidate.address, selectedCandidate.postcode].filter(Boolean).join(', ')}
                            </DetailItem>
                       </DetailSection>

                       <DetailSection title="Personal Details">
                           <DetailItem label="Date of Birth">{selectedCandidate.dateOfBirth ? new Date(selectedCandidate.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</DetailItem>
                           <DetailItem label="Age">{age !== null ? `${age} years` : 'N/A'}</DetailItem>
                       </DetailSection>
                       
                       <DetailSection title="Driving Details">
                           <DetailItem label="Licence Points">{selectedCandidate.licensePoints}</DetailItem>
                           <DetailItem label="Off-road Parking">{selectedCandidate.offRoadParking ? 'Yes' : 'No'}</DetailItem>
                       </DetailSection>

                       <DetailSection title="Application & Sourcing Info">
                           <DetailItem label="Source of Candidate">{formatReferralSource(selectedCandidate.referralSource)}</DetailItem>
                           {selectedCandidate.cvFilename && (
                               <DetailItem label="CV on File">
                                   <span className="flex items-center">
                                       <DocumentTextIcon className="w-5 h-5 mr-2 text-brand-gray dark:text-slate-400" />
                                       <span>{selectedCandidate.cvFilename}</span>
                                   </span>
                               </DetailItem>
                           )}
                       </DetailSection>
                    </div>
                </div>
            </div>

            {/* Right Column: Tabbed Interface */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-colors">
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-1 py-4 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 ${activeTab === 'notes' ? 'border-brand-accent text-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10' : 'border-transparent text-brand-gray-dark dark:text-slate-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            Activity & Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`flex-1 py-4 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 ${activeTab === 'tasks' ? 'border-brand-accent text-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10' : 'border-transparent text-brand-gray-dark dark:text-slate-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('kit')}
                            className={`flex-1 py-4 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 ${activeTab === 'kit' ? 'border-brand-accent text-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10' : 'border-transparent text-brand-gray-dark dark:text-slate-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            Kit Checklist
                        </button>
                        <button
                            onClick={() => setActiveTab('costs')}
                            className={`flex-1 py-4 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 ${activeTab === 'costs' ? 'border-brand-accent text-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10' : 'border-transparent text-brand-gray-dark dark:text-slate-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            Costs
                        </button>
                    </div>
                    <div className="p-6 flex-1 bg-slate-50/30 dark:bg-slate-900/30">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
      
      <Modal isOpen={isEmailModalOpen} onClose={() => { setIsEmailModalOpen(false); setIsCompletingTermination(false); }} title="Send Email">
         <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-lg font-medium text-brand-charcoal dark:text-white">To:</span>
                    <input 
                        type="email" 
                        value={emailTo} 
                        onChange={(e) => setEmailTo(e.target.value)}
                        className="flex-1 min-w-[250px] p-1 border-b border-slate-300 dark:border-slate-600 focus:border-brand-accent focus:outline-none text-brand-charcoal dark:text-white bg-transparent"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select onChange={handleEmailTemplateChange} className="form-select text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-50 dark:bg-slate-700 dark:text-white">
                        <option value="">Use a template...</option>
                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="email-subject" className="sr-only">Subject</label>
                <input
                    type="text"
                    id="email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                />
            </div>
            <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Write your email here..."
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent font-mono text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                rows={15}
            />
            <div className="flex justify-end space-x-3">
                <button onClick={() => { setIsEmailModalOpen(false); setIsCompletingTermination(false); }} className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                <button onClick={handleSendEmail} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Send Email</button>
            </div>
         </div>
      </Modal>

        <Modal isOpen={isWhatsAppMessageModalOpen} onClose={() => setIsWhatsAppMessageModalOpen(false)} title="Send WhatsApp Message">
            <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-lg font-medium text-brand-charcoal dark:text-white">To: {selectedCandidate.name}</h3>
                     <div className="flex items-center gap-2">
                        <select onChange={handleWhatsAppTemplateChange} className="form-select text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-50 dark:bg-slate-700 dark:text-white">
                            <option value="">Use a template...</option>
                            {whatsAppTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <textarea
                    value={whatsAppMessage}
                    onChange={(e) => setWhatsAppMessage(e.target.value)}
                    placeholder="Write your WhatsApp message here..."
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                    rows={6}
                />
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsWhatsAppMessageModalOpen(false)} className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleSendWhatsApp} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
                        <WhatsAppIcon className="w-5 h-5 mr-2" /> Open in WhatsApp
                    </button>
                </div>
            </div>
        </Modal>

        <Modal isOpen={isWhatsAppCallModalOpen} onClose={() => setIsWhatsAppCallModalOpen(false)} title="Log WhatsApp Call">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-brand-charcoal dark:text-white">Log a call with: {selectedCandidate.name}</h3>
                <textarea
                    value={whatsAppCallNotes}
                    onChange={(e) => setWhatsAppCallNotes(e.target.value)}
                    placeholder="Add any notes from the call (optional)..."
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                    rows={5}
                />
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsWhatsAppCallModalOpen(false)} className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleLogCall} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Log Call</button>
                </div>
            </div>
        </Modal>
        
        <ScheduleEventModal 
            isOpen={isScheduleEventModalOpen}
            onClose={() => setIsScheduleEventModalOpen(false)}
            candidate={selectedCandidate}
        />

        <Modal isOpen={isTerminationReasonModalOpen} onClose={() => { setIsTerminationReasonModalOpen(false); setIsCompletingTermination(false); }} title="Reason for Termination">
             <div className="space-y-4">
                <p className="text-sm text-brand-gray-dark dark:text-slate-400">
                    Please select a reason for terminating the contract with <strong>{selectedCandidate.name}</strong>. This will be included in the termination email.
                </p>
                <div>
                    <label htmlFor="termination-reason-type" className="block text-sm font-medium text-brand-gray-dark dark:text-slate-400">Reason</label>
                    <select 
                        id="termination-reason-type"
                        value={terminationReasonType}
                        onChange={e => setTerminationReasonType(e.target.value as TerminationReasonType)}
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">Select a reason...</option>
                        {Object.values(TerminationReasonType).map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>
                {terminationReasonType === TerminationReasonType.OTHER && (
                    <div>
                        <label htmlFor="termination-reason-other" className="block text-sm font-medium text-brand-gray-dark dark:text-slate-400">Please specify other reason</label>
                        <input
                            type="text"
                            id="termination-reason-other"
                            value={terminationReasonOther}
                            onChange={e => setTerminationReasonOther(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => { setIsTerminationReasonModalOpen(false); setIsCompletingTermination(false); }} className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleTerminationReasonSubmit} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Continue to Email</button>
                </div>
            </div>
        </Modal>
        
         <Modal isOpen={isWithdrawalReasonModalOpen} onClose={() => setIsWithdrawalReasonModalOpen(false)} title="Reason for Withdrawal">
             <div className="space-y-4">
                <p className="text-sm text-brand-gray-dark dark:text-slate-400">
                    Please select a reason why <strong>{selectedCandidate.name}</strong> has withdrawn from the process.
                </p>
                <div>
                    <label htmlFor="withdrawal-reason-type" className="block text-sm font-medium text-brand-gray-dark dark:text-slate-400">Reason</label>
                    <select 
                        id="withdrawal-reason-type"
                        value={withdrawalReasonType}
                        onChange={e => setWithdrawalReasonType(e.target.value as WithdrawalReasonType)}
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">Select a reason...</option>
                        {Object.values(WithdrawalReasonType).map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>
                {withdrawalReasonType === WithdrawalReasonType.OTHER && (
                    <div>
                        <label htmlFor="withdrawal-reason-other" className="block text-sm font-medium text-brand-gray-dark dark:text-slate-400">Please specify other reason</label>
                        <input
                            type="text"
                            id="withdrawal-reason-other"
                            value={withdrawalReasonOther}
                            onChange={e => setWithdrawalReasonOther(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => setIsWithdrawalReasonModalOpen(false)} className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleWithdrawalReasonSubmit} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Confirm Withdrawal</button>
                </div>
            </div>
        </Modal>

        <ManageKitModal
            isOpen={isManageKitModalOpen}
            onClose={() => setIsManageKitModalOpen(false)}
            candidate={selectedCandidate}
        />
        
        <ReconsiderCandidateModal
            isOpen={isReconsiderModalOpen}
            onClose={() => setIsReconsiderModalOpen(false)}
            candidate={selectedCandidate}
        />

        <EditCandidateModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            candidate={selectedCandidate}
        />

        <AddTaskModal 
            isOpen={isAddTaskModalOpen}
            onClose={() => setIsAddTaskModalOpen(false)}
            preSelectedCandidateId={selectedCandidate.id}
        />

    </div>
  );
};

export default CandidateDetailView;
