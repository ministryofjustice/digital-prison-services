

export const getHouseBlockReasons = () => [
  { value: 'Acceptable absence', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' } },
  { value: 'F35 Certificate (Medical)', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' } },
  { value: 'Not Required', mapping: { eventOutcome: 'NREQ', performance: 'STANDARD' } },
  { value: 'Refused', mapping: { eventOutcome: 'UNACAB', performance: 'UNACCEPT' } },
  { value: 'Rest In Cell', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' } },
  { value: 'Session Cancelled', mapping: { eventOutcome: 'CANC', performance: 'STANDARD' } },
  { value: 'Unacceptable Performance', mapping: { eventOutcome: 'ATT', performance: 'UNACCEPT' } }
];

export const getActivityListReasons = () => [
  { value: 'Acceptable absence', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' } },
  { value: 'F35 Certificate (Medical)', mapping: { eventOutcome: 'ACCAB', performance: 'STANDARD' } },
  { value: 'Not Required', mapping: { eventOutcome: 'NREQ', performance: 'STANDARD' } },
  { value: 'Refused', mapping: { eventOutcome: 'UNACAB', performance: 'UNACCEPT' } },
  { value: 'Session Cancelled', mapping: { eventOutcome: 'CANC', performance: 'STANDARD' } },
  { value: 'Unacceptable Performance', mapping: { eventOutcome: 'ATT', performance: 'UNACCEPT' } }
];
