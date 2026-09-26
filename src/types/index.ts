/**
 * Core type definitions for Text Tools platform
 */

export type ToolCategory = 'text' | 'writing' | 'developer' | 'seo' | 'encoding' | 'generators';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  count?: number;
}

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
}

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  seo: SEOData;
  requiresClient: boolean;
  processorId: string;
  relatedTools: string[]; // slugs
  faq: ToolFAQ[];
  isFoundationDemo?: boolean;
}

export interface TextStatistics {
  charCount: number;
  wordCount: number;
  lineCount: number;
  byteCount: number;
  readingTimeMinutes: number;
}

export interface ProcessorInput {
  text: string;
  options?: Record<string, any>;
}

export interface ProcessorOutput {
  output: string;
  statistics: TextStatistics;
  metadata?: Record<string, any>;
}

export interface ProcessorResult {
  success: boolean;
  data?: ProcessorOutput;
  error?: string;
}
