import asyncMiddleware from '../middleware/asyncHandler'
import log from '../log'

const placeHolderImagePath = '/images/image-missing.jpg'

export const imageFactory = (prisonApi) => {
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
          res.set('Cache-control', 'private, max-age=86400')
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

export default {
  imageFactory,
}
