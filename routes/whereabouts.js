var express = require('express')
var router = express.Router()

/* GET Whereabouts page. */
router.get('/', function(req, res, next) {
  res.render('whereabouts', { title: 'Whereabouts' })
})

module.exports = router
