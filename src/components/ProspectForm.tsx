import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, AlertTriangle, Sun, Moon } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { formatCurrency, formatPercentage, unformatCurrency, unformatPercentage, formatNumberWithCommas, unformatNumber } from '../utils/formatting';
import { useAuth } from '../contexts/AuthContext';
import { callBayesianAPI, formatFormDataForBayesian, validateBayesianInput, BayesianPredictionInput } from '../utils/bayesianApi';

type HealthPlanRow = {
  id: string;
  healthPlanName: string;
  deductibleIndividual: string;
  deductibleFamily: string;
  deductibleType: 'embedded' | 'aggregate';
  oopIndividual: string;
  oopFamily: string;
  oopType: 'embedded' | 'aggregate';
  coinsuranceIndividual: string;
  coinsuranceFamily: string;
  employeeDistribution: string;
  hasCopays: 'yes' | 'no';
  copayType: string;
};

export default function ProspectForm() {
  const { user } = useAuth();
  const [prospectName, setProspectName] = useState('');
  const [prospectIndustry, setProspectIndustry] = useState('');
  const [accountLink, setAccountLink] = useState('');
  const [unionType, setUnionType] = useState('');
  const [eligibleEmployees, setEligibleEmployees] = useState('');
  const [eligibleMembers, setEligibleMembers] = useState('');
  const [consultant, setConsultant] = useState('');
  const [channelPartnership, setChannelPartnership] = useState('');
  const [healthplanPartnership, setHealthplanPartnership] = useState('');
  const [needsCignaSlides, setNeedsCignaSlides] = useState('');
  const [scenariosCount, setScenariosCount] = useState('');
  const [rxCoverageType, setRxCoverageType] = useState('');
  const [eggFreezingCoverage, setEggFreezingCoverage] = useState('');
  const [fertilityPepm, setFertilityPepm] = useState('');
  const [fertilityCaseRate, setFertilityCaseRate] = useState('');
  const [implementationFee, setImplementationFee] = useState('');
  const [currentFertilityBenefit, setCurrentFertilityBenefit] = useState('');
  const [fertilityAdministrator, setFertilityAdministrator] = useState('');
  const [combinedMedicalRxBenefit, setCombinedMedicalRxBenefit] = useState('');
  const [currentFertilityMedicalLimit, setCurrentFertilityMedicalLimit] = useState('');
  const [medicalLtmType, setMedicalLtmType] = useState('');
  const [currentFertilityRxLimit, setCurrentFertilityRxLimit] = useState('');
  const [rxLtmType, setRxLtmType] = useState('');
  const [medicalBenefitDetails, setMedicalBenefitDetails] = useState('');
  const [rxBenefitDetails, setRxBenefitDetails] = useState('');
  const [currentElectiveEggFreezing, setCurrentElectiveEggFreezing] = useState('');
  const [liveBirths12mo, setLiveBirths12mo] = useState('');
  const [currentBenefitPepm, setCurrentBenefitPepm] = useState('');
  const [currentBenefitCaseFee, setCurrentBenefitCaseFee] = useState('');
  const [includeNoBenefitColumn, setIncludeNoBenefitColumn] = useState('');
  const [dollarMaxColumn, setDollarMaxColumn] = useState('');
  const [competingAgainst, setCompetingAgainst] = useState<string[]>([]);
  const [adoptionSurrogacyEstimates, setAdoptionSurrogacyEstimates] = useState('');
  const [adoptionCoverage, setAdoptionCoverage] = useState('');
  const [adoptionFrequency, setAdoptionFrequency] = useState('');
  const [surrogacyCoverage, setSurrogacyCoverage] = useState('');
  const [surrogacyFrequency, setSurrogacyFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [defaultDueDate, setDefaultDueDate] = useState('');
  const [rushReason, setRushReason] = useState('');
  const [showRushReason, setShowRushReason] = useState(false);
  const [distributionType, setDistributionType] = useState<'number' | 'percentage' | 'unknown'>('percentage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<boolean>(false);
  const [confirmSubmit, setConfirmSubmit] = useState<boolean>(false);
  const [distributionError, setDistributionError] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Theme-aware styling helpers
  const labelClass = `block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`;
  const inputClass = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm hover:shadow ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`;
  const selectClass = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm hover:shadow ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`;
  const textareaClass = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`;
     
    const getEstimatedMembers = () => {
      const employees = parseInt(eligibleEmployees);
      if (!eligibleEmployees || Number.isNaN(employees) || employees <= 0) {
        return null;
      }

      const isUnion = unionType && unionType !== 'Non-Union';
      const multiplier = isUnion ? 1.6 : 1.4;
      return Math.round(employees * multiplier);
    };


  const [healthPlans, setHealthPlans] = useState<HealthPlanRow[]>([
    {
      id: crypto.randomUUID(),
      healthPlanName: '',
      deductibleIndividual: '',
      deductibleFamily: '',
      deductibleType: 'embedded',
      oopIndividual: '',
      oopFamily: '',
      oopType: 'embedded',
      coinsuranceIndividual: '',
      coinsuranceFamily: '',
      employeeDistribution: '',
      hasCopays: 'no',
      copayType: '',
    },
  ]);

  const calculateWorkingDays = (startDate: Date, daysToAdd: number): string => {
    const result = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const calculatedDate = calculateWorkingDays(new Date(), 5);
    setDefaultDueDate(calculatedDate);
    setDueDate(calculatedDate);
  }, []);

  const handleDueDateChange = (newDate: string) => {
    setDueDate(newDate);
    if (newDate !== defaultDueDate) {
      setShowRushReason(true);
    } else {
      setShowRushReason(false);
      setRushReason('');
    }
  };

  const addHealthPlan = () => {
    setHealthPlans([
      ...healthPlans,
      {
        id: crypto.randomUUID(),
        healthPlanName: '',
        deductibleIndividual: '',
        deductibleFamily: '',
        deductibleType: 'embedded',
        oopIndividual: '',
        oopFamily: '',
        oopType: 'embedded',
        coinsuranceIndividual: '',
        coinsuranceFamily: '',
        employeeDistribution: '',
        hasCopays: 'no',
        copayType: '',
      },
    ]);
  };

  const removeHealthPlan = (id: string) => {
    if (healthPlans.length > 1) {
      setHealthPlans(healthPlans.filter((plan) => plan.id !== id));
    }
  };

  const updateHealthPlan = (id: string, field: keyof HealthPlanRow, value: string) => {
    setHealthPlans(
      healthPlans.map((plan) =>
        plan.id === id ? { ...plan, [field]: value } : plan
      )
    );
    if (field === 'employeeDistribution') {
      setDistributionError(false);
    }
  };

  const validateForm = (): string | null => {
    if (!prospectName.trim()) return 'Prospect name is required';
    if (!prospectIndustry.trim()) return 'Prospect industry is required';
    if (!accountLink.trim()) return 'Account Link is required';
    if (!eligibleEmployees || parseInt(eligibleEmployees) <= 0) return 'Valid number of eligible employees is required';

    if (healthplanPartnership === 'Cigna' && !needsCignaSlides) {
      return 'Please specify if Cigna branded slides are needed';
    }

    // Skip distribution validation if type is 'unknown'
    if (distributionType !== 'unknown') {
      const totalDistribution = healthPlans.reduce((sum, plan) => {
        return sum + (parseFloat(plan.employeeDistribution) || 0);
      }, 0);

      if (distributionType === 'percentage') {
        if (Math.abs(totalDistribution - 100) > 0.01) {
          setDistributionError(true);
          return `Employee distribution must add up to 100% (current total: ${totalDistribution.toFixed(2)}%)`;
        }
      } else {
        const expectedTotal = parseInt(eligibleEmployees);
        if (totalDistribution !== expectedTotal) {
          setDistributionError(true);
          return `Employee distribution must add up to ${expectedTotal} employees (current total: ${totalDistribution})`;
        }
      }
    }

    setDistributionError(false);

    for (let i = 0; i < healthPlans.length; i++) {
      const plan = healthPlans[i];
      const planLabel = plan.healthPlanName.trim()
        ? `Health Plan ${i + 1} (${plan.healthPlanName.trim()})`
        : `Health Plan ${i + 1}`;

      if (!plan.healthPlanName.trim()) return `${planLabel}: Please enter a Health Plan name.`;
      if (!plan.deductibleIndividual) return `${planLabel}: Please enter the Individual Deductible.`;
      if (!plan.deductibleFamily) return `${planLabel}: Please enter the Family Deductible.`;
      if (!plan.oopIndividual) return `${planLabel}: Please enter the Individual OOP.`;
      if (!plan.oopFamily) return `${planLabel}: Please enter the Family OOP.`;
      if (!plan.coinsuranceIndividual) return `${planLabel}: Please enter the Individual Coinsurance.`;
      if (!plan.coinsuranceFamily) return `${planLabel}: Please enter the Family Coinsurance.`;
      if (distributionType !== 'unknown' && !plan.employeeDistribution) {
        return `${planLabel}: Please enter the Employee Distribution.`;
      }
      if (plan.hasCopays === 'yes' && !plan.copayType) {
        return `${planLabel}: Please select a Copay Type.`;
      }
    }

    return null;
  };

  const checkForDuplicates = async () => {
    // Duplicate checking disabled
    return false;
  };

  const formatSubmitError = (error: unknown): string => {
    if (error instanceof Error) {
      const message = error.message?.trim() || 'An unexpected error occurred.';

      if (/network|failed to fetch|fetch error|timeout/i.test(message)) {
        return 'Network error. Please check your connection and try again.';
      }

      if (/permission|not authorized|unauthorized|forbidden/i.test(message)) {
        return 'You do not have permission to submit this request.';
      }

      if (/duplicate key|unique constraint/i.test(message)) {
        return 'A request with the same key already exists.';
      }

      if (/row level security|rls/i.test(message)) {
        return 'Your account is not allowed to submit this request.';
      }

      const httpMatch = message.match(/HTTP\s(\d{3})\s*:\s*(.*)/i);
      if (httpMatch) {
        const status = Number(httpMatch[1]);
        const body = (httpMatch[2] || '').trim();
        if (status === 400) {
          return body || 'Some fields are invalid. Please review and try again.';
        }
        if (status === 401) {
          return 'Your session has expired. Please sign in and try again.';
        }
        if (status === 403) {
          return 'You do not have permission to submit this request.';
        }
        if (status === 404) {
          return 'Submission service not found. Please contact support.';
        }
        if (status >= 500) {
          return 'The server ran into an issue. Please try again in a few minutes.';
        }
      }

      return message;
    }

    if (typeof error === 'string' && error.trim()) {
      return error.trim();
    }

    return 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    if (!confirmSubmit) {
      const isDuplicate = await checkForDuplicates();
      if (isDuplicate) {
        setDuplicateWarning(true);
        setMessage({
          type: 'error',
          text: 'Warning: An identical submission already exists. Click "Submit Anyway" to proceed.'
        });
        return;
      }
    }

    setIsSubmitting(true);
    setMessage(null);
    setDuplicateWarning(false);
    setConfirmSubmit(false);

    try {
      const estimatedMembers = getEstimatedMembers();
      const effectiveMembers = eligibleMembers
        ? eligibleMembers
        : estimatedMembers
        ? String(estimatedMembers)
        : '';

      const formData = {
        prospectName,
        prospectIndustry,
        accountLink,
        unionType,
        eligibleEmployees,
        eligibleMembers: effectiveMembers,
        consultant,
        channelPartnership,
        healthplanPartnership,
        needsCignaSlides,
        scenariosCount,
        rxCoverageType,
        eggFreezingCoverage,
        fertilityPepm,
        fertilityCaseRate,
        implementationFee,
        currentFertilityBenefit,
        fertilityAdministrator,
        combinedMedicalRxBenefit,
        currentFertilityMedicalLimit,
        medicalLtmType,
        currentFertilityRxLimit,
        rxLtmType,
        medicalBenefitDetails,
        rxBenefitDetails,
        currentElectiveEggFreezing,
        liveBirths12mo,
        currentBenefitPepm,
        currentBenefitCaseFee,
        includeNoBenefitColumn,
        dollarMaxColumn,
        competingAgainst,
        adoptionSurrogacyEstimates,
        adoptionCoverage,
        adoptionFrequency,
        surrogacyCoverage,
        surrogacyFrequency,
        notes,
        dueDate,
        rushReason,
        distributionType,
        healthPlans,
        feeType, // <-- Ensure feeType is sent
        created_by: user?.id, // <-- Add user ID for created_by tracking
      };

      const apiUrl = `${import.meta.env.VITE_API_URL}/submit-toa-request`;

      // Step 1: Submit form data to API (insert prospects & health_plans)
      setMessage({ type: 'info', text: 'Submitting form data...' });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Always read the response as text first (works for JSON + non-JSON)
      const raw = await response.text();

      console.log('[submit-toa-request] status:', response.status);
      console.log('[submit-toa-request] raw:', raw);

      // If HTTP failed, throw the MOST informative error possible
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${raw || '(empty response body)'}`);
      }

      // If HTTP is ok, optionally parse JSON
      let result: any = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch {
        result = null;
      }

      console.log('[submit-toa-request] parsed:', result);

      // Only treat as failure if the server explicitly says success=false
      if (result?.success === false) {
        throw new Error(result?.error || result?.message || 'Server returned success=false');
      }

      const prospect_id = result?.prospect_id;
      if (!prospect_id) {
        throw new Error('No prospect_id returned from server');
      }

      // Step 2: Call Bayesian API if data is available
      let bayesianPrediction: any = null;
      try {
        setMessage({ type: 'info', text: 'Generating predictions...' });
        
        const bayesianInput = formatFormDataForBayesian(formData, prospect_id);
        const validationErrors = validateBayesianInput(bayesianInput);
        
        if (validationErrors.length === 0) {
          bayesianPrediction = await callBayesianAPI(bayesianInput);
          console.log('Bayesian prediction:', bayesianPrediction);
        } else {
          console.warn('Bayesian input validation warnings:', validationErrors);
          // Continue without prediction if validation fails
        }
      } catch (bayesianError: unknown) {
        console.warn('Bayesian API call failed:', bayesianError);
        // Don't fail the whole submission if Bayesian API fails
        // Just log the warning and continue
        const errorMsg = bayesianError instanceof Error ? bayesianError.message : String(bayesianError);
        console.warn(`Bayesian prediction skipped: ${errorMsg}`);
      }

      // Step 3: If Bayesian prediction succeeded, insert it into the database
      if (bayesianPrediction) {
        try {
          setMessage({ type: 'info', text: 'Saving predictions...' });
          
          const bayesianApiUrl = `${import.meta.env.VITE_API_URL}/insert-bayesian-output`;
          
          const bayesianInsertRes = await fetch(bayesianApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prospect_id,
              predicted_rate: bayesianPrediction.predicted_rate,
              predicted_count: bayesianPrediction.predicted_count,
              lower_bound: bayesianPrediction.lower_bound,
              upper_bound: bayesianPrediction.upper_bound,
            }),
          });

          const bayesianRaw = await bayesianInsertRes.text();
          console.log('[insert-bayesian-output] status:', bayesianInsertRes.status);
          
          if (!bayesianInsertRes.ok) {
            console.warn('Failed to save Bayesian output:', bayesianRaw);
          } else {
            console.log('[insert-bayesian-output] success');
          }
        } catch (bayesianDbError: unknown) {
          console.warn('Failed to save Bayesian prediction to database:', bayesianDbError);
          // Don't fail the whole submission
        }
      }

      // Overall success message
      setMessage({ type: 'success', text: 'Request submitted successfully!' });

      setProspectName('');
      setProspectIndustry('');
      setAccountLink('');
      setUnionType('');
      setEligibleEmployees('');
      setEligibleMembers('');
      setConsultant('');
      setChannelPartnership('');
      setHealthplanPartnership('');
      setNeedsCignaSlides('');
      setScenariosCount('');
      setRxCoverageType('');
      setEggFreezingCoverage('');
      setFertilityPepm('');
      setFertilityCaseRate('');
      setImplementationFee('');
      setCurrentFertilityBenefit('');
      setFertilityAdministrator('');
      setCombinedMedicalRxBenefit('');
      setCurrentFertilityMedicalLimit('');
      setMedicalLtmType('');
      setCurrentFertilityRxLimit('');
      setRxLtmType('');
      setMedicalBenefitDetails('');
      setRxBenefitDetails('');
      setCurrentElectiveEggFreezing('');
      setLiveBirths12mo('');
      setCurrentBenefitPepm('');
      setCurrentBenefitCaseFee('');
      setIncludeNoBenefitColumn('');
      setDollarMaxColumn('');
      setCompetingAgainst([]);
      setAdoptionSurrogacyEstimates('');
      setAdoptionCoverage('');
      setAdoptionFrequency('');
      setSurrogacyCoverage('');
      setSurrogacyFrequency('');
      setNotes('');
      const newDefaultDate = calculateWorkingDays(new Date(), 5);
      setDefaultDueDate(newDefaultDate);
      setDueDate(newDefaultDate);
      setRushReason('');
      setShowRushReason(false);
      setHealthPlans([
        {
          id: crypto.randomUUID(),
          healthPlanName: '',
          deductibleIndividual: '',
          deductibleFamily: '',
          deductibleType: 'embedded',
          oopIndividual: '',
          oopFamily: '',
          oopType: 'embedded',
          coinsuranceIndividual: '',
          coinsuranceFamily: '',
          employeeDistribution: '',
          hasCopays: 'no',
          copayType: '',
        },
      ]);
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = formatSubmitError(error);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add state for Fee Type
  const [feeType, setFeeType] = useState('');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100'}`}>
      <div className={`sticky top-0 z-40 backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/30' : 'bg-gradient-to-br from-slate-100/95 via-slate-50/95 to-blue-100/95 border-white/30'} border-b shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img src="/mea-logo.png" alt="MEA Logo" className="h-20 w-auto" />
              <div className={`w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Save className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme === 'dark' ? 'from-slate-100 to-slate-300' : 'from-slate-900 to-slate-700'} bg-clip-text text-transparent`}>TOA Request Form</h1>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Let's gather the information we need to get started</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {message && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-2xl w-full mx-4">
            <div
              className={`p-6 rounded-2xl shadow-2xl border-2 ${
                message.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-300'
              }`}
            >
              <p className="text-lg font-semibold text-center">{message.text}</p>
              <button
                onClick={() => setMessage(null)}
                className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  message.type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {message && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setMessage(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-8 pb-3 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-900 border-slate-100'}`}>Client Information</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <AutocompleteInput
                      value={prospectName}
                      onChange={setProspectName}
                      optionType="prospect_name"
                      label="Prospect Name"
                      placeholder="Type or select prospect name..."
                      required
                      theme={theme}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Account Link *
                    </label>
                    <input
                      type="text"
                      value={accountLink}
                      onChange={(e) => setAccountLink(e.target.value)}
                      className={inputClass}
                      placeholder="Paste full Salesforce account link"
                      required
                    />
                  </div>

                  <div>
                    <AutocompleteInput
                      value={prospectIndustry}
                      onChange={setProspectIndustry}
                      optionType="prospect_industry"
                      label="Prospect Industry"
                      placeholder="Type or select industry..."
                      required
                      theme={theme}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Union Type
                    </label>
                    <select
                      value={unionType}
                      onChange={(e) => setUnionType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select union type...</option>
                      <option value="AFL-CIO">AFL-CIO</option>
                      <option value="Teamsters">Teamsters</option>
                      <option value="SEIU">SEIU</option>
                      <option value="UAW">UAW</option>
                      <option value="UFCW">UFCW</option>
                      <option value="Other">Other</option>
                      <option value="Non-Union">Non-Union</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      # of Eligible Employees (Medically Enrolled Employees) *
                    </label>
                    <input
                      type="text"
                      value={eligibleEmployees ? formatNumberWithCommas(eligibleEmployees) : ''}
                      onChange={(e) => setEligibleEmployees(unformatNumber(e.target.value))}
                      className={inputClass}
                      placeholder="Enter number"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      # of Eligible Members (Employees + Spouses/Dependents)
                    </label>
                    <input
                      type="text"
                      value={eligibleMembers ? formatNumberWithCommas(eligibleMembers) : ''}
                      onChange={(e) => setEligibleMembers(unformatNumber(e.target.value))}
                      className={inputClass}
                      placeholder="Enter number"
                    />
                    {!eligibleMembers && getEstimatedMembers() !== null && (
                      <p className="text-xs text-slate-500 mt-1">
                        If left blank, this will be calculated as {formatNumberWithCommas(String(getEstimatedMembers()))}.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Consultant
                    </label>
                    <select
                      value={consultant}
                      onChange={(e) => setConsultant(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="WTW">WTW</option>
                      <option value="Mercer">Mercer</option>
                      <option value="TPG">TPG</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Channel Partnership
                    </label>
                    <select
                      value={channelPartnership}
                      onChange={(e) => setChannelPartnership(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="CVS">CVS</option>
                      <option value="Caslight">Caslight</option>
                      <option value="Evernorth">Evernorth</option>
                      <option value="CHA">CHA</option>
                      <option value="Quantum">Quantum</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Health-plan Partnership
                    </label>
                    <select
                      value={healthplanPartnership}
                      onChange={(e) => setHealthplanPartnership(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="IBX">IBX</option>
                      <option value="BCBSNC">BCBSNC</option>
                      <option value="HealthPartners">HealthPartners</option>
                      <option value="Brighton">Brighton</option>
                      <option value="WebTPA">WebTPA</option>
                      <option value="MagniCare">MagniCare</option>
                      <option value="Surest">Surest</option>
                      <option value="Meritain">Meritain</option>
                      <option value="Providence">Providence</option>
                      <option value="BCBS Alabama">BCBS Alabama</option>
                      <option value="Cigna">Cigna</option>
                    </select>
                  </div>

                  {healthplanPartnership === 'Cigna' && (
                    <div>
                      <label className={labelClass}>
                        Do you need the Cigna branded slides? *
                      </label>
                      <select
                        value={needsCignaSlides}
                        onChange={(e) => setNeedsCignaSlides(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => handleDueDateChange(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {showRushReason && (
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Rush Reason (Due date changed from standard 5-day SLA)
                      </label>
                      <textarea
                        value={rushReason}
                        onChange={(e) => setRushReason(e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Please explain the reason for the date change..."
                      />
                    </div>
                  )}
                </div>
              </div>
          </div>

          <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-900 border-slate-100'}`}>Health Plans</h2>

              <div className={`mb-6 p-4 rounded-lg transition-colors ${distributionError ? 'bg-yellow-100 border-2 border-yellow-400' : ''}`}>
                <label className={labelClass}>
                  Employee Distribution Type *
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}`}>
                    <input
                      type="radio"
                      value="percentage"
                      checked={distributionType === 'percentage'}
                      onChange={(e) => {
                        setDistributionType(e.target.value as 'percentage');
                        setDistributionError(false);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Percentage (%)</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}`}>
                    <input
                      type="radio"
                      value="number"
                      checked={distributionType === 'number'}
                      onChange={(e) => {
                        setDistributionType(e.target.value as 'number');
                        setDistributionError(false);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Number of Employees</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}`}>
                    <input
                      type="radio"
                      value="unknown"
                      checked={distributionType === 'unknown'}
                      onChange={(e) => {
                        setDistributionType(e.target.value as 'unknown');
                        setDistributionError(false);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Enrollment distribution unknown</span>
                  </label>
                </div>
              </div>

              <div className={`overflow-x-auto border rounded-xl shadow-sm ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                <table className={`w-full border-collapse ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                  <thead>
                    <tr className={`${theme === 'dark' ? 'bg-gradient-to-r from-slate-600 to-slate-700' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                      <th className={`border px-3 py-2 text-center text-xs font-semibold w-[50px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'}`}>

                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[150px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Health Plan
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Deductible Individual
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Deductible Family
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Deductible Type
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        OOP Individual
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        OOP Family
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        OOP Type
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Coinsurance Individual
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[120px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Coinsurance Family
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[100px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Employee ({distributionType === 'percentage' ? '%' : distributionType === 'number' ? '#' : 'Distribution'})
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[100px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Has Copays?
                      </th>
                      <th className={`border px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[150px] ${theme === 'dark' ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                        Copay Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthPlans.map((plan, index) => (
                      <tr key={plan.id} className={`${theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-slate-50'}`}>
                        <td className={`border p-3 text-center ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                          {healthPlans.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeHealthPlan(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete row"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.healthPlanName}
                            onChange={(e) => updateHealthPlan(plan.id, 'healthPlanName', e.target.value)}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="Plan name"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.deductibleIndividual ? formatCurrency(plan.deductibleIndividual) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'deductibleIndividual', unformatCurrency(e.target.value))}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="$0"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.deductibleFamily ? formatCurrency(plan.deductibleFamily) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'deductibleFamily', unformatCurrency(e.target.value))}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="$0"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <select
                            value={plan.deductibleType}
                            onChange={(e) => updateHealthPlan(plan.id, 'deductibleType', e.target.value)}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                          >
                            <option value="embedded">Embedded</option>
                            <option value="aggregate">Aggregate</option>
                          </select>
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.oopIndividual ? formatCurrency(plan.oopIndividual) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'oopIndividual', unformatCurrency(e.target.value))}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="$0"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.oopFamily ? formatCurrency(plan.oopFamily) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'oopFamily', unformatCurrency(e.target.value))}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="$0"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <select
                            value={plan.oopType}
                            onChange={(e) => updateHealthPlan(plan.id, 'oopType', e.target.value)}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                          >
                            <option value="embedded">Embedded</option>
                            <option value="aggregate">Aggregate</option>
                          </select>
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.coinsuranceIndividual ? formatPercentage(plan.coinsuranceIndividual) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'coinsuranceIndividual', unformatPercentage(e.target.value))}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="0%"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={plan.coinsuranceFamily ? formatPercentage(plan.coinsuranceFamily) : ''}
                            onChange={(e) => updateHealthPlan(plan.id, 'coinsuranceFamily', unformatPercentage(e.target.value))}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            placeholder="0%"
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <input
                            type="text"
                            value={
                              distributionType === 'unknown'
                                ? '0'
                                : plan.employeeDistribution
                                ? distributionType === 'percentage'
                                  ? formatPercentage(plan.employeeDistribution)
                                  : plan.employeeDistribution
                                : ''
                            }
                            onChange={(e) =>
                              updateHealthPlan(
                                plan.id,
                                'employeeDistribution',
                                distributionType === 'percentage'
                                  ? unformatPercentage(e.target.value)
                                  : e.target.value.replace(/[^0-9]/g, '')
                              )
                            }
                            disabled={distributionType === 'unknown'}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${
                              distributionType === 'unknown'
                                ? 'bg-slate-100 cursor-not-allowed text-slate-500'
                                : 'bg-transparent'
                            }`}
                            placeholder={distributionType === 'percentage' ? '0%' : '0'}
                          />
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <select
                            value={plan.hasCopays}
                            onChange={(e) => updateHealthPlan(plan.id, 'hasCopays', e.target.value)}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </td>
                        <td className={`border p-0 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
                          <select
                            value={plan.copayType}
                            onChange={(e) => updateHealthPlan(plan.id, 'copayType', e.target.value)}
                            className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
                            disabled={plan.hasCopays === 'no'}
                          >
                            <option value="">Select...</option>
                            <option value="Medical and Rx">Medical and Rx</option>
                            <option value="Medical only">Medical only</option>
                            <option value="Rx Only">Rx Only</option>
                            <option value="Surest plan">Surest plan</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addHealthPlan}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Add Row
              </button>
          </div>

          <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-8 pb-3 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-900 border-slate-100'}`}>New Benefit</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    How many scenarios would you like to show?
                  </label>
                  <select
                    value={scenariosCount}
                    onChange={(e) => setScenariosCount(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>



                <div>
                  <label className={labelClass}>
                    How will Rx be covered? (Prog Rx / No Prog Rx)
                  </label>
                  <select
                    value={rxCoverageType}
                    onChange={(e) => setRxCoverageType(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="Prog Rx">Prog Rx</option>
                    <option value="No Prog Rx">No Prog Rx</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Will elective egg freezing be covered?
                  </label>
                  <select
                    value={eggFreezingCoverage}
                    onChange={(e) => setEggFreezingCoverage(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="Yes (included in the employer cost)">Yes (included in the employer cost)</option>
                    <option value="Yes (spiked out from the employer cost)">Yes (spiked out from the employer cost)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Fertility PEPM
                  </label>
                  <input
                    type="number"
                    value={fertilityPepm}
                    onChange={(e) => setFertilityPepm(e.target.value)}
                    className={inputClass}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Fertility Case Rate
                  </label>
                  <input
                    type="number"
                    value={fertilityCaseRate}
                    onChange={(e) => setFertilityCaseRate(e.target.value)}
                    className={inputClass}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Implementation Fee
                  </label>
                  <input
                    type="number"
                    value={implementationFee}
                    onChange={(e) => setImplementationFee(e.target.value)}
                    className={inputClass}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-8 pb-3 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-900 border-slate-100'}`}>Current Benefit</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Does prospect currently offer fertility benefits?
                  </label>
                  <select
                    value={currentFertilityBenefit}
                    onChange={(e) => setCurrentFertilityBenefit(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="Standard benefits">Standard benefits</option>
                    <option value="non-standard benefit (cycle)">non-standard benefit (cycle)</option>
                    <option value="fully insured">fully insured</option>
                    <option value="No benefit">No benefit</option>
                  </select>
                </div>

                {currentFertilityBenefit && currentFertilityBenefit !== 'No benefit' && (
                  <div>
                    <label className={labelClass}>
                      Who administers the fertility benefit?
                    </label>
                    <select
                      value={fertilityAdministrator}
                      onChange={(e) => setFertilityAdministrator(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Carrot">Carrot</option>
                      <option value="Kindbody">Kindbody</option>
                      <option value="Ovia">Ovia</option>
                      <option value="WIN">WIN</option>
                      <option value="Maven">Maven</option>
                      <option value="Carrier">Carrier</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {(currentFertilityBenefit === 'Standard benefits' || currentFertilityBenefit === 'fully insured') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      Does the prospect have combined medical / Rx benefit?
                    </label>
                    <select
                      value={combinedMedicalRxBenefit}
                      onChange={(e) => setCombinedMedicalRxBenefit(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      What is the current fertility medical dollar limit?
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={currentFertilityMedicalLimit}
                      onChange={(e) => setCurrentFertilityMedicalLimit(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00 or Unlimited"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter a dollar amount or type Unlimited.</p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Is medical LTM lifetime or annual?
                    </label>
                    <select
                      value={medicalLtmType}
                      onChange={(e) => setMedicalLtmType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Lifetime">Lifetime</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      What is the current fertility Rx dollar limit?
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={currentFertilityRxLimit}
                      onChange={(e) => setCurrentFertilityRxLimit(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00 or Unlimited"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter a dollar amount or type Unlimited.</p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Is Rx LTM lifetime or annual?
                    </label>
                    <select
                      value={rxLtmType}
                      onChange={(e) => setRxLtmType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Lifetime">Lifetime</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Does the prospect currently offer elective egg freezing?
                    </label>
                    <select
                      value={currentElectiveEggFreezing}
                      onChange={(e) => setCurrentElectiveEggFreezing(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Unsure">Unsure</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Optional - Please provide the number of live births from the latest 12-month reporting period
                    </label>
                    <input
                      type="text"
                      value={liveBirths12mo ? formatNumberWithCommas(liveBirths12mo) : ''}
                      onChange={(e) => setLiveBirths12mo(unformatNumber(e.target.value))}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current benefit PEPM
                    </label>
                    <input
                      type="number"
                      value={currentBenefitPepm}
                      onChange={(e) => setCurrentBenefitPepm(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current benefit case fee
                    </label>
                    <input
                      type="number"
                      value={currentBenefitCaseFee}
                      onChange={(e) => setCurrentBenefitCaseFee(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {currentFertilityBenefit === 'non-standard benefit (cycle)' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      Please provide medical benefit details here
                    </label>
                    <textarea
                      value={medicalBenefitDetails}
                      onChange={(e) => setMedicalBenefitDetails(e.target.value)}
                      className={inputClass}
                      rows={4}
                      placeholder="Enter medical benefit details..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Please provide Rx benefit details here
                    </label>
                    <textarea
                      value={rxBenefitDetails}
                      onChange={(e) => setRxBenefitDetails(e.target.value)}
                      className={inputClass}
                      rows={4}
                      placeholder="Enter Rx benefit details..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Does the prospect currently offer elective egg freezing?
                    </label>
                    <select
                      value={currentElectiveEggFreezing}
                      onChange={(e) => setCurrentElectiveEggFreezing(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Unsure">Unsure</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Optional - Please provide the number of live births from the latest 12-month reporting period
                    </label>
                    <input
                      type="text"
                      value={liveBirths12mo ? formatNumberWithCommas(liveBirths12mo) : ''}
                      onChange={(e) => setLiveBirths12mo(unformatNumber(e.target.value))}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current benefit PEPM
                    </label>
                    <input
                      type="number"
                      value={currentBenefitPepm}
                      onChange={(e) => setCurrentBenefitPepm(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current benefit case fee
                    </label>
                    <input
                      type="number"
                      value={currentBenefitCaseFee}
                      onChange={(e) => setCurrentBenefitCaseFee(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {currentFertilityBenefit === 'No benefit' && (
                <div>
                  <label className={labelClass}>
                    Would you like to include a no benefit column in the TOA?
                  </label>
                  <select
                    value={includeNoBenefitColumn}
                    onChange={(e) => setIncludeNoBenefitColumn(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-8 pb-3 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-900 border-slate-100'}`}>Additional</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Would you like to see a Dollar Max column for comparison?
                  </label>
                  <select
                    value={dollarMaxColumn}
                    onChange={(e) => setDollarMaxColumn(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {dollarMaxColumn === 'yes' && (
                  <div>
                    <label className={labelClass}>
                      If yes - do we know who we are competing against? (Select up to 2)
                    </label>
                    <div className="space-y-2">
                      {['Carrot', 'Maven', 'Kindbody', 'Win', 'Ovia', 'Carrier', 'Unsure'].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={competingAgainst.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (competingAgainst.length < 2) {
                                  setCompetingAgainst([...competingAgainst, option]);
                                }
                              } else {
                                setCompetingAgainst(competingAgainst.filter((item) => item !== option));
                              }
                            }}
                            disabled={!competingAgainst.includes(option) && competingAgainst.length >= 2}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Would you like to see adoption and surrogacy cost estimates?
                  </label>
                  <select
                    value={adoptionSurrogacyEstimates}
                    onChange={(e) => setAdoptionSurrogacyEstimates(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {adoptionSurrogacyEstimates === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Adoption Coverage */}
                  <div>
                    <label className={labelClass}>
                      What coverage would you like to see for adoption?
                    </label>
                    <select
                      value={adoptionCoverage}
                      onChange={(e) => setAdoptionCoverage(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="5000">$5,000</option>
                      <option value="7500">$7,500</option>
                      <option value="10000">$10,000</option>
                      <option value="12500">$12,500</option>
                      <option value="15000">$15,000</option>
                      <option value="17500">$17,500</option>
                      <option value="20000">$20,000</option>
                      <option value="25000">$25,000</option>
                      <option value="30000">$30,000</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>

                  {/* Adoption Frequency */}
                  <div>
                    <label className={labelClass}>
                      Would adoption be per lifetime or per child?
                    </label>
                    <select
                      value={adoptionFrequency}
                      onChange={(e) => setAdoptionFrequency(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Per lifetime">Per lifetime</option>
                      <option value="Per child">Per child</option>
                    </select>
                  </div>

                  {/* Surrogacy Coverage */}
                  <div>
                    <label className={labelClass}>
                      What coverage would you like to see for surrogacy?
                    </label>
                    <select
                      value={surrogacyCoverage}
                      onChange={(e) => setSurrogacyCoverage(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="5000">$5,000</option>
                      <option value="7500">$7,500</option>
                      <option value="10000">$10,000</option>
                      <option value="12500">$12,500</option>
                      <option value="15000">$15,000</option>
                      <option value="17500">$17,500</option>
                      <option value="20000">$20,000</option>
                      <option value="25000">$25,000</option>
                      <option value="30000">$30,000</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>

                  {/* Surrogacy Frequency */}
                  <div>
                    <label className={labelClass}>
                      Would surrogacy be per lifetime or per child?
                    </label>
                    <select
                      value={surrogacyFrequency}
                      onChange={(e) => setSurrogacyFrequency(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Per lifetime">Per lifetime</option>
                      <option value="Per child">Per child</option>
                    </select>
                  </div>

                  {/* Fee Type Dropdown */}
                  <div>
                    <label className={labelClass}>
                      Fee Type
                    </label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="$800 Case Rate">$800 Case Rate</option>
                      <option value="10% Admin Fee">10% Admin Fee</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-8 pb-3 border-b ${theme === 'dark' ? 'text-slate-100 border-slate-700' : 'text-slate-900 border-slate-100'}`}>Notes</h2>

            <div>
              <label className={labelClass}>
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
                rows={6}
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {duplicateWarning && (
              <button
                type="button"
                onClick={() => {
                  setConfirmSubmit(true);
                  setDuplicateWarning(false);
                  document.querySelector('form')?.requestSubmit();
                }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <AlertTriangle size={22} />
                Submit Anyway
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save size={22} />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



