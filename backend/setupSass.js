const express = require('express')
const path = require('path')
const sass = require('node-sass-middleware')

const router = express.Router()

module.exports = () => {
  router.use(
    sass({
      src: path.join(__dirname, '../sass'),
      dest: path.join(__dirname, '../build/static/stylesheets'),
      outputStyle: 'compressed',
      prefix: '/stylesheets',
    })
  )
  router.use(
    sass({
      src: path.join(__dirname, '../views/components'),
      dest: path.join(__dirname, '../build/static/stylesheets'),
      outputStyle: 'compressed',
      prefix: '/stylesheets',
    })
  )

  return router
}
