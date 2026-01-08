/**
 * Formats a tracking ID based on whether it's anonymous
 * @param trackingId - The original tracking ID (e.g., "CASE-1234" or "HELP-5678")
 * @param isAnonymous - Whether the case/request was reported anonymously
 * @param type - Type of entity: 'CASE' or 'HELP'
 * @returns Formatted tracking ID (e.g., "ANON-C-1234" for anonymous cases, "ANON-H-5678" for anonymous help requests)
 */
export const formatTrackingId = (
  trackingId: string | undefined,
  isAnonymous: boolean | undefined,
  type: 'CASE' | 'HELP' = 'CASE'
): string => {
  if (!trackingId) {
    return '';
  }

  // If not anonymous, return as-is
  if (!isAnonymous) {
    return trackingId;
  }

  // Extract the ID part (numbers/characters after the prefix)
  // Handle formats like "CASE-1234", "HELP-5678", "CASE_1234", etc.
  const match = trackingId.match(/(?:CASE|HELP)[-_]?([A-Z0-9]+)/i);
  
  if (match && match[1]) {
    const idPart = match[1];
    return type === 'CASE' ? `ANON-C-${idPart}` : `ANON-H-${idPart}`;
  }

  // If we can't parse the format, try to extract last 4 characters
  const lastPart = trackingId.slice(-4);
  return type === 'CASE' ? `ANON-C-${lastPart}` : `ANON-H-${lastPart}`;
};

/**
 * Formats a tracking ID from a case ID when trackingId is not available
 * @param caseId - The case ID
 * @param isAnonymous - Whether the case was reported anonymously
 * @returns Formatted tracking ID
 */
export const formatCaseId = (
  caseId: string | undefined,
  isAnonymous: boolean | undefined
): string => {
  if (!caseId) {
    return 'N/A';
  }

  if (isAnonymous) {
    const idPart = caseId.slice(0, 4).toUpperCase();
    return `ANON-C-${idPart}`;
  }

  return `CASE-${caseId.slice(0, 4).toUpperCase()}`;
};

/**
 * Formats a tracking ID from a help request ID when trackingId is not available
 * @param helpRequestId - The help request ID
 * @param isAnonymous - Whether the request was made anonymously
 * @returns Formatted tracking ID
 */
export const formatHelpRequestId = (
  helpRequestId: string | undefined,
  isAnonymous: boolean | undefined
): string => {
  if (!helpRequestId) {
    return 'N/A';
  }

  if (isAnonymous) {
    const idPart = helpRequestId.slice(0, 4).toUpperCase();
    return `ANON-H-${idPart}`;
  }

  return `HELP-${helpRequestId.slice(0, 4).toUpperCase()}`;
};

