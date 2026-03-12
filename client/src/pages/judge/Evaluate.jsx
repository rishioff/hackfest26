import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as teamService from '../../services/team.service';
import * as evaluationService from '../../services/evaluation.service';
import { EVALUATION_CRITERIA } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TrophyIcon,
  StarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

function ScoreInput({ criterion, value, onChange }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{criterion.label}</h4>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{criterion.description}</p>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 ml-3 flex-shrink-0">
          {value}/{criterion.maxScore}
        </span>
      </div>

      {/* Star rating — hidden on very small screens, shown on sm+ */}
      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: criterion.maxScore }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            {i < value ? (
              <StarIconSolid className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            ) : (
              <StarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 dark:text-gray-600" />
            )}
          </button>
        ))}
      </div>

      {/* Slider — always visible on mobile, fallback on desktop */}
      <input
        type="range"
        min={0}
        max={criterion.maxScore}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full mt-3 accent-primary-600"
      />
    </div>
  );
}

export default function Evaluate() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [scores, setScores] = useState(() =>
    EVALUATION_CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 0 }), {})
  );

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { comments: '' },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamData, evalData] = await Promise.allSettled([
          teamService.getTeamById(teamId),
          evaluationService.getByTeam(teamId),
        ]);

        if (teamData.status === 'fulfilled') {
          setTeam(teamData.value.data?.team || teamData.value.team || teamData.value.data || teamData.value);
        }

        if (evalData.status === 'fulfilled') {
          const rawE = evalData.value.data?.data || evalData.value.data?.evaluations || evalData.value.data || []; const evals = Array.isArray(rawE) ? rawE : [];
          // Find the current judge's evaluation if it exists
          if (evals.length > 0) {
            const existing = evals[0]; // Assume first is current judge's
            setExistingEvaluation(existing);
            if (existing.scores) {
              setScores((prev) => ({ ...prev, ...existing.scores }));
            }
            if (existing.comments) {
              setValue('comments', existing.comments);
            }
          }
        }
      } catch {
        toast.error('Failed to load team details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teamId, setValue]);

  function updateScore(criterionId, value) {
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  }

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxTotal = EVALUATION_CRITERIA.reduce((sum, c) => sum + c.maxScore, 0);

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      const payload = {
        teamId,
        scores,
        comments: data.comments,
      };

      if (existingEvaluation) {
        await evaluationService.updateEvaluation(existingEvaluation._id, payload);
        toast.success('Evaluation updated!');
      } else {
        await evaluationService.submitEvaluation(payload);
        toast.success('Evaluation submitted!');
      }
      navigate('/assignments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/assignments" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {existingEvaluation ? 'Update Evaluation' : 'Evaluate Team'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{team?.teamName || team?.name || 'Team'}</p>
          </div>
        </div>

        {/* Team Summary */}
        {team && (
          <div className="card p-4 sm:p-6 mb-6 animate-fade-in">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{team.teamName || team.name}</h2>
            {team.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{team.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span>{team.members?.length || 0} members</span>
              {team.repoUrl && (
                <a href={team.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                  View Repository
                </a>
              )}
            </div>
          </div>
        )}

        {/* Score Overview */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 border-primary-200 dark:border-primary-800 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-primary-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Total Score</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalScore}</span>
              <span className="text-lg text-gray-400 dark:text-gray-500">/{maxTotal}</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(totalScore / maxTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-6">
            {EVALUATION_CRITERIA.map((criterion) => (
              <ScoreInput
                key={criterion.id}
                criterion={criterion}
                value={scores[criterion.id]}
                onChange={(val) => updateScore(criterion.id, val)}
              />
            ))}
          </div>

          {/* Comments */}
          <div className="card p-6 mb-6">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Comments & Feedback
            </label>
            <textarea
              rows={5}
              className="input-field resize-none"
              placeholder="Provide detailed feedback for this team..."
              {...register('comments')}
            />
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary py-3 text-base sm:text-lg gap-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {existingEvaluation ? 'Updating...' : 'Submitting...'}
                </span>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  {existingEvaluation ? 'Update Evaluation' : 'Submit Evaluation'}
                </>
              )}
            </button>
            <Link to="/assignments" className="btn-secondary py-3 px-6 text-base sm:text-lg text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
