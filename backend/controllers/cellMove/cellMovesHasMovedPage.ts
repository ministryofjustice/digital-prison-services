import config from '../../config'

export default (req, res) => {
  const { activeCaseLoad } = res.locals.user

  return res.render('cellMove/cellMovesHasMovedPage', {
    changeSomeonesCellUrl: config.apis.changeSomeonesCell.ui_url,
  })
}
