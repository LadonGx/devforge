import type { FrameSnap, V } from '../../engine/types'
import { formatV } from '../../engine/serialize'
import { ArrayView, MapView, MatrixView, SetView, StackView, sameV, type Pointer } from './views'

const POINTER_RE =
  /^(i|j|k|l|r|lo|hi|low|high|mid|left|right|start|end|slow|fast|p|p1|p2|q|ptr|idx|index|cur|curr|row|col|top|bottom|L|R|first|last)$|(Index|Idx|Ptr|Pointer)$/
const STACK_RE = /stack|stk|pilha/i
const WINDOW_PAIRS: [string, string][] = [
  ['l', 'r'],
  ['L', 'R'],
  ['left', 'right'],
  ['lo', 'hi'],
  ['low', 'high'],
  ['start', 'end'],
]

const isInt = (v: V): v is { t: 'n'; v: number } => v.t === 'n' && Number.isInteger(v.v)

export function FrameView({ frame, prev, current }: { frame: FrameSnap; prev?: FrameSnap; current: boolean }) {
  const prevVars = new Map(prev?.vars || [])
  const vars = frame.vars

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
  const cell: [number, number] | null = rv && cv && isInt(rv) && isInt(cv) ? [rv.v, cv.v] : null

  const scalars: [string, V][] = []
  const structs: [string, V][] = []
  for (const [n, v] of vars) {
    const isStr = v.t === 's' && pointerTargets.has(n)
    if (v.t === 'arr' || v.t === 'map' || v.t === 'set' || v.t === 'obj' || isStr) structs.push([n, v])
    else scalars.push([n, v])
  }

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
            const changed = prev && !sameV(p, v)
            const isPtr = pointerNames.includes(n)
            return (
              <div key={n} className={'scalar' + (changed ? ' changed' : '') + (isPtr ? ' is-ptr' : '')}>
                <span className="scalar-name">{n}</span>
                <span className="scalar-val">{formatV(v)}</span>
                {changed && p && <span className="scalar-prev">era {formatV(p)}</span>}
              </div>
            )
          })}
        </div>
      )}
      <div className="structs">
        {structs.map(([n, v]) => {
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
