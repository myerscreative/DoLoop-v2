

// Constants
export const TIMEZONE_PST = 'America/Los_Angeles';

/**
 * Get the current date in PST/PDT
 */
export function getNowPST(): Date {
  // Create a date object that corresponds to the current instant
  const now = new Date();
  
  // If we just need a Date object that represents "now", the standard Date() is fine
  // because the underlying timestamp is UTC. 
  // However, when we perform operations like "start of day", we need to know the timezone.
  
  return now;
}

/**
 * Format a date object to a localized string string in PST
 * e.g. "Jan 1, 2026" or "1/1/2026"
 */
export function formatDatePST(date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE_PST,
      ...options,
    }).format(dateObj);
  } catch (e) {
    // Fallback if timezone is not supported (rare in modern environments)
    console.warn('PST Timezone not supported, falling back to local', e);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format time in PST
 * e.g. "10:30 AM"
 */
export function formatTimePST(date: Date | string | number | null | undefined): string {
    return formatDatePST(date, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

/**
 * Format full date and time in PST
 * e.g. "Jan 1, 2026, 10:30 AM"
 */
export function formatDateTimePST(date: Date | string | number | null | undefined): string {
    return formatDatePST(date, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

/**
 * Calculate relative time string in PST context (e.g. "2d ago", "Just now")
 * Note: Relative time based on duration is timezone-independent (2 hours is 2 hours everywhere),
 * but calculations involving "Start of Day" or "Yesterday" need PST.
 */
export function formatRelativePST(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  // For "Yesterday" check, we need to compare calendar days in PST


  // Use the PST-formatted strings to check for "Yesterday"
  // Calculate difference in days (PST safe enough for relative "ago" logic)
  // Calculate difference in days (PST safe enough for relative "ago" logic)
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDatePST(date, { month: 'short', day: 'numeric' });
}

/**
 * Get the "Start of Day" (00:00:00) for a given date in PST, returned as a UTC Date object.
 * This is crucial for streaks/comparisons to ensure "Today" flips at midnight PST, not UTC.
 */
export function getStartOfDayPST(date: Date = new Date()): Date {
    // 1. Format the date components in PST
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE_PST,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    }).formatToParts(date);

    const partMap: Record<string, number> = {};
    parts.forEach(p => {
        if (p.type !== 'literal') partMap[p.type] = parseInt(p.value, 10);
    });

    // 2. Construct a new date using these components, but treating them as the "local" time
    // We want the timestamp that corresponds to 00:00:00 on that day in PST.
    // This is complex because we need to find the UTC timestamp that *is* 00:00 PST.
    
    // Easier approach: Use string manipulation which Intl handles well
    // "1/1/2026"
    const dateStringPST = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE_PST,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }).format(date);
    
    // Create a date purely from the "YYYY-MM-DD" string, then offset it?
    // Actually, simple string parsing might be safer if we assume the input is valid.
    // Let's rely on the fact that creating a Date from a specific string in a specific timezone is non-trivial in pure JS without libraries like date-fns-tz.
    // However, we can approximate "Start of Day" for comparison purposes.
    
    return new Date(dateStringPST); // This uses browser local time, which might be wrong if user device is not PST.
}

/**
 * Returns a sortable date string "YYYY-MM-DD" representing the date in PST.
 * Useful for grouping data by day.
 */
export function getIsoDatePST(date: Date = new Date()): string {
     return new Intl.DateTimeFormat('en-CA', { // YYYY-MM-DD format
          timeZone: TIMEZONE_PST,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
      }).format(date);
}

/**
 * Returns formatted Due Date string relative to PST "Today"
 */
export function formatDueDatePST(dueDateString: string): string {
    const due = new Date(dueDateString);
    const now = new Date();
    
    const dueIsoPST = getIsoDatePST(due);
    const todayIsoPST = getIsoDatePST(now);
    
    if (dueIsoPST === todayIsoPST) return 'Due today';
    
    // Calculate difference in days based on the ISO strings to avoid hour math issues
    const d1 = new Date(dueIsoPST);
    const d2 = new Date(todayIsoPST);
    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays}d`;
    
    return formatDatePST(due, { month: 'numeric', day: 'numeric', year: '2-digit' });
}
