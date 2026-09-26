import { ProcessorInput, ProcessorResult } from '../../types';
import { executeProcessorSync } from './processors/engine';

/**
 * Executes a text processing task, attempting Web Worker execution for heavy loads
 * and falling back gracefully to main thread synchronous execution.
 */
export async function runTextProcessor(
  processorId: string,
  input: ProcessorInput,
  useWorkerIfAvailable = true
): Promise<ProcessorResult> {
  // For small text strings (< 50,000 chars), synchronous processing is instantaneous and avoids worker spinup overhead
  if (!useWorkerIfAvailable || input.text.length < 50000 || typeof Worker === 'undefined') {
    return executeProcessorSync(processorId, input);
  }

  return new Promise<ProcessorResult>((resolve) => {
    try {
      // Inline worker URL or standard module worker instantiation
      const worker = new Worker(new URL('../../workers/text.worker.ts', import.meta.url), {
        type: 'module'
      });

      const timeout = setTimeout(() => {
        worker.terminate();
        // Fallback to sync
        resolve(executeProcessorSync(processorId, input));
      }, 5000);

      worker.onmessage = (e: MessageEvent) => {
        clearTimeout(timeout);
        worker.terminate();
        if (e.data?.success) {
          resolve({
            success: true,
            data: e.data.data
          });
        } else {
          resolve({
            success: false,
            error: e.data?.error || 'Worker execution failed'
          });
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        worker.terminate();
        console.warn('Worker error, falling back to synchronous execution:', err);
        resolve(executeProcessorSync(processorId, input));
      };

      worker.postMessage({
        type: 'PROCESS',
        toolId: processorId,
        input: input.text,
        options: input.options
      });
    } catch (err) {
      console.warn('Worker creation failed, falling back to sync:', err);
      resolve(executeProcessorSync(processorId, input));
    }
  });
}
