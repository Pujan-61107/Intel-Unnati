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
  deviceId: z.string().describe('The device ID of the product.'),
  batchId: z.string().describe('The batch ID of the product.'),
  manufacturingDate: z.string().describe('The manufacturing date of the product (YYYY-MM-DD).'),
  rohsCompliance: z.boolean().describe('Whether the product is RoHS compliant.'),
});
export type ValidateLabelQualityInput = z.infer<typeof ValidateLabelQualityInputSchema>;

const ValidateLabelQualityOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the label is valid and contains the correct information.'),
  validationResult: z.string().describe('Detailed results of the label validation, including any errors or missing information.'),
});
export type ValidateLabelQualityOutput = z.infer<typeof ValidateLabelQualityOutputSchema>;

export async function validateLabelQuality(input: ValidateLabelQualityInput): Promise<ValidateLabelQualityOutput> {
  return validateLabelQualityFlow(input);
}

const ocrTool = ai.defineTool({
  name: 'ocrTool',
  description: 'Performs OCR on an image and returns the text found.',
  inputSchema: z.object({
    imageUri: z.string().describe('The data URI of the image to process.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  const {text} = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: [
      {media: {url: input.imageUri}},
      {text: 'Read the text in this image.'},
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
  prompt: `You are a quality control expert validating product labels. You will use OCR to read the label and check if the information matches the provided details.

Here are the product details:
Device ID: {{{deviceId}}}
Batch ID: {{{batchId}}}
Manufacturing Date: {{{manufacturingDate}}}
RoHS Compliance: {{{rohsCompliance}}}

Use the ocrTool to extract the text from the label image.

Based on the OCR output, determine if the label is valid and contains all the correct information. Provide a detailed validation result, including any errors or missing information.

OCR Output: {{await ocrTool imageUri=labelImageUri}}

Return a JSON object with the following format:
{
  "isValid": true/false,
  "validationResult": "Detailed validation results"
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
