module.exports = (complexData, key) => {
  if (!complexData || complexData.error) return null

  return key ? complexData.response[key] : complexData.response
}
