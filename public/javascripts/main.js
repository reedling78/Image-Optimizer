
(function(){	

	$(document).ready(function(){

		if (!isNaN(parseInt(location.pathname.replace('/scrubber/', '')))) {
			app.currentPage = parseInt(location.pathname.replace('/scrubber/', ''));
		} else {
			app.currentPage = 1;
		}

		$('.pagination-build').twbsPagination({
	        totalPages: app.pageCount,
	        visiblePages: 15,
	        startPage: app.currentPage, 
	        onPageClick: function (event, page) {
	            var newPage;

	            if (page === 1) {
	            	app.currentPage = 1;
	            	newPage = window.location.href;
	            } else {
	            	app.currentPage = page;
	            	newPage = window.location.origin + '/scrubber/' + page;
	            }
	            
	            if (location.href !== newPage) {
	            	window.location.href = window.location.origin + '/scrubber/' + page;
	            }

	        }
	    });

		$('.pagination-build a, a.show-da-modal').on('click', function(){
			waitingDialog.show('Optimizing images... hold please');
		});


	});

})();



