import log from './log'

export const logError = (url, error, msg) => {
  if (error.response) {
    log.error(
      {
        url,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        stack: error.stack,
        data: error.response.body,
        message: error.message,
      },
      msg
    )
  } else if (error.request) {
    // request is too big and best skipped
    log.error(
      {
        url,
        code: error.code,
        stack: error.stack,
        message: error.message,
      },
      msg
    )
  } else {
    log.error(
      {
        url,
        stack: error.stack,
        message: error.message,
      },
      msg
    )
  }
}

export default {
  logError,
}
