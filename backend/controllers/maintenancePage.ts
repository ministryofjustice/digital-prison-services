import asyncMiddleware from '../middleware/asyncHandler'

export default (title) =>
  asyncMiddleware(async (req, res) => {
    return res.render('maintenancePage.njk', { title })
  })
