
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

const ocrTool = ai.defineTool({
  name: 'ocrTool',
  description: 'Performs OCR on an image of a product label and returns the text found.',
  inputSchema: z.object({
    imageUri: z.string().describe('The data URI of the label image to process.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  const {text} = await ai.generate({
    model: 'googleai/gemini-2.0-flash', // Using a model capable of OCR-like tasks
    prompt: [
      {media: {url: input.imageUri}},
      {text: 'Extract all visible text from this product label image. Present the text clearly.'},
    ],
    config: {
      responseModalities: ['TEXT'],
    },
  });

  return text!;
});

const validateLabelQualityPrompt = ai.definePrompt({
  name: 'validateLabelQualityPrompt',
  input: {schema: ValidateLabelQualityInputSchema},
  output: {schema: ValidateLabelQualityOutputSchema},
  tools: [ocrTool],
  system: `You are a Quality Control Inspector. Your only function is to validate product labels by comparing extracted text to expected values and return a JSON object with the results. You must use the provided 'ocrTool' to get the text from the label image.`,
  prompt: `
Validate the product label from the image in \`labelImageUri\`.

**Step 1: Extract Text**
Use the \`ocrTool\` with the \`labelImageUri\` to get the text from the label.

**Step 2: Compare and Validate**
Compare the extracted text against this expected information:
- Device ID: {{{deviceId}}}
- Batch ID: {{{batchId}}}
- Manufacturing Date: {{{manufacturingDate}}}
- RoHS Compliant: {{{rohsCompliance}}}
- Serial Number: {{{serialNumber}}}

**Step 3: Formulate Response**
- If every single piece of information is present and matches the expected values exactly, set \`isValid\` to \`true\` and \`validationResult\` to "All information is present and correct on the label.".
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
      const { output } = await validateLabelQualityPrompt(input);

      if (!output) {
        console.error("AI model returned a null or undefined output.");
        return {
          isValid: false,
          validationResult: "AI model failed to generate a valid response. The result was empty.",
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
