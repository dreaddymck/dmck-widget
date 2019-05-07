"use strict"
const blog_paginate = {
	currpage: 1,
	show: true,
	init: function(config) {
		blog_paginate.config = config,
		blog_paginate.home = location.href;
		if (blog_paginate.show) { blog_paginate.style.paginate(); } else { blog_paginate.style.default(); }
		let lblname1 = "";
		let promise = function(url, cb) {
			return new Promise((resolve,reject)=>{
				$.ajax({
					url: url,
					type: 'GET',
					dataType: "jsonp",
					success: function(data) {
						resolve(cb(data));
					},
					error: function(error) {
						reject(error);
					},
				})
			}
			);
		}
		if (blog_paginate.home.indexOf("/search/label/") != -1) {
			if (blog_paginate.home.indexOf("?updated-max") != -1) {
				lblname1 = blog_paginate.home.substring(blog_paginate.home.indexOf("/search/label/") + 14, blog_paginate.home.indexOf("?updated-max"))
			} else {
				lblname1 = blog_paginate.home.substring(blog_paginate.home.indexOf("/search/label/") + 14, blog_paginate.home.length)
				if (blog_paginate.home.indexOf("?&max") > 0) {
					lblname1 = blog_paginate.home.substring(blog_paginate.home.indexOf("/search/label/") + 14, blog_paginate.home.indexOf("?&max"))
				} else if (blog_paginate.home.indexOf("?max-results") > 0) {
					lblname1 = blog_paginate.home.substring(blog_paginate.home.indexOf("/search/label/") + 14, blog_paginate.home.indexOf("?max-results"))
				}
			}
		}
		if (blog_paginate.home.indexOf("?q=") == -1) {
			if (blog_paginate.home.indexOf("/search/label/") == -1) {
				return promise("/feeds/posts/summary?alt=json-in-script&max-results=99999", blog_paginate.showpageCount);
			} else {
				return promise("/feeds/posts/full/-/" + lblname1 + "?alt=json-in-script&max-results=99999", blog_paginate.showpageCount2);
			}
		}
	},
	showpageCount: function(a) {
		let timestamp;
		let b = blog_paginate.home
		  , c = []
		  , e = 1
		  , f = 0
		  , g = 0
		  , h = 0
		  , j = ""
		  , k = ""
		  , l = "";
		for (let g, p = 0; g = a.feed.entry[p]; p++) {
			timestamp = g.published.$t.substring(0, 19) + g.published.$t.substring(23, 29);
			//timestamp = encodeURIComponent(a);
			let p = g.title.$t;
			"" != p && 
			(
				0 != f && f % blog_paginate.config.pageCount != blog_paginate.config.pageCount - 1 || (-1 != b.indexOf(timestamp) && (blog_paginate.currpage = e),
				"" != p && e++,
				c[c.length] = "/search?updated-max=" + timestamp + "&max-results=" + blog_paginate.config.pageCount)
			),
			f++
		}
		for (let a = 0; a < c.length; a++)
			a >= blog_paginate.currpage - blog_paginate.config.displayPageNum - 1 && a < blog_paginate.currpage + blog_paginate.config.displayPageNum && (0 == g && a == blog_paginate.currpage - 2 && (k = 2 == blog_paginate.currpage ? '<span class="showpage up_page"><a href="/">' + blog_paginate.config.upPageWord + "</a></span>" : '<span class="showpage up_page"><a href="' + c[a] + '">' + blog_paginate.config.upPageWord + "</a></span>",
			g++),
			a == blog_paginate.currpage - 1 ? j += '<span class="showpagePoint">' + blog_paginate.currpage + "</span>" : j += 0 == a ? '<span class="showpageNum"><a href="/">1</a></span>' : '<span class="showpageNum"><a href="' + c[a] + '">' + (a + 1) + "</a></span>",
			0 == h && a == blog_paginate.currpage && (l = '<span class="showpage"> <a href="' + c[a] + '">' + blog_paginate.config.downPageWord + "</a></span>",
			h++));
		blog_paginate.currpage > 1 && (j = k + " " + j + " "),
		j = '<div class="showpageArea"><span class="showpageOf"> Pages (' + (e - 1) + ")</span>" + j,
		blog_paginate.currpage < e - 1 && (j += l),
		1 == e && e++,
		j += "</div>";

		if (blog_paginate.show) {
			let o = document.getElementsByName("pageArea")
			  , q = document.getElementById("blog-pager");
			e <= 2 && (j = "");

			for (let a = 0; a < o.length; a++)
				o[a].innerHTML = j;
			o && o.length > 0 && (j = ""),
			q && (q.innerHTML = j);
		}
		return true;
	},
	showpageCount2: function(a) {
		let timestamp;
		let b = blog_paginate.home
		  , c = []
		  , d = -1 != b.indexOf("/search/label/")
		  , e = d ? b.substr(b.indexOf("/search/label/") + 14, b.length) : "";
		e = -1 != e.indexOf("?") ? e.substr(0, e.indexOf("?")) : e;
		let g = 1
		  , h = 0
		  , j = 0
		  , k = 0
		  , l = ""
		  , m = ""
		  , n = "";
		for (let n, l = 0; n = a.feed.entry[l]; l++) {
			timestamp = n.published.$t.substring(0, 19) + n.published.$t.substring(23, 29);
			// timestamp = encodeURIComponent(a);
			let l = n.title.$t;
			"" != l && (0 != h && h % blog_paginate.config.pageCount != blog_paginate.config.pageCount - 1 || (-1 != b.indexOf(timestamp) && (blog_paginate.currpage = g),
			"" != l && g++,
			c[c.length] = "/search/label/" + e + "?updated-max=" + timestamp + "&max-results=" + blog_paginate.config.pageCount)),
			h++
		}
		for (let a = 0; a < c.length; a++)
			a >= blog_paginate.currpage - blog_paginate.config.displayPageNum - 1 && a < blog_paginate.currpage + blog_paginate.config.displayPageNum && (0 == j && a == blog_paginate.currpage - 2 && (m = 2 == blog_paginate.currpage ? '<span class="showpage up_page"><a href="/">' + blog_paginate.config.upPageWord + "</a></span>" : '<span class="showpage up_page"><a href="' + c[a] + '">' + blog_paginate.config.upPageWord + "</a></span>",
			j++),
			a == blog_paginate.currpage - 1 ? l += '<span class="showpagePoint">' + blog_paginate.currpage + "</span>" : 0 == a ? l = '<span class="showpageNum"><a href="/search/label/' + e + "?&max-results=" + blog_paginate.config.pageCount + '">1</a></span>' : l += '<span class="showpageNum"><a href="' + c[a] + '">' + (a + 1) + "</a></span>",
			0 == k && a == blog_paginate.currpage && (n = '<span class="showpage"> <a href="' + c[a] + '">' + blog_paginate.config.downPageWord + "</a></span>",
			k++));
		blog_paginate.currpage > 1 && (l = m + " " + l + " "),
		l = '<div class="showpageArea"><span class="showpageOf"> Pages (' + (g - 1) + ")</span>" + l,
		blog_paginate.currpage < g - 1 && (l += n),
		1 == g && g++,
		l += "</div>";

		if (blog_paginate.show) {
			let s = document.getElementsByName("pageArea")
			  , t = document.getElementById("blog-pager");
			g <= 2 && (l = "");

			for (let a = 0; a < s.length; a++)
				s[a].innerHTML = l;
			s && s.length > 0 && (l = ""),
			t && (t.innerHTML = l);
		}
		return true
	},
	style: {
		paginate: function(){
			jQuery('head').append(`
/*****************************************
Page navigation
******************************************/
<style type="text/css">
#blog-pager{display:block;-webkit-border-radius:0;-moz-border-radius:0;-o-border-radius:0;border-radius:0;padding:0;margin:0 0 30px;list-style:none;font-size:0;text-align:center}.showpage.up_page a{float:left}.showpage a:hover,.showpageNum a:hover{background-color:#777;color:#fff}.showpage a,.showpageNum a{transition:all .2s ease-in}.showpageOf{display:none}.showpage a,.showpageNum a{margin:0 4px}.showpagePoint{margin:0 2px 0 0}.showpagePoint{display:inline-block;font-size:14px;line-height:40px;border:none;background:#fff;margin:0 3px;color:#000;height:40px;width:40px;text-align:center;float:none;padding:0;position:relative;background-color:#777;color:#fff}.showpageNum a{display:inline-block;font-size:14px;line-height:40px;border:none;background:#fff;margin:0 3px;color:#000;height:40px;width:40px;text-align:center;float:none;padding:0;position:relative;text-decoration:none}.showpage a{float:right;display:inline-block;font-size:14px;line-height:40px;border:none;background:#fff;margin:0 3px;color:#000;height:40px;text-align:center;padding:0 20px;position:relative;text-decoration:none}.showpageOf{display:none}
</style>
				`);		
			}
		},
		default: function(){
			jQuery('head').append(`
/*****************************************
Page navigation
******************************************/
<style type="text/css">
#blog-pager{display:block;-webkit-border-radius:0;-moz-border-radius:0;-o-border-radius:0;border-radius:0;padding:0;margin:0 0 30px;list-style:none;text-align:center}#blog-pager-newer-link{float:left}#blog-pager-older-link{float:right}#blog-pager{text-align:center}
</style>
				`);
		}
	}




// jQuery(document).ready(function () {
// 	if( jQuery("body").hasClass("isPage") || jQuery("body").hasClass(" isSingleItem") ){ return; }
// 	blog_paginate.init({
// 		pageCount: 4,
// 		displayPageNum: 3,
// 		upPageWord: '&#171; Previous',
// 		downPageWord: 'Next &#187;'
// 	});
// });