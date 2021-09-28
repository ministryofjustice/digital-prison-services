import Logger from 'bunyan'

export default new Logger({
  name: 'prisonStaffHub',
  streams: [
    {
      stream: process.stdout,
      level: (process.env.LOG_LEVEL as Logger.LogLevel) || 'info',
    },
  ],
})
