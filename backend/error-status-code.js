const errorStatusCode = (error) => {
  if (error && error.response) {
    return error.response.status;
  }

  if (error && error.code === 'ECONNREFUSED') {
    return 503;
  }

  return 500;
};

module.exports = errorStatusCode;
