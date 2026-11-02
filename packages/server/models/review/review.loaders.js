const Review = require('./review.model')

const reviewUsersLoader = async reviews => Review.getUsersOfReviews(reviews)

module.exports = {
  reviewUsersLoader,
}
