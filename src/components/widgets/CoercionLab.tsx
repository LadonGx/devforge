import { useState } from 'react'

/**
 * Laboratório de coerção: escolhe dois valores e um operador e mostra,
 * passo a passo, as regras que o JavaScript aplica (== , +, -, Boolean...).
 */

interface Val {
  label: string
  v: unknown
}

export const VALUES: Val[] = [
  { label: '0', v: 0 },
  { label: '1', v: 1 },
  { label: '-0', v: -0 },
  { label: 'NaN', v: NaN },
  { label: '""', v: '' },
  { label: '" "', v: ' ' },
  { label: '"0"', v: '0' },
  { label: '"1"', v: '1' },
  { label: '"abc"', v: 'abc' },
  { label: 'true', v: true },
  { label: 'false', v: false },
  { label: 'null', v: null },
  { label: 'undefined', v: undefined },
  { label: '[]', v: [] },
  { label: '[1]', v: [1] },
  { label: '[1,2]', v: [1, 2] },
  { label: '{}', v: {} },
]

type Op = '==' | '===' | '+' | '-'
const OPS: Op[] = ['==', '===', '+', '-']

const typeOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'object' : typeof x)

export function show(x: unknown): string {
  if (typeof x === 'string') return JSON.stringify(x)
  if (Object.is(x, -0)) return '-0'
  if (Array.isArray(x)) return '[' + x.map(show).join(',') + ']'
  if (x && typeof x === 'object') return '{}'
  return String(x)
}

function toPrimitive(x: unknown, steps: string[]): unknown {
  if (x === null || typeof x !== 'object') return x
  const p = String(x) // arrays e objetos simples: valueOf() devolve o próprio objeto, então usa toString()
  steps.push(`ToPrimitive(${show(x)}): valueOf() devolve o próprio objeto, então usa toString() → ${show(p)}`)
  return p
}

function toNumber(x: unknown, steps: string[], why: string): number {
  const n = Number(x)
  let note = ''
  if (x === '' || (typeof x === 'string' && x.trim() === '')) note = ' (string vazia/só espaços vira 0!)'
  else if (x === null) note = ' (null vira 0)'
  else if (x === undefined) note = ' (undefined vira NaN)'
  else if (typeof x === 'string' && Number.isNaN(n)) note = ' (texto que não é número vira NaN)'
  steps.push(`${why}: Number(${show(x)}) → ${show(n)}${note}`)
  return n
}

function looseEq(a: unknown, b: unknown, steps: string[], depth = 0): boolean {
  if (depth > 6) return false
  const ta = typeOf(a)
  const tb = typeOf(b)
  if (ta === tb) {
    const r = a === b
    let extra = ''
    if (Number.isNaN(a as number) && typeof a === 'number') extra = ' (NaN nunca é igual a nada, nem a ele mesmo)'
    else if (ta === 'object') extra = ' (objetos são comparados por referência: são objetos diferentes)'
    steps.push(`Mesmo tipo (${ta}): compara como === → ${r}${extra}`)
    return r
  }
  if ((a === null || a === undefined) && (b === null || b === undefined)) {
    steps.push('null == undefined: regra especial → true')
    return true
  }
  if (a === null || a === undefined || b === null || b === undefined) {
    steps.push('null/undefined só são == entre si → false')
    return false
  }
  if (ta === 'number' && tb === 'string') return looseEq(a, toNumber(b, steps, 'número × string: converte a string'), steps, depth + 1)
  if (ta === 'string' && tb === 'number') return looseEq(toNumber(a, steps, 'string × número: converte a string'), b, steps, depth + 1)
  if (ta === 'boolean') return looseEq(toNumber(a, steps, 'boolean vira número'), b, steps, depth + 1)
  if (tb === 'boolean') return looseEq(a, toNumber(b, steps, 'boolean vira número'), steps, depth + 1)
  if (ta === 'object') return looseEq(toPrimitive(a, steps), b, steps, depth + 1)
  if (tb === 'object') return looseEq(a, toPrimitive(b, steps), steps, depth + 1)
  steps.push('Nenhuma regra se aplica → false')
  return false
}

export function explain(a: unknown, op: Op, b: unknown): { result: unknown; steps: string[] } {
  const steps: string[] = []
  if (op === '===') {
    const same = typeOf(a) === typeOf(b)
    if (!same) steps.push(`Tipos diferentes (${typeOf(a)} × ${typeOf(b)}) → false, sem conversão nenhuma`)
    else {
      const r = a === b
      steps.push(
        `Mesmo tipo (${typeOf(a)}): compara os valores → ${r}` +
          (typeof a === 'number' && Number.isNaN(a) ? ' (NaN !== NaN)' : '') +
          (typeOf(a) === 'object' ? ' (referências diferentes)' : ''),
      )
    }
    return { result: a === b, steps }
  }
  if (op === '==') return { result: looseEq(a, b, steps), steps }
  if (op === '+') {
    const pa = toPrimitive(a, steps)
    const pb = toPrimitive(b, steps)
    if (typeof pa === 'string' || typeof pb === 'string') {
      const r = String(pa) + String(pb)
      steps.push(`Um dos lados é string → concatena: ${show(String(pa))} + ${show(String(pb))} → ${show(r)}`)
      return { result: r, steps }
    }
    const na = toNumber(pa, steps, 'Nenhum lado é string: converte para número')
    const nb = toNumber(pb, steps, 'Converte o outro lado')
    steps.push(`Soma numérica: ${show(na)} + ${show(nb)} → ${show(na + nb)}`)
    return { result: na + nb, steps }
  }
  const na = toNumber(toPrimitive(a, steps), steps, '`-` sempre converte para número')
  const nb = toNumber(toPrimitive(b, steps), steps, 'Converte o outro lado')
  steps.push(`Subtração: ${show(na)} - ${show(nb)} → ${show(na - nb)}`)
  return { result: na - nb, steps }
}

export function realResult(a: unknown, op: Op, b: unknown): unknown {
  /* eslint-disable eqeqeq */
  const x = a as never
  const y = b as never
  if (op === '==') return a == b
  if (op === '===') return a === b
  if (op === '+') return (x as number) + (y as number)
  return (x as number) - (y as number)
}

export function CoercionLab({ title }: { title?: string }) {
  const [ai, setAi] = useState(4) // ""
  const [bi, setBi] = useState(0) // 0
  const [op, setOp] = useState<Op>('==')
  const a = VALUES[ai].v
  const b = VALUES[bi].v
  const { result, steps } = explain(a, op, b)
  const real = realResult(a, op, b)
  const consistent = Object.is(real, result) || (Number.isNaN(real as number) && Number.isNaN(result as number))

  return (
    <div className="lab">
      <div className="lab-head">
        <span className="badge badge-accent">Laboratório</span>
        <strong>{title ?? 'Coerção de tipos passo a passo'}</strong>
      </div>
      <div className="lab-controls">
        <ValuePicker value={ai} onChange={setAi} label="valor A" />
        <div className="seg lab-ops">
          {OPS.map((o) => (
            <button key={o} className={o === op ? 'active' : ''} onClick={() => setOp(o)}>
              {o}
            </button>
          ))}
        </div>
        <ValuePicker value={bi} onChange={setBi} label="valor B" />
      </div>
      <div className="lab-expr">
        <code>
          {VALUES[ai].label} {op} {VALUES[bi].label}
        </code>
        <span className="lab-arrow">→</span>
        <code className={'lab-result' + (typeof result === 'boolean' ? (result ? ' is-true' : ' is-false') : '')}>{show(result)}</code>
      </div>
      <ol className="lab-steps">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {!consistent && <div className="muted small">(o JavaScript real retornou {show(real)})</div>}
      <div className="lab-truthy">
        <div className="viz-label">Truthy ou falsy? (o que `if (valor)` enxerga)</div>
        <div className="truthy-grid">
          {VALUES.map((v) => (
            <span key={v.label} className={'truthy-chip ' + (v.v ? 'is-truthy' : 'is-falsy')} title={v.v ? 'truthy' : 'falsy'}>
              <code>{v.label}</code> {v.v ? '✓' : '✗'}
            </span>
          ))}
        </div>
        <div className="muted small">
          Falsy são só: <code>false</code>, <code>0</code>, <code>-0</code>, <code>""</code>, <code>null</code>, <code>undefined</code>, <code>NaN</code>{' '}
          (e <code>0n</code>). Todo o resto é truthy, inclusive <code>[]</code>, <code>{'{}'}</code> e <code>"0"</code>.
        </div>
      </div>
    </div>
  )
}

function ValuePicker({ value, onChange, label }: { value: number; onChange: (i: number) => void; label: string }) {
  return (
    <select className="select lab-select" value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label}>
      {VALUES.map((v, i) => (
        <option key={v.label} value={i}>
          {v.label}
        </option>
      ))}
    </select>
  )
}
