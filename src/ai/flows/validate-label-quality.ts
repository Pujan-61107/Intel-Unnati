
// src/ai/flows/validate-label-quality.ts
'use server';

/**
 * @fileOverview Flow for validating the quality and correctness of a product label using OCR and an LLM.
 *
 * - validateLabelQuality - A function that validates the label.
 * - ValidateLabelQualityInput - The input type for the validateLabelQuality function.
 * - ValidateLabelQualityOutput - The return type for the validateLabelQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateLabelQualityInputSchema = z.object({
  labelImageUri: z
    .string()
    .describe(
      "A photo of the product label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  deviceId: z.string().describe('The expected Device ID of the product.'),
  batchId: z.string().describe('The expected Batch ID of the product.'),
  manufacturingDate: z.string().describe('The expected manufacturing date of the product (YYYY-MM-DD).'),
  rohsCompliance: z.boolean().describe('The expected RoHS compliance status of the product.'),
  serialNumber: z.string().describe('The expected Serial Number of the product.'),
});
export type ValidateLabelQualityInput = z.infer<typeof ValidateLabelQualityInputSchema>;

const ValidateLabelQualityOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the label is valid and contains all the correct information matching the expected values.'),
  validationResult: z.string().describe('Detailed results of the label validation, including checks for each piece of information (Device ID, Batch ID, Manufacturing Date, RoHS Compliance, Serial Number) and any discrepancies found or confirmations of correctness.'),
});
export type ValidateLabelQualityOutput = z.infer<typeof ValidateLabelQualityOutputSchema>;

export async function validateLabelQuality(input: ValidateLabelQualityInput): Promise<ValidateLabelQualityOutput> {
  return validateLabelQualityFlow(input);
}

// New, simpler prompt for validation only. It receives the OCR text as input.
const validationPromptInputSchema = ValidateLabelQualityInputSchema.extend({
  extractedText: z.string().describe("The text extracted from the label image via OCR."),
});

const validationPrompt = ai.definePrompt({
  name: 'validationPrompt',
  input: { schema: validationPromptInputSchema },
  output: { schema: ValidateLabelQualityOutputSchema },
  system: `You are a Quality Control Inspector. Your function is to validate product labels by comparing extracted text to expected values and return a JSON object with the results.`,
  prompt: `
Compare the extracted text below against the expected information and validate the product label.

**Extracted Text from Label:**
---
{{{extractedText}}}
---

**Expected Information:**
- Device ID: {{{deviceId}}}
- Batch ID: {{{batchId}}}
- Manufacturing Date: {{{manufacturingDate}}}
- RoHS Compliant: {{{rohsCompliance}}}
- Serial Number: {{{serialNumber}}}

**Instructions:**
- If every single piece of expected information is present and matches the extracted text exactly, set \`isValid\` to \`true\` and \`validationResult\` to "All information is present and correct on the label.".
- If even one piece of information is missing, incorrect, or does not match, set \`isValid\` to \`false\` and create a \`validationResult\` string that details every discrepancy found (e.g., "Device ID: Correct. Batch ID: Missing. Serial Number: Found 'SN-123' instead of 'SN-456'.").

Your final output must be ONLY the JSON object conforming to the output schema. Do not add any extra text or explanations.
`,
});

const validateLabelQualityFlow = ai.defineFlow(
  {
    name: 'validateLabelQualityFlow',
    inputSchema: ValidateLabelQualityInputSchema,
    outputSchema: ValidateLabelQualityOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Perform OCR directly in the flow.
      const { text: ocrText } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: [
          { media: { url: input.labelImageUri } },
          { text: 'Extract all visible text from this product label image. Present the text clearly.' },
        ],
        config: {
          responseModalities: ['TEXT'],
        },
      });
      
      if (!ocrText) {
        return {
          isValid: false,
          validationResult: "AI failed to extract any text from the label image (OCR failed).",
        };
      }

      // Step 2: Call the validation prompt with the extracted text.
      const { output } = await validationPrompt({
        ...input,
        extractedText: ocrText,
      });

      if (!output) {
        console.error("AI model returned a null or undefined output for validation.");
        return {
          isValid: false,
          validationResult: "AI model failed to generate a valid validation response. The result was empty.",
        };
      }
      
      return output;
    } catch (e: any) {
      console.error("An error occurred in the validateLabelQualityFlow:", e);

      // Provide a more user-friendly message for schema validation errors.
      if (e.message?.includes("Schema validation failed")) {
          return {
              isValid: false,
              validationResult: "AI failed to produce a correctly formatted JSON response. It may have returned text instead of the required JSON structure.",
          };
      }

      return {
        isValid: false,
        validationResult: `An unexpected error occurred during AI validation: ${e.message || 'Unknown error'}`
      };
    }
  }
);
