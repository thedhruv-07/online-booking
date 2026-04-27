import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Settings,
  Search,
  FileText,
  CheckCircle2,
  ChevronDown,
  Loader2,
  CheckSquare,
  Square,
  Globe,
  Tag
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
// Import from shared pricing (Vite allow fs: .. is required)
import * as SHARED_PRICING_MODULE from '@shared/pricing';
const SHARED_PRICING = SHARED_PRICING_MODULE.default || SHARED_PRICING_MODULE;
const { services, calculateFinalPrice, COVERED_COUNTRIES, bundles } = SHARED_PRICING;
import { cn } from '../../utils/cn';
import { locationService } from '../../services/location.service';

const serviceIcons = {
  'pre-shipment': ShieldCheck,
  'during-production': Settings,
  'audit': Search,
  'social-audit': ShieldCheck,
  'container-loading': FileText,
};

const ServiceStep = () => {
  const { updateStepData, bookingData, nextStep } = useBooking();
  
  const [selectedServices, setSelectedServices] = useState(bookingData.service?.selected || []);
  const [openCategories, setOpenCategories] = useState(['Inspection+', 'Inspection', 'Audit']);
  const [locationData, setLocationData] = useState({ 
    country: bookingData.service?.country || '', 
    region: bookingData.service?.region || 'other',
    loading: !bookingData.service?.country,
    manual: false
  });

  useEffect(() => {
    if (!bookingData.service?.country) {
      locationService.detectLocation()
        .then(data => {
          setLocationData({ 
            country: data.country || 'US', 
            region: data.region || 'other', 
            loading: false,
            manual: false
          });
        })
        .catch(() => {
          setLocationData(prev => ({ ...prev, loading: false, manual: true, country: 'US' }));
        });
    }
  }, [bookingData.service?.country]);

  const pricingResult = useMemo(() => {
    return calculateFinalPrice(selectedServices, locationData.country);
  }, [selectedServices, locationData.country]);

  const toggleCategory = (category) => {
    setOpenCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSelect = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  const handleBundleSelect = (bundle) => {
    const allIncludedSelected = bundle.includes.every(id => selectedServices.includes(id));
    
    if (allIncludedSelected) {
      // If all are selected, deselect them all
      setSelectedServices(prev => prev.filter(id => !bundle.includes.includes(id)));
    } else {
      // If some/none are selected, select them all (avoid duplicates)
      setSelectedServices(prev => [...new Set([...prev, ...bundle.includes])]);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    const region = COVERED_COUNTRIES.includes(country) ? 'covered' : 'other';
    setLocationData({ country, region, loading: false, manual: true });
  };

  const handleNext = () => {
    updateStepData('service', {
      ...pricingResult,
      name: services
        .filter(s => selectedServices.includes(s.id))
        .map(s => s.name)
        .join(', ') || 'Custom Package'
    });
    nextStep();
  };

  const allCategories = [...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Build your service package</h2>
        <p className="text-slate-500 font-medium">
          Select the inspections or audits you need. 
          Bundles are automatically detected and discounts applied at checkout.
        </p>
      </div>

      {/* Location Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Factory Location</h3>
            <p className="text-xs text-slate-500">Determines regional pricing tiers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {locationData.loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm italic">
              <Loader2 className="animate-spin" size={16} />
              Detecting...
            </div>
          ) : (
            <select
              value={locationData.country}
              onChange={handleCountryChange}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="US">Standard (Global / US)</option>
              <optgroup label="Covered Regions">
                {COVERED_COUNTRIES.map(code => (
                  <option key={code} value={code}>{code} (Covered)</option>
                ))}
              </optgroup>
              <optgroup label="Other Countries">
                 <option value="GB">United Kingdom (GB)</option>
                 <option value="DE">Germany (DE)</option>
                 <option value="FR">France (FR)</option>
                 {/* This could be a larger list or just ISO codes */}
              </optgroup>
            </select>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {allCategories.map((category) => {
          const categoryServices = services.filter((s) => s.category === category);
          const isBundleCategory = category === 'Inspection+';
          const isOpen = openCategories.includes(category);

          return (
            <div key={category} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800">{category}</h3>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                    {isBundleCategory ? bundles.length : categoryServices.length}
                  </span>
                </div>
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
                    <div className="flex flex-col bg-white">
                      {isBundleCategory ? (
                        <>
                          {/* Render Bundles First */}
                          {bundles.map((bundle) => {
                            const isAllSelected = bundle.includes.every(id => selectedServices.includes(id));
                            const someSelected = bundle.includes.some(id => selectedServices.includes(id));

                            return (
                              <div
                                key={bundle.id}
                                onClick={() => handleBundleSelect(bundle)}
                                className={cn(
                                  "flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-colors border-b border-slate-50 cursor-pointer hover:bg-indigo-50/20",
                                  isAllSelected && "bg-indigo-50/40"
                                )}
                              >
                                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                  <div className="mt-1">
                                    {isAllSelected ? (
                                      <CheckSquare size={20} className="text-indigo-600" />
                                    ) : someSelected ? (
                                      <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
                                         <div className="w-2.5 h-0.5 bg-indigo-600 rounded-full" />
                                      </div>
                                    ) : (
                                      <Square size={20} className="text-slate-300" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-base font-bold text-slate-800">{bundle.name}</h4>
                                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                        Save ${bundle.discount}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                      Includes: {bundle.includes.map(id => services.find(s => s.id === id)?.name).join(', ')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Render Individual Inspection+ Services */}
                          {categoryServices.map((service) => {
                            const isSelected = selectedServices.includes(service.id);
                            const price = service.pricing[locationData.region];

                            return (
                              <div
                                key={service.id}
                                onClick={() => handleSelect(service.id)}
                                className={cn(
                                  "flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-colors border-b border-slate-50 last:border-b-0 cursor-pointer hover:bg-slate-50",
                                  isSelected && "bg-indigo-50/30"
                                )}
                              >
                                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                  <div className="mt-1">
                                    {isSelected ? (
                                      <CheckSquare size={20} className="text-indigo-600" />
                                    ) : (
                                      <Square size={20} className="text-slate-300" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className={cn(
                                      "text-base font-bold",
                                      isSelected ? "text-indigo-900" : "text-slate-700"
                                    )}>
                                      {service.name}
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xl">{service.description}</p>
                                  </div>
                                </div>

                                <div className="sm:ml-4 flex items-center shrink-0">
                                    <div className={cn(
                                      "font-bold text-lg",
                                      isSelected ? "text-indigo-700" : "text-slate-700"
                                    )}>
                                      ${price}
                                    </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        // Render Individual Services
                        categoryServices.map((service) => {
                          const isSelected = selectedServices.includes(service.id);
                          const price = service.pricing[locationData.region];

                          return (
                            <div
                              key={service.id}
                              onClick={() => handleSelect(service.id)}
                              className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-colors border-b border-slate-50 last:border-b-0 cursor-pointer hover:bg-slate-50",
                                isSelected && "bg-indigo-50/30"
                              )}
                            >
                              <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                <div className="mt-1">
                                  {isSelected ? (
                                    <CheckSquare size={20} className="text-indigo-600" />
                                  ) : (
                                    <Square size={20} className="text-slate-300" />
                                  )}
                                </div>
                                <div>
                                  <h4 className={cn(
                                    "text-base font-bold",
                                    isSelected ? "text-indigo-900" : "text-slate-700"
                                  )}>
                                    {service.name}
                                  </h4>
                                  <p className="text-sm text-slate-500 mt-1 max-w-xl">{service.description}</p>
                                </div>
                              </div>

                              <div className="sm:ml-4 flex items-center shrink-0">
                                  <div className={cn(
                                    "font-bold text-lg",
                                    isSelected ? "text-indigo-700" : "text-slate-700"
                                  )}>
                                    ${price}
                                  </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Static Summary Card (Appears after Audit) */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-8 group transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 duration-300">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {locationData.country} • {locationData.region === 'covered' ? 'Covered Region' : 'Standard Region'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">${pricingResult.totalAmount}</span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Est. Amount</span>
                </div>
              </div>
            </div>

            {pricingResult.discount > 0 && (
              <div className="bg-emerald-50 border border-emerald-100/50 px-4 py-2 rounded-xl flex items-center gap-3">
                <Tag size={16} className="text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-emerald-700 font-bold text-xs leading-none">BUNDLE DISCOUNT</span>
                  <span className="text-emerald-600/70 font-semibold text-[9px] mt-1">Saved ${pricingResult.discount}</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleNext}
            disabled={selectedServices.length === 0}
            className={cn(
              "w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              selectedServices.length > 0 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20" 
                : "bg-slate-100 text-slate-400"
            )}
          >
            Continue to Location
          </button>
        </div>
      </div>




    </div>
  );
};

export default ServiceStep;
