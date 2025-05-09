/**
 * Date formatting to get the difference between two dates in a human-readable format.
 * @param startDate The starting date/time
 * @param endDate The ending date/time (defaults to current time if null)
 * @param maxUnits Maximum number of units to display (default: 2)
 * @returns A detailed formatted string like "2 days, 5 hours"
 */
export function readableDuration(startDate: Date, endDate: Date | null = null, maxUnits: number = 2): string {
  // Use current time if no end date is provided
  const end = endDate || new Date();
  const start = new Date(startDate);
  
  // Calculate duration in seconds
  let durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  
  if (durationInSeconds <= 0) {
    return '0 seconds';
  }
  
  // Define time units in descending order
  const timeUnits = [
    { name: 'year', seconds: 365 * 24 * 60 * 60 },
    { name: 'month', seconds: 30 * 24 * 60 * 60 },
    { name: 'week', seconds: 7 * 24 * 60 * 60 },
    { name: 'day', seconds: 24 * 60 * 60 },
    { name: 'hour', seconds: 60 * 60 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 }
  ];
  
  const parts: string[] = [];
  
  // Build the duration string with multiple units
  for (const unit of timeUnits) {
    if (parts.length >= maxUnits) break;
    
    const value = Math.floor(durationInSeconds / unit.seconds);
    if (value > 0) {
      parts.push(`${value} ${unit.name}${value !== 1 ? 's' : ''}`);
      durationInSeconds -= value * unit.seconds;
    }
  }
  
  return parts.join(', ');
}


/**
 * Calculate the total number of seconds between two dates.
 * @param startDate The starting date/time
 * @param endDate The ending date/time (defaults to current time if null)
 * @returns The total number of seconds between the two dates as a number
 */
export function getTotalSeconds(startDate: Date, endDate: Date | null = null): number {
  // Use current time if no end date is provided
  const end = endDate || new Date();
  const start = new Date(startDate);
  
  // Calculate the difference in milliseconds and convert to seconds
  const differenceInMilliseconds = end.getTime() - start.getTime();
  const totalSeconds = Math.floor(differenceInMilliseconds / 1000);
  
  // Return zero if the result is negative (end date before start date)
  return totalSeconds > 0 ? totalSeconds : 0;
}