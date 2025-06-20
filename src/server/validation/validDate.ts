export default function validDate(date: string) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);

  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();

  if (day < 1 || day > daysInMonth) return false;

  return true;
}
