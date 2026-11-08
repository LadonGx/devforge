/**
 * Etapa opcional: embeddings de verdade, com um modelo rodando no navegador (transformers.js).
 *
 * A biblioteca vem do CDN só quando o aluno pede (não entra no bundle) e o modelo fica no cache
 * do navegador depois do primeiro download. Os vetores saem normalizados (norma 1), então o
 * cosseno é o próprio produto escalar, mas o laboratório usa o mesmo cosineSimilarity do TF-IDF.
 */
const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1'

export interface EmbeddingModel {
  id: string
  label: string
  size: string
  note: string
}

export const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
    label: 'MiniLM multilíngue',
    size: '118 MB',
    note: 'entende português; mais pesado',
  },
  {
    id: 'Xenova/all-MiniLM-L6-v2',
    label: 'MiniLM (inglês)',
    size: '23 MB',
    note: 'leve, mas treinado em inglês: em português acerta menos',
  },
]

export type Embedder = (texts: string[]) => Promise<number[][]>

interface FeatureExtractor {
  (texts: string[], opts: { pooling: 'mean'; normalize: boolean }): Promise<{ tolist(): number[][] }>
}
interface TransformersModule {
  pipeline(task: 'feature-extraction', model: string, opts: Record<string, unknown>): Promise<FeatureExtractor>
}

const cache = new Map<string, Promise<Embedder>>()

/** Carrega o modelo (uma vez por sessão). `onProgress` recebe de 0 a 1 durante o download. */
export function loadEmbedder(modelId: string, onProgress?: (pct: number) => void): Promise<Embedder> {
  let p = cache.get(modelId)
  if (!p) {
    p = (async () => {
      const mod = (await import(/* @vite-ignore */ TRANSFORMERS_URL)) as TransformersModule
      const loaded = new Map<string, { loaded: number; total: number }>()
      const extractor = await mod.pipeline('feature-extraction', modelId, {
        dtype: 'q8',
        progress_callback: (e: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (e.status === 'progress' && e.file && e.total) {
            loaded.set(e.file, { loaded: e.loaded ?? 0, total: e.total })
            let a = 0
            let t = 0
            for (const v of loaded.values()) {
              a += v.loaded
              t += v.total
            }
            onProgress?.(t ? a / t : 0)
          }
        },
      })
      return async (texts: string[]) => (await extractor(texts, { pooling: 'mean', normalize: true })).tolist()
    })()
    p.catch(() => cache.delete(modelId)) // falhou (rede, CDN): deixa tentar de novo
    cache.set(modelId, p)
  }
  return p
}
