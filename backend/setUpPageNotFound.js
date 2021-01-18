module.exports = (req, res) => {
  res.status(404)
  res.render('notFound.njk', { url: req.headers.referer || '/' })
}
