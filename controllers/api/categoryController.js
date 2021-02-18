const categoryService = require('../../services/categoryService')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => res.json(data))
  },

  postCategory: (req, res) => {
    categoryService.postCategory(req, res, (data) => res.json(data))
  },
}
module.exports = categoryController