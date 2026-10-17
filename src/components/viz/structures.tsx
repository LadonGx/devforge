import { useLayoutEffect, useRef } from 'react'
import type { CallNode, TNode, V } from '../../engine/types'
import { cellText, pointerColor } from './views'

/* ---------------- Lista ligada ---------------- */

export function ListView({
  nodes,
  cycleTo,
  more,
  labels,
  allNames,
  changed,
  badIdx,
}: {
  badIdx?: Set<number>
  nodes: { id: number; val: V }[]
  cycleTo?: number
  more?: boolean
  labels: Map<number, string[]>
  allNames: string[]
  changed?: Set<number>
}) {
  const maxLabels = Math.max(0, ...nodes.map((n) => labels.get(n.id)?.length ?? 0))
  return (
    <div className="ll">
      <div className="ll-row">
        {nodes.map((n, i) => {
          const ls = labels.get(n.id) ?? []
          return (
            <div key={n.id} className="ll-item">
              <div className="ll-col">
                <div className={'ll-node' + (ls.length ? ' has-ptr' : '') + (changed?.has(n.id) ? ' changed' : '') + (badIdx?.has(i) ? ' bad' : '') + (cycleTo === i ? ' cycle-target' : '')}
                  style={ls.length ? { borderColor: pointerColor(ls[0], allNames) } : undefined}
                >
                  <span className="ll-val">{cellText(n.val)}</span>
                  <span className="ll-next" />
                </div>
                <div className="arr-ptrs" style={{ minHeight: maxLabels * 18 }}>
                  {ls.map((l) => (
                    <div key={l} className="ptr" style={{ color: pointerColor(l, allNames) }}>
                      <span className="ptr-arrow">▲</span>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              {i < nodes.length - 1 && <span className="ll-arrow">→</span>}
            </div>
          )
        })}
        {cycleTo !== undefined ? (
          <span className="ll-cycle" title="ciclo">
            ↺ volta para o nó {cycleTo} ({cellText(nodes[cycleTo].val)})
          </span>
        ) : more ? (
          <span className="ll-arrow">→ …</span>
        ) : (
          <>
            <span className="ll-arrow">→</span>
            <span className="ll-null">null</span>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------- Árvore binária (SVG) ---------------- */

interface Placed {
  n: TNode
  x: number
  y: number
  parent?: Placed
}

const NODE_R = 17
const X_GAP = 42
const Y_GAP = 58

function layoutTree(root: TNode): Placed[] {
  const out: Placed[] = []
  let order = 0
  const walk = (n: TNode | null, depth: number, parent?: Placed): Placed | undefined => {
    if (!n) return undefined
    const placeholder: Placed = { n, x: 0, y: depth * Y_GAP + NODE_R + 6, parent }
    walk(n.left, depth + 1, placeholder)
    placeholder.x = order++ * X_GAP + NODE_R + 8
    out.push(placeholder)
    walk(n.right, depth + 1, placeholder)
    return placeholder
  }
  walk(root, 0)
  return out
}

export function TreeView({
  root,
  labels,
  allNames,
  highlight,
  changed,
}: {
  root: TNode | null
  labels: Map<number, string[]>
  allNames: string[]
  highlight?: Set<number>
  changed?: Set<number>
}) {
  if (!root) return <div className="arr-empty">null (árvore vazia)</div>
  const placed = layoutTree(root)
  const width = Math.max(...placed.map((p) => p.x)) + NODE_R + 40
  const height = Math.max(...placed.map((p) => p.y)) + NODE_R + 30
  return (
    <div className="tree-scroll">
      <svg className="tree-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="árvore binária">
        {placed.map((p) =>
          p.parent ? <line key={'e' + p.n.id} x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} className="tree-edge" /> : null,
        )}
        {placed.map((p) => {
          const ls = labels.get(p.n.id) ?? []
          const cls = ['tree-node']
          if (highlight?.has(p.n.id)) cls.push('hl')
          if (changed?.has(p.n.id)) cls.push('changed')
          const txt = cellText(p.n.val)
          return (
            <g key={p.n.id} className={cls.join(' ')}>
              <circle cx={p.x} cy={p.y} r={NODE_R} style={ls.length ? { stroke: pointerColor(ls[0], allNames) } : undefined} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className="tree-val">
                {txt.length > 4 ? txt.slice(0, 3) + '…' : txt}
              </text>
              {p.n.cut && (
                <text x={p.x} y={p.y + NODE_R + 12} textAnchor="middle" className="tree-cut">
                  …
                </text>
              )}
              {ls.length > 0 && (
                <text x={p.x + NODE_R + 3} y={p.y - NODE_R + 4} className="tree-label" style={{ fill: pointerColor(ls[0], allNames) }}>
                  {ls.join(', ')}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Converte um array de heap (índice i → filhos 2i+1, 2i+2) em árvore para desenhar. */
export function heapToTree(items: V[]): TNode | null {
  const build = (i: number): TNode | null =>
    i < items.length ? { id: -(i + 1), val: items[i], left: build(2 * i + 1), right: build(2 * i + 2) } : null
  return build(0)
}

/** Lê uma árvore em ordem de nível (formato LeetCode, com nulls) e monta TNodes para desenhar. */
export function levelOrderToTree(items: V[]): TNode | null {
  if (!items.length || items[0].t === 'null') return null
  let id = -1
  const mk = (v: V): TNode => ({ id: id--, val: v, left: null, right: null })
  const root = mk(items[0])
  const q = [root]
  let i = 1
  while (q.length && i < items.length) {
    const n = q.shift()!
    if (i < items.length && items[i].t !== 'null') q.push((n.left = mk(items[i])))
    i++
    if (i < items.length && items[i].t !== 'null') q.push((n.right = mk(items[i])))
    i++
  }
  return root
}

/* ---------------- Árvore de chamadas ---------------- */

export function CallTreeView({ calls, pos, activeIds, currentId }: { calls: CallNode[]; pos: number; activeIds: Set<number>; currentId?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // mantém a chamada atual visível dentro da caixa com rolagem
  useLayoutEffect(() => {
    const box = scrollRef.current
    const el = box?.querySelector('.call.current') as Element | null
    if (!box || !el) return
    const b = box.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.left < b.left || r.right > b.right) box.scrollLeft += r.left - b.left - b.width / 2 + r.width / 2
    if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - b.height / 2 + r.height / 2
  }, [pos, currentId])
  const visible = calls.filter((c) => c.start <= pos)
  if (visible.length === 0) return null
  const byParent = new Map<number | null, CallNode[]>()
  for (const c of visible) {
    const arr = byParent.get(c.parent) ?? []
    arr.push(c)
    byParent.set(c.parent, arr)
  }
  const roots = byParent.get(null) ?? []

  if (visible.length > 90) {
    // muitas chamadas: lista indentada
    const rows: { c: CallNode; depth: number }[] = []
    const walk = (c: CallNode, d: number) => {
      rows.push({ c, depth: d })
      for (const ch of byParent.get(c.id) ?? []) walk(ch, d + 1)
    }
    roots.forEach((r) => walk(r, 0))
    return (
      <div className="calltree-list" ref={scrollRef}>
        {rows.map(({ c, depth }) => (
          <div key={c.id} className={callCls(c, pos, activeIds, currentId)} style={{ paddingLeft: depth * 14 }}>
            {c.name}({c.args}){c.end !== undefined && c.end <= pos && c.ret !== undefined ? ` → ${c.ret}` : ''}
          </div>
        ))}
      </div>
    )
  }

  // layout: folhas recebem x consecutivos; pai fica no meio dos filhos
  const longest = Math.max(...visible.map((c) => c.name.length + c.args.length + 2))
  const W = Math.min(190, Math.max(96, longest * 7 + 16))
  const maxChars = Math.floor((W - 12) / 7)
  const H = 54
  const pos2 = new Map<number, { x: number; y: number }>()
  let leaf = 0
  const place = (c: CallNode, depth: number): number => {
    const kids = byParent.get(c.id) ?? []
    let x: number
    if (kids.length === 0) x = leaf++ * W
    else {
      const xs = kids.map((k) => place(k, depth + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
    }
    pos2.set(c.id, { x, y: depth * H })
    return x
  }
  roots.forEach((r) => place(r, 0))
  const width = Math.max(leaf, 1) * W + 10
  const height = Math.max(...[...pos2.values()].map((p) => p.y)) + H
  return (
    <div className="calltree-scroll" ref={scrollRef}>
      <svg className="calltree-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {visible.map((c) => {
          if (c.parent === null) return null
          const a = pos2.get(c.parent)
          const b = pos2.get(c.id)
          if (!a || !b) return null
          return <line key={'e' + c.id} x1={a.x + W / 2} y1={a.y + 30} x2={b.x + W / 2} y2={b.y + 4} className="tree-edge" />
        })}
        {visible.map((c) => {
          const p = pos2.get(c.id)!
          const done = c.end !== undefined && c.end <= pos
          return (
            <g key={c.id} className={callCls(c, pos, activeIds, currentId)}>
              <rect x={p.x + 4} y={p.y + 4} width={W - 8} height={26} rx={6} />
              <text x={p.x + W / 2} y={p.y + 21} textAnchor="middle" className="call-label">
                {shortLabel(`${c.name}(${c.args})`, maxChars)}
              </text>
              {done && c.ret !== undefined && (
                <text x={p.x + W / 2} y={p.y + 44} textAnchor="middle" className="call-ret">
                  → {c.ret}
                </text>
              )}
              <title>{`${c.name}(${c.args})${c.ret !== undefined ? ' → ' + c.ret : ''}`}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function shortLabel(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function callCls(c: CallNode, pos: number, active: Set<number>, currentId?: number) {
  const cls = ['call']
  if (c.id === currentId) cls.push('current')
  else if (active.has(c.id)) cls.push('active')
  else if (c.end !== undefined && c.end <= pos) cls.push('done')
  return cls.join(' ')
}
