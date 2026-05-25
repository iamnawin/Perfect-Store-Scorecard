import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { skuData, displayLocations } from '../data/mock'
import type { QuantityUnit } from '../types'

const UNIT_OPTIONS: { value: QuantityUnit; label: string }[] = [
  { value: 'eaches', label: 'Eaches (ea)' },
  { value: 'cases', label: 'Cases' },
  { value: 'pallets', label: 'Pallets' },
  { value: 'estimated', label: 'Estimated Units' },
]

export function IncrementalOffShelfScreen() {
  const navigate = useNavigate()
  const { offShelfItems, addOffShelfItem, removeOffShelfItem, incrementalOffShelfPoints, incrementalRawLgorPercent } = useApp()

  const [skuId, setSkuId] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<QuantityUnit>('eaches')
  const [itemNotes, setItemNotes] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const activeItems = offShelfItems.filter(e => e.status !== 'removed')
  const selectedSku = skuData.find(s => s.id === skuId)

  function handleAdd() {
    if (!skuId) return setError('Select a SKU')
    if (!location) return setError('Select a display location')
    const qty = Number(quantity)
    if (!quantity || isNaN(qty) || qty <= 0) return setError('Enter a valid quantity')
    setError('')
    addOffShelfItem(skuId, location, qty, unit, itemNotes)
    setSkuId('')
    setLocation('')
    setQuantity('')
    setUnit('eaches')
    setItemNotes('')
    setShowForm(false)
  }

  function getMultiplierBadge(multiplier: number) {
    if (multiplier >= 3) return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">3x peak week</span>
    if (multiplier >= 2) return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">2x peak week</span>
    if (multiplier >= 1) return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">1x peak week</span>
    return <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">&lt;1x peak week — 0 pts</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard/base-plan-lgor')} className="text-blue-600 text-sm font-medium">← LGOR Review</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Off-Shelf Capture</h1>
            <p className="text-xs text-gray-400">{activeItems.length} SKU{activeItems.length !== 1 ? 's' : ''} captured</p>
          </div>
        </div>

        {/* Score summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Incremental Off-Shelf Points</p>
            <p className="text-xl font-bold text-blue-700">{incrementalOffShelfPoints.toFixed(1)}</p>
            <p className="text-xs text-gray-400 italic">Demo value</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Incremental Raw LGOR %</p>
            <p className="text-xl font-bold text-green-600">{incrementalRawLgorPercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 italic">Demo value</p>
          </div>
        </div>

        {/* Scoring note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
          <p className="font-semibold">Incremental Item Points = SKU LGOR % × Peak Week Multiplier</p>
          <p className="mt-1">Multiplier: ≥3x placed = 3×, ≥2x = 2×, ≥1x = 1×, &lt;1x = 0</p>
          <p className="mt-1 text-blue-500 italic">All values are demo — pending business confirmation</p>
        </div>

        {/* Captured items */}
        {activeItems.length > 0 && (
          <div className="space-y-3 mb-4">
            {activeItems.map(entry => (
              <div key={entry.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{entry.product}</p>
                    <p className="text-xs text-gray-400">{entry.displayLocation} · {entry.quantity} {entry.quantityUnit} → {entry.calculatedUnits} units</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {getMultiplierBadge(entry.peakWeekMultiplier)}
                      <span className="text-xs text-gray-400">{entry.lgorPercent}% LGOR × {entry.peakWeekMultiplier}x = <span className="font-semibold text-gray-700">{entry.points.toFixed(1)} pts</span></span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Peak week: {entry.peakWeekUnits} units · Ratio: {entry.peakWeekRatio.toFixed(2)}x</p>
                    <p className="text-xs text-gray-400 italic">Demo values — pending business confirmation</p>
                  </div>
                  <button
                    onClick={() => removeOffShelfItem(entry.id)}
                    className="text-red-400 text-xs hover:text-red-600 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p className="font-semibold text-gray-900 mb-4">Add Off-Shelf SKU</p>

            <div className="space-y-3">
              {/* SKU */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">SKU / Product</label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                  value={skuId}
                  onChange={e => setSkuId(e.target.value)}
                >
                  <option value="">Select SKU…</option>
                  {skuData.map(sku => (
                    <option key={sku.id} value={sku.id}>
                      {sku.productName} ({sku.lgorPercent}% LGOR) — demo
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU preview */}
              {selectedSku && (
                <div className="bg-blue-50 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-blue-800">{selectedSku.productName}</p>
                  <p className="text-blue-600">LGOR: {selectedSku.lgorPercent}% · Peak Week: {selectedSku.peakWeekUnits} units</p>
                  <p className="text-blue-500">Case: {selectedSku.unitsPerCase} units · Pallet: {selectedSku.unitsPerPallet} units</p>
                  <p className="text-blue-400 italic">Demo values — pending business confirmation</p>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Display Location</label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                >
                  <option value="">Select location…</option>
                  {displayLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Location is for reporting only — does not change score unless business confirms</p>
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                    placeholder="e.g. 2"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Unit</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                    value={unit}
                    onChange={e => setUnit(e.target.value as QuantityUnit)}
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion note */}
              {selectedSku && quantity && Number(quantity) > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                  {unit === 'cases' && <p>= {Number(quantity) * selectedSku.unitsPerCase} calculated units ({selectedSku.unitsPerCase} units/case — demo)</p>}
                  {unit === 'pallets' && <p>= {Number(quantity) * selectedSku.unitsPerPallet} calculated units ({selectedSku.unitsPerPallet} units/pallet — demo)</p>}
                  {(unit === 'eaches' || unit === 'estimated') && <p>= {Number(quantity)} calculated units</p>}
                  <p className="text-gray-400 italic mt-1">Conversion data are demo values — pending business confirmation</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Notes (optional)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:border-blue-400"
                  rows={2}
                  placeholder="Add any notes…"
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(false); setError('') }}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm"
                >
                  Add SKU
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-white border-2 border-dashed border-blue-200 text-blue-600 rounded-xl py-4 font-semibold text-sm mb-4 hover:border-blue-400 transition-colors"
          >
            + Add Off-Shelf SKU
          </button>
        )}

        {/* Manual entry fallback note */}
        <p className="text-xs text-gray-400 text-center">Can’t find a SKU? Use manual entry or UPC scan (simulated in web pilot)</p>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/scorecard/opportunity')}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm"
          >
            Next: Opportunity Layer →
          </button>
        </div>
      </div>
    </div>
  )
}
