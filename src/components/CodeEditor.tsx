import { useEffect, useMemo, useRef } from 'react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { Decoration, EditorView, keymap, type DecorationSet } from '@codemirror/view'
import { StateEffect, StateField, Prec } from '@codemirror/state'
import type { Lang } from '../engine/types'
import { useTheme } from '../lib/theme'

const setMarks = StateEffect.define<{ step: number | null; error: number | null }>()

const stepDeco = Decoration.line({ class: 'cm-step-line' })
const errorDeco = Decoration.line({ class: 'cm-error-line' })

const marksField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(setMarks)) {
        const ranges = []
        const { step, error } = e.value
        const doc = tr.state.doc
        if (error && error >= 1 && error <= doc.lines) ranges.push(errorDeco.range(doc.line(error).from))
        if (step && step >= 1 && step <= doc.lines) ranges.push(stepDeco.range(doc.line(step).from))
        ranges.sort((a, b) => a.from - b.from)
        deco = Decoration.set(ranges, true)
      }
    }
    return deco
  },
  provide: (f) => EditorView.decorations.from(f),
})

const baseTheme = EditorView.theme({
  '&': { fontSize: '13.5px', height: '100%' },
  '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.6' },
  '.cm-step-line': { backgroundColor: 'rgba(110,168,254,0.22)', boxShadow: 'inset 3px 0 0 #6ea8fe' },
  '.cm-error-line': { backgroundColor: 'rgba(248,81,73,0.18)', boxShadow: 'inset 3px 0 0 #f85149' },
})

interface Props {
  value: string
  onChange?: (v: string) => void
  lang: Lang
  readOnly?: boolean
  stepLine?: number | null
  errorLine?: number | null
  onRun?: () => void
  height?: string
}

export function CodeEditor({ value, onChange, lang, readOnly, stepLine = null, errorLine = null, onRun, height = '100%' }: Props) {
  const ref = useRef<ReactCodeMirrorRef>(null)
  const theme = useTheme()
  const runRef = useRef(onRun)
  runRef.current = onRun

  const extensions = useMemo(
    () => [
      javascript({ typescript: lang === 'ts' }),
      marksField,
      baseTheme,
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              runRef.current?.()
              return true
            },
          },
        ]),
      ),
    ],
    [lang],
  )

  useEffect(() => {
    const view = ref.current?.view
    if (!view) return
    view.dispatch({ effects: setMarks.of({ step: stepLine, error: errorLine }) })
    if (stepLine && stepLine <= view.state.doc.lines) {
      const pos = view.state.doc.line(stepLine).from
      view.dispatch({ effects: EditorView.scrollIntoView(pos, { y: 'nearest' }) })
    }
  }, [stepLine, errorLine, value])

  return (
    <CodeMirror
      ref={ref}
      value={value}
      height={height}
      theme={theme === 'dark' ? 'dark' : 'light'}
      extensions={extensions}
      onChange={onChange}
      editable={!readOnly}
      readOnly={readOnly}
      basicSetup={{ foldGutter: false, highlightActiveLine: !readOnly, autocompletion: true, tabSize: 2 }}
      indentWithTab
      style={{ height }}
    />
  )
}
