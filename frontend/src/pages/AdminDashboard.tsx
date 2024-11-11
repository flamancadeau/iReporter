import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  HourglassIcon,
  SearchIcon,
  XCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Report interface
interface Report {
  id: number;
  title: string;
  description: string;
  submittedAt: string;
  status: 'Pending' | 'Under Investigation' | 'Rejected' | 'Resolved';
}

// Status configuration for easy mapping
const STATUS_CONFIG: Record<Report['status'], { icon: React.FC; color: string }> = {
  Pending: {
    icon: HourglassIcon,
    color: 'bg-yellow-200 text-yellow-800 border-yellow-300',
  },
  'Under Investigation': {
    icon: AlertCircle,
    color: 'bg-blue-200 text-blue-800 border-blue-300',
  },
  Rejected: {
    icon: XCircle,
    color: 'bg-red-200 text-red-800 border-red-300',
  },
  Resolved: {
    icon: CheckCircle,
    color: 'bg-green-200 text-green-800 border-green-300',
  },
};

// Colors for pie charts
const CHART_COLORS = {
  Pending: '#FFC107',
  'Under Investigation': '#007BFF',
  Rejected: '#DC3545',
  Resolved: '#28A745',
};

export default function Component() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Report['status'] | 'All'>('All');
  const [error, setError] = useState("");

  // useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/reports');
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(error);
        // Handle error (e.g., show error message to user)
      }
    };

    fetchReports();
  // }, []);

  // const filteredReports = useMemo(() => {
  //   return reports.filter((report) => {
  //     const matchesSearch =
  //       report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       report.description.toLowerCase().includes(searchTerm.toLowerCase());
  //     const matchesStatus =
  //       filterStatus === 'All' || report.status === filterStatus;
  //     return matchesSearch && matchesStatus;
  //   });
  // }, [reports, searchTerm, filterStatus]);

  // const updateReportStatus = async (id: number, newStatus: Report['status']) => {
  //   try {
  //     const response = await fetch(`/auth/reports/${id}`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ status: newStatus }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update report status');
  //     }

  //     setReports((currentReports) =>
  //       currentReports.map((report) =>
  //         report.id === id ? { ...report, status: newStatus } : report
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error updating report status:', error);
  //     // Handle error (e.g., show error message to user)
  //   }
  // };

  // const statusCounts = useMemo(() => {
  //   const counts: Record<Report['status'], number> = {
  //     Pending: 0,
  //     'Under Investigation': 0,
  //     Rejected: 0,
  //     Resolved: 0,
  //   };
  //   reports.forEach((report) => {
  //     counts[report.status]++;
  //   });
  //   return counts;
  // }, [reports]);

  // const chartData = Object.keys(statusCounts).map((status) => ({
  //   name: status as Report['status'],
  //   value: statusCounts[status as Report['status']],
  // }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <div className="flex space-x-4 mb-6">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as Report['status'] | 'All')
              }
              className="border rounded-lg p-3"
            >
              <option value="All">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Individual Pie Charts for Each Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Report Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(STATUS_CONFIG).map((status) => {
              // const statusCount = statusCounts[status as Report['status']];
              return (
                <div key={status} className="bg-white shadow-md rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{status}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[{ name: status, value: 2 }]}  // todo: statusCount
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        fill={CHART_COLORS[status as Report['status']]}
                        label
                      >
                        <Cell fill={CHART_COLORS[status as Report['status']]} />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-1 gap-4">
          {reports.map((report) => {
            const StatusIcon = STATUS_CONFIG[report.status].icon;
            const statusStyle = STATUS_CONFIG[report.status].color;
            return (
              <div
                key={report.id}
                className={`bg-white shadow-md rounded-lg p-6 flex items-center justify-between hover:shadow-lg transition-shadow border-l-4 ${statusStyle.split(' ')[2]}`}
              >
                <div className="flex-grow mr-4">
                  <div className="flex items-center mb-2">
                    <StatusIcon className={`mr-2 ${statusStyle.split(' ')[1]}`} />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {report.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-2">{report.description}</p>
                  <div className="text-sm text-gray-500">
                    Submitted: {report.submittedAt}
                  </div>
                </div>
                {/* Status Change Dropdown */}
                <select
                  value={report.status}
                  // onChange={(e) =>
                  //   updateReportStatus(report.id, e.target.value as Report['status'])
                  // }
                  className={`border rounded px-3 py-2 ${statusStyle}`}
                >
                  {Object.keys(STATUS_CONFIG).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <h1>{error}</h1>

        {/* No Results Handling */}
        {/* {filteredReports.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No reports found matching your search or filter.
          </div>
        )} */}
      </div>
    </div>
  );
}