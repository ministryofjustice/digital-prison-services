module.exports = (type, array, key) => {
  const value = array && array.length > 0 ? array.find(item => item.type === type) : array

  return value && value[key]
}
