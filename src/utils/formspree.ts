/**
 * Formspree integration utility
 * Handles form submission to Formspree endpoint: https://formspree.io/f/xvzvperv
 */

export interface FormspreeResponse {
  ok: boolean;
  error?: string;
}

/**
 * Format form data into Formspree-compatible structure
 * Formspree accepts nested objects and arrays in JSON
 */
export function formatDataForFormspree(formData: Record<string, any>): Record<string, any> {
  // Formspree can handle JSON directly, so we just need to ensure all values are serializable
  return {
    ...formData,
  };
}

/**
 * Submit form data to Formspree
 * @param formData The form data object to submit
 * @returns Response from Formspree API
 */
export async function submitToFormspree(
  formData: Record<string, any>
): Promise<FormspreeResponse> {
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzvperv';

  try {
    const formattedData = formatDataForFormspree(formData);

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    // Formspree returns JSON with success/error status
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Formspree returned ${response.status}`);
    }

    return {
      ok: true,
      ...result,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Formspree submission failed: ${errorMessage}`);
  }
}
