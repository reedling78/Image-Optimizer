module.exports = {
	dev: {
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		database : 'shared_content',
		multipleStatements: true
	},
	beta: {
		host     : 'main.db.myfonts-beta.com',
		user     : 'dev_user',
		password : '7PgrDw8sXn3KBJVqG9G2TqeA',
		database : 'shared_content',
		multipleStatements: true,
		connectTimeout: 10000000000000000
	}
}