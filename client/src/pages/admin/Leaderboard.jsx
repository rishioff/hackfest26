import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as leaderboardService from '../../services/leaderboard.service';
import { formatScore } from '../../utils/formatters';
import { downloadFromResponse } from '../../utils/downloadFile';
import { cn } from '../../utils/classNames';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const rankColors = [
  'from-yellow-400 to-amber-500',
  'from-gray-300 to-gray-400',
  'from-orange-400 to-orange-500',
];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard();
      setLeaderboard(data.data?.leaderboard || data.leaderboard || data.data || []);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await leaderboardService.exportCSV();
      downloadFromResponse(response, 'leaderboard.csv');
      toast.success('Leaderboard exported');
    } catch {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 flex-shrink-0" />
              Leaderboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Team rankings by evaluation scores</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary gap-1.5 text-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export CSV'}</span>
            <span className="sm:hidden">{exporting ? '...' : 'CSV'}</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="card p-12 text-center">
            <TrophyIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No scores yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Teams will appear here once judges submit evaluations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry._id || entry.teamId || index}
                className={cn(
                  'card p-5 flex items-center gap-4 animate-slide-up transition-all',
                  index < 3 && 'border-l-4',
                  index === 0 && 'border-l-amber-400',
                  index === 1 && 'border-l-gray-400',
                  index === 2 && 'border-l-orange-400'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rank */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                    index < 3
                      ? `bg-gradient-to-br ${rankColors[index]} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {index + 1}
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {entry.teamName || entry.name || 'Team'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.memberCount || entry.members?.length || 0} members
                    {entry.evaluationCount ? ` - ${entry.evaluationCount} evaluations` : ''}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatScore(entry.averageScore || entry.totalScore || entry.score || 0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.averageScore != null ? 'avg' : 'total'} score
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
