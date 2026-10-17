import type { FrameSnap, TNode, V } from '../../engine/types'
import { formatV } from '../../engine/serialize'
import { ArrayView, MapView, MatrixView, SetView, StackView, cellText, sameV, type Pointer } from './views'
import { ListView, TreeView, heapToTree } from './structures'

const POINTER_RE =
  /^(i|j|l|r|lo|hi|low|high|mid|left|right|start|end|slow|fast|p|p1|p2|q|ptr|idx|index|cur|curr|row|col|top|bottom|L|R|first|last)$|(Index|Idx|Ptr|Pointer)$/
const STACK_RE = /stack|stk|pilha/i
const QUEUE_RE = /^(q|fila)$|queue/i
const HEAP_RE = /heap/i

type Linked = Extract<V, { t: 'list' } | { t: 'tree' }>

function treeIds(n: TNode | null, out: Set<number>) {
  if (!n) return out
  out.add(n.id)
  treeIds(n.left, out)
  treeIds(n.right, out)
  return out
}
function nodeIds(v: Linked): Set<number> {
  return v.t === 'list' ? new Set(v.nodes.map((n) => n.id)) : treeIds(v.root, new Set())
}
const headId = (v: Linked) => (v.t === 'list' ? v.nodes[0]?.id : v.root?.id)
const isLinked = (v: V): v is Linked => v.t === 'list' || v.t === 'tree'

/** Texto curto para um nó (usado em frames que não são o atual). */
function shortNode(v: Linked) {
  if (v.t === 'list') return `ListNode(${v.nodes[0] ? cellText(v.nodes[0].val) : '?'})`
  return `TreeNode(${v.root ? cellText(v.root.val) : '?'})`
}

/** `this` de métodos de classe vira variáveis `this.campo`. */
function expandThis(vars: [string, V][]): [string, V][] {
  const out: [string, V][] = []
  for (const [n, v] of vars) {
    if (n === 'this' && v.t === 'obj' && !/Heap$/.test(v.cls)) {
      for (const [k, x] of v.entries) if (x.t !== 'fn') out.push([`this.${k}`, x])
    } else out.push([n, v])
  }
  return out
}

const WINDOW_PAIRS: [string, string][] = [
  ['l', 'r'],
  ['L', 'R'],
  ['left', 'right'],
  ['lo', 'hi'],
  ['low', 'high'],
  ['start', 'end'],
]

const isInt = (v: V): v is { t: 'n'; v: number } => v.t === 'n' && Number.isInteger(v.v)

const structId = (v: V): number | undefined => ('id' in v && (v.t === 'arr' || v.t === 'map' || v.t === 'set' || v.t === 'obj') ? v.id : undefined)

function summary(v: V): string {
  if (v.t === 'arr') return `Array(${v.len})`
  if (v.t === 'map') return `Map(${v.size})`
  if (v.t === 'set') return `Set(${v.size})`
  if (v.t === 'obj') return v.cls || 'Object'
  return formatV(v)
}

interface FrameProps {
  frame: FrameSnap
  prev?: FrameSnap
  current: boolean
  context?: V[]
  /** estruturas já desenhadas em frames acima (mostradas aqui de forma compacta) */
  shownIds?: Set<number>
  /** célula (linha, coluna) da chamada atual, para destacar matrizes de frames externos */
  focusCell?: [number, number] | null
}

export function FrameView({ frame, prev, current, context = [], shownIds, focusCell }: FrameProps) {
  const prevVars = new Map(expandThis(prev?.vars || []))
  const vars = expandThis(frame.vars)

  // ---- listas ligadas e árvores: agrupa cada variável na maior estrutura que contém o nó dela ----
  const linkedGroups = new Map<number, { v: Linked; labels: Map<number, string[]>; names: string[] }>()
  if (current) {
    const candidates: Linked[] = [...context, ...vars.map(([, v]) => v)].filter(isLinked)
    const idsOf = new Map(candidates.map((c) => [c, nodeIds(c)]))
    for (const [n, v] of vars) {
      if (!isLinked(v)) continue
      const h = headId(v)
      let best: Linked = v
      for (const c of candidates) {
        if (c.t !== v.t) continue
        const ids = idsOf.get(c)!
        if (h !== undefined && ids.has(h) && ids.size > idsOf.get(best)!.size) best = c
      }
      const g = linkedGroups.get(best.id) ?? { v: best, labels: new Map<number, string[]>(), names: [] as string[] }
      if (h !== undefined) g.labels.set(h, [...(g.labels.get(h) ?? []), n])
      g.names.push(n)
      linkedGroups.set(best.id, g)
    }
  }

  // ponteiros: inteiros com nomes típicos de índice
  const pointerVars = vars.filter(([n, v]) => POINTER_RE.test(n) && isInt(v)) as [string, { t: 'n'; v: number }][]
  const pointerNames = pointerVars.map(([n]) => n)

  // em quais coleções desenhar os ponteiros: preferimos os parâmetros (entrada)
  const seqVars = vars.filter(([n, v]) => (v.t === 'arr' && !STACK_RE.test(n) && !isMatrix(v)) || (v.t === 's' && v.v.length > 0 && v.v.length <= 60))
  const paramSeqs = seqVars.filter(([n]) => frame.params.includes(n)).map(([n]) => n)
  const pointerTargets = new Set(paramSeqs.length ? paramSeqs : seqVars.map(([n]) => n))

  let window: [number, number] | null = null
  const varMap = new Map(vars)
  for (const [a, b] of WINDOW_PAIRS) {
    const va = varMap.get(a)
    const vb = varMap.get(b)
    if (va && vb && isInt(va) && isInt(vb) && va.v <= vb.v) {
      window = [va.v, vb.v]
      break
    }
  }

  // linha/coluna para matrizes
  const rv = varMap.get('row') ?? varMap.get('r')
  const cv = varMap.get('col') ?? varMap.get('c')
  const cell: [number, number] | null = rv && cv && isInt(rv) && isInt(cv) ? [rv.v, cv.v] : (focusCell ?? null)

  const scalars: [string, V][] = []
  const structs: [string, V][] = []
  for (const [n, v] of vars) {
    const isStr = v.t === 's' && pointerTargets.has(n)
    if (isLinked(v)) {
      if (!current) scalars.push([n, { t: 's', v: shortNode(v) }])
      continue
    }
    const sid = structId(v)
    if (sid !== undefined && shownIds?.has(sid)) {
      scalars.push([n, { t: 's', v: `${summary(v)} ↑ mesmo objeto` }])
      continue
    }
    if (v.t === 'arr' || v.t === 'map' || v.t === 'set' || v.t === 'obj' || isStr) structs.push([n, v])
    else scalars.push([n, v])
  }
  const allPtrNames = [...linkedGroups.values()].flatMap((g) => g.names)

  return (
    <div className={'frame' + (current ? ' frame-current' : '')}>
      <div className="frame-head">
        <span className="frame-name">{frame.name}()</span>
        {!current && <span className="muted"> aguardando retorno da chamada acima</span>}
      </div>
      {vars.length === 0 && <div className="muted frame-empty">sem variáveis ainda</div>}
      {scalars.length > 0 && (
        <div className="scalars">
          {scalars.map(([n, v]) => {
            const p = prevVars.get(n)
            // resumos (nós, objetos repetidos) mostram o texto puro e não piscam como "alterados"
            const summarized = v.t === 's' && /^(List|Tree)Node\(|↑ mesmo objeto$/.test(v.v) && varMap.get(n)?.t !== 's'
            const changed = prev && !summarized && !sameV(p, v)
            const isPtr = pointerNames.includes(n)
            return (
              <div key={n} className={'scalar' + (changed ? ' changed' : '') + (isPtr ? ' is-ptr' : '')}>
                <span className="scalar-name">{n}</span>
                <span className="scalar-val">{summarized && v.t === 's' ? v.v : formatV(v)}</span>
                {changed && p && <span className="scalar-prev">era {formatV(p)}</span>}
              </div>
            )
          })}
        </div>
      )}
      <div className="structs">
        {[...linkedGroups.values()].map((g) => (
          <div key={'g' + g.v.id} className="linked">
            <div className="viz-label">
              {g.v.t === 'list' ? 'lista ligada' : 'árvore'} <span className="muted">· {g.names.join(', ')}</span>
            </div>
            {g.v.t === 'list' ? (
              <ListView nodes={g.v.nodes} cycleTo={g.v.cycleTo} more={g.v.more} labels={g.labels} allNames={allPtrNames} />
            ) : (
              <TreeView root={g.v.root} labels={g.labels} allNames={allPtrNames} highlight={new Set(g.labels.keys())} />
            )}
          </div>
        ))}
        {structs.map(([n, v]) => {
          const p0 = prevVars.get(n)
          // heap (MinHeap/MaxHeap ou array chamado heap): desenha como árvore
          const heapArr = v.t === 'obj' && /Heap$/.test(v.cls) ? v.entries.find(([k]) => k === 'data')?.[1] : v.t === 'arr' && HEAP_RE.test(n) ? v : undefined
          if (heapArr && heapArr.t === 'arr') {
            const prevHeap = p0?.t === 'obj' ? p0.entries.find(([k]) => k === 'data')?.[1] : p0
            return (
              <div key={n} className="heapv">
                <div className="viz-label">
                  {n} <span className="muted">{v.t === 'obj' ? v.cls : 'heap'} ({heapArr.len}) · topo = raiz</span>
                </div>
                <div className="heap-row">
                  <TreeView root={heapToTree(heapArr.items)} labels={new Map()} allNames={[]} highlight={new Set(heapArr.items.length ? [-1] : [])} />
                  <ArrayView name="" items={heapArr.items} len={heapArr.len} prev={prev && prevHeap?.t === 'arr' ? prevHeap.items : undefined} compact />
                </div>
              </div>
            )
          }
          if (v.t === 'arr' && QUEUE_RE.test(n) && !isMatrix(v)) {
            return (
              <ArrayView key={n} name={`${n} · fila (frente à esquerda)`} items={v.items} len={v.len} prev={prev && p0?.t === 'arr' ? p0.items : undefined} />
            )
          }
          const p = prevVars.get(n)
          if (v.t === 'arr' && isMatrix(v)) {
            return <MatrixView key={n} name={n} rows={v.items} prev={p?.t === 'arr' ? p.items : undefined} cell={cell} />
          }
          if (v.t === 'arr' && STACK_RE.test(n)) {
            return <StackView key={n} name={n} items={v.items} len={v.len} prev={p?.t === 'arr' ? p.items : undefined} />
          }
          if (v.t === 'arr' || v.t === 's') {
            const items: V[] = v.t === 'arr' ? v.items : [...v.v].map((c) => ({ t: 's', v: c }) as V)
            const len = v.t === 'arr' ? v.len : v.v.length
            const prevItems = p?.t === 'arr' ? p.items : p?.t === 's' ? [...p.v].map((c) => ({ t: 's', v: c }) as V) : undefined
            const ptrs: Pointer[] = pointerTargets.has(n) ? pointerVars.map(([pn, pv]) => ({ name: pn, idx: pv.v })) : []
            return (
              <ArrayView
                key={n}
                name={v.t === 's' ? `${n} (string)` : n}
                items={items}
                len={len}
                prev={prev ? prevItems : undefined}
                pointers={ptrs}
                pointerNames={pointerNames}
                window={pointerTargets.has(n) ? window : null}
                rawStrings={v.t === 's'}
              />
            )
          }
          if (v.t === 'map') return <MapView key={n} name={n} entries={v.entries} size={v.size} prev={prev ? (p?.t === 'map' ? p.entries : []) : undefined} />
          if (v.t === 'set') return <SetView key={n} name={n} items={v.items} size={v.size} prev={prev ? (p?.t === 'set' ? p.items : []) : undefined} />
          if (v.t === 'obj')
            return (
              <MapView
                key={n}
                name={n}
                kind={v.cls || 'Object'}
                entries={v.entries}
                prev={prev ? (p?.t === 'obj' ? p.entries : []) : undefined}
              />
            )
          return null
        })}
      </div>
    </div>
  )
}

function isMatrix(v: V): boolean {
  return v.t === 'arr' && v.items.length > 0 && v.items.every((x) => x.t === 'arr')
}
