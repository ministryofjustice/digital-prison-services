import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
   allowlist: {
  "node_modules/@parcel/watcher@2.5.1": "ALLOW",
  "node_modules/core-js@2.6.12": "FORBID",
  "node_modules/cypress@13.17.0": "ALLOW",
  "node_modules/dtrace-provider@0.8.8": "ALLOW",
  "node_modules/fsevents@2.3.3": "ALLOW",
  "node_modules/react-final-form@4.1.0": "ALLOW"
},
})
