import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Settings,
  Search,
  FileText,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { services as mockServices } from '../../utils/constants';
import { cn } from '../../utils/cn';
import { StepNavigation } from '../booking';

// Mapping icons to service IDs (mock data)
const serviceIcons = {
  'pre-shipment': ShieldCheck,
  'during-production': Settings,
  'factory-audit': Search,
  'container-loading': FileText,
};

const ServiceStep = () => {
  const { updateStepData, bookingData, nextStep } = useBooking();
  const [selectedServiceId, setSelectedServiceId] = useState(bookingData.service?.id || '');
  const [openCategory, setOpenCategory] = useState('Inspection');

  const handleSelect = (service) => {
    setSelectedServiceId(service.id);
    updateStepData('service', {
      id: service.id,
      name: service.name,
      price: service.price
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What service do you need?</h2>
        <p className="text-slate-500 font-medium">Select the type of inspection that best fits your requirements. You can add more details in the next steps.</p>
      </div>

      <div className="space-y-4">
        {['Inspection', 'Audit', 'Inspection+'].map((category) => {
          const categoryServices = mockServices.filter((s) => s.category === category);
          
          if (categoryServices.length === 0) return null;

          const isOpen = openCategory === category;

          return (
            <div key={category} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button 
                onClick={() => setOpenCategory(isOpen ? null : category)}
                className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <h3 className="text-xl font-bold text-slate-800">{category}</h3>
                <ChevronDown className={cn("text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col bg-white border-t border-slate-100">
                      {categoryServices.map((service) => {
                        const Icon = serviceIcons[service.id] || ShieldCheck;
                        const isSelected = selectedServiceId === service.id;

                        return (
                          <div
                            key={service.id}
                            onClick={() => handleSelect(service)}
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0",
                              isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                                isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                              )}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <h4 className={cn(
                                  "text-base font-semibold",
                                  isSelected ? "text-indigo-900" : "text-slate-700"
                                )}>
                                  {service.name}
                                </h4>
                                <p className="text-sm text-slate-500">{service.description}</p>
                              </div>
                            </div>

                            <div className="sm:ml-4 flex justify-end shrink-0">
                              {isSelected ? (
                                <div className="flex items-center text-indigo-600 font-semibold text-sm">
                                  <CheckCircle2 size={18} className="mr-1" />
                                  Selected
                                </div>
                              ) : (
                                <div className="px-4 py-1.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                                  Select
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <StepNavigation 
        onNext={nextStep}
        isValid={!!selectedServiceId}
        isFirstStep={true}
        nextLabel="Continue to Location"
      />
    </div>
  );
};

export default ServiceStep;
