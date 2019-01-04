const fieldComparator = fieldExtractor => (a, b) => {
  const x = fieldExtractor(a)
  const y = fieldExtractor(b)
  if (x === y) return 0
  return x < y ? -1 : 1
}

const thenComparing = (compareFirst, compareNext) => (a, b) => {
  const res = compareFirst(a, b)
  return res !== 0 ? res : compareNext(a, b)
}

const lastNameComparator = thenComparing(
  thenComparing(fieldComparator(obj => obj.lastName), fieldComparator(obj => obj.firstName)),
  fieldComparator(obj => obj.offenderNo)
)

export { fieldComparator, thenComparing, lastNameComparator }
