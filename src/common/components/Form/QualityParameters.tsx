import React from 'react';
import { AlertTriangle } from 'lucide-react';
import FormField from './FormField';

interface QualitySpecs {
  FFA: { value: number; tolerance: number };
  IV: { value: number; tolerance: number };
  S: { value: number; tolerance: number };
  MI: { value: number; tolerance: number };
}

interface QualityWarnings {
  FFA?: string;
  IV?: string;
  S?: string;
  MI?: string;
}

interface QualityParameters {
  FFA: number;
  IV: number;
  S: number;
  MI: number;
}

interface QualityParametersProps {
  value: QualityParameters;
  onChange: (value: QualityParameters) => void;
  contractSpecs: QualitySpecs | null;
  error?: string;
}

interface FocusState {
  FFA: boolean;
  IV: boolean;
  S: boolean;
  MI: boolean;
}

export default function QualityParameters({
  value,
  onChange,
  contractSpecs,
  error
}: QualityParametersProps) {
  const [focusedFields, setFocusedFields] = React.useState<FocusState>({
    FFA: false,
    IV: false,
    S: false,
    MI: false
  });

  const handleFocus = (field: keyof QualityParameters) => {
    setFocusedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof QualityParameters) => {
    setFocusedFields(prev => ({ ...prev, [field]: false }));
  };

  const [warnings, setWarnings] = React.useState<QualityWarnings>({});
  const [showNotice, setShowNotice] = React.useState(false);

  // Validate quality against contract specs
  const validateQuality = React.useCallback((newValue: Partial<QualityParameters>) => {
    if (!contractSpecs) return;

    const newWarnings: QualityWarnings = {};
    let hasWarnings = false;

    // Check FFA
    if (newValue.FFA !== undefined) {
      if (newValue.FFA > contractSpecs.FFA.value * (1 + contractSpecs.FFA.tolerance)) {
        newWarnings.FFA = `Above contract spec (${contractSpecs.FFA.value})`;
        hasWarnings = true;
      }
    }

    // Check IV
    if (newValue.IV !== undefined) {
      if (Math.abs(newValue.IV - contractSpecs.IV.value) > contractSpecs.IV.tolerance) {
        newWarnings.IV = `Outside contract spec range (${contractSpecs.IV.value} ±${contractSpecs.IV.tolerance})`;
        hasWarnings = true;
      }
    }

    // Check S
    if (newValue.S !== undefined) {
      if (newValue.S > contractSpecs.S.value * (1 + contractSpecs.S.tolerance)) {
        newWarnings.S = `Above contract spec (${contractSpecs.S.value})`;
        hasWarnings = true;
      }
    }

    // Check MI
    if (newValue.MI !== undefined) {
      if (newValue.MI > contractSpecs.MI.value * (1 + contractSpecs.MI.tolerance)) {
        newWarnings.MI = `Above contract spec (${contractSpecs.MI.value})`;
        hasWarnings = true;
      }
    }

    setWarnings(newWarnings);
    setShowNotice(hasWarnings);
  }, [contractSpecs]);

  // Handle individual field changes
  const handleChange = (field: keyof QualityParameters, newValue: number) => {
    const updatedQuality = { ...value, [field]: newValue };
    onChange(updatedQuality);
    validateQuality(updatedQuality);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        <FormField 
          label="FFA" 
          error={warnings.FFA}
        >
          <div className="space-y-1">
            {contractSpecs && (
              <div className="text-sm text-gray-500">
                Contract spec: {contractSpecs.FFA.value} (±10% tolerance)
              </div>
            )}
            <div className="relative">
              <input
                type="number"
                value={focusedFields.FFA ? value.FFA || '' : value.FFA || 0}
                onChange={(e) => handleChange('FFA', Number(e.target.value))}
                onFocus={() => handleFocus('FFA')}
                onBlur={() => handleBlur('FFA')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  warnings.FFA 
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </FormField>

        <FormField 
          label="IV" 
          error={warnings.IV}
        >
          <div className="space-y-1">
            {contractSpecs && (
              <div className="text-sm text-gray-500">
                Contract spec: {contractSpecs.IV.value} (±5 tolerance)
              </div>
            )}
            <div className="relative">
              <input
                type="number"
                value={focusedFields.IV ? value.IV || '' : value.IV || 0}
                onChange={(e) => handleChange('IV', Number(e.target.value))}
                onFocus={() => handleFocus('IV')}
                onBlur={() => handleBlur('IV')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  warnings.IV
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </FormField>

        <FormField 
          label="S" 
          error={warnings.S}
        >
          <div className="space-y-1">
            {contractSpecs && (
              <div className="text-sm text-gray-500">
                Contract spec: {contractSpecs.S.value} (±10% tolerance)
              </div>
            )}
            <div className="relative">
              <input
                type="number"
                value={focusedFields.S ? value.S || '' : value.S || 0}
                onChange={(e) => handleChange('S', Number(e.target.value))}
                onFocus={() => handleFocus('S')}
                onBlur={() => handleBlur('S')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  warnings.S
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </FormField>

        <FormField 
          label="M&I" 
          error={warnings.MI}
        >
          <div className="space-y-1">
            {contractSpecs && (
              <div className="text-sm text-gray-500">
                Contract spec: {contractSpecs.MI.value} (±10% tolerance)
              </div>
            )}
            <div className="relative">
              <input
                type="number"
                value={focusedFields.MI ? value.MI || '' : value.MI || 0}
                onChange={(e) => handleChange('MI', Number(e.target.value))}
                onFocus={() => handleFocus('MI')}
                onBlur={() => handleBlur('MI')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  warnings.MI
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </FormField>
      </div>

      {showNotice && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Quality Parameters Notice:</h4>
              <p className="mt-1 text-sm text-amber-700">
                Values outside contract specifications will be aggregated at shipment level. Tank quality parameters can
                exceed contract specs as final quality is calculated as weighted average across all tanks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}