const dummy = blogs => {
	return 1
}

const totalLikes = blogs => {
	let likesAcc = 0
	blogs.map(blog => {
		likesAcc += blog.likes
	})

	return likesAcc
}

module.exports = {
	dummy,
	totalLikes,
}
