/**
 * Match Score System for Salone Opportunity Hub
 *
 * Calculates match score (0-100%) between user profile and opportunity.
 * Uses weighted scoring: Skills 35%, Education 25%, Experience 20%, Location 20%
 */

import type { Profile, Opportunity } from '@/types'

// --- Scoring weights ---
const WEIGHTS = {
  skills: 0.35,
  education: 0.25,
  experience: 0.20,
  location: 0.20,
} as const

// --- Education hierarchy (higher = more advanced) ---
const EDUCATION_RANK: Record<string, number> = {
  'Secondary School': 1,
  'High School': 1,
  'Diploma': 2,
  'HND': 2,
  'Bachelor\'s Degree': 3,
  'Bachelors': 3,
  'Master\'s Degree': 4,
  'Masters': 4,
  'PhD': 5,
  'Doctorate': 5,
}

// --- Experience hierarchy ---
const EXPERIENCE_RANK: Record<string, number> = {
  'entry': 1,
  'junior': 2,
  'mid': 3,
  'senior': 4,
  'expert': 5,
}

// --- Match labels ---
export type MatchLabel = 'Strong Match' | 'Good Match' | 'Moderate' | 'Low'

export interface MatchResult {
  match_score: number
  match_label: MatchLabel
}

export interface MatchData {
  user_not_logged_in: boolean
  profile_incomplete: boolean
  match_score: number | null
  match_label: MatchLabel | null
  display_text: string
}

/**
 * Check if user profile has all required fields for match scoring.
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false

  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0
  const hasEducation = !!profile.education_level?.trim()
  const hasExperience = !!profile.experience_level?.trim()
  const hasLocation = !!profile.location?.trim()

  return hasSkills && hasEducation && hasExperience && hasLocation
}

/**
 * Calculate skills match score using set intersection.
 * Returns 0-100 based on overlap between user skills and opportunity keywords.
 */
function scoreSkills(userSkills: string[], opportunity: Opportunity): number {
  if (!userSkills || userSkills.length === 0) return 0

  // Extract keywords from opportunity title, description, requirements, and category
  const oppText = [
    opportunity.title,
    opportunity.description,
    opportunity.requirements ?? '',
    opportunity.category ?? '',
  ].join(' ').toLowerCase()

  const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()))
  let matches = 0

  for (const skill of userSet) {
    // Check if skill appears in opportunity text (partial match for multi-word skills)
    if (oppText.includes(skill)) {
      matches++
    }
  }

  // Score = percentage of user skills that match the opportunity
  return userSet.size > 0 ? Math.round((matches / userSet.size) * 100) : 0
}

/**
 * Calculate education match score.
 * User meets or exceeds requirement = 100, partial credit if close.
 */
function scoreEducation(userLevel: string, opportunity: Opportunity): number {
  const userRank = EDUCATION_RANK[userLevel] ?? 0

  // Try to match study_level from opportunity
  const oppLevel = opportunity.study_level ?? ''
  const oppRank = EDUCATION_RANK[oppLevel] ?? 0

  // No specific education required → full score
  if (oppRank === 0) return 100

  // User meets or exceeds → full score
  if (userRank >= oppRank) return 100

  // Partial credit based on proximity (25 points lost per gap level)
  const gap = oppRank - userRank
  return Math.max(0, 100 - gap * 25)
}

/**
 * Calculate experience match score.
 * Infer required experience from opportunity type and text.
 */
function scoreExperience(userLevel: string, opportunity: Opportunity): number {
  const userRank = EXPERIENCE_RANK[userLevel] ?? 0
  if (userRank === 0) return 50 // Unknown level → neutral

  // Infer required experience from opportunity type
  const oppText = `${opportunity.title} ${opportunity.description}`.toLowerCase()
  let requiredRank = 1 // default: entry-level

  if (opportunity.type === 'internship') {
    requiredRank = 1 // entry
  } else if (opportunity.type === 'scholarship' || opportunity.type === 'grant') {
    requiredRank = 1 // varies, default entry
  } else if (oppText.includes('senior') || oppText.includes('lead') || oppText.includes('manager')) {
    requiredRank = 4
  } else if (oppText.includes('mid-level') || oppText.includes('3+ years') || oppText.includes('5+ years')) {
    requiredRank = 3
  } else if (oppText.includes('junior') || oppText.includes('1+ year') || oppText.includes('2+ years')) {
    requiredRank = 2
  }

  if (userRank >= requiredRank) return 100

  const gap = requiredRank - userRank
  return Math.max(0, 100 - gap * 25)
}

/**
 * Calculate location eligibility score.
 * Checks if user's preferred location aligns with opportunity.
 */
function scoreLocation(profile: Profile, opportunity: Opportunity): number {
  // If opportunity is remote → everyone eligible
  if (opportunity.is_remote) return 100

  const oppLocation = (opportunity.location ?? '').toLowerCase()
  const userPref = (profile.preferred_opportunity_location ?? '').toLowerCase()

  // Remote preference + remote opportunity = perfect
  if (userPref.includes('remote') && opportunity.is_remote) return 100

  // International preference matches anything
  if (userPref.includes('international')) return 100

  // Local preference matches Sierra Leone opportunities
  if (userPref.includes('local') && oppLocation.includes('sierra leone')) return 100

  // Regional matches West Africa
  const westAfrica = ['sierra leone', 'ghana', 'nigeria', 'senegal', 'guinea', 'liberia']
  if (userPref.includes('regional') && westAfrica.some(c => oppLocation.includes(c))) return 100

  // Default: partial credit based on SL eligibility
  return opportunity.sl_eligible ? 70 : 30
}

/**
 * Main match calculation function.
 * Returns match_score (0-100) and match_label.
 */
export function calculateMatch(profile: Profile, opportunity: Opportunity): MatchResult {
  const skillsScore = scoreSkills(profile.skills ?? [], opportunity)
  const educationScore = scoreEducation(profile.education_level ?? '', opportunity)
  const experienceScore = scoreExperience(profile.experience_level ?? '', opportunity)
  const locationScore = scoreLocation(profile, opportunity)

  // Weighted average
  const matchScore = Math.round(
    skillsScore * WEIGHTS.skills +
    educationScore * WEIGHTS.education +
    experienceScore * WEIGHTS.experience +
    locationScore * WEIGHTS.location
  )

  return {
    match_score: matchScore,
    match_label: getMatchLabel(matchScore),
  }
}

/**
 * Get human-readable label from score.
 */
function getMatchLabel(score: number): MatchLabel {
  if (score >= 75) return 'Strong Match'
  if (score >= 55) return 'Good Match'
  if (score >= 35) return 'Moderate'
  return 'Low'
}

/**
 * Get complete match data for an opportunity card.
 * Handles login state + profile completeness.
 */
export function getMatchData(
  isLoggedIn: boolean,
  profile: Profile | null,
  opportunity: Opportunity
): MatchData {
  // Not logged in
  if (!isLoggedIn) {
    return {
      user_not_logged_in: true,
      profile_incomplete: false,
      match_score: null,
      match_label: null,
      display_text: '🔓 Login to see your match',
    }
  }

  // Profile incomplete
  if (!isProfileComplete(profile)) {
    return {
      user_not_logged_in: false,
      profile_incomplete: true,
      match_score: null,
      match_label: null,
      display_text: '📋 Complete your profile to see your match',
    }
  }

  // Calculate match
  const { match_score, match_label } = calculateMatch(profile!, opportunity)

  const emoji = match_score >= 75 ? '🔥' : match_score >= 55 ? '✅' : match_score >= 35 ? '⚠️' : '❌'

  return {
    user_not_logged_in: false,
    profile_incomplete: false,
    match_score,
    match_label,
    display_text: `${emoji} ${match_score}% ${match_label}`,
  }
}
