module.exports = () => {
  const renderTemplate = (req, res) => {
    const { multipleDeleted } = req.query

    return res.render('appointmentDeleted.njk', {
      multipleDeleted: multipleDeleted === 'true',
    })
  }

  const index = async (req, res) => renderTemplate(req, res)

  return { index }
}
