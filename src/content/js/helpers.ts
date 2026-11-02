/** Gera o código inicial (JS e TS) a partir das assinaturas, com o corpo vazio. */
export function starter(jsSig: string, tsSig: string, jsDoc?: string) {
  return {
    js: `${jsDoc ? jsDoc + '\n' : ''}${jsSig} {\n\n}\n`,
    ts: `${tsSig} {\n\n}\n`,
  }
}
