import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, Plus, Check, Loader2, X } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { Input, Select, SearchableSelect } from '../ui';
import { StepNavigation } from '../booking';
import { getPhoneCodes } from '../../utils/geoData';
import { factoryService } from '../../services/factory.service';

const FactoryStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();

  const [savedFactories, setSavedFactories] = useState([]);
  const [isLoadingFactories, setIsLoadingFactories] = useState(true);
  const [selectedFactoryId, setSelectedFactoryId] = useState(
    bookingData.factory?._id || bookingData.factory?.id || ''
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    address: '',
    phone: '',
    phonePrefix: '+86',
  });

  const phoneCodes = useMemo(() => getPhoneCodes(), []);

  useEffect(() => {
    factoryService
      .getFactories()
      .then((list) => setSavedFactories(list))
      .catch(() => setSavedFactories([]))
      .finally(() => setIsLoadingFactories(false));
  }, []);

  // Options for the select: saved factories + sentinel for Add New
  const selectOptions = useMemo(() => [
    ...savedFactories.map((f) => ({ id: f._id, name: f.name })),
    { id: '__add_new__', name: '+ Add New Factory' },
  ], [savedFactories]);

  const selectedFactory = savedFactories.find((f) => f._id === selectedFactoryId);

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setValidationError('');
    if (val === '__add_new__') {
      setShowAddForm(true);
      setSelectedFactoryId('');
    } else {
      setSelectedFactoryId(val);
      setShowAddForm(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFactory = async () => {
    if (!addForm.name || !addForm.address || !addForm.phone) {
      setValidationError('Please fill in all factory fields');
      return;
    }
    setIsSaving(true);
    try {
      const created = await factoryService.createFactory({
        name: addForm.name,
        location: addForm.address,
        phone: `${addForm.phonePrefix} ${addForm.phone}`,
      });
      setSavedFactories((prev) => [...prev, created]);
      setSelectedFactoryId(created._id);
      setShowAddForm(false);
      setAddForm({ name: '', address: '', phone: '', phonePrefix: '+86' });
    } catch (err) {
      setValidationError(err.message || 'Failed to save factory');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setValidationError('');
  };

  const handleContinue = () => {
    if (!selectedFactory) {
      setValidationError(
        showAddForm
          ? 'Please save the new factory before continuing'
          : 'Please select or add a factory'
      );
      return;
    }
    updateStepData('factory', {
      _id: selectedFactory._id,
      id: selectedFactory._id,
      name: selectedFactory.name,
      location: selectedFactory.location,
      phone: selectedFactory.phone,
    });
    nextStep();
  };

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Factory size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Factory Details</h2>
        <p className="text-slate-500 font-medium">
          Select a saved factory or add a new one.
        </p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center max-w-2xl mx-auto">
          {validationError}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropdown */}
        {isLoadingFactories ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Select Factory <span className="text-rose-500">*</span>
            </label>
            <Select
              name="factory"
              value={selectedFactoryId}
              onChange={handleDropdownChange}
              options={selectOptions}
              placeholder="Choose a saved factory or add new..."
            />
          </div>
        )}

        {/* Selected factory summary card */}
        <AnimatePresence>
          {selectedFactory && !showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Selected Factory</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-bold text-slate-500">Name:</span>{' '}<span className="text-slate-800 font-semibold">{selectedFactory.name}</span></p>
                <p><span className="font-bold text-slate-500">Address:</span>{' '}<span className="text-slate-800 font-semibold">{selectedFactory.location}</span></p>
                <p><span className="font-bold text-slate-500">Phone:</span>{' '}<span className="text-slate-800 font-semibold">{selectedFactory.phone}</span></p>
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
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">New Factory</h3>
                </div>
                <button onClick={cancelAdd} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Factory Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    placeholder="e.g. Guangzhou Manufacturing Hub"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Contact Number <span className="text-rose-500">*</span>
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
                      placeholder="XXX XXXX XXXX"
                      className="flex-1"
                      wrapperClassName="mb-0 flex-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Factory Full Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={addForm.address}
                    onChange={handleAddFormChange}
                    placeholder="Building number, street, district, city..."
                    rows={3}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={handleSaveFactory}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? 'Saving...' : 'Save Factory'}
                </button>
                <button
                  onClick={cancelAdd}
                  className="text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                >
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
        isValid={!!selectedFactory && !showAddForm}
        nextLabel="Continue to Contact"
      />
    </div>
  );
};

export default FactoryStep;
