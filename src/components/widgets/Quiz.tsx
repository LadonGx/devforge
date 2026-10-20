import { useState } from 'react'
import { CodeBlock, Markdown } from '../Markdown'

interface Props {
  question: string
  code?: string
  options: string[]
  answer: number
  explain: string
}

/** Pergunta rápida "qual a saída?" com explicação depois de responder. */
export function Quiz({ question, code, options, answer, explain }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const done = picked !== null
  const right = picked === answer
  return (
    <div className={'quiz' + (done ? (right ? ' quiz-right' : ' quiz-wrong') : '')}>
      <div className="quiz-head">
        <span className="badge badge-accent">Pergunta rápida</span>
        <Markdown md={question} className="quiz-q" />
      </div>
      {code && <CodeBlock code={code} />}
      <div className="quiz-options">
        {options.map((o, i) => {
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
