import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { products as mockProducts } from '../../utils/constants';

/**
 * Step 3: Product Information
 */
const ProductStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const [productType, setProductType] = useState(bookingData.product?.type || '');
  const [customProduct, setCustomProduct] = useState(bookingData.product?.name || '');

  const handleContinue = () => {
    const productData = productType === 'other'
      ? { type: 'other', name: customProduct }
      : mockProducts.find(p => p.id === productType);

    updateStepData('product', productData);
    nextStep();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Product Information</h2>
      <p className="text-gray-600 mb-6">
        What type of product do you need inspected?
      </p>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Select Product</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setProductType(product.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                productType === product.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="product"
                  value={product.id}
                  checked={productType === product.id}
                  onChange={() => setProductType(product.id)}
                  className="mt-1"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Other option */}
          <div
            onClick={() => setProductType('other')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              productType === 'other'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="product"
                value="other"
                checked={productType === 'other'}
                onChange={() => setProductType('other')}
                className="mt-1"
              />
              <div>
                <h3 className="font-semibold text-gray-900">Other / Custom</h3>
                <p className="text-sm text-gray-500">Specify your product</p>
              </div>
            </div>
          </div>
        </div>

        {productType === 'other' && (
          <div className="mt-4">
            <Input
              label="Describe your product"
              value={customProduct}
              onChange={(e) => setCustomProduct(e.target.value)}
              placeholder="e.g., Electronic components, Textiles, etc."
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={prevStep}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!productType || (productType === 'other' && !customProduct)}
        >
          Continue to Upload
        </Button>
      </div>
    </div>
  );
};

export default ProductStep;
