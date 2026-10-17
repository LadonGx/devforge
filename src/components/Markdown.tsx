import { Fragment, type ReactNode } from 'react'

/** Highlight simples para blocos estáticos de JS/TS. */
const KW = new Set(
  'const|let|var|function|return|if|else|for|while|do|of|in|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|break|continue|switch|case|interface|type|implements|public|private|readonly|this|null|undefined|true|false|void|number|string|boolean|unknown|any|never'.split('|'),
)

export function highlight(code: string): ReactNode[] {
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([A-Za-z_$][\w$]*)\b/g
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index))
    if (m[1]) out.push(<span key={i++} className="tok-com">{m[1]}</span>)
    else if (m[2]) out.push(<span key={i++} className="tok-str">{m[2]}</span>)
    else if (m[3]) out.push(<span key={i++} className="tok-num">{m[3]}</span>)
    else if (m[4]) out.push(<span key={i++} className={KW.has(m[4]) ? 'tok-kw' : 'tok-fn'}>{m[4]}</span>)
    else if (m[5]) out.push(KW.has(m[5]) ? <span key={i++} className="tok-kw">{m[5]}</span> : m[5])
    last = re.lastIndex
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <div className="codeblock">
      {caption && <div className="codeblock-caption">{caption}</div>}
      <pre>
        <code>{highlight(code.replace(/\n$/, ''))}</code>
      </pre>
    </div>
  )
}

/** Inline: `code`, **negrito**, *itálico*, [link](url) */
export function inline(text: string): ReactNode[] {
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)]+\))/g
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (m[1]) out.push(<code key={i++}>{tok.slice(1, -1)}</code>)
    else if (m[2]) out.push(<strong key={i++}>{inline(tok.slice(2, -2))}</strong>)
    else if (m[3]) out.push(<em key={i++}>{inline(tok.slice(1, -1))}</em>)
    else if (m[4]) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!
      const external = /^https?:/.test(mm[2])
      out.push(
        <a key={i++} href={mm[2]} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
          {mm[1]}
        </a>,
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** Markdown bem simples: parágrafos, ### títulos, listas, ```código```. */
export function Markdown({ md, className = '' }: { md: string; className?: string }) {
  const lines = md.replace(/^\n+|\s+$/g, '').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') {
      i++
      continue
    }
    if (line.startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      blocks.push(<CodeBlock key={k++} code={buf.join('\n')} />)
      continue
    }
    const h = /^(#{2,4})\s+(.*)$/.exec(line)
    if (h) {
      const Tag = (`h${h[1].length + 1}` as 'h3' | 'h4' | 'h5')
      blocks.push(<Tag key={k++}>{inline(h[2])}</Tag>)
      i++
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''))
      blocks.push(
        <ul key={k++}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ul>,
      )
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''))
      blocks.push(
        <ol key={k++}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ol>,
      )
      continue
    }
    const buf: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(```|#{2,4}\s|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) buf.push(lines[i++])
    blocks.push(
      <p key={k++}>
        {buf.map((b, j) => (
          <Fragment key={j}>
            {j > 0 && ' '}
            {inline(b)}
          </Fragment>
        ))}
      </p>,
    )
  }
  return <div className={'md ' + className}>{blocks}</div>
}
