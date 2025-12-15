
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Candidate, Note, Template, TemplateType } from '../types';
import { generateEmailTemplate } from '../services/geminiService';
import { SearchIcon, SparklesIcon, ArrowPathIcon, EmailIcon } from './icons';
import RichTextEditor from './RichTextEditor';

const EmailCenterView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { candidates, templates } = state;
    
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPurpose, setAiPurpose] = useState('scheduling a first interview');
    const [dragOverTemplateId, setDragOverTemplateId] = useState<string | null>(null);

    const emailTemplates = templates.filter(t => t.type === TemplateType.EMAIL);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [candidates, searchQuery]);
    
    const handleSelectCandidate = (candidate: Candidate) => {
        if (selectedCandidate?.id !== candidate.id) {
             setSelectedCandidate(candidate);
             setEmailSubject('');
             setEmailBody('');
        }
    };

    const applyTemplate = (content: string, candidate: Candidate, subject?: string) => {
        const processedContent = content
            .replace(/\{candidateName\}/g, candidate.name)
            .replace(/\{jobTitle\}/g, 'Trade Plate Driver');
        
        const processedSubject = subject
            ? subject.replace(/\{candidateName\}/g, candidate.name)
            : '';
            
        // Convert plain text newlines to HTML breaks for RTE
        const htmlContent = processedContent.replace(/\n/g, '<br/>');

        return { content: htmlContent, subject: processedSubject };
    };

    const handleDropOnTemplate = (e: React.DragEvent, template: Template) => {
        e.preventDefault();
        const candidateId = e.dataTransfer.getData('candidateId');
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            setSelectedCandidate(candidate);
            const { content, subject } = applyTemplate(template.content, candidate, template.subject);
            setEmailSubject(subject);
            setEmailBody(content);
        }
        setDragOverTemplateId(null);
    };

    const handleGenerateEmail = async () => {
        if (!selectedCandidate) return;
        setIsGenerating(true);
        try {
            const { subject, body } = await generateEmailTemplate(selectedCandidate.name, 'Trade Plate Driver', aiPurpose);
            setEmailSubject(subject);
            // Convert plain text result from AI to HTML
            setEmailBody(body.replace(/\n/g, '<br/>'));
        } catch (error) {
            console.error("Failed to generate email", error);
            setEmailBody("Sorry, couldn't generate an email at this time.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendEmail = () => {
        if (!selectedCandidate || !emailSubject.trim() || !emailBody.trim()) {
            alert("Please select a candidate and fill in both subject and body.");
            return;
        };

        // Convert HTML body to Plain Text for mailto
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = emailBody;
        // Use innerText to approximate layout preservation
        const plainTextBody = tempDiv.innerText;

        // Use mailto to open Outlook/default client
        const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(plainTextBody)}`;
        window.location.href = mailtoLink;

        // Log the rich HTML content in notes
        const newNote: Note = {
            id: `n-${Date.now()}`,
            content: `Email opened in default client from Email Centre\nSubject: ${emailSubject}\n\nContent:\n${emailBody.substring(0, 300)}${emailBody.length > 300 ? '...' : ''}`,
            author: 'Admin',
            date: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_NOTE', payload: { candidateId: selectedCandidate.id, note: newNote } });
        
        setEmailSubject('');
        setEmailBody('');
        setSelectedCandidate(null);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden h-[calc(100vh-8rem)] flex flex-col transition-colors duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white">Email Centre</h1>
                <p className="text-brand-gray-dark dark:text-slate-400 mt-1">Compose and send emails to candidates.</p>
            </div>
            <div className="flex-1 flex min-h-0">
                {/* Candidate List Panel */}
                <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400"
                            />
                        </div>
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {filteredCandidates.map(c => (
                            <li 
                                key={c.id} 
                                draggable="true" 
                                onDragStart={(e) => e.dataTransfer.setData('candidateId', c.id)}
                                onClick={() => handleSelectCandidate(c)}
                                className={`p-4 flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${selectedCandidate?.id === c.id ? 'bg-brand-accent/10 dark:bg-brand-accent/20' : ''}`}
                            >
                                <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-full mr-3 bg-slate-200 dark:bg-slate-600 object-contain p-1" />
                                <div>
                                    <p className="font-medium text-brand-charcoal dark:text-white">{c.name}</p>
                                    <p className="text-sm text-brand-gray-dark dark:text-slate-400">{c.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Email Composition Panel */}
                <div className="w-2/3 flex flex-col bg-white dark:bg-slate-800 transition-colors duration-200">
                    {selectedCandidate ? (
                        <>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm">
                                        <span className="font-medium text-brand-gray-dark dark:text-slate-400">To: </span> 
                                        <span className="text-brand-charcoal dark:text-white font-medium">{selectedCandidate.name} &lt;{selectedCandidate.email}&gt;</span>
                                    </p>
                                    <button onClick={() => setSelectedCandidate(null)} className="text-sm text-brand-accent hover:underline">Choose Template Instead</button>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Email Subject"
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col overflow-hidden">
                                <RichTextEditor
                                    value={emailBody}
                                    onChange={setEmailBody}
                                    placeholder="Compose your email..."
                                    className="w-full flex-1"
                                />
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                 <div className="flex items-center gap-2 flex-wrap">
                                     <span className="text-sm text-brand-gray-dark dark:text-slate-400">AI Purpose:</span>
                                     <select value={aiPurpose} onChange={(e) => setAiPurpose(e.target.value)} className="form-select text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-50 bg-white dark:bg-slate-700 dark:text-white">
                                         <option value="scheduling a first interview">Schedule Interview</option>
                                         <option value="rejecting the candidate after review">Reject Candidate</option>
                                         <option value="sending a job offer">Send Offer</option>
                                         <option value="following up after an interview">Follow-up</option>
                                     </select>
                                    <button onClick={handleGenerateEmail} disabled={isGenerating} className="flex items-center bg-brand-accent/10 text-brand-accent px-3 py-1.5 rounded-md text-sm font-medium hover:bg-brand-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                       {isGenerating ? <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                                       Generate with AI
                                    </button>
                                </div>
                                <button onClick={handleSendEmail} className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                                    Send Email
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col p-6 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-semibold text-brand-charcoal dark:text-white">Choose a Template</h2>
                                <p className="text-brand-gray-dark dark:text-slate-400">Drag and drop a candidate onto a template to start.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                                {emailTemplates.map(template => (
                                    <div 
                                        key={template.id}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverTemplateId(template.id); }}
                                        onDragLeave={() => setDragOverTemplateId(null)}
                                        onDrop={(e) => handleDropOnTemplate(e, template)}
                                        className={`p-4 border-2 rounded-lg transition-all ${dragOverTemplateId === template.id ? 'border-brand-accent bg-brand-accent/10 dark:bg-brand-accent/20' : 'border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'}`}
                                    >
                                        <h3 className="font-semibold text-brand-charcoal dark:text-white">{template.name}</h3>
                                        <p className="text-sm text-brand-gray-dark dark:text-slate-400 mt-1 line-clamp-2">{template.subject}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailCenterView;
