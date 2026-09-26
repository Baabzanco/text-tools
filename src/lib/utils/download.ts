/**
 * Reusable client-side TXT file download utility.
 * Creates a local Blob and triggers browser download without any server roundtrip.
 */

export function downloadAsTxtFile(content: string, filename = 'text-tools-output.txt'): boolean {
  if (typeof window === 'undefined' || !content) {
    return false;
  }

  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (err) {
    console.error('Failed to trigger text download:', err);
    return false;
  }
}
