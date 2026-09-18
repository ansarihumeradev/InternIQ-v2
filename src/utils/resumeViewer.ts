/**
 * Resume Viewer Utility
 * Safely opens student PDF resumes in the browser.
 * Handles Data URLs (by converting to Blob URL to bypass Chromium top-level navigation restrictions)
 * and HTTP/HTTPS URLs.
 */
export const openResume = (resumeUrl: string, candidateName: string = 'Candidate'): void => {
  if (!resumeUrl || resumeUrl.trim() === '') {
    alert('No resume attached for this applicant.');
    return;
  }

  if (resumeUrl.includes('placeholder.url')) {
    alert('This application was submitted with an outdated placeholder URL. Please ask the applicant to upload a real PDF resume.');
    return;
  }

  // Handle Base64 Data URL (data:application/pdf;base64,...)
  if (resumeUrl.startsWith('data:')) {
    try {
      const parts = resumeUrl.split(',');
      if (parts.length < 2) {
        throw new Error('Invalid Data URL');
      }

      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const win = window.open(blobUrl, '_blank');
      if (!win) {
        // Fallback for pop-up blockers: trigger download
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Revoke the blob URL after 2 minutes to free memory
      setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
    } catch (err) {
      console.error('Error opening resume blob:', err);
      // Fallback attempt
      window.open(resumeUrl, '_blank');
    }
  } else {
    // Normal HTTP/HTTPS URL
    window.open(resumeUrl, '_blank', 'noopener,noreferrer');
  }
};
