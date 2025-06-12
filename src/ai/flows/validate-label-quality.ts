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
  prompt: `You are a meticulous Quality Control Inspector for product labels.
Your task is to validate a product label based on text extracted via OCR.
Use the ocrTool to get the text from the label image provided (labelImageUri).

Expected Product Information:
- Device ID: {{{deviceId}}}
- Batch ID: {{{batchId}}}
- Manufacturing Date: {{{manufacturingDate}}}
- RoHS Compliant: {{{rohsCompliance}}}
- Serial Number: {{{serialNumber}}}

OCR Output from Label: {{await ocrTool imageUri=labelImageUri}}

Based on the OCR Output, meticulously check the following:
1.  Is the Device ID "{{{deviceId}}}" present and correct on the label?
2.  Is the Batch ID "{{{batchId}}}" present and correct on the label?
3.  Is the Manufacturing Date "{{{manufacturingDate}}}" present and correct on the label?
4.  Is the RoHS compliance status (equivalent to "{{{rohsCompliance}}}") present and correct on the label? (e.g., "RoHS: Yes", "RoHS Compliant", or similar for true; "RoHS: No", "Not RoHS Compliant" for false)
5.  Is the Serial Number "{{{serialNumber}}}" present and correct on the label?

Determine if the label is overall 'isValid'. The label is 'isValid' ONLY IF ALL expected pieces of information are present on the label and match the expected values.
Provide a detailed 'validationResult' summarizing your findings for each check (present and correct, present but incorrect, or missing). If incorrect, state what was found.

Return a JSON object with "isValid" (boolean) and "validationResult" (string).
Example for a partially incorrect label:
{
  "isValid": false,
  "validationResult": "Device ID: Present and correct. Batch ID: Missing. Manufacturing Date: Present, but found '2024-07-14' instead of '2024-07-15'. RoHS Compliance: Present and correct. Serial Number: Present and correct."
}
Example for a fully correct label:
{
  "isValid": true,
  "validationResult": "All information is present and correct on the label."
}
`,
});

const validateLabelQualityFlow = ai.defineFlow(
  {
    name: 'validateLabelQualityFlow',
    inputSchema: ValidateLabelQualityInputSchema,
    outputSchema: ValidateLabelQualityOutputSchema,
  },
  async input => {
    const {output} = await validateLabelQualityPrompt(input);
    return output!;
  }
);
