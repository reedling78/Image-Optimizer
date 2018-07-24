var fs = require("fs"),
	rimraf = require('rimraf'),
	request = require('request'),
	_ = require('underscore-node'),
	imagemin = require('imagemin'),
	imageminJpegtran = require('imagemin-jpegtran'),
	imageminPngquant = require('imagemin-pngquant'),
	take = 10,
	dimensionArray = ['1440x720', '400x400', '600x375','36x18','72x36','200x200','original','640x320','960x480','298x149','596x298','75x75','220x220','100x100','720x360','120x120','110x110'];

var bitwise = function(id, num) {
	return (id >> num); 
}

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

var getExtension = function(mimeType){
	var ext = 'png';

	switch(mimeType) {
	    case 'image/gif':
	        ext = 'gif';
	        break;
	    case 'image/png':
	        ext = 'png';
	        break;
        case 'image/jpeg':
	        ext = 'jpg';
	        break;
	    default:
	        ext = 'png'
	}

	return ext;
}

function download(imgObj, callback){
	return request.head(imgObj.path, function(err, res, body){

		if (!fs.existsSync('./images/src/s/aw/' + imgObj.dimension + '/' + imgObj.bit1)) {
			fs.mkdirSync('./images/src/s/aw/' + imgObj.dimension + '/' + imgObj.bit1);

			if (!fs.existsSync('./images/src/s/aw/' + imgObj.dimension + '/' + imgObj.bit1 + '/' + imgObj.bit2)) {
				fs.mkdirSync('./images/src/s/aw/' + imgObj.dimension + '/' + imgObj.bit1 + '/' + imgObj.bit2);
			}
		}

		if (!fs.existsSync('./images/min/s/aw/' + imgObj.dimension + '/' + imgObj.bit1)) {
			fs.mkdirSync('./images/min/s/aw/' + imgObj.dimension + '/' + imgObj.bit1);

			if (!fs.existsSync('./images/min/s/aw/' + imgObj.dimension + '/' + imgObj.bit1 + '/' + imgObj.bit2)) {
				fs.mkdirSync('./images/min/s/aw/' + imgObj.dimension + '/' + imgObj.bit1 + '/' + imgObj.bit2);
			}
		}

		request(imgObj.path).pipe(fs.createWriteStream('images/src/' + imgObj.optimizedPath)).on('close', function() {
			
			imagemin(['images/src/' + imgObj.optimizedPath], 'images/min/' + imgObj.optimizedPathNoFile, {
			    plugins: [
			        imageminJpegtran({
			        	progressive: true,
    					arithmetic: false
			        }),
			        imageminPngquant({
			        	quality: '70-80'
			        })
			    ]
			}).then(files => {
				console.log('images/min/' + imgObj.optimizedPath);
			    callback(err, res, body);
			});

		});

	});
};

var code = {

	data: [],

	prepData : function (d) {
		_.each(d, function(row, inc){
			row.images = [];
			_.each(dimensionArray, function(dimension){
				var imagePath = 'http://cdn.myfonts.net/s/aw/' + dimension + '/' + bitwise(row.ArtworkID, 9) + '/' + bitwise(row.ArtworkID, 18) + '/' + row.ArtworkID +'.' + getExtension(row.MimeType),
					originalPath = 's/aw/' + dimension + '/' + bitwise(row.ArtworkID, 9) + '/' + bitwise(row.ArtworkID, 18) + '/' + row.ArtworkID +'.' + getExtension(row.MimeType),
					optimizedPath = 's/aw/' + dimension + '/' + bitwise(row.ArtworkID, 9) + '/' + bitwise(row.ArtworkID, 18) + '/' + row.ArtworkID +'.' + getExtension(row.MimeType),
					optimizedPathNoFile = 's/aw/' + dimension + '/' + bitwise(row.ArtworkID, 9) + '/' + bitwise(row.ArtworkID, 18) + '/'
					item = {
						path: imagePath,
						originalPath: originalPath,
						optimizedPath: optimizedPath,
						optimizedPathNoFile: optimizedPathNoFile,
						dimension: dimension,
						bit1: bitwise(row.ArtworkID, 9),
						bit2 : bitwise(row.ArtworkID, 18)
					};
				row.images.push(item);
			});
		});

		code.data = d;
	},

	prepFileSystem: function(){
		rimraf('./images', function () { 
			fs.mkdirSync('./images');
			fs.mkdirSync('./images/src');
			fs.mkdirSync('./images/src/s');
			fs.mkdirSync('./images/src/s/aw');

			fs.mkdirSync('./images/min');
			fs.mkdirSync('./images/min/s');
			fs.mkdirSync('./images/min/s/aw');

			_.each(dimensionArray, function(dimension){
				fs.mkdirSync('./images/src/s/aw/' + dimension);
				fs.mkdirSync('./images/min/s/aw/' + dimension);
			});
		});
	},

	weighAndMeasure: function(dataInc, imageInc, callback){
		if (_.isArray(code.data)) {
			if (_.isObject(code.data[dataInc])) {
				if (_.isArray(code.data[dataInc].images)) {
					if (_.isObject(code.data[dataInc].images[imageInc])) {

						download(code.data[dataInc].images[imageInc], function(err, res, body){

							fs.stat('images/src/' + code.data[dataInc].images[imageInc].originalPath, function(d, stats){
								if (stats) {
									code.data[dataInc].images[imageInc].statusCode = res.statusCode;
									code.data[dataInc].images[imageInc].show = (res.statusCode === 200);
									code.data[dataInc].images[imageInc].originalSizeFormatted = bytesToSize(stats.size);
									code.data[dataInc].images[imageInc].originalSize = stats.size;

									fs.stat('images/min/' + code.data[dataInc].images[imageInc].originalPath, function(d, minstats){
										code.data[dataInc].images[imageInc].optimizedSizeFormatted = bytesToSize(minstats.size);
										code.data[dataInc].images[imageInc].optimizedSize = minstats.size;
										code.data[dataInc].images[imageInc].savings = bytesToSize(stats.size - minstats.size);
										code.weighAndMeasure(dataInc, imageInc + 1, callback);
									});
								}
							});
							
						});

					} else {
						code.weighAndMeasure(dataInc + 1, 0, callback);
					}
				}
			} else {
				callback();
			}
		}
	}

};

module.exports = code;