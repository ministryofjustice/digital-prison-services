// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'asyncMiddl... Remove this comment to see the full error message
const asyncMiddleware = require('../middleware/asyncHandler')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'log'.
const log = require('../log')

const placeHolderImagePath = '/images/image-missing.jpg'

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'imageFacto... Remove this comment to see the full error message
const imageFactory = (prisonApi) => {
  const image = asyncMiddleware(async (req, res) => {
    const { imageId } = req.params

    if (!imageId) {
      res.redirect(placeHolderImagePath)
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
          res.redirect(placeHolderImagePath)
        })
    }
  })

  const prisonerImage = asyncMiddleware(async (req, res) => {
    const { offenderNo } = req.params
    const { fullSizeImage } = req.query

    if (!offenderNo || offenderNo === 'placeholder') {
      res.redirect(placeHolderImagePath)
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
          res.redirect(placeHolderImagePath)
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
