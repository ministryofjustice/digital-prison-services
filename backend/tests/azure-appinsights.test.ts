import { initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import applicationVersion from '../application-version'
import ignoreNotFoundErrors from '../telemetryProcessors/ignoreNotFound'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => ({
  initialiseTelemetry: jest.fn(),
  telemetry: {
    trackEvent: jest.fn(),
    processors: { enrichSpanNameWithHttpRoute: jest.fn() },
  },
}))

jest.mock('../telemetryProcessors/ignoreNotFound', () => ({ __esModule: true, default: jest.fn() }))

describe('azure-appinsights', () => {
  const originalConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  const originalDebug = process.env.DEBUG_TELEMETRY
  const builder = {
    addFilter: jest.fn().mockReturnThis(),
    addModifier: jest.fn().mockReturnThis(),
    startRecording: jest.fn(),
    setInstrumentations: jest.fn().mockReturnThis(),
    withProvider: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(initialiseTelemetry).mockReturnValue(builder)
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    delete process.env.DEBUG_TELEMETRY
  })

  afterEach(() => {
    if (originalConnectionString === undefined) delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    else process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = originalConnectionString
    if (originalDebug === undefined) delete process.env.DEBUG_TELEMETRY
    else process.env.DEBUG_TELEMETRY = originalDebug
  })

  const loadTelemetry = () => {
    let client: typeof telemetry
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      client = require('../azure-appinsights').default
    })
    return client
  }

  it('initialises with an explicit service identity and connection string', () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'InstrumentationKey=test-key'

    expect(loadTelemetry()).toBe(telemetry)

    expect(initialiseTelemetry).toHaveBeenCalledWith({
      serviceName: 'digital-prison-services',
      serviceVersion: applicationVersion.buildNumber,
      connectionString: 'InstrumentationKey=test-key',
      debug: false,
    })
    expect(builder.addFilter).toHaveBeenCalledWith(ignoreNotFoundErrors)
    expect(telemetry.processors.enrichSpanNameWithHttpRoute).toHaveBeenCalled()
    expect(builder.startRecording).toHaveBeenCalledTimes(1)
  })

  it('enables local debugging without requiring an instrumentation key', () => {
    process.env.DEBUG_TELEMETRY = 'true'

    loadTelemetry()

    expect(initialiseTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ connectionString: undefined, debug: true }),
    )
  })

  it('leaves recording disabled by default when there is no connection string', () => {
    loadTelemetry()

    expect(initialiseTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ connectionString: undefined, debug: false }),
    )
  })
})
