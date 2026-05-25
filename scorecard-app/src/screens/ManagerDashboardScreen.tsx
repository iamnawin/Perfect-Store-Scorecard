import { useNavigate } from 'react-router-dom'
import { leaderboardSeed, flaggedStoresSeed, regionBenchmark } from '../data/mock'

export function ManagerDashboardScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-blue-600 text-sm font-medium">← Visit</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-xs text-gray-400">{regionBenchmark.name} · Q1 2026</p>
          </div>
        </div>

        {/* Region Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Avg PSS Score</p>
            <p className="text-2xl font-bold text-gray-900">{regionBenchmark.averageScore.toFixed(1)}</p>
            <p className="text-xs text-gray-400 italic">Demo value</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Avg LGOR Rep %</p>
            <p className="text-2xl font-bold text-green-600">{regionBenchmark.averageLgorRepPercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 italic">Demo value</p>
          </div>
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Open Revisits</p>
            <p className="text-2xl font-bold text-orange-600">{regionBenchmark.openRevisitCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Peak Week Risk</p>
            <p className="text-2xl font-bold text-red-500">{regionBenchmark.peakWeekRiskStores}</p>
            <p className="text-xs text-gray-400">stores</p>
          </div>
        </div>

        {/* Score Formula reminder */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
          <p className="font-semibold">Leaderboard shows both Final PSS Score and LGOR Rep %</p>
          <p className="mt-1">● Final PSS Score = internal competitive metric (can exceed 100)</p>
          <p className="mt-0.5">● LGOR Rep % = business coverage percentage off-shelf</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">Leaderboard</p>
            <p className="text-xs text-gray-400">Store / Rep / District</p>
          </div>
          <div className="divide-y divide-gray-50">
            {leaderboardSeed.map(entry => (
              <div key={entry.rank} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                  entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.store}</p>
                  <p className="text-xs text-gray-400">{entry.rep}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{entry.score.toFixed(1)}</p>
                  <p className="text-xs text-green-600 font-semibold">{entry.lgorRepPercent.toFixed(1)}%</p>
                  <p className={`text-xs font-semibold ${
                    entry.delta > 0 ? 'text-green-500' : entry.delta < 0 ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {entry.delta > 0 ? '+' : ''}{entry.delta}
                  </p>
                </div>
                {entry.openRevisitCount > 0 && (
                  <div className="bg-orange-100 text-orange-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {entry.openRevisitCount}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-50">
            <p className="text-xs text-gray-400 italic text-center">Demo values — pending business confirmation</p>
          </div>
        </div>

        {/* Flagged Stores */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">Flagged Stores</p>
            <p className="text-xs text-gray-400">Stores with open revisit items or execution gaps</p>
          </div>
          <div className="divide-y divide-gray-50">
            {flaggedStoresSeed.map(store => (
              <div key={store.storeId} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{store.storeName}</p>
                    <p className="text-xs text-gray-400">{store.owner}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{store.score.toFixed(1)}</p>
                    <p className="text-xs text-green-600 font-semibold">{store.lgorRepPercent.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 bg-red-50 rounded-lg p-2">{store.issue}</p>
                {store.currentQuantity !== undefined && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="text-xs">
                      <p className="text-gray-400">Current</p>
                      <p className="font-semibold text-gray-700">{store.currentQuantity}u</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400">Peak Wk</p>
                      <p className="font-semibold text-gray-700">{store.peakWeekUnits}u</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400">Gap</p>
                      <p className="font-bold text-red-600">{store.gap}u</p>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    store.revisitStatus === 'Open' ? 'bg-red-100 text-red-700' :
                    store.revisitStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{store.revisitStatus}</span>
                  <p className="text-xs text-gray-400 italic">Demo values — pending business confirmation</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
