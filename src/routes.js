// This needs to be put into a centralised route config that is also used in App.js
// See: https://reacttraining.com/react-router/web/example/route-config
export default [
  { path: '/', breadcrumb: null },
  { path: '/establishment-roll/out-today', breadcrumb: 'Out today' },
  { path: '/establishment-roll/in-reception', breadcrumb: 'In reception' },
  { path: '/establishment-roll/en-route', breadcrumb: 'En route' },
  { path: '/establishment-roll/total-currently-out', breadcrumb: 'Total currently out' },
  { path: '/establishment-roll/:livingUnitId', breadcrumb: null },
]
