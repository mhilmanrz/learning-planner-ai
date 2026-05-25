import { useEffect, useState } from 'react';
import { TrendingUp, Clock3, CheckCircle2, Target } from 'lucide-react';
import { api } from '../services/api';
import { getThisMonday } from '../utils/dateUtils';

// Palet gradien untuk progress bar per-goal (berulang jika >5 goals)
const BAR_GRADIENTS = [
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-green-400',
  'from-orange-500 to-yellow-400',
  'from-pink-500 to-rose-400',
  'from-sky-500 to-cyan-400',
];

// ── Skeleton loader ───────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className='bg-[#0f172a] border border-white/10 rounded-3xl p-6 animate-pulse'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-3 w-24 bg-slate-700 rounded' />
          <div className='h-8 w-16 bg-slate-700 rounded' />
        </div>
        <div className='w-12 h-12 bg-slate-700 rounded-2xl' />
      </div>
    </div>
  );
}

// ── Circular progress SVG ─────────────────────────────────────
function CircularProgress({ percent }) {
  const CIRCUMFERENCE = 327; // 2π × 52
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100;

  return (
    <div className='relative w-52 h-52'>
      <svg className='w-full h-full rotate-[-90deg]' viewBox='0 0 120 120'>
        <circle cx='60' cy='60' r='52' stroke='#1e293b' strokeWidth='10' fill='none' />
        <circle
          cx='60' cy='60' r='52'
          stroke='url(#progressGrad)'
          strokeWidth='10'
          fill='none'
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap='round'
          className='transition-all duration-1000'
        />
        <defs>
          <linearGradient id='progressGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#8b5cf6' />
            <stop offset='100%' stopColor='#6366f1' />
          </linearGradient>
        </defs>
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <h2 className='text-5xl font-bold'>{percent}%</h2>
        <p className='text-gray-400 mt-2'>Progress</p>
      </div>
    </div>
  );
}

// ── Progress Page ─────────────────────────────────────────────
export default function Progress() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const weekStart = getThisMonday();

    Promise.all([
      api.get(`/tasks?week_start=${weekStart}`),
      api.get('/goals'),
    ])
      .then(([tasksData, goalsData]) => {
        if (cancelled) return;
        setTasks(tasksData ?? []);
        setGoals(goalsData ?? []);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Derived stats ─────────────────────────────────────────
  const doneTasks  = tasks.filter((t) => t.status === 'done');
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.duration_estimate ?? 0), 0);
  const weeklyProgress = tasks.length
    ? Math.round((doneTasks.length / tasks.length) * 100)
    : 0;

  const statCards = [
    {
      title: 'Jam Belajar',
      value: loading ? '–' : `${(totalMinutes / 60).toFixed(1)} Jam`,
      icon: Clock3,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/20',
    },
    {
      title: 'Task Selesai',
      value: loading ? '–' : String(doneTasks.length),
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    },
    {
      title: 'Goals Aktif',
      value: loading ? '–' : String(goals.length),
      icon: Target,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
    },
  ];

  // Format tanggal minggu
  const weekStart = getThisMonday();
  const weekLabel = new Date(weekStart + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className='min-h-screen bg-[#020617] text-white p-6'>

      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Progress Belajar</h1>
        <p className='text-gray-400 mt-2'>
          Pantau perkembangan belajar Anda — minggu mulai {weekLabel}.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className='mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm'>
          Gagal memuat data: {error.message}
        </div>
      )}

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {loading
          ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          : statCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className='bg-[#0f172a] border border-white/10 rounded-3xl p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-400 text-sm'>{item.title}</p>
                      <h2 className='text-3xl font-bold mt-2'>{item.value}</h2>
                    </div>
                    <div className={`${item.bg} p-3 rounded-2xl`}>
                      <Icon className={item.color} />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Main area */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>

        {/* Circular Progress */}
        <div className='bg-[#0f172a] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center'>
          {loading ? (
            <div className='w-52 h-52 rounded-full bg-slate-800 animate-pulse' />
          ) : (
            <CircularProgress percent={weeklyProgress} />
          )}
          <p className='text-gray-400 mt-6 text-center text-sm'>
            Konsistensi kecil setiap hari menghasilkan progress besar.
          </p>
        </div>

        {/* Per-goal progress bars */}
        <div className='xl:col-span-2 bg-[#0f172a] border border-white/10 rounded-3xl p-8'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='bg-indigo-500/20 p-3 rounded-2xl'>
              <TrendingUp className='text-indigo-400' />
            </div>
            <div>
              <h2 className='text-2xl font-bold'>Statistik Minggu Ini</h2>
              <p className='text-gray-400 text-sm'>Progress per goal berdasarkan task yang selesai</p>
            </div>
          </div>

          {loading ? (
            <div className='space-y-6 animate-pulse'>
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className='flex justify-between mb-2'>
                    <div className='h-4 w-32 bg-slate-700 rounded' />
                    <div className='h-4 w-10 bg-slate-700 rounded' />
                  </div>
                  <div className='w-full h-3 bg-slate-800 rounded-full' />
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className='text-center py-12 text-slate-500'>
              <p className='text-lg font-medium mb-1'>Belum ada goals</p>
              <p className='text-sm'>Buat goal pertama kamu di halaman Goals.</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {goals.map((goal, idx) => {
                const pct = goal.task_total > 0
                  ? Math.round((goal.task_done_count / goal.task_total) * 100)
                  : 0;
                const gradient = BAR_GRADIENTS[idx % BAR_GRADIENTS.length];

                return (
                  <div key={goal.id}>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-gray-300 text-sm font-medium truncate pr-4'>
                        {goal.title}
                      </span>
                      <span className='font-semibold text-sm flex-shrink-0'>
                        {goal.task_done_count ?? 0}/{goal.task_total ?? 0} task
                        <span className='ml-2 text-slate-400'>({pct}%)</span>
                      </span>
                    </div>
                    <div className='w-full h-3 bg-[#111827] rounded-full overflow-hidden'>
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}