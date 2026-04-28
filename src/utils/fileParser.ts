/**
 * File parser utility for extracting text from PDF, DOCX, DOC, and TXT files.
 * Text is extracted client-side and sent to AI APIs (not the raw file).
 */

import * as pdfjsLib from 'pdfjs-dist';
// Import the worker directly from the package — Vite bundles it as a separate asset
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set the worker source using the locally bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text from a PDF file.
 */
async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const textParts: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }
  
  return textParts.join('\n\n');
}

/**
 * Extract text from a DOCX file using mammoth.
 */
async function parseDOCX(file: File): Promise<string> {
  // @ts-ignore
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Read a plain text file.
 */
async function parseTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

/**
 * Supported file extensions.
 */
export const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
export const ACCEPT_STRING = '.pdf,.doc,.docx,.txt';

/**
 * Get file extension from a file name.
 */
function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Parse a file and extract its text content.
 * Supports PDF, DOCX, DOC, and TXT files.
 */
export async function parseFile(file: File): Promise<string> {
  const ext = getFileExtension(file.name);
  
  switch (ext) {
    case '.pdf':
      return await parsePDF(file);
    case '.docx':
      return await parseDOCX(file);
    case '.doc':
      // .doc (old Word format) — mammoth has limited support
      // Try mammoth, fall back with a helpful message
      try {
        return await parseDOCX(file);
      } catch {
        throw new Error(
          'Unable to read .doc file. Please convert it to .docx format and try again.'
        );
      }
    case '.txt':
      return await parseTXT(file);
    default:
      throw new Error(
        `Unsupported file type: ${ext}. Please use PDF, DOCX, or TXT files.`
      );
  }
}
