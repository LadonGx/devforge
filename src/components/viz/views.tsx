import type { V } from '../../engine/types'
import { formatV } from '../../engine/serialize'

export interface Pointer {
  name: string
  idx: number
}

const key = (v: V | undefined) => (v ? JSON.stringify(v, (k, x) => (k === 'id' ? undefined : x)) : '')

export function sameV(a: V | undefined, b: V | undefined) {
  return key(a) === key(b)
}

/** Texto curto para caber em uma célula. */
export function cellText(v: V, rawStrings = false): string {
  if (v.t === 's') return rawStrings ? v.v : JSON.stringify(v.v)
  const s = formatV(v)
  return s.length > 28 ? s.slice(0, 26) + '…' : s
}

const POINTER_COLORS = ['#6ea8fe', '#f78c6c', '#c792ea', '#3fb950', '#e3a008', '#ff6b9a', '#4dd0e1']

export function pointerColor(name: string, all: string[]) {
  const i = all.indexOf(name)
  return POINTER_COLORS[(i < 0 ? 0 : i) % POINTER_COLORS.length]
}

interface ArrayViewProps {
  name: string
  items: V[]
  len: number
  prev?: V[]
  pointers?: Pointer[]
  pointerNames?: string[]
  window?: [number, number] | null
  rawStrings?: boolean
  highlight?: Set<number>
  bad?: Set<number>
  compact?: boolean
}

export function ArrayView({ name, items, len, prev, pointers = [], pointerNames = [], window, rawStrings, highlight, bad, compact }: ArrayViewProps) {
  const byIdx = new Map<number, Pointer[]>()
  for (const p of pointers) {
    if (p.idx < 0 || p.idx > len) continue
    const arr = byIdx.get(p.idx) || []
    arr.push(p)
    byIdx.set(p.idx, arr)
  }
  const showEnd = pointers.some((p) => p.idx === len) && len === items.length
  const cells = showEnd ? [...items, null] : items
  const maxStack = Math.max(0, ...[...byIdx.values()].map((a) => a.length))
  return (
    <div className={'arr' + (compact ? ' arr-compact' : '')}>
      {name && <div className="viz-label">{name}</div>}
      {len === 0 ? (
        <div className="arr-empty">[ ] vazio</div>
      ) : (
        <div className="arr-scroll">
          <div className="arr-row">
            {cells.map((v, i) => {
              const inWin = window && i >= window[0] && i <= window[1]
              const changed = v && prev && (i >= prev.length || !sameV(prev[i], v))
              const cls = ['arr-cell']
              if (!v) cls.push('arr-cell-end')
              if (inWin) cls.push('in-window')
              else if (window && v) cls.push('out-window')
              if (changed) cls.push('changed')
              if (highlight?.has(i)) cls.push('hl')
              if (bad?.has(i)) cls.push('bad')
              const ps = byIdx.get(i) || []
              return (
                <div key={i} className="arr-col">
                  <div className="arr-idx">{v ? i : ''}</div>
                  <div className={cls.join(' ')} style={ps.length ? { borderColor: pointerColor(ps[0].name, pointerNames) } : undefined}>
                    {v ? cellText(v, rawStrings) : '∅'}
                  </div>
                  <div className="arr-ptrs" style={{ minHeight: maxStack ? maxStack * 18 : 0 }}>
                    {ps.map((p) => (
                      <div key={p.name} className="ptr" style={{ color: pointerColor(p.name, pointerNames) }}>
                        <span className="ptr-arrow">▲</span>
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {len > items.length && <div className="arr-more">+{len - items.length}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export function MatrixView({ name, rows, prev, cell }: { name: string; rows: V[]; prev?: V[]; cell?: [number, number] | null }) {
  return (
    <div className="arr">
      <div className="viz-label">{name}</div>
      <div className="matrix">
        {rows.map((r, i) => {
          const items = r.t === 'arr' ? r.items : []
          const prevRow = prev?.[i]
          const prevItems = prevRow && prevRow.t === 'arr' ? prevRow.items : undefined
          return (
            <div key={i} className="matrix-row">
              <div className="arr-idx matrix-ri">{i}</div>
              {items.map((v, j) => {
                const cls = ['arr-cell']
                if (prevItems && !sameV(prevItems[j], v)) cls.push('changed')
                if (cell && cell[0] === i && cell[1] === j) cls.push('hl')
                else if (cell && (cell[0] === i || cell[1] === j)) cls.push('in-window')
                return (
                  <div key={j} className={cls.join(' ')}>
                    {cellText(v)}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MapView({ name, entries, prev, kind = 'Map', size }: { name: string; entries: [V | string, V][]; prev?: [V | string, V][]; kind?: string; size?: number }) {
  const kStr = (k: V | string) => (typeof k === 'string' ? k : cellText(k))
  const prevMap = new Map((prev || []).map(([k, v]) => [kStr(k), v]))
  return (
    <div className="mapv">
      <div className="viz-label">
        {name} <span className="muted">{kind}{size !== undefined ? `(${size})` : ''}</span>
      </div>
      {entries.length === 0 ? (
        <div className="arr-empty">{'{ } vazio'}</div>
      ) : (
        <table className="map-table">
          <thead>
            <tr>
              <th>chave</th>
              <th>valor</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v]) => {
              const ks = kStr(k)
              const isNew = prev && !prevMap.has(ks)
              const changed = prev && !isNew && !sameV(prevMap.get(ks), v)
              return (
                <tr key={ks} className={isNew ? 'new' : changed ? 'changed' : ''}>
                  <td>{ks}</td>
                  <td>{cellText(v)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function SetView({ name, items, prev, size }: { name: string; items: V[]; prev?: V[]; size: number }) {
  const prevKeys = new Set((prev || []).map((v) => key(v)))
  return (
    <div className="setv">
      <div className="viz-label">
        {name} <span className="muted">Set({size})</span>
      </div>
      <div className="set-items">
        {items.length === 0 && <div className="arr-empty">{'{ } vazio'}</div>}
        {items.map((v, i) => (
          <span key={i} className={'set-item' + (prev && !prevKeys.has(key(v)) ? ' new' : '')}>
            {cellText(v)}
          </span>
        ))}
      </div>
    </div>
  )
}

export function StackView({ name, items, prev, len }: { name: string; items: V[]; prev?: V[]; len: number }) {
  return (
    <div className="stackv">
      <div className="viz-label">
        {name} <span className="muted">pilha ({len})</span>
      </div>
      <div className="stack-col">
        {items.length === 0 && <div className="arr-empty">vazia</div>}
        {[...items].reverse().map((v, ri) => {
          const i = items.length - 1 - ri
          const changed = prev && (i >= prev.length || !sameV(prev[i], v))
          return (
            <div key={i} className={'stack-item' + (changed ? ' changed' : '')}>
              {ri === 0 && <span className="stack-top">topo →</span>}
              {cellText(v)}
            </div>
          )
        })}
        <div className="stack-base" />
      </div>
    </div>
  )
}

/** Visual compacto de um valor qualquer (usado em entradas/saídas de testes). */
export function ValueView({ v, name, bad }: { v: V; name?: string; bad?: Set<number> }) {
  if (v.t === 'arr') {
    if (v.items.length > 0 && v.items.every((x) => x.t === 'arr')) {
      return <MatrixView name={name || ''} rows={v.items} />
    }
    return <ArrayView name={name || ''} items={v.items} len={v.len} bad={bad} compact />
  }
  if (v.t === 's' && v.v.length <= 40 && v.v.length > 0) {
    return <ArrayView name={name || ''} items={[...v.v].map((c) => ({ t: 's', v: c }) as V)} len={v.v.length} rawStrings compact />
  }
  if (v.t === 'map') return <MapView name={name || ''} entries={v.entries} size={v.size} />
  if (v.t === 'set') return <SetView name={name || ''} items={v.items} size={v.size} />
  return (
    <div className="scalar-inline">
      {name && <span className="viz-label">{name}</span>}
      <code>{formatV(v)}</code>
    </div>
  )
}
