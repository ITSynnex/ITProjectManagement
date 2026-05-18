import { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { getTaskOverviewByTeam } from '../../api/taskOverview.api';
import TaskOverviewLayout from '../../components/overview/TaskOverviewLayout';

const TaskOverviewTeamPage = () => {
  const [data, setData]       = useState({ kpis: null, matrix: [], swimlane: [], buckets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getTaskOverviewByTeam()
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8E6E0] bg-white flex-shrink-0">
        <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-[#4F46E5]" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-[#1A1A1A]">Project Overview — By IT Team</h1>
          {!loading && !error && (
            <p className="text-[12px] text-[#9CA3AF]">{data.kpis?.total ?? 0} projects total</p>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <TaskOverviewLayout
          kpis={data.kpis}
          matrix={data.matrix}
          swimlane={data.swimlane}
          buckets={data.buckets}
          groupKey="IT Team"
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default TaskOverviewTeamPage;
