import axios from 'axios'

export const hasAnyRole = (requiredRoles: string[], userRoles: string[]): boolean =>
  requiredRoles.some((role) => userRoles.includes(role))

export const checkRPHomepage = (url: string): Promise<boolean> => axios.get(url).then((res) => res.status !== 401)
