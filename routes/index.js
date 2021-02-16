const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  //如果使用者訪問首頁，就導向 /restaurants 的頁面
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))

  //在 /restaurants 底下則交給 restController.getRestaurants 來處理
  app.get('/restaurants', authenticated, restController.getRestaurants)

  // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))

  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)

  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  // categories
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)

  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)

  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  // rest
  app.get('/restaurants/top', authenticated, restController.getTop10Rests)
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  app.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

  // comment
  app.post('/comments', authenticated, commentController.postComment)
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

  // users
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.putUsers)

  // user profile
  app.get('/users/top', authenticated, userController.getTopUser)
  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
  app.post('/following/:userId', authenticated, userController.addFollowing)
  app.delete('/following/:userId', authenticated, userController.removeFollowing)

  // favorite
  app.post('/favorite/:RestaurantId', authenticated, userController.addFavorite)
  app.delete('/favorite/:RestaurantId', authenticated, userController.removeFavorite)

  // likes
  app.post('/like/:restaurantId', authenticated, userController.like)
  app.delete('/like/:restaurantId', authenticated, userController.unlike)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}
