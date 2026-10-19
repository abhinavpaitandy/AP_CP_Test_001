import { ArrowRightLeft, Check, PackageCheck, RotateCcw, TriangleAlert } from 'lucide-react'
import type { Replenishment } from '../domain/metrics'
import { formatCover } from '../domain/metrics'

export function StockRow({
  item,
  moved,
  countMissing,
  onToggleMoved,
  compact = false,
}: {
  item: Replenishment
  moved: boolean
  countMissing: boolean
  onToggleMoved?: () => void
  compact?: boolean
}) {
  const { article, coverHours, moveUnits, shortfall, state } = item
  const urgent = coverHours < 1

  let instruction: string
  if (countMissing) instruction = 'Stock count missing. Count the floor manually.'
  else if (moved) instruction = `${moveUnits} units moved to the floor`
  else if (state === 'transfer') instruction = 'Stockroom empty. Request a transfer.'
  else if (state === 'move') instruction = `Move ${moveUnits} from stockroom${shortfall > 0 ? `, ${shortfall} still short` : ''}`
  else instruction = 'Well stocked'

  return (
    <li className={`stock-row${moved ? ' is-moved' : ''}`}>
      <div className="stock-main">
        <p className="stock-name">{article.name}</p>
        <p className="stock-sub">
          {article.department} · {article.sizes}
          {!compact && !countMissing && (
            <>
              {' '}· {article.stockFloor} on floor · {article.stockRoom} in stockroom
            </>
          )}
        </p>
        <p className={`stock-instruction${state === 'transfer' || countMissing ? ' is-warning' : ''}`}>
          {countMissing || state === 'transfer' ? (
            <TriangleAlert size={14} aria-hidden />
          ) : moved ? (
            <Check size={14} aria-hidden />
          ) : state === 'move' ? (
            <PackageCheck size={14} aria-hidden />
          ) : null}
          {instruction}
        </p>
      </div>
      <div className="stock-side">
        <p className={`cover${urgent && !moved && !countMissing ? ' is-urgent' : ''}`}>
          <strong>{countMissing ? '—' : formatCover(coverHours)}</strong>
          <span>floor cover</span>
        </p>
        {onToggleMoved && state === 'move' && !countMissing && (
          <button
            type="button"
            className={`button button-sm ${moved ? 'button-ghost' : 'button-secondary'}`}
            onClick={onToggleMoved}
            aria-label={moved ? `Undo moved for ${article.name}` : `Mark ${article.name} as moved`}
          >
            {moved ? <RotateCcw size={14} aria-hidden /> : <Check size={14} aria-hidden />}
            {moved ? 'Undo' : 'Moved'}
          </button>
        )}
        {onToggleMoved && state === 'transfer' && !countMissing && (
          <span className="tag">
            <ArrowRightLeft size={13} aria-hidden />
            Transfer
          </span>
        )}
      </div>
    </li>
  )
}
