import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTimer } from '../../hooks/useTimer';
import * as adminService from '../../services/admin.service';
import { formatDuration } from '../../utils/formatters';
import {
  UserGroupIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

function StatCard({ icon: Icon, label, value, trend, color, to }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    blue: 'from-blue-500 to-blue-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  const Card = to ? Link : 'div';

  return (
    <Card to={to} className="card p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value ?? '--'}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { totalSeconds, isRunning } = useTimer();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data.data?.stats || data.stats || data.data || data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hackathon overview and management</p>
          </div>
        </div>

        {/* Timer Banner */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-600 to-primary-800 text-white border-0 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <ClockIcon className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Hackathon Timer</p>
                <p className="text-2xl sm:text-3xl font-mono font-bold tracking-wider">{formatDuration(totalSeconds)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRunning && (
                <span className="flex items-center gap-1.5 text-sm bg-white/20 rounded-full px-3 py-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Running
                </span>
              )}
              <Link to="/timer" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Manage Timer
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            <StatCard
              icon={UserCircleIcon}
              label="Total Users"
              value={stats?.totalUsers}
              color="primary"
              to="/admin/users"
            />
            <StatCard
              icon={UserGroupIcon}
              label="Total Teams"
              value={stats?.totalTeams}
              color="blue"
              to="/teams"
            />
            <StatCard
              icon={DocumentTextIcon}
              label="Forms Created"
              value={stats?.totalForms}
              color="cyan"
              to="/forms"
            />
            <StatCard
              icon={ClipboardDocumentListIcon}
              label="Submissions"
              value={stats?.totalSubmissions}
              color="green"
              to="/forms"
            />
            <StatCard
              icon={TrophyIcon}
              label="Evaluations"
              value={stats?.totalEvaluations}
              color="amber"
              to="/leaderboard"
            />
            <StatCard
              icon={ArrowTrendingUpIcon}
              label="Total Commits"
              value={stats?.totalCommits}
              color="pink"
            />
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          {[
            { to: '/admin/users', label: 'Manage Users', icon: UserCircleIcon },
            { to: '/teams', label: 'Manage Teams', icon: UserGroupIcon },
            { to: '/forms', label: 'Manage Forms', icon: DocumentTextIcon },
            { to: '/export', label: 'Export Data', icon: ClipboardDocumentListIcon },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="card-hover p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-primary-500" />
              <span className="font-medium text-gray-900 dark:text-white">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
