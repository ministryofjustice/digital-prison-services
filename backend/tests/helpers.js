const makeError = (key, value) =>
  new class TestError extends Error {
    constructor() {
      super()
      this[key] = value
    }
  }()

const makeResetError = () => makeError('code', 'ECONNRESET')

export { makeError, makeResetError }
