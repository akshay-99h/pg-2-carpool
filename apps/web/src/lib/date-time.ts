export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function combineDateAndTimeToIso(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const parsed = new Date(`${dateValue}T${timeValue}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function isSameInputDate(date: Date, inputDate: string) {
  return toDateInputValue(date) === inputDate;
}

export function minuteOfDayFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function minuteOfDayFromInput(timeValue: string) {
  if (!timeValue || !timeValue.includes(':')) {
    return null;
  }

  const [hoursString, minutesString] = timeValue.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}
