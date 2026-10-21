import { useEffect, useState } from 'react'
import type { Block } from '../content/types'
import type { TraceResult } from '../engine/types'
import { runTrace } from '../engine/runner'
import { CodeBlock, Markdown } from './Markdown'
import { Visualizer } from './viz/Visualizer'
import { Quiz } from './widgets/Quiz'
import { CoercionLab } from './widgets/CoercionLab'
import { Pipeline } from './widgets/Pipeline'
import { EventLoop } from './widgets/EventLoop'
import { Timeline } from './widgets/Timeline'

function Demo({ block }: { block: Extract<Block, { type: 'demo' }> }) {
  const [trace, setTrace] = useState<TraceResult | null>(null)
  useEffect(() => {
    let alive = true
    setTrace(null) // evita mostrar o trace do demo anterior ao trocar de aula
    runTrace(block.code, 'js', block.fnName, block.input, block.io).then((t) => alive && setTrace(t))
    return () => {
      alive = false
    }
  }, [block])
  return (
    <div className="demo">
      <div className="demo-head">
        <span className="badge badge-accent">Visualização</span>
        <strong>{block.title}</strong>
      </div>
      {block.caption && <p className="muted small demo-caption">{block.caption}</p>}
      {trace ? <Visualizer trace={trace} code={block.code} lang="js" /> : <div className="loading">Executando…</div>}
    </div>
  )
}

export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="lesson">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'text':
            return <Markdown key={i} md={b.md} />
          case 'code':
            return <CodeBlock key={i} code={b.code} caption={b.caption} />
          case 'callout':
            return (
              <div key={i} className={'callout callout-' + b.tone}>
                {b.title && <div className="callout-title">{b.title}</div>}
                <Markdown md={b.md} />
              </div>
            )
          case 'signals':
            return (
              <div key={i} className="signals">
                <div className="signals-title">🔎 {b.title || 'Quando usar'}</div>
                <ul>
                  {b.items.map((it, j) => (
                    <li key={j}>
                      <Markdown md={it} className="inline-md" />
                    </li>
                  ))}
                </ul>
              </div>
            )
          case 'compare':
            return (
              <div key={i} className="compare">
                <div className="compare-col compare-bad">
                  <div className="compare-title">{b.left.title}</div>
                  <Markdown md={b.left.md} />
                </div>
                <div className="compare-col compare-good">
                  <div className="compare-title">{b.right.title}</div>
                  <Markdown md={b.right.md} />
                </div>
              </div>
            )
          case 'demo':
            return <Demo key={i} block={b} />
          case 'quiz':
            return <Quiz key={i} question={b.question} code={b.code} options={b.options} answer={b.answer} explain={b.explain} />
          case 'coercion':
            return <CoercionLab key={i} title={b.title} />
          case 'pipeline':
            return <Pipeline key={i} title={b.title} caption={b.caption} input={b.input} stages={b.stages} />
          case 'eventloop':
            return <EventLoop key={i} title={b.title} caption={b.caption} code={b.code} program={b.program} />
          case 'timeline':
            return <Timeline key={i} title={b.title} caption={b.caption} tasks={b.tasks} />
        }
      })}
    </div>
  )
}
