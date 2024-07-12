import config from '../../config'

export default (req, res) => {
  return res.render('cellMove/cellMovesHasMovedPage', {
    changeSomeonesCellUrl: config.apis.changeSomeonesCell.ui_url,
  })
}
