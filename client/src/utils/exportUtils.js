/**
 * Triggers a file download for exported data in JSON format
 */
export const downloadJSON = (data, filename = 'winter-arc-export.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Triggers a CSV file download from exported data tables
 */
export const downloadCSV = (data, filename = 'winter-arc-habits.csv') => {
  if (!data || !data.habitLogs) return;

  const habitMap = {};
  if (data.habits) {
    data.habits.forEach((h) => {
      habitMap[h._id] = h.name;
    });
  }

  let csvContent = 'Date,Habit,Status\n';
  data.habitLogs.forEach((log) => {
    const habitName = habitMap[log.habitId] || 'Unknown Habit';
    csvContent += `"${log.date}","${habitName}","${log.completed ? 'Completed' : 'Missed'}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
