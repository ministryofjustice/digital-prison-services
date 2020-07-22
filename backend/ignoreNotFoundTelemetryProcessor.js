module.exports = function ignoreNotFoundErrors(envelope) {
  if (envelope && envelope.data && envelope.data.baseData) {
    if (envelope.data.baseType === 'RemoteDependencyData' && envelope.data.baseData.resultCode === '404') return false
    if (envelope.data.baseType === 'RequestData' && envelope.data.baseData.responseCode === '404') return false
  }

  return true
}
