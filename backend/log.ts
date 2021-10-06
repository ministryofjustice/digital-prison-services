import Logger from 'bunyan'

export default new Logger({
  name: 'digital-prison-services',
  streams: [
    {
      stream: process.stdout,
      level: (process.env.LOG_LEVEL as Logger.LogLevel) || 'info',
    },
  ],
})
