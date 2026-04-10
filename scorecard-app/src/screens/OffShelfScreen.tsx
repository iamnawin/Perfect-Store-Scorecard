import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, MapPin, Tag, Package, Hash } from 'lucide-react'
import clsx from 'clsx'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/AppContext'
import { locations, categories, productsByCategory, quantities, trellisBotInsights } from '../data/mock'

export function OffShelfScreen() {
  const navigate = useNavigate()
  const { offShelf, addOffShelfEntry, removeOffShelfEntry, trellisEnabled } = useApp()

  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState<number | string>('')

  const products = category ? (productsByCategory[category] ?? []) : []
  const canAdd = location && category && product && quantity !== ''

  function handleAdd() {
    if (!canAdd) return
    addOffShelfEntry({
      id: crypto.randomUUID(),
      location, category, product,
      quantity: quantity as number | string,
    })
    setLocation('')
    setCategory('')
    setProduct('')
    setQuantity('')
  }

  return (
    <PhoneShell>
      <TopBar title="Off-Shelf Capture" subtitle="Incremental placements" showBack showTrellisToggle />

      <div className="flex-1 overflow-y-auto bg-surface-low">
        {trellisEnabled && (
          <div className="pt-3">
            <TrellisBot insight={trellisBotInsights.offShelf} />
          </div>
        )}

        {/* Entry form */}
        <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 space-y-4">
          {/* Location */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin size={13} className="text-primary" />
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Location</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={clsx(
                    'px-3 py-2 rounded-full text-[13px] font-medium transition-colors',
                    location === loc
                      ? 'bg-primary text-white'
                      : 'bg-surface-low text-on-surface-variant border border-outline/60'
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={13} className="text-primary" />
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Category</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setProduct('') }}
                  className={clsx(
                    'px-3 py-2 rounded-full text-[13px] font-medium transition-colors',
                    category === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-low text-on-surface-variant border border-outline/60'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          {products.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Package size={13} className="text-primary" />
                <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Product</p>
              </div>
              <div className="space-y-1.5">
                {products.map(p => (
                  <button
                    key={p}
                    onClick={() => setProduct(p)}
                    className={clsx(
                      'w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors border',
                      product === p
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-surface-low text-on-surface border-outline/40'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {product && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Hash size={13} className="text-primary" />
                <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Est. Quantity (units)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {quantities.map(q => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={clsx(
                      'px-4 py-2 rounded-full text-[13px] font-semibold transition-colors',
                      quantity === q
                        ? 'bg-primary text-white'
                        : 'bg-surface-low text-on-surface-variant border border-outline/60'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={clsx(
              'w-full py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-opacity',
              canAdd ? 'opacity-100' : 'opacity-40'
            )}
            style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)', color: 'white' }}
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>

        {/* Added entries */}
        {offShelf.length > 0 && (
          <div className="mx-4 mt-3 mb-4 space-y-2">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-1">Added Entries ({offShelf.length})</p>
            {offShelf.map(entry => (
              <div key={entry.id} className="bg-surface-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-on-surface truncate">{entry.product}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{entry.location} · {entry.quantity} units</p>
                </div>
                <button onClick={() => removeOffShelfEntry(entry.id)} className="text-on-surface-variant shrink-0 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>

      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-outline/40 px-4 py-4 pb-8">
        <button
          onClick={() => navigate('/photo')}
          className="w-full py-4 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)' }}
        >
          Next — Photo & Notes
        </button>
      </div>
    </PhoneShell>
  )
}
