import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { skuData, displayCapacity } from '../data/mock'
import { buildOffShelfEntry, convertQuantityToUnits, calculatePeakWeekRatio, calculatePeakWeekMultiplier } from '../lib/scorecard'
import type { QuantityUnit } from '../types'

const locations = displayCapacity.map(d => d.location)
const units: { value: QuantityUnit; label: string }[] = [
  { value: 'eaches', label: 'Eaches' },
  { value: 'cases', label: 'Cases' },
  { value: 'pallets', label: 'Pallets' },
  { value: 'estimated', label: 'Estimated' },
]

const multiplierColors: Record<number, string> = {
  3: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-700',
  1: 'bg-yellow-100 text-yellow-700',
  0: 'bg-red-100 text-red-700',
}

export function IncrementalOffShelfScreen() {
  const navigate = useNavigate()
  const { offShelfItems, addOffShelfItem, removeOffShelfItem, incrementalOffShelfPoints, incrementalRawLgorPercent } = useApp()

  const [selectedSkuId, setSelectedSkuId] = useState(skuData[0].id)
  const [selectedLocation, setSelectedLocation] = useState(locations[0])
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState<QuantityUnit>('cases')
  const [entryNotes, setEntryNotes] = useState('')

  const selectedSku = skuData.find(s => s.id === selectedSkuId)!
  const calculatedUnits = convertQuantityToUnits(quantity, unit, selectedSkuId)
  const ratio = calculatePeakWeekRatio(calculatedUnits, selectedSku.peakWeekUnits)
  const multiplier = calculatePeakWeekMultiplier(ratio)
  const previewPoints = Math.round(selectedSku.lgorPercent * multiplier * 10) / 10

  function handleAdd() {
    const entry = buildOffShelfEntry({
      skuId: selectedSkuId,
      location: selectedLocation,
      quantity,
      unit,
      notes: entryNotes,
    })
    addOffShelfItem(entry)
    setEntryNotes('')
    setQuantity(1)
  }

  const activeItems = offShelfItems.filter(e => e.status === 'active')

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
          <button onClick={() => navigate('/scorecard/base-plan-lgor')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Incremental Off-Shelf</h1>
          <p className="text-xs text-blue-200 mt-1">LGOR % × Peak Week Multiplier</p>
          <div className="flex justify-between mt-3">
            <span className="text-xs text-blue-200">{activeItems.length} SKU{activeItems.length !== 1 ? 's' : ''} captured</span>
            <div className="text-right">
              <span className="text-sm font-bold">{incrementalOffShelfPoints.toFixed(1)} pts</span>
              <span className="text-xs text-blue-200 ml-1">· LGOR {incrementalRawLgorPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Add form */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Add Off-Shelf Display</p>

            <div>
              <label className="text-xs text-gray-500 block mb-1">SKU</label>
              <select
                value={selectedSkuId}
                onChange={e => setSelectedSkuId(e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs"
              >
                {skuData.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} · LGOR {s.lgorPercent}% · Rank #{s.rank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Display Location</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs"
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-gray-200 rounded p-2 text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as QuantityUnit)}
                  className="w-full border border-gray-200 rounded p-2 text-xs"
                >
                  {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* Live conversion preview */}
            <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Calculated units</span>
                <span className="font-semibold">{calculatedUnits} ea</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Peak week units</span>
                <span className="font-semibold">{selectedSku.peakWeekUnits} ea</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Peak week ratio</span>
                <span className="font-semibold">{ratio.toFixed(2)}×</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Multiplier</span>
                <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${multiplierColors[multiplier]}`}>{multiplier}×</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                <span className="text-gray-700 font-semibold">Points preview</span>
                <span className="font-bold text-blue-700">{previewPoints} pts</span>
              </div>
              <p className="text-amber-600 italic text-xs">Demo values — pending business confirmation</p>
            </div>

            <textarea
              value={entryNotes}
              onChange={e => setEntryNotes(e.target.value)}
              placeholder="Notes (optional)…"
              className="w-full border border-gray-200 rounded p-2 text-xs resize-none h-14"
            />

            <button
              onClick={handleAdd}
              className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              Add to Capture
            </button>
          </div>

          {/* Captured items */}
          {activeItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Captured Items</p>
              <div className="space-y-2">
                {activeItems.map(entry => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{entry.productName}</p>
                        <p className="text-xs text-gray-500">{entry.location} · {entry.quantity} {entry.unit}</p>
                        <p className="text-xs text-gray-500">{entry.calculatedUnits} ea · Ratio {entry.peakWeekRatio.toFixed(2)}×</p>
                      </div>
                      <div className="text-right ml-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${multiplierColors[entry.peakWeekMultiplier]}`}>
                          {entry.peakWeekMultiplier}×
                        </span>
                        <p className="text-sm font-bold text-blue-700 mt-1">{entry.itemPoints.toFixed(1)} pts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeOffShelfItem(entry.id)}
                      className="text-xs text-red-500 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/scorecard/opportunity')}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            Next: Opportunity SKUs →
          </button>
        </div>
      </div>
    </div>
  )
}
