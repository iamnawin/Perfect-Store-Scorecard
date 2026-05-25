import { useNavigate } from 'react-router-dom'
import { leaderboardSeed, flaggedStoresSeed, regionBenchmark } from '../data/mock'

export function ManagerDashboardScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
          <button onClick={() => navigate('/')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Manager Dashboard</h1>
          <p className="text-xs text-blue-200 mt-1">Columbus North · Q1 2026</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Region summary cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{regionBenchmark.averageScore}</p>
              <p className="text-xs text-gray-500 mt-1">Avg PSS Score</p>
              <p className="text-xs text-amber-600 italic">Demo value</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{regionBenchmark.averageLgorRepPercent}%</p>
              <p className="text-xs text-gray-500 mt-1">Avg LGOR Rep %</p>
              <p className="text-xs text-amber-600 italic">Demo value</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-500">{regionBenchmark.openRevisitCount}</p>
              <p className="text-xs text-gray-500 mt-1">Open Revisits</p>
              <p className="text-xs text-amber-600 italic">Demo value</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{regionBenchmark.peakWeekRiskStoreCount}</p>
              <p className="text-xs text-gray-500 mt-1">Peak Week Risk</p>
              <p className="text-xs text-amber-600 italic">Demo value</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Leaderboard</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-1 bg-gray-50 px-3 py-2 text-xs text-gray-400 font-semibold">
                <span>#</span>
                <span className="col-span-2">Store / Rep</span>
                <span className="text-right">Score</span>
                <span className="text-right">LGOR%</span>
              </div>
              {leaderboardSeed.map(entry => (
                <div
                  key={entry.store}
                  className="grid grid-cols-5 gap-1 px-3 py-2.5 border-t border-gray-100 text-xs items-center"
                >
                  <span className="font-bold text-gray-700">{entry.rank}</span>
                  <div className="col-span-2 min-w-0">
                    <p className="text-gray-800 font-semibold truncate">{entry.store}</p>
                    <p className="text-gray-400">{entry.rep}</p>
                    {entry.openRevisitCount > 0 && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-1 py-0.5 rounded">
                        {entry.openRevisitCount} revisit{entry.openRevisitCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.score}</p>
                    <p className={`text-xs ${entry.delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {entry.delta >= 0 ? '+' : ''}{entry.delta}
                    </p>
                  </div>
                  <p className="text-right font-bold text-blue-700">{entry.lgorRepPercent}%</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-600 italic mt-1">Demo values — pending business confirmation</p>
          </div>

          {/* Flagged stores */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Flagged Stores</p>
            <div className="space-y-2">
              {flaggedStoresSeed.map(flagged => (
                <div key={flagged.store} className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{flagged.store}</p>
                      <p className="text-xs text-gray-500">{flagged.rep}</p>
                      <p className="text-xs text-red-700 mt-1">{flagged.issue}</p>
                      <p className="text-xs text-gray-600 mt-1">SKU: {flagged.sku}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                      flagged.revisitStatus === 'Open' ? 'bg-red-100 text-red-700' :
                      flagged.revisitStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {flagged.revisitStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-400">Peak Week</p>
                      <p className="font-bold">{flagged.peakWeekUnits} ea</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Current</p>
                      <p className="font-bold">{flagged.currentQuantity} ea</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Gap</p>
                      <p className="font-bold text-red-600">{flagged.gap} ea</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Owner: {flagged.owner}</p>
                  <p className="text-xs text-amber-600 italic mt-0.5">Demo values — pending business confirmation</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center pb-4">
            Both PSS Score and LGOR Rep % shown per spec requirement
          </div>
        </div>
      </div>
    </div>
  )
}
