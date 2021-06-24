const whereaboutsTasks = [
  {
    id: 'view-residential-location',
    heading: 'View by residential location',
    description: 'View all activities for people living in a residential location.',
    href: '/manage-prisoner-whereabouts/select-residential-location',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-activity-location',
    heading: 'View by activity or appointment location',
    description: 'View all activities in an activity or appointment location.',
    href: '/manage-prisoner-whereabouts/select-location',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-all-appointments',
    heading: 'View all appointments',
    description: 'View all appointments in your establishment.',
    href: '/view-all-appointments',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-unaccounted-for',
    heading: 'View prisoners unaccounted for',
    description: 'View all prisoners not marked as attended or not attended.',
    href: '/manage-prisoner-whereabouts/prisoners-unaccounted-for',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-attendance-statistics',
    heading: 'View attendance reason statistics',
    description: 'View a breakdown of attendance statistics.',
    href: '/manage-prisoner-whereabouts/attendance-reason-statistics',
    roles: null,
    enabled: true,
  },
]

module.exports = () => async (req, res) =>
  res.render('whereabouts/whereaboutsHomepage.njk', {
    tasks: whereaboutsTasks.filter((task) => task.enabled).map(({ roles, enabled, ...task }) => task),
  })
