// This needs to be put into a centralised route config that is also used in App.js
// See: https://reacttraining.com/react-router/web/example/route-config
export default [
  { path: '/', breadcrumb: null },
  // Below are temporary as latest version of react-router-breadcrumbs-hoc leaves hyphens in the breadcrumb text
  { path: '/manage-prisoner-whereabouts', breadcrumb: 'Prisoner whereabouts' },
  { path: '/manage-prisoner-whereabouts/housing-block-results', breadcrumb: 'Housing block results' },
  { path: '/manage-prisoner-whereabouts/activity-results', breadcrumb: 'Activity results' },
  { path: '/manage-prisoner-whereabouts/prisoners-unaccounted-for', breadcrumb: 'Prisoners unaccounted for' },
]
