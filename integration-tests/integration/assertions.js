const assertHasRequestCount = count => response => {
  const result = JSON.parse(response.text)
  console.clear()
  console.error(response)
  console.error(result)
  expect(result.count).to.equal(count)
}

module.exports = {
  assertHasRequestCount,
}
