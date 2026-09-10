import { jsPDF } from 'jspdf'
import type { Exercise, Topic } from '../types'

/** Helvetica en jsPDF no soporta simbolos Unicode (-, x, etc. especiales). */
function pdfSafe(text: string) {
  return text
    .replace(/[\u2212\u2013\u2014\u2010\u2011]/g, '-')
    .replace(/[×·]/g, 'x')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[“”„"]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/·/g, '-')
}

export function downloadExercisesPdf(
  topic: Topic,
  exercises: Exercise[],
  kind: 'problemas' | 'solucionario',
) {
  const doc = new jsPDF()
  const title =
    kind === 'problemas'
      ? `Ejercicios - ${topic.title}`
      : `Solucionario - ${topic.title}`

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(pdfSafe(title), 14, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(pdfSafe('Baldor - Santillana - Maquetacion'), 14, 28)

  let y = 40
  exercises.forEach((ex, i) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}.`, 14, y)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(pdfSafe(ex.prompt), 170)
    doc.text(lines, 24, y)
    y += lines.length * 6 + 4

    if (kind === 'solucionario') {
      doc.setTextColor(20, 90, 70)
      doc.text(pdfSafe(`Respuesta: ${ex.answer}`), 24, y)
      doc.setTextColor(0, 0, 0)
      y += 10
    } else {
      y += 8
      doc.setDrawColor(180)
      doc.line(24, y, 100, y)
      y += 12
    }
  })

  const name =
    kind === 'problemas'
      ? `ejercicios-${topic.id}.pdf`
      : `solucionario-${topic.id}.pdf`
  doc.save(name)
}
