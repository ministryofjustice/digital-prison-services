// eslint-disable-next-line import/prefer-default-export
export const hasAnyRole = (requiredRoles: string[], userRoles: string[]): boolean =>
  requiredRoles.some((role) => userRoles.includes(role))
