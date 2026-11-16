AI_Logs

prompt:
how do i convert it so it works for deadline, deadline is: 2026-11-18T19:29:00.000Z

code: 
function toDateTimeLocal(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

accepted but modified to fit the logic