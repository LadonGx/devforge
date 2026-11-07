import type { Course, Exam, Problem } from '../types'
import { courseById, unitPath } from '../courses'
import { IFOOD, ifoodSection, ifoodSectionPath } from '../ifood'
import { PROVA_1 } from './prova1'
import { PROVA_2 } from './prova2'
import { PROVA_3 } from './prova3'
import { PROVA_4 } from './prova4'
import { PROVA_5 } from './prova5'

export const EXAMS: Exam[] = [PROVA_1, PROVA_2, PROVA_3, PROVA_4, PROVA_5]

export const examById = (id: string) => EXAMS.find((e) => e.id === id)

/** "curso:aula" (ou "ifood:<seção>") → link e nome, para a seção "O que revisar". */
export function topicRef(topic: string): { label: string; to: string } | null {
  const [courseId, unitId] = topic.split(':')
  if (courseId === IFOOD.id) {
    const sec = ifoodSection(unitId)
    if (sec) return { label: `Treino iFood: ${sec.title}`, to: ifoodSectionPath(sec.id) }
  }
  const c = courseById(courseId)
  const u = c?.units.find((x) => x.id === unitId)
  if (!c || !u) return null
  return { label: `${c.unitLabel}: ${u.title}`, to: unitPath(c, u.id) }
}

/** Questões de código das provas, para abrir no editor completo (com visualizador) depois da correção. */
const EXAM_PROBLEMS: Problem[] = EXAMS.flatMap((e) => e.questions.flatMap((q) => (q.kind === 'code' ? [q.problem] : [])))

export const EXAM_COURSE: Course = {
  id: 'provas',
  title: 'Provas',
  basePath: '/provas',
  unitSegment: 'x',
  unitLabel: 'Prova',
  volumeLabel: 'Guia',
  intro: '',
  how: [],
  units: [],
  problems: EXAM_PROBLEMS,
}
