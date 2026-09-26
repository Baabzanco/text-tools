import { TOOL_REGISTRY, CATEGORIES } from './registry';
import { processorRegistry } from '../text/processors/engine';

export interface IntegrityCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  toolCount: number;
}

/**
 * Validates integrity of all registered tools in TOOL_REGISTRY.
 */
export function validateToolRegistry(): IntegrityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validCategories = new Set(CATEGORIES.map(c => c.id));
  const validSlugs = new Set(TOOL_REGISTRY.map(t => t.slug));
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();

  for (const tool of TOOL_REGISTRY) {
    // 1. Unique ID
    if (seenIds.has(tool.id)) {
      errors.push(`Duplicate tool ID found: "${tool.id}"`);
    } else {
      seenIds.add(tool.id);
    }

    // 2. Unique Slug
    if (seenSlugs.has(tool.slug)) {
      errors.push(`Duplicate tool slug found: "${tool.slug}"`);
    } else {
      seenSlugs.add(tool.slug);
    }

    // 3. Valid Category
    if (!validCategories.has(tool.category)) {
      errors.push(`Tool "${tool.slug}" has invalid category "${tool.category}"`);
    }

    // 4. Registered Processor
    if (!processorRegistry[tool.processorId]) {
      errors.push(`Tool "${tool.slug}" references missing processorId "${tool.processorId}"`);
    }

    // 5. SEO Metadata Present
    if (!tool.seo || !tool.seo.title || !tool.seo.description) {
      errors.push(`Tool "${tool.slug}" is missing SEO title or description`);
    }

    // 6. Valid Related Tools
    if (tool.relatedTools) {
      for (const relSlug of tool.relatedTools) {
        if (!validSlugs.has(relSlug)) {
          warnings.push(`Tool "${tool.slug}" references non-existent related tool slug "${relSlug}"`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    toolCount: TOOL_REGISTRY.length
  };
}
