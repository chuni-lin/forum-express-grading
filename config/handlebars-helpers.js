const formatDistanceToNow = require('date-fns/formatDistanceToNow')

module.exports = {
  ifSame: function (v1, v2, options) {
    return (v1 === v2) ? options.fn(this) : options.inverse(this)
  },
  formatDistanceToNow: function (a) {
    return formatDistanceToNow(a)
  }
}
