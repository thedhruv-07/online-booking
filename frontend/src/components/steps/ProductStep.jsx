import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Package, FileText, Hash, Calendar, Layers, ShoppingBag } from 'lucide-react';

/**
 * Step 3: Product Information
 */
const ProductStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  
  const [formData, setFormData] = useState({
    name: bookingData.product?.name || '',
    description: bookingData.product?.description || '',
    unitType: bookingData.product?.unitType || '',
    quantity: bookingData.product?.quantity || '',
    piecesInSet: bookingData.product?.piecesInSet || '',
    poNumber: bookingData.product?.poNumber || '',
    inspectionDate: bookingData.product?.inspectionDate || '',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationError) setValidationError('');
  };

  const handleContinue = () => {
    if (!formData.description || !formData.unitType || !formData.quantity || !formData.inspectionDate) {
      setValidationError('Please fill in all mandatory fields');
      return;
    }

    updateStepData('product', {
      ...formData,
      type: 'custom'
    });
    nextStep();
  };

  const unitTypes = [
    { id: 'pieces', name: 'Pieces' },
    { id: 'set', name: 'Set' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Package size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Details</h2>
        <p className="text-slate-500 font-medium">Provide detailed information about the products to be inspected. This helps our team prepare the correct testing protocols.</p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <ShoppingBag size={14} className="text-orange-500" />
            Product Name
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Product Name ..."
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <FileText size={14} className="text-orange-500" />
            Product Description <span className="text-rose-500">*</span>
          </label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter Product Description ..."
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {/* Type of Unit */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" />
            Type of Unit <span className="text-rose-500">*</span>
          </label>
          <Select
            name="unitType"
            value={formData.unitType}
            onChange={handleChange}
            options={unitTypes}
            placeholder="Select Unit Type"
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Hash size={14} className="text-orange-500" />
            Quantity <span className="text-rose-500">*</span>
          </label>
          <Input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter Quantity ..."
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {/* Pieces In Set */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" />
            Pieces In Set (If Any)
          </label>
          <Input
            type="number"
            name="piecesInSet"
            value={formData.piecesInSet}
            onChange={handleChange}
            placeholder="Enter Pieces In Set ..."
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {/* PO Number */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <FileText size={14} className="text-orange-500" />
            Purchase Order Number
          </label>
          <Input
            name="poNumber"
            value={formData.poNumber}
            onChange={handleChange}
            placeholder="Enter PO Number ..."
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {/* Inspection Date */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Calendar size={14} className="text-orange-500" />
            Inspection Date <span className="text-rose-500">*</span>
          </label>
          <Input
            type="date"
            name="inspectionDate"
            value={formData.inspectionDate}
            onChange={handleChange}
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={prevStep}
          className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleContinue}
          className="h-14 px-10 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 shadow-lg"
        >
          Continue to Upload
        </Button>
      </div>
    </div>
  );
};

export default ProductStep;
