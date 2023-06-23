import { hasAnyRole } from '../../shared/permissions'
import config from '../../config'

const {
  apis: { activities, appointments },
} = config

type TaskType = {
  id: string
  heading: string
  href: string
  description: string
  enabled: (args: { roles: string[] }) => boolean
}

const isEnabled = (): boolean => true

export const whereaboutsTasks: TaskType[] = [
  {
    id: 'view-residential-location',
    heading: 'View by residential location',
    description: 'View all activities for people living in a residential location.',
    href: '/manage-prisoner-whereabouts/select-residential-location',
    enabled: isEnabled,
  },
  {
    id: 'view-activity-location',
    heading: 'View by activity or appointment location',
    description: 'View all activities in an activity or appointment location.',
    href: '/manage-prisoner-whereabouts/select-location',
    enabled: isEnabled,
  },
  {
    id: 'view-all-appointments',
    heading: 'View all appointments',
    description: 'View all appointments in your establishment.',
    href: '/view-all-appointments',
    enabled: isEnabled,
  },
  {
    id: 'view-unaccounted-for',
    heading: 'View prisoners unaccounted for',
    description: 'View all prisoners not marked as attended or not attended.',
    href: '/manage-prisoner-whereabouts/prisoners-unaccounted-for',
    enabled: isEnabled,
  },
  {
    id: 'view-attendance-statistics',
    heading: 'View attendance reason statistics',
    description: 'View a breakdown of attendance statistics.',
    href: '/manage-prisoner-whereabouts/attendance-reason-statistics',
    enabled: isEnabled,
  },
  {
    id: 'view-people-due-to-leave',
    heading: 'People due to leave',
    description: 'View people due to leave this establishment for court appearances, transfers or being released.',
    href: '/manage-prisoner-whereabouts/scheduled-moves',
    enabled: isEnabled,
  },
  {
    id: 'view-covid-units',
    heading: 'View COVID units',
    description: 'View who is in each COVID unit in your establishment.',
    href: '/current-covid-units',
    enabled: ({ roles }) => hasAnyRole(['PRISON'], roles),
  },
  {
    id: 'view-bulk-appointments',
    heading: 'Add bulk appointments',
    description: 'Upload a spreadsheet to add appointments for multiple people.',
    href: '/bulk-appointments/need-to-upload-file',
    enabled: ({ roles }) => hasAnyRole(['BULK_APPOINTMENTS'], roles),
  },
]

export default ({ oauthApi, prisonApi }: any) => {
  const index = async (req, res) => {
    const { activeCaseLoadId, staffId } = req.session.userDetails
    const userRoles = oauthApi.userRoles(res.locals)
    const staffRoles = await prisonApi.getStaffRoles(res.locals, staffId, activeCaseLoadId)

    if (
      activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
      appointments.enabled_prisons.split(',').includes(activeCaseLoadId)
    ) {
      res.redirect('/')
    }

    const oauthRoles = userRoles.map((userRole) => userRole.roleCode)
    const prisonStaffRoles = staffRoles.map((staffRole) => staffRole.role)
    const roles = [...oauthRoles, ...prisonStaffRoles]

    res.render('whereabouts/whereaboutsHomepage.njk', {
      tasks: whereaboutsTasks.filter((task) => task.enabled({ roles })).map(({ enabled, ...task }) => task),
    })
  }

  return {
    index,
  }
}
