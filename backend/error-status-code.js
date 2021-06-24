const errorStatusCode = (error) => {
  if (error) {
    if (error.response && error.response.status) return error.response.status
    if (error.code === 'ECONNREFUSED') return 503
  }

  return 500
}

module.exports = errorStatusCode
