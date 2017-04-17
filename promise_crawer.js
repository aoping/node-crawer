var http=require('http');
var Promise=require('bluebird');
var cheerio=require('cheerio');
var url='http://www.imooc.com/learn/348';
var baseUrl='http://www.imooc.com/learn/';
var courseIds=[75,197,259,348,637] // 课程id


var fetchCourseArray=[]
courseIds.forEach(function(id){
	fetchCourseArray.push(getPageAsync(baseUrl+id))
})


function filterChapters(html){
	var $=cheerio.load(html);
	var chapters=$('.chapter')
	var title=$('.course-infos .path span').text()
	var number=$(".js-learn-num").text().trim()

	// courseData={
	// 	title:title,
	// 	number:number,
	// 	videos:[{
	// 	chapterTitle: '',
	// 	videos: [
	// 		title: '',
	// 		id: ''
	// 	]
	// 	}]
	// }

	var courseData={
		title:title,
		number:number,
		videos:[]
	};
	chapters.each(function(item){
		var chapter=$(this)
		var chapterTitle=chapter.find('strong').text().trim()
		var videos=chapter.find('.video').children('li')
		var chapterData={
			chapterTitle: chapterTitle,
			videos:[]
		}

		videos.each(function(item){
			var video=$(this).find('.J-media-item')
			var videoTitle=video.text().trim()
			var id=video.attr('href').split('video/')[1]

			chapterData.videos.push({
				title:videoTitle,
				id:id
			})
		})

		courseData.videos.push(chapterData)

	})

	return courseData;

}

function printCourseInfo(coursesData){
	coursesData.forEach(function(courseData){
		console.log(courseData.number+"人学过"+courseData.title);
	})

	coursesData.forEach(function(courseData){
		courseData.videos.forEach(function(item){
			var chapterTitle=item.chapterTitle

			console.log(chapterTitle+'\n');

			item.videos.forEach(function(video){
				console.log('['+video.id+']'+video.title);
			})
		})
	})
}

function getPageAsync(url){ //爬取网页
	return new Promise(function(resolve,reject){
		http.get(url,function(res){
			var html='';
			res.on('data',function(data){
				html+=data;
			})
			res.on('end',function(){
				resolve(html)
			})
			res.on('error',function(err){
				reject(err)
				console.log(err);
			})
		})
	})
}

Promise
	.all(fetchCourseArray)
	.then(function(pages){
		var courseData=[]
		pages.forEach(function(html){
			var courses=filterChapters(html)
			// console.log(courses)
			courseData.push(courses)
		})
		courseData.sort(function(a,b){
			return a.number<b.number
		})
		printCourseInfo(courseData)
	})