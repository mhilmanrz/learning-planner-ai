/**
 * Mengembalikan tanggal Senin dari minggu yang mengandung date
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}
 
/**
 * Mengembalikan tanggal Minggu dari minggu yang mengandung date
 */
function getWeekEnd(date) {
  const start = new Date(getWeekStart(date));
  start.setDate(start.getDate() + 6);
  return start.toISOString().split('T')[0];
}
 
/**
 * Mengembalikan string minggu ISO: 2026-W15
 */
function getWeekString(date) {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}
 
/**
 * Mengembalikan tanggal Senin dari minggu berjalan
 */
function getCurrentWeekStart() {
  return getWeekStart(new Date());
}
 
/**
 * Mengembalikan string minggu ISO dari minggu berjalan
 */
function getCurrentWeek() {
  return getWeekString(new Date());
}
 
module.exports = { getWeekStart, getWeekEnd, getWeekString, getCurrentWeekStart, getCurrentWeek };