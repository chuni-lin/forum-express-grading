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
}

module.exports = categoryService