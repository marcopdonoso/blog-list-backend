const _ = require('lodash')

const dummy = () => {
	return 1
}

const totalLikes = blogs => {
	let likesAcc = 0
	blogs.map(blog => {
		likesAcc += blog.likes
	})

	return likesAcc
}

const favoriteBlog = blogs => {
	const reducer = (prev, curr) => {
		return prev.likes > curr.likes ? prev : curr
	}

	const mostLikedBlog =
		blogs.length === 0
			? { title: 'None', author: 'None', likes: 0 }
			: blogs.reduce(reducer)

	const { title, author, likes } = mostLikedBlog

	return { title, author, likes }
}

const mostBlogs = blogs => {
	const blogsCounterByAuthor = _.countBy(blogs, 'author')
	const authorNames = Object.keys(blogsCounterByAuthor)
	const numberOfBlogs = Object.values(blogsCounterByAuthor)
	const authorsArray = []

	authorNames.forEach((authorName, i) => {
		const authorObject = {}
		authorObject.author = authorName
		authorObject.blogs = numberOfBlogs[i]
		authorsArray.push(authorObject)
	})

	const mostBlogsAuthor = _.maxBy(authorsArray, 'blogs')

	return authorNames.length === 0
		? { author: 'None', blogs: 0 }
		: mostBlogsAuthor
}

const mostLikes = blogs => {
	const mostLikedAuthor =
		blogs.length === 0 ? { author: 'None', likes: 0 } : _.maxBy(blogs, 'likes')

	const { author, likes } = mostLikedAuthor

	return { author, likes }
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
}
