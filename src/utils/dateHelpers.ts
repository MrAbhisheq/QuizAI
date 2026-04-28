/**
 * Safely convert Firestore Timestamp to JavaScript Date
 * @param timestamp - Firestore Timestamp or Date object
 * @returns JavaScript Date object or current date if invalid
 */
export const toDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }
  
  // If already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If Firestore Timestamp
  if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If timestamp has seconds (Firestore Timestamp format)
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Try to parse as date string
  try {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    console.warn('Could not parse date:', timestamp);
  }
  
  // Return current date as fallback
  return new Date();
};

/**
 * Safe format date with fallback
 * @param date - Date to format
 * @param formatFn - Format function from date-fns
 * @param pattern - Format pattern
 * @param fallback - Fallback string if date is invalid
 */
export const safeFormatDate = (
  date: any,
  formatFn: (date: Date, pattern: string) => string,
  pattern: string,
  fallback: string = 'Unknown date'
): string => {
  try {
    const validDate = toDate(date);
    if (isNaN(validDate.getTime())) {
      return fallback;
    }
    return formatFn(validDate, pattern);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Convert Firestore document data with timestamps
 * @param data - Firestore document data
 * @param timestampFields - Array of field names that are timestamps
 */
export const convertTimestamps = <T extends Record<string, any>>(
  data: T,
  timestampFields: string[] = ['createdAt', 'updatedAt']
): T => {
  const converted: any = { ...data };
  
  timestampFields.forEach(field => {
    if (converted[field]) {
      converted[field] = toDate(converted[field]);
    }
  });
  
  return converted as T;
};
