import { app } from '../config'

export const canViewNeurodivergenceSupportData = (agencyId: string, enabledPrisons): boolean => {
  let canViewNeurodivergenceData = true
  if (agencyId && enabledPrisons.length) {
    canViewNeurodivergenceData = enabledPrisons?.includes(agencyId)
  }
  return canViewNeurodivergenceData
}

export const createFlaggedContent = <T>(content: T) => ({
  enabled: app.esweEnabled,
  content,
})

export default {
  canViewNeurodivergenceSupportData,
  createFlaggedContent,
}
