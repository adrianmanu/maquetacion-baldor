import { jsPDF } from 'jspdf'
import type { Evaluation, ExamSubmission } from '../types'

function pdfSafe(text: string) {
  return text
    .replace(/[\u2212\u2013\u2014\u2010\u2011]/g, '-')
    .replace(/[×·]/g, 'x')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/[“”„"]/g, '"')
}

export function exportActasCsv(
  evaluation: Evaluation,
  submissions: ExamSubmission[],
) {
  const header = [
    'Codigo',
    'Tema',
    'Estudiante',
    'Correctas',
    'Total',
    'Nota_%',
    'Fecha',
    'Estado_sync',
  ]
  const rows = submissions.map((s) => [
    evaluation.code,
    evaluation.topicTitle,
    s.studentName,
    String(s.correct),
    String(s.total),
    String(s.scorePercent),
    new Date(s.submittedAt).toLocaleString('es-ES'),
    s.pendingSync ? 'pendiente' : 'ok',
  ])

  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((r) => r.map(escape).join(';')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `acta-${evaluation.code}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportActasPdf(
  evaluation: Evaluation,
  submissions: ExamSubmission[],
) {
  const doc = new jsPDF()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(pdfSafe(`Acta de evaluacion - ${evaluation.topicTitle}`), 14, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(pdfSafe(`Codigo: ${evaluation.code}`), 14, 26)
  doc.text(
    pdfSafe(
      `Fecha acta: ${new Date().toLocaleString('es-ES')} | Entregas: ${submissions.length}`,
    ),
    14,
    32,
  )

  let y = 42
  doc.setFont('helvetica', 'bold')
  doc.text('Estudiante', 14, y)
  doc.text('Nota', 110, y)
  doc.text('Detalle', 140, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  if (submissions.length === 0) {
    doc.text('Sin entregas registradas.', 14, y)
  }

  submissions.forEach((s) => {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    doc.text(pdfSafe(s.studentName).slice(0, 40), 14, y)
    doc.text(`${s.scorePercent}%`, 110, y)
    doc.text(`${s.correct}/${s.total}`, 140, y)
    y += 7
  })

  const avg =
    submissions.length === 0
      ? 0
      : Math.round(
          submissions.reduce((a, s) => a + s.scorePercent, 0) / submissions.length,
        )
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text(pdfSafe(`Promedio del aula: ${avg}%`), 14, y)

  doc.save(`acta-${evaluation.code}.pdf`)
}
