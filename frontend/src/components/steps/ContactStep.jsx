import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Check, Loader2, User, X } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../store/authStore';
import { Input, Select, SearchableSelect } from '../ui';
import { StepNavigation } from '../booking';
import { getPhoneCodes } from '../../utils/geoData';
import { contactService } from '../../services/contact.service';
import { cn } from '../../utils/cn';

const ContactStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const { user } = useAuth();

  const [savedContacts, setSavedContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState(
    bookingData.contact?._id || bookingData.contact?.id || ''
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [useProfile, setUseProfile] = useState(false);

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    phonePrefix: '+86',
    designation: '',
  });

  const phoneCodes = useMemo(() => getPhoneCodes(), []);

  useEffect(() => {
    contactService
      .getContacts()
      .then((list) => setSavedContacts(list))
      .catch(() => setSavedContacts([]))
      .finally(() => setIsLoadingContacts(false));
  }, []);

  // Auto-fill form from user profile when toggle is on
  useEffect(() => {
    if (useProfile && user) {
      setAddForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone?.replace(/^\+\d+\s/, '') || '',
        phonePrefix: user.phone?.match(/^\+\d+/)?.[0] || '+86',
        designation: user.designation || 'Client Contact',
      });
    }
  }, [useProfile, user]);

  const selectOptions = useMemo(() => [
    ...savedContacts.map((c) => ({ id: c._id, name: c.name })),
    { id: '__add_new__', name: '+ Add New Contact' },
  ], [savedContacts]);

  const selectedContact = savedContacts.find((c) => c._id === selectedContactId);

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setValidationError('');
    if (val === '__add_new__') {
      setShowAddForm(true);
      setSelectedContactId('');
    } else {
      setSelectedContactId(val);
      setShowAddForm(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (useProfile) setUseProfile(false);
  };

  const handleSaveContact = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.designation) {
      setValidationError('Please fill in all contact fields');
      return;
    }
    setIsSaving(true);
    try {
      const created = await contactService.createContact({
        name: addForm.name,
        email: addForm.email,
        phone: `${addForm.phonePrefix} ${addForm.phone}`,
        designation: addForm.designation,
      });
      setSavedContacts((prev) => [...prev, created]);
      setSelectedContactId(created._id);
      setShowAddForm(false);
      setAddForm({ name: '', email: '', phone: '', phonePrefix: '+86', designation: '' });
    } catch (err) {
      setValidationError(err.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setValidationError('');
    setUseProfile(false);
    setAddForm({ name: '', email: '', phone: '', phonePrefix: '+86', designation: '' });
  };

  const handleContinue = () => {
    if (!selectedContact) {
      setValidationError(
        showAddForm
          ? 'Please save the new contact before continuing'
          : 'Please select or add a contact person'
      );
      return;
    }
    updateStepData('contact', {
      _id: selectedContact._id,
      id: selectedContact._id,
      name: selectedContact.name,
      email: selectedContact.email,
      phone: selectedContact.phone,
      designation: selectedContact.designation,
    });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Users size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Factory Contact</h2>
        <p className="text-slate-500 font-medium">
          Select a saved contact or add a new one. Our inspector will reach out to this person to confirm the visit.
        </p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center">
          {validationError}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropdown */}
        {isLoadingContacts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Select Contact <span className="text-rose-500">*</span>
            </label>
            <Select
              name="contact"
              value={selectedContactId}
              onChange={handleDropdownChange}
              options={selectOptions}
              placeholder="Choose a saved contact or add new..."
            />
          </div>
        )}

        {/* Selected contact summary card */}
        <AnimatePresence>
          {selectedContact && !showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-blue-50 border border-blue-100 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Selected Contact</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-bold text-slate-500">Name:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.name}</span></p>
                <p><span className="font-bold text-slate-500">Email:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.email}</span></p>
                <p><span className="font-bold text-slate-500">Phone:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.phone}</span></p>
                <p><span className="font-bold text-slate-500">Designation:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.designation}</span></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/40 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">New Contact</h3>
                </div>
                <button onClick={cancelAdd} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Profile auto-fill toggle */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                    <User size={16} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Use my profile details</p>
                </div>
                <button
                  onClick={() => setUseProfile(!useProfile)}
                  className={cn(
                    'w-12 h-7 rounded-full relative transition-all duration-300',
                    useProfile ? 'bg-blue-600' : 'bg-slate-200'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                      useProfile ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <Input name="name" value={addForm.name} onChange={handleAddFormChange} placeholder="Enter Contact Name..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <Input type="email" name="email" value={addForm.email} onChange={handleAddFormChange} placeholder="Enter Email Address..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <SearchableSelect
                      name="phonePrefix"
                      value={addForm.phonePrefix}
                      onChange={handleAddFormChange}
                      options={phoneCodes}
                      className="w-32"
                      wrapperClassName="mb-0 w-32"
                      placeholder="+Code"
                      searchPlaceholder="Search..."
                    />
                    <Input
                      name="phone"
                      value={addForm.phone}
                      onChange={handleAddFormChange}
                      placeholder="Enter Phone Number..."
                      className="flex-1"
                      wrapperClassName="mb-0 flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <Input name="designation" value={addForm.designation} onChange={handleAddFormChange} placeholder="e.g. Factory Manager" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={handleSaveContact}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? 'Saving...' : 'Save Contact'}
                </button>
                <button onClick={cancelAdd} className="text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={handleContinue}
        isValid={!!selectedContact && !showAddForm}
        nextLabel="Continue to AQL"
      />
    </div>
  );
};

export default ContactStep;
