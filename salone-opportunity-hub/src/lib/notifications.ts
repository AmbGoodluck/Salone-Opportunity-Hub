import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/supabase'

type OpportunityRow = Database['public']['Tables']['opportunities']['Row']

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface InsertedOpportunity {
  id: string
  title: string
  type: string
  category: string
  description: string
}

export async function matchAndNotify(opportunities: InsertedOpportunity[]) {
  if (opportunities.length === 0) return

  const supabase = createAdminClient()

  // Get all profiles with notifications enabled
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, preferred_types, preferred_categories, notifications_enabled, email_notifications')
    .eq('notifications_enabled', true)

  if (!profiles || profiles.length === 0) return

  for (const opp of opportunities) {
    for (const profile of profiles) {
      const prefTypes = (profile.preferred_types ?? []) as string[]
      const prefCategories = (profile.preferred_categories ?? []) as string[]

      // Match if no preferences set (show all) or if opp matches preferences
      const typeMatch = prefTypes.length === 0 || prefTypes.includes(opp.type)
      const catMatch = prefCategories.length === 0 || prefCategories.includes(opp.category)

      if (!typeMatch && !catMatch) continue

      // Create in-app notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        opportunity_id: opp.id,
        title: `New ${opp.type}: ${opp.title}`,
        body: opp.description.slice(0, 200),
      })

      // Send email if enabled
      if (profile.email_notifications && resend && profile.email) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? 'Salone Opportunity Hub <notifications@saloneopportunityhub.com>',
            to: profile.email,
            subject: `New ${opp.type} matches your interests: ${opp.title}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                <h2 style="color:#059669">New Opportunity</h2>
                <h3>${opp.title}</h3>
                <p style="color:#6b7280">${opp.type.charAt(0).toUpperCase() + opp.type.slice(1)} &middot; ${opp.category}</p>
                <p>${opp.description.slice(0, 300)}${opp.description.length > 300 ? '...' : ''}</p>
                <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://saloneopportunityhub.com' : 'http://localhost:3000'}/opportunities/${opp.id}"
                   style="display:inline-block;background:#059669;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:12px">
                  View Opportunity
                </a>
                <p style="color:#9ca3af;font-size:12px;margin-top:24px">
                  You're receiving this because you have email notifications enabled.
                  Update your preferences in your profile settings.
                </p>
              </div>
            `,
          })
        } catch (err) {
          console.error(`Failed to send email to ${profile.email}:`, err)
        }
      }
    }
  }
}
