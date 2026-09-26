import { computeTextStatistics } from '../lib/utils/unicode';
import { processorRegistry } from '../lib/text/processors/engine';

/**
 * Web Worker for offloading heavy text transformation and statistics calculations
 * away from the main UI thread.
 */

self.onmessage = (event: MessageEvent) => {
  const { type, toolId, input, options } = event.data || {};

  if (type !== 'PROCESS') {
    return;
  }

  try {
    const text = typeof input === 'string' ? input : '';
    const stats = computeTextStatistics(text);
    
    const processor = processorRegistry[toolId];
    let output = text;
    let metadata: Record<string, any> = { processedInWorker: true };

    if (processor) {
      const res = processor(text, options);
      output = res.output;
      if (res.metadata) {
        metadata = { ...res.metadata, processedInWorker: true };
      }
    }

    const outputStats = computeTextStatistics(output);

    self.postMessage({
      type: 'RESULT',
      success: true,
      data: {
        output,
        statistics: outputStats,
        inputStatistics: stats,
        metadata
      }
    });
  } catch (err: any) {
    self.postMessage({
      type: 'RESULT',
      success: false,
      error: err?.message || 'An unexpected error occurred during worker processing'
    });
  }
};
