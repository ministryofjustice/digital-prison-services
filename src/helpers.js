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

module.exports = {
  linkOnClick,
}
