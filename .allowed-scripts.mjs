import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    'node_modules/@parcel/watcher@2.5.1': 'ALLOW',
    'node_modules/core-js@2.6.12': 'FORBID',
    'node_modules/cypress@15.16.0': 'ALLOW',
    'node_modules/dtrace-provider@0.8.8': 'ALLOW',
    'node_modules/fsevents@2.3.3': 'ALLOW',
    'node_modules/react-final-form@4.1.0': 'ALLOW',
    'node_modules/protobufjs@8.0.1': 'ALLOW',
    'node_modules/@grpc/proto-loader/node_modules/protobufjs@7.6.4': 'ALLOW',
  },
})
