const canAccessProbationDocuments = (
  userRoles: [{ roleCode: string }],
  caseloads: [{ caseLoadId }],
  agencyId: string
): boolean => {
  const offenderInCaseload =
    caseloads && (caseloads as [{ caseLoadId: string }]).some((caseload) => caseload.caseLoadId === agencyId)
  const hasCorrectRole =
    userRoles && userRoles.find((role) => role.roleCode === 'VIEW_PROBATION_DOCUMENTS' || role.roleCode === 'POM')

  return offenderInCaseload && !!hasCorrectRole
}

export default canAccessProbationDocuments
