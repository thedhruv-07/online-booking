import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Settings,
  Search,
  FileText,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { services as mockServices } from '../../utils/constants';
import { cn } from '../../utils/cn';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockServices.map((service) => {
          const Icon = serviceIcons[service.id] || ShieldCheck;
          const isSelected = selectedServiceId === service.id;

          return (
            <motion.div
              key={service.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(service)}
              className={cn(
                "relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col h-full",
                isSelected
                  ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100"
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-indigo-600">
                  <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                </div>
              )}

              <div className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center mb-6 transition-colors",
                isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              )}>
                <Icon size={20} />
              </div>

              <div className="flex-1">
                <h3 className={cn(
                  "text-lg font-bold mb-2 transition-colors",
                  isSelected ? "text-slate-900" : "text-slate-700"
                )}>
                  {service.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Starting at</span>
                  <span className="text-xl font-bold text-slate-900">${service.price.toFixed(2)}</span>
                </div>
                <div className={cn(
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"
                )}>
                  {isSelected ? "Selected" : "Select"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-10 flex justify-end">
        <button
          onClick={nextStep}
          disabled={!selectedServiceId}
          className={cn(
            "btn-primary flex items-center gap-2",
            !selectedServiceId && "opacity-50 cursor-not-allowed"
          )}
        >
          Continue to Location
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
        </button>
      </div>
    </div>
  );
};

export default ServiceStep;
