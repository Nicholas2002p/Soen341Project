import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import {GetAnalyticsApi} from '../../utils/Api';
import { Pie, PieChart } from 'recharts';

import './Insight.scss';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const SeeHistory = async () => {
      const data = await GetAnalyticsApi(token);
      if (!data) return;
      setAnalytics(data);
    };
    SeeHistory();
  }, [token]);
  
  return (
    <section className='analytics'>
      <main className='main-analytics'>
        {analytics && <JobApplicationAnalytics byStatus={analytics.byStatus} />}

        <p> <strong>Interview Rate</strong>: {analytics.interviewRate} </p>
        <p> <strong>Applications submitted over time</strong>: {analytics.submittedOverTime?.length} </p>
      </main>
    </section>
  );
}

/**
 * 
 * from: https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/
 * @param {*} param0 
 */
function JobApplicationAnalytics({ byStatus }) {
  const statuses = [
    { name: 'Applied', key: 'Applied', color: 'rgb(121, 116, 116)' },
    { name: 'Under Review', key: 'Under_Review', color: 'rgb(227, 138, 35)' },
    { name: 'Interview', key: 'Interview', color: 'rgb(49, 49, 190)' },
    { name: 'Offered', key: 'Offered', color: 'rgb(73, 204, 73)' },
    { name: 'Rejected', key: 'Rejected', color: 'rgb(151, 31, 31)' }
  ].map((status) => ({
    ...status,
    value: byStatus[status.key] ?? 0,
    fill: status.color
  }));
  const data = statuses.filter((status) => status.value > 0);

  return (
    <section className='job-application-analytics'>
      <h2>Applications by status</h2>
      {data.length > 0 ? (
      <PieChart style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }} responsive>
          <Pie
            data={data}
            labelLine={false}
            label={renderCustomizedLabel}
            dataKey="value"
            isAnimationActive={true}
          />
        </PieChart>
      ) : (
        <p>No applications yet.</p>
      )}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1rem' }}>
        {statuses.map((status) => (
          <li key={status.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem', backgroundColor: status.color }} />
            {status.name}: {status.value}
          </li>
        ))}
      </ul>
    </section>
  )
};

// HELPERS

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} (${value})`}
    </text>
  );
};
