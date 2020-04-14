const path = require('path')
const asyncMiddleware = require('../middleware/asyncHandler')
const log = require('../log')

const prisonerImageFactory = elite2Api => {
  const prisonerImage = asyncMiddleware(async (req, res) => {
    const placeHolder = path.join(__dirname, '../assets/images/image-missing.jpg')
    const { offenderNo } = req.params
    const { fullSizeImage } = req.query

    if (!offenderNo || offenderNo === 'placeholder') {
      res.sendFile(placeHolder)
    } else {
      elite2Api
        .getPrisonerImage(res.locals, offenderNo, fullSizeImage)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(error => {
          log.error(error)
          res.sendFile(placeHolder)
        })
    }
  })

  return {
    prisonerImage,
  }
}

module.exports = {
  prisonerImageFactory,
}
