const path = require('path')
const asyncMiddleware = require('../middleware/asyncHandler')
const log = require('../log')

const rootDirectory = process.cwd()
const placeHolder = path.join(rootDirectory, '/static/images/image-missing.jpg')

const imageFactory = (prisonApi) => {
  const image = asyncMiddleware(async (req, res) => {
    const { imageId } = req.params

    if (!imageId) {
      res.sendFile(placeHolder)
    } else {
      prisonApi
        .getImage(res.locals, imageId)
        .then((data) => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch((error) => {
          // Not Found 404 is an acceptable response.
          // It has been logged as part of the client call,
          // no need to repeat here.
          if (error.status !== 404) {
            log.error(error)
          }
          res.sendFile(placeHolder)
        })
    }
  })

  const prisonerImage = asyncMiddleware(async (req, res) => {
    const { offenderNo } = req.params
    const { fullSizeImage } = req.query

    if (!offenderNo || offenderNo === 'placeholder') {
      res.sendFile(placeHolder)
    } else {
      prisonApi
        .getPrisonerImage(res.locals, offenderNo, fullSizeImage)
        .then((data) => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch((error) => {
          // Not Found 404 is an acceptable response.
          // It has been logged as part of the client call,
          // no need to repeat here.
          if (error.status !== 404) {
            log.error(error)
          }
          res.sendFile(placeHolder)
        })
    }
  })

  return {
    image,
    prisonerImage,
  }
}

module.exports = {
  imageFactory,
}
