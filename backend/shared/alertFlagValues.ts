export const alertFlagLabels = [
  { alertCodes: ['HA'], classes: 'alert-status alert-status--self-harm', label: 'ACCT open' },
  {
    alertCodes: ['HA1'],
    classes: 'alert-status alert-status--self-harm',
    label: 'ACCT post closure',
  },
  {
    alertCodes: ['XSA', 'SA'],
    classes: 'alert-status alert-status--security',
    label: 'Staff assaulter',
  },
  {
    alertCodes: ['XA'],
    classes: 'alert-status alert-status--security',
    label: 'Arsonist',
  },
  {
    alertCodes: ['PEEP'],
    classes: 'alert-status alert-status--medical',
    label: 'PEEP',
  },
  {
    alertCodes: ['HID'],
    classes: 'alert-status alert-status--medical',
    label: 'Hidden disability',
  },
  { alertCodes: ['XEL'], classes: 'alert-status alert-status--elist', label: 'E-list' },
  {
    alertCodes: ['XRF'],
    classes: 'alert-status alert-status--security',
    label: 'Risk to females',
  },
  { alertCodes: ['XTACT'], classes: 'alert-status alert-status--security', label: 'TACT' },
  {
    alertCodes: ['XCO'],
    classes: 'alert-status alert-status--security',
    label: 'Corruptor',
  },
  {
    alertCodes: ['XCA'],
    classes: 'alert-status alert-status--security',
    label: 'Chemical attacker',
  },
  {
    alertCodes: ['XCI'],
    classes: 'alert-status alert-status--security',
    label: 'Concerted indiscipline',
  },
  { alertCodes: ['XR'], classes: 'alert-status alert-status--security', label: 'Racist' },
  {
    alertCodes: ['RTP', 'RLG'],
    classes: 'alert-status alert-status--risk',
    label: 'Risk to LGBT',
  },
  {
    alertCodes: ['XHT'],
    classes: 'alert-status alert-status--security',
    label: 'Hostage taker',
  },
  {
    alertCodes: ['XCU'],
    classes: 'alert-status alert-status--security',
    label: 'Controlled unlock',
  },
  {
    alertCodes: ['XGANG'],
    classes: 'alert-status alert-status--security',
    label: 'Gang member',
  },
  { alertCodes: ['CSIP'], classes: 'alert-status alert-status--other', label: 'CSIP' },
  { alertCodes: ['F1'], classes: 'alert-status alert-status--ex-armed-forces', label: 'Veteran' },
  {
    alertCodes: ['LCE'],
    classes: 'alert-status alert-status--care-leaver',
    label: 'Care experienced',
  },
  {
    alertCodes: ['RNO121'],
    classes: 'alert-status alert-status--risk',
    label: 'No one-to-one',
  },
  { alertCodes: ['RCON'], classes: 'alert-status alert-status--risk', label: 'Conflict' },
  {
    alertCodes: ['RCDR'],
    classes: 'alert-status alert-status--quarantined',
    label: 'Quarantined',
  },
  {
    alertCodes: ['URCU'],
    classes: 'alert-status alert-status--reverse-cohorting-unit',
    label: 'Reverse Cohorting Unit',
  },
  {
    alertCodes: ['UPIU'],
    classes: 'alert-status alert-status--protective-isolation-unit',
    label: 'Protective Isolation Unit',
  },
  { alertCodes: ['USU'], classes: 'alert-status alert-status--shielding-unit', label: 'Shielding Unit' },
  { alertCodes: ['URS'], classes: 'alert-status alert-status--refusing-to-shield', label: 'Refusing to shield' },
  { alertCodes: ['RKS'], classes: 'alert-status alert-status--risk-to-known-adults', label: 'Risk to known adults' },
  { alertCodes: ['VIP'], classes: 'alert-status alert-status--isolated-prisoner', label: 'Isolated' },
  { alertCodes: ['PVN'], classes: 'alert-status alert-status--multicase alert-status--visor', label: 'ViSOR' },
].sort((a, b) => a.label.localeCompare(b.label))

export const cellMoveAlertCodes = [
  'PEEP',
  'RTP',
  'RLG',
  'RCON',
  'XHT',
  'XGANG',
  'XR',
  'XA',
  'XEL',
  'CSIP',
  'URCU',
  'UPIU',
  'USU',
  'URS',
  'RKS',
  'VIP',
  'HA',
  'HA1',
  'RTP',
  'PVN',
]

export const profileAlertCodes = [
  'HA',
  'HA1',
  'XSA',
  'XA',
  'PEEP',
  'HID',
  'XEL',
  'XRF',
  'XTACT',
  'XCO',
  'XCA',
  'XCI',
  'XR',
  'RTP',
  'RLG',
  'XHT',
  'XCU',
  'XGANG',
  'CSIP',
  'F1',
  'LCE',
  'RNO121',
  'RCON',
  'RCDR',
  'URCU',
  'UPIU',
  'USU',
  'URS',
  'PVN',
  'RKS',
  'VIP',
]

export type AlertLabelFlag = {
  label: string
  classes: string
}

export default {
  alertFlagLabels,
  cellMoveAlertCodes,
  profileAlertCodes,
}
