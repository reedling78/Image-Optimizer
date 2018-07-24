var express = require('express'),
	router = express.Router(),
	mysql = require('mysql'),
	dbCred = require('../configs/db.js').dev,
	connection = mysql.createConnection(dbCred),
	take = 10,
	scrub = require('../bin/scrubber-functions');


connection.connect();

router.get('/:pagenum', function(req, res, next) {
	req.setTimeout(10000000) // no timeout

	

	var pagenum = req.params.pagenum || 1,
		skip = pagenum * take,
		q = "SELECT count( * ) AS 'total' FROM Artwork; SELECT * FROM Artwork LIMIT " + skip + ", " + take;

	connection.query(q, function (error, results, fields) {
		if (error) { throw error };
		console.log('SQL query complete');
		
		scrub.prepData(results[1]);
		console.log('Data preped');

		scrub.prepFileSystem();
		console.log('Local directory structure built');

		//connection.end();

		scrub.weighAndMeasure(0,0,function(){
			res.render('scrubber', { 
				title: 'Image Optimizer',
				imageCountFormated: results[0][0].total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
				rows: scrub.data,
				take: take,
				rowsCount: results[0][0].total,
				pageCount: Math.ceil(results[0][0].total/take)
			});
		});

	});

});

module.exports = router;