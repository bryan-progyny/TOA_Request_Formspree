export interface BayesianPredictionInput {
  [key: string]: unknown;
}

export interface BayesianPredictionOutput {
  predicted_rate: number;
  predicted_count: number;
  lower_bound: number;
  upper_bound: number;
}

export function formatFormDataForBayesian(
  formData: Record<string, unknown>,
  prospectId: string
): BayesianPredictionInput {
  // Transform form data into Bayesian API input format
  return {
    prospect_id: prospectId,
    ...formData,
  };
}

export function validateBayesianInput(input: BayesianPredictionInput): string[] {
  const errors: string[] = [];
  
  // Add validation logic as needed
  if (!input.prospect_id) {
    errors.push('prospect_id is required');
  }
  
  return errors;
}

export async function callBayesianAPI(
  input: BayesianPredictionInput
): Promise<BayesianPredictionOutput> {
  try {
    const bayesianApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bayesian-prediction`;
    
    const response = await fetch(bayesianApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Bayesian API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      predicted_rate: data.predicted_rate || 0,
      predicted_count: data.predicted_count || 0,
      lower_bound: data.lower_bound || 0,
      upper_bound: data.upper_bound || 0,
    };
  } catch (error) {
    console.error('Bayesian API call failed:', error);
    throw error;
  }
}
