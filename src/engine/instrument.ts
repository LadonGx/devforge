/**
 * Instrumentação do código do usuário para o visualizador passo a passo.
 *
 * Insere chamadas antes de cada statement dentro de funções:
 *   __s(linha, () => ({ ...variáveis visíveis }))
 * e envolve o corpo de cada função com __enter/__exit (para a pilha de chamadas)
 * e cada `return x` com __ret(linha, x).
 *
 * As inserções são feitas por offset no texto original, então o código do usuário
 * continua igual (linhas preservadas).
 */
import { parse } from 'acorn'

type Node = {
  type: string
  start: number
  end: number
  loc: { start: { line: number; column: number } }
  [k: string]: unknown
}

interface Ctx {
  inFn: boolean
  scopes: string[][]
}

interface Ins {
  pos: number
  text: string
  seq: number
}

function isNode(x: unknown): x is Node {
  return !!x && typeof x === 'object' && typeof (x as Node).type === 'string'
}

function patternNames(p: Node | null | undefined, out: string[] = []): string[] {
  if (!p) return out
  switch (p.type) {
    case 'Identifier':
      out.push(p.name as string)
      break
    case 'ObjectPattern':
      for (const prop of p.properties as Node[]) {
        if (prop.type === 'RestElement') patternNames(prop.argument as Node, out)
        else patternNames(prop.value as Node, out)
      }
      break
    case 'ArrayPattern':
      for (const el of p.elements as (Node | null)[]) patternNames(el, out)
      break
    case 'AssignmentPattern':
      patternNames(p.left as Node, out)
      break
    case 'RestElement':
      patternNames(p.argument as Node, out)
      break
  }
  return out
}

/** `var` declarados em qualquer lugar do corpo (sem entrar em funções aninhadas). */
function varNames(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((n) => varNames(n, out))
    return out
  }
  if (!isNode(node)) return out
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') return out
  if (node.type === 'VariableDeclaration' && node.kind === 'var') {
    for (const d of node.declarations as Node[]) patternNames(d.id as Node, out)
  }
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'loc') continue
    const v = node[k]
    if (Array.isArray(v) || isNode(v)) varNames(v, out)
  }
  return out
}

/** let/const/function/class declarados diretamente em uma lista de statements. */
function lexNames(list: Node[]): string[] {
  const out: string[] = []
  for (const s of list) {
    if (s.type === 'VariableDeclaration' && s.kind !== 'var') {
      for (const d of s.declarations as Node[]) patternNames(d.id as Node, out)
    } else if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && s.id) {
      out.push((s.id as Node).name as string)
    }
  }
  return out
}

export interface InstrumentResult {
  code: string
}

export function instrument(code: string): InstrumentResult {
  const ast = parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'script',
    locations: true,
    preserveParens: true,
  }) as unknown as Node

  const ins: Ins[] = []
  let seq = 0
  const add = (pos: number, text: string) => ins.push({ pos, text, seq: seq++ })

  const snapText = (line: number, ctx: Ctx) => {
    const names = [...new Set(ctx.scopes.flat())].filter((n) => !n.startsWith('__'))
    const body = names.map((n) => `try{__o[${JSON.stringify(n)}]=${n}}catch(__e){}`).join('')
    return `__s(${line},()=>{const __o={};${body}return __o});`
  }

  const handleList = (list: Node[], ctx: Ctx) => {
    for (const st of list) {
      if (ctx.inFn && st.type !== 'FunctionDeclaration' && st.type !== 'ClassDeclaration' && st.type !== 'EmptyStatement') {
        add(st.start, snapText(st.loc.start.line, ctx))
      }
      walk(st, ctx)
    }
  }

  const handleBody = (body: Node, ctx: Ctx, parentLine: number) => {
    if (body.type === 'BlockStatement' || !ctx.inFn) {
      // bloco vazio (ex.: `while (x) {}`): ainda registra um passo por iteração
      if (ctx.inFn && body.type === 'BlockStatement' && (body.body as Node[]).length === 0) {
        add(body.start + 1, snapText(body.loc.start.line, ctx))
      }
      walk(body, ctx)
      return
    }
    // corpo na mesma linha do if/for: não cria um passo duplicado
    const sameLine = body.loc.start.line === parentLine
    add(body.start, '{' + (body.type === 'EmptyStatement' || sameLine ? '' : snapText(body.loc.start.line, ctx)))
    walk(body, ctx)
    add(body.end, '}')
  }

  const handleFn = (fn: Node, _ctx: Ctx, hint?: string) => {
    const body = fn.body as Node
    const params: string[] = []
    for (const p of fn.params as Node[]) patternNames(p, params)
    if (body.type !== 'BlockStatement') {
      // arrow com expressão: não instrumenta (ex.: callbacks de sort/map), só percorre
      walk(body, { inFn: false, scopes: [] })
      return
    }
    const name = (fn.id as Node | null)?.name as string | undefined
    const fnName = name || hint || 'anônima'
    const fnScope = [...params, ...varNames(body.body), ...lexNames(body.body as Node[])]
    if (name && fn.type === 'FunctionExpression') fnScope.push(name)
    add(body.start + 1, `__enter(${JSON.stringify(fnName)},${JSON.stringify(params)});try{`)
    handleList(body.body as Node[], { inFn: true, scopes: [fnScope] })
    add(body.end - 1, `}finally{__exit()}`)
  }

  const walkChildren = (node: Node, ctx: Ctx) => {
    for (const k of Object.keys(node)) {
      if (k === 'type' || k === 'loc' || k === 'start' || k === 'end') continue
      const v = node[k]
      if (Array.isArray(v)) {
        for (const c of v) if (isNode(c)) walk(c, ctx)
      } else if (isNode(v)) walk(v, ctx)
    }
  }

  const fnTypes = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

  function walk(node: Node, ctx: Ctx): void {
    switch (node.type) {
      case 'Program':
        handleList(node.body as Node[], { inFn: false, scopes: [] })
        return
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        handleFn(node, ctx)
        return
      case 'VariableDeclarator': {
        const init = node.init as Node | null
        if (init && fnTypes.has(init.type) && (node.id as Node).type === 'Identifier') {
          handleFn(init, ctx, (node.id as Node).name as string)
          return
        }
        break
      }
      case 'MethodDefinition':
      case 'Property': {
        const val = node.value as Node
        const key = node.key as Node
        if (val && fnTypes.has(val.type)) {
          const hint = key.type === 'Identifier' ? (key.name as string) : undefined
          if (node.computed) walk(key, ctx)
          handleFn(val, ctx, hint)
          return
        }
        break
      }
      case 'BlockStatement': {
        const inner = { ...ctx, scopes: [...ctx.scopes, lexNames(node.body as Node[])] }
        handleList(node.body as Node[], inner)
        return
      }
      case 'StaticBlock':
        handleList(node.body as Node[], ctx)
        return
      case 'SwitchStatement': {
        walk(node.discriminant as Node, ctx)
        const cases = node.cases as Node[]
        const inner = { ...ctx, scopes: [...ctx.scopes, lexNames(cases.flatMap((c) => c.consequent as Node[]))] }
        for (const c of cases) {
          if (c.test) walk(c.test as Node, inner)
          handleList(c.consequent as Node[], inner)
        }
        return
      }
      case 'ForStatement': {
        const init = node.init as Node | null
        const names = init && init.type === 'VariableDeclaration' && init.kind !== 'var' ? lexNames([init]) : []
        const inner = { ...ctx, scopes: [...ctx.scopes, names] }
        if (init) walk(init, inner)
        if (node.test) walk(node.test as Node, inner)
        if (node.update) walk(node.update as Node, inner)
        handleBody(node.body as Node, inner, node.loc.start.line)
        return
      }
      case 'ForInStatement':
      case 'ForOfStatement': {
        const left = node.left as Node
        const names = left.type === 'VariableDeclaration' && left.kind !== 'var' ? lexNames([left]) : []
        const inner = { ...ctx, scopes: [...ctx.scopes, names] }
        walk(left, inner)
        walk(node.right as Node, ctx)
        handleBody(node.body as Node, inner, node.loc.start.line)
        return
      }
      case 'IfStatement':
        walk(node.test as Node, ctx)
        handleBody(node.consequent as Node, ctx, node.loc.start.line)
        if (node.alternate) handleBody(node.alternate as Node, ctx, node.loc.start.line)
        return
      case 'WhileStatement':
        walk(node.test as Node, ctx)
        handleBody(node.body as Node, ctx, node.loc.start.line)
        return
      case 'DoWhileStatement':
        handleBody(node.body as Node, ctx, node.loc.start.line)
        walk(node.test as Node, ctx)
        return
      case 'LabeledStatement':
        // não envolve o corpo (quebraria `continue label`)
        walk(node.body as Node, ctx)
        return
      case 'TryStatement': {
        walk(node.block as Node, ctx)
        const handler = node.handler as Node | null
        if (handler) {
          const names = handler.param ? patternNames(handler.param as Node) : []
          walk(handler.body as Node, { ...ctx, scopes: [...ctx.scopes, names] })
        }
        if (node.finalizer) walk(node.finalizer as Node, ctx)
        return
      }
      case 'ReturnStatement': {
        const arg = node.argument as Node | null
        if (arg && ctx.inFn) {
          add(arg.start, `__ret(${node.loc.start.line},`)
          walk(arg, ctx)
          add(arg.end, `)`)
          return
        }
        break
      }
    }
    walkChildren(node, ctx)
  }

  walk(ast, { inFn: false, scopes: [] })

  ins.sort((a, b) => b.pos - a.pos || b.seq - a.seq)
  let out = code
  for (const i of ins) out = out.slice(0, i.pos) + i.text + out.slice(i.pos)
  return { code: out }
}
