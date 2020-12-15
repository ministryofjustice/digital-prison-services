module.exports = (req, res) => res.render('notFound.njk', { url: req.headers.referer || '/' })
