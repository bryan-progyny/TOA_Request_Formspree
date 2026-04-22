import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Moon, Sun } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { formatCurrency, formatPercentage, unformatCurrency, unformatPercentage, formatNumberWithCommas, unformatNumber } from '../utils/formatting';
import { submitToFormspree } from '../utils/formspree';

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
  const [smartCyclesOption1, setSmartCyclesOption1] = useState('');
  const [smartCyclesOption2, setSmartCyclesOption2] = useState('');
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
  const [femaleEmployees4060, setFemaleEmployees4060] = useState('');
  const [liveBirths12moExpanded, setLiveBirths12moExpanded] = useState('');
  const [subscribersDependentsUnder12, setSubscribersDependentsUnder12] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [defaultDueDate, setDefaultDueDate] = useState('');
  const [rushReason, setRushReason] = useState('');
  const [showRushReason, setShowRushReason] = useState(false);
  const [distributionType, setDistributionType] = useState<'number' | 'percentage' | 'unknown'>('percentage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [distributionError, setDistributionError] = useState<boolean>(false);
  const [feeType, setFeeType] = useState('');
  const [scenarioSmartCycles, setScenarioSmartCycles] = useState<Record<number, string>>({});
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

  const formatSubmitError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message?.trim() || 'An unexpected error occurred.';
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

    setIsSubmitting(true);
    setMessage(null);

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
        smartCyclesOption1,
        smartCyclesOption2,
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
        femaleEmployees4060,
        liveBirths12moExpanded,
        subscribersDependentsUnder12,
        notes,
        dueDate,
        rushReason,
        distributionType,
        healthPlans,
        feeType,
        scenarioSmartCycles,
      };

      setMessage({ type: 'success', text: 'Submitting request...' });
      
      await submitToFormspree(formData);

      setMessage({ type: 'success', text: 'Request submitted successfully!' });

      // Reset form
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
      setSmartCyclesOption1('');
      setSmartCyclesOption2('');
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
      setFemaleEmployees4060('');
      setLiveBirths12moExpanded('');
      setSubscribersDependentsUnder12('');
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
      setScenarioSmartCycles({});
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = formatSubmitError(error);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme-aware class styles
  const cardClass = `rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border p-8 ${
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200'
  }`;

  const headingClass = `text-2xl font-bold pb-3 border-b ${
    theme === 'dark'
      ? 'text-slate-100 border-slate-700'
      : 'text-slate-900 border-slate-100'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${
    theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
  }`;

  const inputClass = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow ${
    theme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 hover:border-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
  }`;

  const selectClass = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow ${
    theme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-slate-100 hover:border-slate-500'
      : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
  }`;

  const h3Class = `text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`;
  const h4Class = `text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`;
  const tableHeaderClass = `text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100'
    }`}>
      <div className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-lg transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/30'
          : 'bg-gradient-to-br from-slate-100/95 via-slate-50/95 to-blue-100/95 border-white/30'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img src="/mea-logo.png" alt="MEA Logo" className="h-20 w-auto flex-shrink-0" />
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Save className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                  theme === 'dark'
                    ? 'from-slate-100 to-slate-400'
                    : 'from-slate-900 to-slate-700'
                } bg-clip-text text-transparent`}>TOA Request Form</h1>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Let's gather the information we need to get started</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div className={`max-w-7xl mx-auto px-4 py-12`}>
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
          {/* Client Information Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Client Information</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <AutocompleteInput
                    value={prospectName}
                    onChange={setProspectName}
                    optionType="prospect_name"
                    label="Prospect Name"
                    placeholder="Type prospect name..."
                    required
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
                    placeholder="Paste Salesforce account link"
                    required
                  />
                </div>

                <div>
                  <AutocompleteInput
                    value={prospectIndustry}
                    onChange={setProspectIndustry}
                    optionType="prospect_industry"
                    label="Prospect Industry"
                    placeholder="Type industry..."
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Union Type
                  </label>
                  <select
                    value={unionType}
                    onChange={(e) => setUnionType(e.target.value)}
                    className={inputClass}
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
                    # of Eligible Employees *
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
                    # of Eligible Members
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
                      Estimated: {formatNumberWithCommas(String(getEstimatedMembers()))}
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
                      Cigna branded slides? *
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
                      Rush Reason
                    </label>
                    <textarea
                      value={rushReason}
                      onChange={(e) => setRushReason(e.target.value)}
                      className={inputClass}
                      rows={3}
                      placeholder="Explain the date change..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Health Plans Section - kept from original */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-6`}>Health Plans</h2>
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
                  <span className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Percentage (%)</span>
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
                  <span className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Number of Employees</span>
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
                  <span className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Unknown</span>
                </label>
              </div>
            </div>

            <div className={`overflow-x-auto border rounded-xl shadow-sm mb-4 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
              <table className={`w-full border-collapse ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <thead>
                  <tr className={`bg-gradient-to-r ${theme === 'dark' ? 'from-slate-700 to-slate-600' : 'from-slate-50 to-slate-100'}`}>
                    <th className={`border px-3 py-2 text-center text-xs font-semibold w-[50px] ${theme === 'dark' ? 'border-slate-700 text-slate-200' : 'border-slate-300 text-slate-700'}`}></th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[150px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Health Plan</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[120px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Ded Indiv</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[120px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Ded Family</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[100px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Type</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[120px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>OOP Indiv</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[120px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>OOP Family</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[100px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Type</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[120px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Coin Indiv</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[120px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Coin Family</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[100px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Distribution</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[100px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Has Copays?</th>
                    <th className={`${tableHeaderClass} border px-3 py-3 text-left min-w-[150px] ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>Copay Type</th>
                  </tr>
                </thead>
                <tbody>
                  {healthPlans.map((plan) => (
                    <tr key={plan.id} className={`${theme === 'dark' ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-slate-50 border-slate-200'}`}>
                      <td className={`border p-3 text-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        {healthPlans.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHealthPlan(plan.id)}
                            className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.healthPlanName}
                          onChange={(e) => updateHealthPlan(plan.id, 'healthPlanName', e.target.value)}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="Plan name"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.deductibleIndividual ? formatCurrency(plan.deductibleIndividual) : ''}
                          onChange={(e) => updateHealthPlan(plan.id, 'deductibleIndividual', unformatCurrency(e.target.value))}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="$0"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.deductibleFamily ? formatCurrency(plan.deductibleFamily) : ''}
                          onChange={(e) => updateHealthPlan(plan.id, 'deductibleFamily', unformatCurrency(e.target.value))}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="$0"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <select
                          value={plan.deductibleType}
                          onChange={(e) => updateHealthPlan(plan.id, 'deductibleType', e.target.value)}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                        >
                          <option value="embedded">Embedded</option>
                          <option value="aggregate">Aggregate</option>
                        </select>
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.oopIndividual ? formatCurrency(plan.oopIndividual) : ''}
                          onChange={(e) => updateHealthPlan(plan.id, 'oopIndividual', unformatCurrency(e.target.value))}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="$0"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.oopFamily ? formatCurrency(plan.oopFamily) : ''}
                          onChange={(e) => updateHealthPlan(plan.id, 'oopFamily', unformatCurrency(e.target.value))}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="$0"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <select
                          value={plan.oopType}
                          onChange={(e) => updateHealthPlan(plan.id, 'oopType', e.target.value)}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                        >
                          <option value="embedded">Embedded</option>
                          <option value="aggregate">Aggregate</option>
                        </select>
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.coinsuranceIndividual ? formatPercentage(plan.coinsuranceIndividual) : ''}
                          onChange={(e) => updateHealthPlan(plan.id, 'coinsuranceIndividual', unformatPercentage(e.target.value))}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="0%"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <input
                          type="text"
                          value={plan.coinsuranceFamily ? formatPercentage(plan.coinsuranceFamily) : ''}
                          onChange={(e) => updateHealthPlan(plan.id, 'coinsuranceFamily', unformatPercentage(e.target.value))}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                          placeholder="0%"
                        />
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
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
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <select
                          value={plan.hasCopays}
                          onChange={(e) => updateHealthPlan(plan.id, 'hasCopays', e.target.value)}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </td>
                      <td className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>
                        <select
                          value={plan.copayType}
                          onChange={(e) => updateHealthPlan(plan.id, 'copayType', e.target.value)}
                          className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}
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

          {/* Current Benefit Details Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Current Benefit Details</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Does prospect currently offer fertility benefits?
                  </label>
                  <select
                    value={currentFertilityBenefit}
                    onChange={(e) => setCurrentFertilityBenefit(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="No benefit">No benefit</option>
                    <option value="Standard benefits">Standard benefits</option>
                    <option value="Fully insured">Fully insured</option>
                    <option value="Non-standard benefit (cycle)">Non-standard benefit (cycle)</option>
                  </select>
                </div>

                {currentFertilityBenefit && currentFertilityBenefit !== 'No benefit' && (
                  <div>
                    <label className={labelClass}>
                      Current Fertility Administrator
                    </label>
                    <input
                      type="text"
                      value={fertilityAdministrator}
                      onChange={(e) => setFertilityAdministrator(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Progyny, Carrot, etc."
                    />
                  </div>
                )}
              </div>

              {(currentFertilityBenefit === 'Standard benefits' || currentFertilityBenefit === 'Fully insured') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      Medical Lifetime Maximum
                    </label>
                    <input
                      type="text"
                      value={currentFertilityMedicalLimit}
                      onChange={(e) => setCurrentFertilityMedicalLimit(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00 or Unlimited"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Medical LTM Type
                    </label>
                    <select
                      value={medicalLtmType}
                      onChange={(e) => setMedicalLtmType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Lifetime">Lifetime</option>
                      <option value="Per-Year">Per-Year</option>
                      <option value="Per-Treatment">Per-Treatment</option>
                      <option value="Unlimited">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Rx Lifetime Maximum
                    </label>
                    <input
                      type="text"
                      value={currentFertilityRxLimit}
                      onChange={(e) => setCurrentFertilityRxLimit(e.target.value)}
                      className={inputClass}
                      placeholder="$0.00 or Unlimited"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Rx LTM Type
                    </label>
                    <select
                      value={rxLtmType}
                      onChange={(e) => setRxLtmType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Lifetime">Lifetime</option>
                      <option value="Per-Year">Per-Year</option>
                      <option value="Per-Treatment">Per-Treatment</option>
                      <option value="Unlimited">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current Elective Egg Freezing Coverage
                    </label>
                    <select
                      value={currentElectiveEggFreezing}
                      onChange={(e) => setCurrentElectiveEggFreezing(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Covered">Covered</option>
                      <option value="Not Covered">Not Covered</option>
                      <option value="Partial">Partial</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Live Births (Last 12 Months)
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
                      Current Benefit - PEPM
                    </label>
                    <input
                      type="text"
                      value={currentBenefitPepm ? formatCurrency(currentBenefitPepm) : ''}
                      onChange={(e) => setCurrentBenefitPepm(unformatCurrency(e.target.value))}
                      className={inputClass}
                      placeholder="$0.00 per employee/month"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current Benefit - Case Fee
                    </label>
                    <input
                      type="text"
                      value={currentBenefitCaseFee ? formatCurrency(currentBenefitCaseFee) : ''}
                      onChange={(e) => setCurrentBenefitCaseFee(unformatCurrency(e.target.value))}
                      className={inputClass}
                      placeholder="$0.00 per case"
                    />
                  </div>
                </div>
              )}

              {currentFertilityBenefit === 'Non-standard benefit (cycle)' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      Medical Benefit Details
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
                      Rx Benefit Details
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
                      Current Elective Egg Freezing Coverage
                    </label>
                    <select
                      value={currentElectiveEggFreezing}
                      onChange={(e) => setCurrentElectiveEggFreezing(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Covered">Covered</option>
                      <option value="Not Covered">Not Covered</option>
                      <option value="Partial">Partial</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Live Births (Last 12 Months)
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
                      Current Benefit - PEPM
                    </label>
                    <input
                      type="text"
                      value={currentBenefitPepm ? formatCurrency(currentBenefitPepm) : ''}
                      onChange={(e) => setCurrentBenefitPepm(unformatCurrency(e.target.value))}
                      className={inputClass}
                      placeholder="$0.00 per employee/month"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current Benefit - Case Fee
                    </label>
                    <input
                      type="text"
                      value={currentBenefitCaseFee ? formatCurrency(currentBenefitCaseFee) : ''}
                      onChange={(e) => setCurrentBenefitCaseFee(unformatCurrency(e.target.value))}
                      className={inputClass}
                      placeholder="$0.00 per case"
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
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Progyny Benefit Proposal Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Progyny Benefit Proposal</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="PEPM">PEPM</option>
                    <option value="Case Rate">Case Rate</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Fertility PEPM
                  </label>
                  <input
                    type="text"
                    value={fertilityPepm ? formatCurrency(fertilityPepm) : ''}
                    onChange={(e) => setFertilityPepm(unformatCurrency(e.target.value))}
                    className={inputClass}
                    placeholder="$0.00 per employee/month"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Fertility Case Rate
                  </label>
                  <input
                    type="text"
                    value={fertilityCaseRate ? formatCurrency(fertilityCaseRate) : ''}
                    onChange={(e) => setFertilityCaseRate(unformatCurrency(e.target.value))}
                    className={inputClass}
                    placeholder="$0.00 per case"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Implementation Fee
                  </label>
                  <input
                    type="text"
                    value={implementationFee ? formatCurrency(implementationFee) : ''}
                    onChange={(e) => setImplementationFee(unformatCurrency(e.target.value))}
                    className={inputClass}
                    placeholder="$0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fertility Scenarios Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Fertility Scenarios</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Number of Scenarios
                  </label>
                  <select
                    value={scenariosCount}
                    onChange={(e) => setScenariosCount(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Include "No Benefit" Column
                  </label>
                  <select
                    value={includeNoBenefitColumn}
                    onChange={(e) => setIncludeNoBenefitColumn(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Include Dollar Max Column
                  </label>
                  <select
                    value={dollarMaxColumn}
                    onChange={(e) => setDollarMaxColumn(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Live Births (12 months)
                  </label>
                  <input
                    type="text"
                    value={liveBirths12mo ? formatNumberWithCommas(liveBirths12mo) : ''}
                    onChange={(e) => setLiveBirths12mo(unformatNumber(e.target.value))}
                    className={inputClass}
                    placeholder="Enter number"
                  />
                </div>
              </div>

              {scenariosCount && parseInt(scenariosCount) > 0 && (
                <div className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                  <h3 className={h3Class}>Smart Cycles Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClass}>
                        Smart Cycles - Option 1
                      </label>
                      <input
                        type="text"
                        value={smartCyclesOption1}
                        onChange={(e) => setSmartCyclesOption1(e.target.value)}
                        className={inputClass}
                        placeholder="Describe the Smart Cycles option..."
                      />
                    </div>

                    {parseInt(scenariosCount) >= 2 && (
                      <div>
                        <label className={labelClass}>
                          Smart Cycles - Option 2
                        </label>
                        <input
                          type="text"
                          value={smartCyclesOption2}
                          onChange={(e) => setSmartCyclesOption2(e.target.value)}
                          className={inputClass}
                          placeholder="Describe the Smart Cycles option..."
                        />
                      </div>
                    )}
                  </div>

                  <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h4 className={h4Class}>Scenario Selections</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.from({ length: parseInt(scenariosCount) }).map((_, index) => (
                        <div key={index}>
                          <label className={labelClass}>
                            Scenario {index + 1} - Smart Cycles Option
                          </label>
                          <select
                            value={scenarioSmartCycles[index] || ''}
                            onChange={(e) => setScenarioSmartCycles({ ...scenarioSmartCycles, [index]: e.target.value })}
                            className={inputClass}
                          >
                            <option value="">Select...</option>
                            <option value="Option 1">Option 1</option>
                            <option value="Option 2">Option 2</option>
                            <option value="Both">Both</option>
                            <option value="Neither">Neither</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical & Prescription Coverage Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Medical & Prescription Coverage</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Combined Medical & Rx Benefit?
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
                    Rx Coverage Type
                  </label>
                  <select
                    value={rxCoverageType}
                    onChange={(e) => setRxCoverageType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="Covered">Covered</option>
                    <option value="Not Covered">Not Covered</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Current Fertility Medical Limit
                  </label>
                  <input
                    type="text"
                    value={currentFertilityMedicalLimit ? formatCurrency(currentFertilityMedicalLimit) : ''}
                    onChange={(e) => setCurrentFertilityMedicalLimit(unformatCurrency(e.target.value))}
                    className={inputClass}
                    placeholder="$0.00"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Medical LTM Type
                  </label>
                  <select
                    value={medicalLtmType}
                    onChange={(e) => setMedicalLtmType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="Lifetime">Lifetime</option>
                    <option value="Annual">Annual</option>
                    <option value="Per Cycle">Per Cycle</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Current Fertility Rx Limit
                  </label>
                  <input
                    type="text"
                    value={currentFertilityRxLimit ? formatCurrency(currentFertilityRxLimit) : ''}
                    onChange={(e) => setCurrentFertilityRxLimit(unformatCurrency(e.target.value))}
                    className={inputClass}
                    placeholder="$0.00"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Rx LTM Type
                  </label>
                  <select
                    value={rxLtmType}
                    onChange={(e) => setRxLtmType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="Lifetime">Lifetime</option>
                    <option value="Annual">Annual</option>
                    <option value="Per Cycle">Per Cycle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={labelClass}>
                    Medical Benefit Details
                  </label>
                  <textarea
                    value={medicalBenefitDetails}
                    onChange={(e) => setMedicalBenefitDetails(e.target.value)}
                    className={inputClass}
                    rows={3}
                    placeholder="Describe any specific medical benefit details..."
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Rx Benefit Details
                  </label>
                  <textarea
                    value={rxBenefitDetails}
                    onChange={(e) => setRxBenefitDetails(e.target.value)}
                    className={inputClass}
                    rows={3}
                    placeholder="Describe any specific Rx benefit details..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Egg Freezing Coverage Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Egg Freezing Coverage</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Egg Freezing Coverage Type
                  </label>
                  <select
                    value={eggFreezingCoverage}
                    onChange={(e) => setEggFreezingCoverage(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="Covered">Covered</option>
                    <option value="Not Covered">Not Covered</option>
                    <option value="Partial">Partial</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Adoption & Surrogacy Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Adoption & Surrogacy Benefits</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Include Adoption/Surrogacy Estimates?
                  </label>
                  <select
                    value={adoptionSurrogacyEstimates}
                    onChange={(e) => setAdoptionSurrogacyEstimates(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {adoptionSurrogacyEstimates === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      Adoption Coverage
                    </label>
                    <select
                      value={adoptionCoverage}
                      onChange={(e) => setAdoptionCoverage(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Full">Full</option>
                      <option value="Partial">Partial</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Adoption Frequency
                    </label>
                    <input
                      type="text"
                      value={adoptionFrequency}
                      onChange={(e) => setAdoptionFrequency(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Once per lifetime, per year, etc."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Surrogacy Coverage
                    </label>
                    <select
                      value={surrogacyCoverage}
                      onChange={(e) => setSurrogacyCoverage(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Full">Full</option>
                      <option value="Partial">Partial</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Surrogacy Frequency
                    </label>
                    <input
                      type="text"
                      value={surrogacyFrequency}
                      onChange={(e) => setSurrogacyFrequency(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Once per lifetime, per year, etc."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Products Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Expanded Products</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    How many female employees, spouses and domestic partners are between age 40-60?
                  </label>
                  <input
                    type="text"
                    value={femaleEmployees4060 ? formatNumberWithCommas(femaleEmployees4060) : ''}
                    onChange={(e) => setFemaleEmployees4060(unformatNumber(e.target.value))}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Provide the number of live births in the most recent 12 months
                  </label>
                  <input
                    type="text"
                    value={liveBirths12moExpanded ? formatNumberWithCommas(liveBirths12moExpanded) : ''}
                    onChange={(e) => setLiveBirths12moExpanded(unformatNumber(e.target.value))}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Please provide the number of subscribers with dependents 12 and under
                  </label>
                  <input
                    type="text"
                    value={subscribersDependentsUnder12 ? formatNumberWithCommas(subscribersDependentsUnder12) : ''}
                    onChange={(e) => setSubscribersDependentsUnder12(unformatNumber(e.target.value))}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Competing Solutions Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Competing Solutions</h2>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Competing Against (select all that apply)
                </label>
                <div className="space-y-3">
                  {['Carrot', 'Progyny Legacy', 'Kindbody', 'Maven', 'Other'].map((option) => (
                    <label key={option} className={`flex items-center gap-3 cursor-pointer px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}`}>
                      <input
                        type="checkbox"
                        checked={competingAgainst.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompetingAgainst([...competingAgainst, option]);
                          } else {
                            setCompetingAgainst(competingAgainst.filter((item) => item !== option));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className={cardClass}>
            <h2 className={`${headingClass} mb-8`}>Notes & Files</h2>

            <div className="space-y-6">
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
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
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







