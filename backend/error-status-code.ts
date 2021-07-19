// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'errorStatu... Remove this comment to see the full error message
const errorStatusCode = (error) => {
  if (error) {
    if (error.response && error.response.status) return error.response.status
    if (error.code === 'ECONNREFUSED') return 503
  }

  return 500
}

module.exports = errorStatusCode
