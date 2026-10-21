/**
 * Simulador didático do event loop do JavaScript.
 *
 * O cenário é descrito como uma lista de "instruções" (log, setTimeout, then, await...)
 * com o número da linha no código mostrado. O simulador executa o modelo do jeito que
 * o motor real faz (pilha → microtasks → uma macrotask → microtasks → ...) e gera
 * um "quadro" por passo para a animação.
 */

export type ElStmt =
  | { kind: 'log'; line: number; text: string }
  | { kind: 'call'; line: number; name: string; body: ElStmt[] }
  | { kind: 'timeout'; line: number; ms: number; label: string; body: ElStmt[] }
  | { kind: 'microtask'; line: number; label: string; body: ElStmt[] } // queueMicrotask(cb)
  /** promise já resolvida + cadeia de .then: cada then só entra na fila quando o anterior termina */
  | { kind: 'then'; line: number; chain: { label: string; body: ElStmt[] }[] }
  /** operação de I/O (fetch, leitura de arquivo): fica na Web API por `ms` e depois resolve a promise */
  | { kind: 'io'; line: number; label: string; ms: number; then?: { label: string; body: ElStmt[] } }
  | { kind: 'async'; line: number; name: string; body: ElStmt[] } // chamada de função async
  /** await de um valor já pronto (`value`), de uma operação de I/O (`io`) ou de várias em paralelo (`all`) */
  | { kind: 'await'; line: number; on: 'value' | { io: string; ms: number } | { all: { io: string; ms: number }[] }; label?: string }

export interface ElFrame {
  line: number | null
  stack: string[]
  webApis: { label: string; until: number }[]
  micro: string[]
  macro: string[]
  console: string[]
  time: number
  note: string
  phase: 'script' | 'micro' | 'macro' | 'loop' | 'end'
}

interface Task {
  label: string
  frame: string
  body: ElStmt[]
  /** callbacks encadeados que entram na fila quando esta task termina (cadeia de .then) */
  after?: { label: string; body: ElStmt[] }[]
}

interface Pending {
  label: string
  until: number
  seq: number
  kind: 'timer' | 'io'
  task: Task
}

export function simulate(program: ElStmt[]): ElFrame[] {
  const frames: ElFrame[] = []
  const stack: string[] = []
  const micro: Task[] = []
  const macro: Task[] = []
  const pending: Pending[] = []
  const consoleOut: string[] = []
  let time = 0
  let seq = 0
  let phase: ElFrame['phase'] = 'script'

  const snap = (line: number | null, note: string) => {
    frames.push({
      line,
      stack: [...stack],
      webApis: pending.map((p) => ({ label: p.label, until: p.until })),
      micro: micro.map((t) => t.label),
      macro: macro.map((t) => t.label),
      console: [...consoleOut],
      time,
      note,
      phase,
    })
    if (frames.length > 400) throw new Error('cenário longo demais')
  }

  /** Executa instruções. Retorna 'suspended' se um await pausou a função async atual. */
  const exec = (stmts: ElStmt[], asyncName?: string): 'done' | 'suspended' => {
    for (let i = 0; i < stmts.length; i++) {
      const st = stmts[i]
      switch (st.kind) {
        case 'log':
          consoleOut.push(st.text)
          snap(st.line, `console.log imprime "${st.text}" na hora: é código síncrono.`)
          break
        case 'call':
          stack.push(`${st.name}()`)
          snap(st.line, `${st.name}() é chamada e entra no topo da call stack.`)
          exec(st.body)
          stack.pop()
          snap(st.line, `${st.name}() terminou e sai da call stack.`)
          break
        case 'timeout':
          pending.push({ label: `${st.label} (${st.ms}ms)`, until: time + st.ms, seq: seq++, kind: 'timer', task: { label: st.label, frame: st.label, body: st.body } })
          snap(
            st.line,
            `setTimeout entrega o callback para a Web API do navegador (timer de ${st.ms}ms) e segue em frente. O JS não espera o timer.`,
          )
          break
        case 'microtask':
          micro.push({ label: st.label, frame: st.label, body: st.body })
          snap(st.line, `queueMicrotask coloca "${st.label}" direto na fila de microtasks.`)
          break
        case 'then': {
          const [first, ...rest] = st.chain
          micro.push({ label: first.label, frame: first.label, body: first.body, after: rest })
          snap(
            st.line,
            rest.length
              ? `A promise já está resolvida: o primeiro .then ("${first.label}") vai para a fila de microtasks. Os próximos .then esperam o anterior terminar.`
              : `A promise já está resolvida: o callback do .then ("${first.label}") vai para a fila de microtasks. Ele só roda quando a pilha esvaziar.`,
          )
          break
        }
        case 'io':
          pending.push({
            label: `${st.label} (${st.ms}ms)`,
            until: time + st.ms,
            seq: seq++,
            kind: 'io',
            task: st.then ? { label: st.then.label, frame: st.then.label, body: st.then.body } : { label: `${st.label} resolvida`, frame: st.label, body: [] },
          })
          snap(st.line, `${st.label} começa na Web API (rede/disco) e devolve uma promise pendente. O JS continua executando.`)
          break
        case 'async': {
          stack.push(`${st.name}()`)
          snap(st.line, `${st.name}() é async: executa normalmente (síncrona) até o primeiro await.`)
          const r = exec(st.body, st.name)
          stack.pop()
          snap(
            st.line,
            r === 'suspended'
              ? `${st.name}() pausou no await e saiu da pilha, devolvendo uma promise pendente. O código depois da chamada continua.`
              : `${st.name}() terminou (sem pausar) e sai da pilha.`,
          )
          break
        }
        case 'await': {
          if (!asyncName) throw new Error('await fora de função async no cenário')
          const rest = stmts.slice(i + 1)
          const label = st.label ?? `${asyncName}: depois do await`
          const cont: Task = { label, frame: `${asyncName}()`, body: rest }
          if (st.on === 'value') {
            micro.push(cont)
            snap(st.line, `await de um valor já pronto: mesmo assim a função pausa, e o resto dela ("${label}") vira uma microtask.`)
          } else if ('all' in st.on) {
            // Promise.all: todas começam juntas; a continuação só entra quando a mais lenta termina
            const ops = st.on.all
            const slowest = ops.reduce((a, b) => (b.ms > a.ms ? b : a))
            for (const op of ops) {
              pending.push({
                label: `${op.io} (${op.ms}ms)`,
                until: time + op.ms,
                seq: seq++,
                kind: 'io',
                task: op === slowest ? cont : { label: `${op.io} pronta (Promise.all ainda espera as outras)`, frame: 'Promise.all', body: [] },
              })
            }
            snap(st.line, `Promise.all dispara ${ops.length} operações AO MESMO TEMPO na Web API. ${asyncName}() pausa até a última terminar.`)
          } else {
            pending.push({ label: `${st.on.io} (${st.on.ms}ms)`, until: time + st.on.ms, seq: seq++, kind: 'io', task: cont })
            snap(st.line, `await ${st.on.io}: a operação vai para a Web API e ${asyncName}() pausa. Quando terminar, o resto da função vira uma microtask.`)
          }
          return 'suspended'
        }
      }
    }
    return 'done'
  }

  const runTask = (t: Task, kind: 'micro' | 'macro') => {
    phase = kind
    stack.push(t.frame)
    snap(null, kind === 'micro' ? `O event loop tira "${t.label}" da fila de microtasks e coloca na pilha.` : `Pilha e microtasks vazias: o event loop pega UMA macrotask, "${t.label}".`)
    // continuação de função async: o frame é a própria função
    const asyncName = t.frame.endsWith('()') ? t.frame.slice(0, -2) : undefined
    const r = exec(t.body, asyncName)
    stack.pop()
    if (r === 'suspended') {
      snap(null, `${t.frame} pausou de novo em outro await e saiu da pilha.`)
    } else if (t.after && t.after.length) {
      const [next, ...rest] = t.after
      micro.push({ label: next.label, frame: next.label, body: next.body, after: rest })
      snap(null, `"${t.label}" terminou: a promise do .then resolveu e o próximo .then ("${next.label}") entra na fila de microtasks.`)
    } else {
      snap(null, `"${t.label}" terminou e saiu da pilha.`)
    }
  }

  const drainMicro = () => {
    while (micro.length) runTask(micro.shift()!, 'micro')
  }

  stack.push('script principal')
  snap(null, 'O script começa: tudo que é síncrono roda agora, de cima para baixo, dentro da call stack.')
  exec(program)
  stack.pop()
  phase = 'loop'
  snap(null, 'O script terminou e a pilha está vazia. Agora o event loop assume: primeiro esvazia TODAS as microtasks.')

  for (let guard = 0; guard < 200; guard++) {
    drainMicro()
    if (macro.length) {
      runTask(macro.shift()!, 'macro')
      continue
    }
    if (!pending.length) break
    // avança o relógio até a próxima operação da Web API terminar
    pending.sort((a, b) => a.until - b.until || a.seq - b.seq)
    const nextTime = pending[0].until
    time = Math.max(time, nextTime)
    phase = 'loop'
    const done = pending.filter((p) => p.until <= time)
    for (const p of done) {
      pending.splice(pending.indexOf(p), 1)
      if (p.kind === 'timer') {
        macro.push(p.task)
        snap(null, `t = ${time}ms: o timer "${p.label}" terminou e o callback vai para a fila de macrotasks (task queue).`)
      } else {
        micro.push(p.task)
        snap(null, `t = ${time}ms: "${p.label}" terminou; a promise resolve e "${p.task.label}" entra na fila de microtasks.`)
      }
    }
  }
  phase = 'end'
  snap(null, 'Nada mais na pilha, nas filas ou na Web API: o programa terminou.')
  return frames
}
