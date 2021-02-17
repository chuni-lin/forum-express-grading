const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helper = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  // profile
  getUser: (req, res) => {
    const UserId = req.params.id
    User.findByPk(UserId, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ],
    }).then(user => {
      const userJSON = user.toJSON()
      const profile = {
        id: userJSON.id,
        name: userJSON.name,
        email: userJSON.email,
        image: userJSON.image
      }
      const followings = userJSON.Followings
      const followers = userJSON.Followers
      const FavoritedRestaurants = userJSON.FavoritedRestaurants

      const allCommentedRests = userJSON.Comments.map(comment => comment.Restaurant)
      const uniqueRests = Array.from(new Set(allCommentedRests
        .map(item => item.id)))
        .map(id => allCommentedRests.find(item => item.id === id))

      return res.render('profile', {
        profile,
        countOfFollowings: followings.length,
        followings,
        countOfFollowers: followers.length,
        followers,
        countOfComments: userJSON.Comments.length,
        countOfCommentRests: uniqueRests.length,
        commentedRestaurants: uniqueRests,
        countOfFavoritedRests: FavoritedRestaurants.length,
        FavoritedRestaurants
      })
    })
  },

  editUser: (req, res) => {
    User.findByPk(req.params.id).then(user =>
      res.render('editProfile', { user: req.user, profile: user.toJSON() })
    )
  },

  putUser: (req, res) => {
    const { id } = req.params
    const update = req.body
    const { file } = req
    if (!update.name) {
      req.flash('error_messages', "Name field is required.")
      return res.redirect('back')
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log('Error: ', err)
        return User.findByPk(id).then(user => {
          update.image = file ? img.data.link : user.image
          user.update(update).then(user => {
            req.flash('success_messages', `User '${user.name}' was updated successfully!`)
            res.redirect(`/users/${user.id}`)
          })
        })
      })
    } else {
      User.findByPk(id).then(user => {
        update.image = user.image
        user.update(update).then(user => {
          req.flash('success_messages', `User '${user.name}' was updated successfully!`)
          res.redirect(`/users/${user.id}`)
        })
      })
    }
  },

  addFavorite: (req, res) => {
    const UserId = helper.getUser(req).id
    const { RestaurantId } = req.params
    Favorite.create({ UserId, RestaurantId }).then(() =>
      res.redirect('back')
    )
  },

  removeFavorite: (req, res) => {
    const UserId = helper.getUser(req).id
    const { RestaurantId } = req.params
    Favorite.findOne({ where: { UserId, RestaurantId } }).then(favorite =>
      favorite.destroy().then(() => res.redirect('back'))
    )
  },

  like: (req, res) => {
    const UserId = helper.getUser(req).id
    const RestaurantId = req.params.restaurantId
    Like.create({ UserId, RestaurantId })
      .then(() => res.redirect('back'))
  },

  unlike: (req, res) => {
    const UserId = helper.getUser(req).id
    const RestaurantId = req.params.restaurantId
    Like.findOne({ where: { UserId, RestaurantId } }).then(like =>
      like.destroy().then(() => res.redirect('back'))
    )
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  }
}



module.exports = userController