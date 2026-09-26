/**
 * Reusable client-side clipboard utility with fallback support for all desktop & mobile browsers.
 */

export interface CopyResult {
  success: boolean;
  message?: string;
}

export async function copyToClipboard(text: string): Promise<CopyResult> {
  if (!text) {
    return { success: false, message: 'Nothing to copy' };
  }

  // Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, message: 'Copied to clipboard' };
    } catch (err) {
      console.warn('Clipboard API failed, trying execCommand fallback:', err);
    }
  }

  // Fallback: execCommand('copy') with invisible textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      return { success: true, message: 'Copied to clipboard' };
    }
    return { success: false, message: 'Copy failed' };
  } catch (err) {
    console.error('Clipboard fallback error:', err);
    return { success: false, message: 'Copying is not supported on this browser' };
  }
}
