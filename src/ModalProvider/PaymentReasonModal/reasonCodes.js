export const getHouseBlockReasons = () => [
  { value: 'Acceptable absence', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' }, commentRequired: true },
  {
    value: 'F35 Certificate (Medical)',
    mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' },
    commentRequired: true,
  },
  { value: 'Not Required', mapping: { eventOutcome: 'NREQ', performance: 'STANDARD' }, commentRequired: false },
  { value: 'Refused', mapping: { eventOutcome: 'UNACAB', performance: 'UNACCEPT' }, commentRequired: true },
  { value: 'Rest In Cell', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' }, commentRequired: false },
  { value: 'Session Cancelled', mapping: { eventOutcome: 'CANC', performance: 'STANDARD' }, commentRequired: false },
  {
    value: 'Unacceptable Performance',
    mapping: { eventOutcome: 'ATT', performance: 'UNACCEPT' },
    commentRequired: true,
  },
]

export const getActivityListReasons = () => [
  { value: 'Acceptable absence', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' }, commentRequired: true },
  {
    value: 'F35 Certificate (Medical)',
    mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' },
    commentRequired: true,
  },
  { value: 'Not Required', mapping: { eventOutcome: 'NREQ', performance: 'STANDARD' }, commentRequired: false },
  { value: 'Refused', mapping: { eventOutcome: 'UNACAB', performance: 'UNACCEPT' }, commentRequired: true },
  { value: 'Session Cancelled', mapping: { eventOutcome: 'CANC', performance: 'STANDARD' }, commentRequired: false },
  {
    value: 'Unacceptable Performance',
    mapping: { eventOutcome: 'ATT', performance: 'UNACCEPT' },
    commentRequired: true,
  },
]
