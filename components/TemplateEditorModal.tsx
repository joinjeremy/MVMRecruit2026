import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Template, TemplateType } from '../types';

interface TemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    template?: Template | null;
}

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ isOpen, onClose, template }) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        type: TemplateType.EMAIL,
        subject: '',
        content: '',
    });

    const isEditing = !!template;

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                type: template.type,
                subject: template.subject || '',
                content: template.content,
            });
        } else {
            setFormData({ name: '', type: TemplateType.EMAIL, subject: '', content: '' });
        }
    }, [template, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.content.trim()) {
            alert("Template name and content are required.");
            return;
        }

        if (isEditing) {
            dispatch({
                type: 'UPDATE_TEMPLATE',
                payload: { ...template, ...formData }
            });
        } else {
            const newTemplate: Template = {
                id: `tpl-${Date.now()}`,
                ...formData
            };
            dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Template' : 'Create New Template'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-gray-dark">Template Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-brand-gray-dark">Template Type</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                        <option value={TemplateType.EMAIL}>Email</option>
                        <option value={TemplateType.WHATSAPP}>WhatsApp</option>
                    </select>
                </div>
                {formData.type === TemplateType.EMAIL && (
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-brand-gray-dark">Subject</label>
                        <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    </div>
                )}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-brand-gray-dark">Content</label>
                    <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows={8} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                    <p className="text-xs text-slate-500 mt-1">Use placeholders like {"{candidateName}"}.</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                        {isEditing ? 'Save Changes' : 'Create Template'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TemplateEditorModal;
