const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => callback({ restaurants }))
  },

  getRestaurant: (req, res, callback) => {
    Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant =>
      callback({ restaurant: restaurant.toJSON() })
    )
  },

  postRestaurant: (req, res, callback) => {
    const restaurant = req.body
    const { file } = req
    if (!restaurant.name) {
      callback({ status: 'error', message: 'name field is required.' })
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log('Error: ', err)
        restaurant.image = file ? img.data.link : null
        return Restaurant.create(restaurant).then(restaurant => {
          callback({ status: 'success', message: `restaurant '${restaurant.name}' was created successfully!` })
        })
      })
    } else {
      restaurant.image = null
      return Restaurant.create(restaurant).then(restaurant => {
        callback({ status: 'success', message: `restaurant '${restaurant.name}' was created successfully!` })
      })
    }
  },

  putRestaurant: (req, res, callback) => {
    const update = req.body
    const { file } = req
    if (!update.name) {
      callback({ status: 'error', message: 'name field is required.' })
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log('Error: ', err)
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          update.image = file ? img.data.link : restaurant.image
          restaurant.update(update).then(restaurant => {
            callback({ status: 'success', message: `restaurant '${restaurant.name}' was updated successfully!` })
          })
        })
      })
    } else {
      Restaurant.findByPk(req.params.id).then(restaurant => {
        update.image = restaurant.image
        restaurant.update(update).then(restaurant => {
          callback({ status: 'success', message: `restaurant '${restaurant.name}' was updated successfully!` })
        })
      })
    }
  },

  deleteRestaurant: (req, res, callback) => {
    Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy().then(restaurant => {
        callback({ status: 'success', message: `restaurant '${restaurant.name}' was removed successfully!` })
      })
    })
  }
}

module.exports = adminService