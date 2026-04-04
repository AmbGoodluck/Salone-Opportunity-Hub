import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { CVData } from '@/types'

function formatMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export async function generateWordCV(data: CVData, fileName: string): Promise<void> {
  const { personal_info: p, education, experience, skills, languages, certifications } = data

  const sections: Paragraph[] = []

  // Name
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: p.full_name || 'Your Name', bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  )

  // Contact info
  const contact = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join(' • ')
  if (contact) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contact, size: 18, color: '6B7280' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }

  // Summary
  if (p.summary) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: p.summary, italics: true, size: 20, color: '374151' })],
        spacing: { after: 300 },
        border: { bottom: { color: 'D1FAE5', style: BorderStyle.SINGLE, size: 4 } },
      })
    )
  }

  function addSection(title: string, content: Paragraph[]) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 20, color: '059669' })],
        spacing: { before: 300, after: 100 },
        border: { bottom: { color: 'D1FAE5', style: BorderStyle.SINGLE, size: 2 } },
      })
    )
    sections.push(...content)
  }

  // Education
  if (education.length > 0) {
    const eduParagraphs = education.flatMap((e) => [
      new Paragraph({
        children: [
          new TextRun({ text: e.institution, bold: true, size: 22 }),
          e.start_date
            ? new TextRun({
                text: `  ${formatMonth(e.start_date)}${e.is_current ? ' - Present' : e.end_date ? ` - ${formatMonth(e.end_date)}` : ''}`,
                color: '9CA3AF',
                size: 18,
              })
            : new TextRun({ text: '' }),
        ],
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${e.degree}${e.field ? ` - ${e.field}` : ''}`,
            size: 20,
            color: '4B5563',
          }),
        ],
        spacing: { after: e.description ? 60 : 160 },
      }),
      ...(e.description
        ? [
            new Paragraph({
              children: [new TextRun({ text: e.description, size: 18, color: '6B7280' })],
              spacing: { after: 160 },
            }),
          ]
        : []),
    ])
    addSection('Education', eduParagraphs)
  }

  // Experience
  if (experience.length > 0) {
    const expParagraphs = experience.flatMap((e) => [
      new Paragraph({
        children: [
          new TextRun({ text: e.title, bold: true, size: 22 }),
          new TextRun({
            text: `  ${formatMonth(e.start_date)}${e.is_current ? ' - Present' : e.end_date ? ` - ${formatMonth(e.end_date)}` : ''}`,
            color: '9CA3AF',
            size: 18,
          }),
        ],
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${e.company}${e.location ? `, ${e.location}` : ''}`,
            size: 20,
            color: '059669',
          }),
        ],
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: e.description, size: 18, color: '4B5563' })],
        spacing: { after: 180 },
      }),
    ])
    addSection('Work Experience', expParagraphs)
  }

  // Skills
  if (skills.length > 0) {
    addSection('Skills', [
      new Paragraph({
        children: [new TextRun({ text: skills.join(' • '), size: 20 })],
        spacing: { after: 160 },
      }),
    ])
  }

  // Languages
  if (languages.length > 0) {
    addSection('Languages', [
      new Paragraph({
        children: [
          new TextRun({
            text: languages.map((l) => `${l.language} (${l.proficiency})`).join(' • '),
            size: 20,
          }),
        ],
        spacing: { after: 160 },
      }),
    ])
  }

  // Certifications
  if (certifications.length > 0) {
    const certParagraphs = certifications.flatMap((c) => [
      new Paragraph({
        children: [new TextRun({ text: c.name, bold: true, size: 22 })],
        spacing: { after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${c.issuer}${c.date ? ` - ${formatMonth(c.date)}` : ''}`,
            size: 18,
            color: '6B7280',
          }),
        ],
        spacing: { after: 160 },
      }),
    ])
    addSection('Certifications', certParagraphs)
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children: sections,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${fileName}.docx`)
}
