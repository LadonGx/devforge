import { useMemo, useState } from 'react'
import { CodeBlock, Markdown } from '../Markdown'

interface Props {
  question: string
  code?: string
  options: string[]
  answer: number
  explain: string
}

/** Hash simples e estável (FNV-1a) para embaralhar sempre do mesmo jeito. */
export function hashStr(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Ordem embaralhada (mas estável) das alternativas: a resposta certa não fica sempre na mesma posição. */
export function shuffledOrder(seed: string, options: string[]) {
  return options.map((o, i) => ({ i, k: hashStr(seed + '|' + o + '|' + i) })).sort((a, b) => a.k - b.k).map((x) => x.i)
}

/** Pergunta rápida "qual a saída?" com explicação depois de responder. */
export function Quiz({ question, code, options, answer, explain }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const done = picked !== null
  const right = picked === answer
  const order = useMemo(() => shuffledOrder(question, options), [question, options])
  return (
    <div className={'quiz' + (done ? (right ? ' quiz-right' : ' quiz-wrong') : '')}>
      <div className="quiz-head">
        <span className="badge badge-accent">Pergunta rápida</span>
        <Markdown md={question} className="quiz-q" />
      </div>
      {code && <CodeBlock code={code} />}
      <div className="quiz-options">
        {order.map((i) => {
          const o = options[i]
          const cls = ['quiz-opt']
          if (done && i === answer) cls.push('is-answer')
          if (done && i === picked && i !== answer) cls.push('is-wrong')
          return (
            <button key={i} className={cls.join(' ')} disabled={done} onClick={() => setPicked(i)}>
              <code>{o}</code>
            </button>
          )
        })}
      </div>
      {done && (
        <div className="quiz-explain">
          <strong>{right ? 'Isso mesmo! ' : 'Quase. '}</strong>
          <Markdown md={explain} className="inline-md" />
          {!right && (
            <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setPicked(null)}>
              Tentar de novo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
