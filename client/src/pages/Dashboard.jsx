import { useAuth } from '../hooks/useAuth';
import { useTimer } from '../hooks/useTimer';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';
import { ROLES } from '../utils/constants';
import { formatDuration } from '../utils/formatters';
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ClockIcon,
  CodeBracketIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

function NavLink({ to, icon: Icon, label, badge }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
    >
      <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 transition-colors" />
      <span className="font-medium">{label}</span>
      {badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function TimerDisplay() {
  const { hours, minutes, seconds, isRunning, totalSeconds } = useTimer();

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Hackathon Timer</h3>
        {isRunning && (
          <span className="ml-auto badge-success text-xs">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse-soft inline-block" />
            Live
          </span>
        )}
      </div>
      <div className="text-center">
        <div className="font-mono text-3xl sm:text-5xl font-bold tracking-wider text-gray-900 dark:text-white">
          {formatDuration(totalSeconds)}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {isRunning ? 'Time remaining' : totalSeconds > 0 ? 'Paused' : 'Not started'}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const isAdmin = user?.role === ROLES.SUPERADMIN;
  const isStudent = user?.role === ROLES.STUDENT;
  const isJudge = user?.role === ROLES.JUDGE;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                Hackathon Portal
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon className="w-5 h-5 text-amber-500" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
              </button>

              <Link
                to="/notifications"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              >
                <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <UserCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'User'}
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isAdmin && 'Here is your admin overview of the hackathon.'}
            {isStudent && 'Track your team progress and submissions.'}
            {isJudge && 'Review and evaluate teams assigned to you.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="card p-3 space-y-1 sticky top-24 overflow-x-auto">
              <NavLink to="/dashboard" icon={ChartBarIcon} label="Dashboard" />
              <NavLink to="/notifications" icon={BellIcon} label="Notifications" badge={unreadCount} />
              <NavLink to="/profile" icon={UserCircleIcon} label="Profile" />

              {isAdmin && (
                <>
                  <div className="px-4 py-2 mt-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Admin
                    </p>
                  </div>
                  <NavLink to="/admin" icon={Cog6ToothIcon} label="Admin Panel" />
                  <NavLink to="/admin/users" icon={UserGroupIcon} label="Manage Users" />
                  <NavLink to="/teams" icon={UserGroupIcon} label="Manage Teams" />
                  <NavLink to="/forms" icon={DocumentTextIcon} label="Manage Forms" />
                  <NavLink to="/timer" icon={ClockIcon} label="Timer Control" />
                  <NavLink to="/notifications/manage" icon={MegaphoneIcon} label="Announcements" />
                  <NavLink to="/leaderboard" icon={TrophyIcon} label="Leaderboard" />
                  <NavLink to="/export" icon={ArrowDownTrayIcon} label="Export Data" />
                </>
              )}

              {isStudent && (
                <>
                  <div className="px-4 py-2 mt-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      My Space
                    </p>
                  </div>
                  <NavLink to="/my-team" icon={UserGroupIcon} label="My Team" />
                  <NavLink to="/my-forms" icon={ClipboardDocumentListIcon} label="My Forms" />
                  <NavLink to="/my-commits" icon={CodeBracketIcon} label="My Commits" />
                </>
              )}

              {isJudge && (
                <>
                  <div className="px-4 py-2 mt-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Judging
                    </p>
                  </div>
                  <NavLink to="/assignments" icon={ClipboardDocumentListIcon} label="Assignments" />
                  <NavLink to="/teams" icon={UserGroupIcon} label="View Teams" />
                  <NavLink to="/leaderboard" icon={TrophyIcon} label="Leaderboard" />
                </>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timer */}
            <div className="animate-slide-up">
              <TimerDisplay />
            </div>

            {/* Quick Stats - Admin */}
            {isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-slide-up">
                <StatCard icon={UserGroupIcon} label="Total Teams" value="--" color="primary" />
                <StatCard icon={UserCircleIcon} label="Participants" value="--" color="blue" />
                <StatCard icon={ClipboardDocumentListIcon} label="Submissions" value="--" color="green" />
                <StatCard icon={TrophyIcon} label="Evaluations" value="--" color="amber" />
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6 animate-slide-up">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {isAdmin && (
                  <>
                    <Link to="/teams" className="card-hover p-4 flex items-center gap-3 text-left">
                      <UserGroupIcon className="w-8 h-8 text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Manage Teams</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and edit teams</p>
                      </div>
                    </Link>
                    <Link to="/timer" className="card-hover p-4 flex items-center gap-3 text-left">
                      <ClockIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Timer Control</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start, pause, reset</p>
                      </div>
                    </Link>
                    <Link to="/leaderboard" className="card-hover p-4 flex items-center gap-3 text-left">
                      <TrophyIcon className="w-8 h-8 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Leaderboard</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View rankings</p>
                      </div>
                    </Link>
                  </>
                )}

                {isStudent && (
                  <>
                    <Link to="/my-team" className="card-hover p-4 flex items-center gap-3 text-left">
                      <UserGroupIcon className="w-8 h-8 text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">My Team</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View team details</p>
                      </div>
                    </Link>
                    <Link to="/my-forms" className="card-hover p-4 flex items-center gap-3 text-left">
                      <ClipboardDocumentListIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Forms</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fill required forms</p>
                      </div>
                    </Link>
                    <Link to="/my-commits" className="card-hover p-4 flex items-center gap-3 text-left">
                      <CodeBracketIcon className="w-8 h-8 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Commits</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Track GitHub activity</p>
                      </div>
                    </Link>
                  </>
                )}

                {isJudge && (
                  <>
                    <Link to="/assignments" className="card-hover p-4 flex items-center gap-3 text-left">
                      <ClipboardDocumentListIcon className="w-8 h-8 text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">My Assignments</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Teams to evaluate</p>
                      </div>
                    </Link>
                    <Link to="/teams" className="card-hover p-4 flex items-center gap-3 text-left">
                      <UserGroupIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">All Teams</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browse all teams</p>
                      </div>
                    </Link>
                    <Link to="/leaderboard" className="card-hover p-4 flex items-center gap-3 text-left">
                      <TrophyIcon className="w-8 h-8 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Leaderboard</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current standings</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Notifications</h3>
                <Link to="/notifications" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  View all
                </Link>
              </div>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No new notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
