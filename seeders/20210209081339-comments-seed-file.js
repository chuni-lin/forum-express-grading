'use strict'
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await User.findAll({ raw: true })
    const restaurants = await Restaurant.findAll({ raw: true })
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 30 }).map(i =>
        ({
          text: faker.lorem.text().substring(0, 50),
          UserId: users[Math.floor(Math.random() * users.length)].id,
          RestaurantId: restaurants[Math.floor(Math.random() * restaurants.length)].id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
}
