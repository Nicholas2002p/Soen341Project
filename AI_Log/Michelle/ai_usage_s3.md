AI_Logs

Task ID/Title: Display old data before editing the recruiter job posting
Purpose of AI Use: Faster way of searching up how to convert the date so it can be displayed
Chat Link or Prompt/Response:
prompt:
how do i convert it so it works for deadline, deadline is: 2026-11-18T19:29:00.000Z

code: 
```
function toDateTimeLocal(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
```
AI-Suggested Content: Code on how to show the deadline
Validation: I ran it and verified it was added correctly
Decision: Accepted but Modified
Reflection: AI makes the search easier
Responsible Person: Michelle

-------------

Task ID/Title: Display the legend for the pie chart
Purpose of AI Use: recharts website didn't show how to display the legend, on the website, it only showed the math and then i added the data but it didn't show what each color did and the rest of the pie charts didn't have a legend or wrote what each sector did.
Chat Link or Prompt/Response:
prompt:
the pie chart doesnt show what each color does, how do i display it

code: 
```
<ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1rem' }}>
  {statuses.map((status) => (
    <li key={status.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem', backgroundColor: status.color }} />
      {status.name}: {status.value}
    </li>
  ))}
</ul>
```
AI-Suggested Content: Code on how to display the legend for the pie chart
Validation: I ran it and verified it was added correctly
Decision: Accepted
Reflection: AI makes the search easier
Responsible Person: Michelle