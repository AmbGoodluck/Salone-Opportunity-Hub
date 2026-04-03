import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { CVData } from '@/types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 16,
    borderBottom: '2pt solid #059669',
    paddingBottom: 10,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 8,
    color: '#6b7280',
  },
  summary: {
    fontSize: 9,
    color: '#374151',
    marginTop: 6,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#059669',
    borderBottom: '1pt solid #d1fae5',
    paddingBottom: 3,
    marginBottom: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#4b5563',
  },
  entryDate: {
    fontSize: 8,
    color: '#9ca3af',
  },
  entryDesc: {
    fontSize: 8.5,
    color: '#6b7280',
    marginTop: 3,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skill: {
    fontSize: 8,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryBlock: {
    marginBottom: 10,
  },
})

function formatMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function CVPdfDocument({ data }: { data: CVData }) {
  const { personal_info: p, education, experience, skills, languages, certifications } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{p.full_name || 'Your Name'}</Text>
          <View style={styles.contactRow}>
            {p.email && <Text>{p.email}</Text>}
            {p.phone && <Text>• {p.phone}</Text>}
            {p.location && <Text>• {p.location}</Text>}
            {p.linkedin && <Text>• {p.linkedin}</Text>}
          </View>
          {p.summary && <Text style={styles.summary}>{p.summary}</Text>}
        </View>

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((e) => (
              <View key={e.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{e.institution}</Text>
                  <Text style={styles.entryDate}>
                    {formatMonth(e.start_date)}
                    {e.is_current ? ' - Present' : e.end_date ? ` - ${formatMonth(e.end_date)}` : ''}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{e.degree}{e.field && ` - ${e.field}`}</Text>
                {e.description && <Text style={styles.entryDesc}>{e.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.map((e) => (
              <View key={e.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{e.title}</Text>
                  <Text style={styles.entryDate}>
                    {formatMonth(e.start_date)}
                    {e.is_current ? ' - Present' : e.end_date ? ` - ${formatMonth(e.end_date)}` : ''}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{e.company}{e.location && `, ${e.location}`}</Text>
                {e.description && <Text style={styles.entryDesc}>{e.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {skills.map((s) => (
                <Text key={s} style={styles.skill}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillsRow}>
              {languages.map((l) => (
                <Text key={l.id} style={styles.skill}>{l.language} ({l.proficiency})</Text>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((c) => (
              <View key={c.id} style={styles.entryBlock}>
                <Text style={styles.entryTitle}>{c.name}</Text>
                <Text style={styles.entrySubtitle}>{c.issuer}{c.date && ` - ${formatMonth(c.date)}`}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
