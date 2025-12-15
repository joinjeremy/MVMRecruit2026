
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Candidate, ReferralSourceType, ReferralSource } from '../types';

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

const EditCandidateModal: React.FC<EditCandidateModalProps> = ({ isOpen, onClose, candidate }) => {
  const { dispatch } = useAppContext();

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
  });

  useEffect(() => {
    if (candidate) {
        setFormData({
            name: candidate.name || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            dateOfBirth: candidate.dateOfBirth || '',
            address: candidate.address || '',
            postcode: candidate.postcode || '',
            licensePoints: candidate.licensePoints || 0,
            offRoadParking: candidate.offRoadParking || false,
            referralSourceType: candidate.referralSource?.type || '',
            referralSourceDetail: candidate.referralSource?.detail || '',
        });
    }
  }, [candidate, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || (!formData.email.trim() && !formData.phone.trim())) {
        alert('A name and a telephone number or email is required.');
        return;
    }

    const referralSource: ReferralSource | undefined = formData.referralSourceType
        ? {
            type: formData.referralSourceType as ReferralSourceType,
            detail: formData.referralSourceDetail,
          }
        : undefined;

    const updatedCandidate: Candidate = {
      ...candidate,
      ...formData,
      licensePoints: Number(formData.licensePoints),
      referralSource,
    };

    dispatch({ type: 'UPDATE_CANDIDATE', payload: updatedCandidate });
    onClose();
  };
  
  const showReferralDetail = formData.referralSourceType === ReferralSourceType.REFERRAL || formData.referralSourceType === ReferralSourceType.OTHER;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Candidate Details">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-brand-charcoal border-b border-slate-200 pb-2 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-brand-gray-dark">Full Name</label>
                  <input type="text" name="name" id="edit-name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-brand-gray-dark">Email</label>
                    <input type="email" name="email" id="edit-email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="edit-phone" className="block text-sm font-medium text-brand-gray-dark">Phone</label>
                    <input type="tel" name="phone" id="edit-phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-dateOfBirth" className="block text-sm font-medium text-brand-gray-dark">Date of Birth</label>
                  <input type="date" name="dateOfBirth" id="edit-dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-brand-charcoal border-b border-slate-200 pb-2 mb-4">Address & Driving Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-address" className="block text-sm font-medium text-brand-gray-dark">Address</label>
                  <input type="text" name="address" id="edit-address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-postcode" className="block text-sm font-medium text-brand-gray-dark">Postcode</label>
                    <input type="text" name="postcode" id="edit-postcode" value={formData.postcode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="edit-licensePoints" className="block text-sm font-medium text-brand-gray-dark">Licence Points</label>
                    <input type="number" name="licensePoints" id="edit-licensePoints" value={formData.licensePoints} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <input id="edit-offRoadParking" name="offRoadParking" type="checkbox" checked={formData.offRoadParking} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent" />
                  <label htmlFor="edit-offRoadParking" className="ml-3 text-sm font-medium text-brand-gray-dark">Off-road Parking Available</label>
                </div>
              </div>
            </section>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-brand-charcoal border-b border-slate-200 pb-2 mb-4">Sourcing</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-referralSourceType" className="block text-sm font-medium text-brand-gray-dark">Referral Source</label>
                  <select name="referralSourceType" id="edit-referralSourceType" value={formData.referralSourceType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                      <option value="">Select a source...</option>
                      {Object.values(ReferralSourceType).map(source => (
                      <option key={source} value={source}>{source}</option>
                      ))}
                  </select>
                </div>
                {showReferralDetail && (
                  <div>
                      <label htmlFor="edit-referralSourceDetail" className="block text-sm font-medium text-brand-gray-dark">
                          {formData.referralSourceType === ReferralSourceType.REFERRAL ? 'Referred by whom?' : 'Please specify'}
                      </label>
                      <input type="text" name="referralSourceDetail" id="edit-referralSourceDetail" value={formData.referralSourceDetail} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>

        <div className="flex justify-end space-x-3 pt-8 mt-8 border-t border-slate-200">
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
          <button type="submit" className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCandidateModal;
