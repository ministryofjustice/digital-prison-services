export default ({ notificationCookie }) =>
  async (req, res) => {
    const { id, revision } = req.body || {}

    if (!req.xhr) return res.redirect('/')
    if (!id || !revision) {
      res.status(400)
      return res.end()
    }

    notificationCookie.markAsDismissed(res, { id, revision })

    res.status(200)

    return res.end()
  }
