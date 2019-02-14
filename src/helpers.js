const linkOnClick = handlerFn => {
  if (!handlerFn) return null

  return {
    tabIndex: 0,
    role: 'link',
    onClick: handlerFn,
    onKeyDown: event => {
      if (event.key === 'Enter') handlerFn(event)
    },
  }
}

const groupBy = (list, keyGetter) => {
  const map = new Map()
  list.forEach(item => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

module.exports = {
  linkOnClick,
  groupBy,
}
