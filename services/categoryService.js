const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    const { id } = req.params
    Category.findAll({ raw: true, nest: true }).then(categories => {
      if (id) {
        const category = categories.find(item => item.id.toString() === id)
        return res.render('admin/categories', { categories, category })
      }
      return callback({ categories })
    })
  },

  postCategory: (req, res, callback) => {
    const category = req.body
    if (!category.name) {
      return callback({ status: 'error', message: 'name didn\'t exist' })
    }
    Category.create(category).then(category => {
      callback({ status: 'success', message: `category '${category.name}' was created successfully!` })
    })
  },
}

module.exports = categoryService