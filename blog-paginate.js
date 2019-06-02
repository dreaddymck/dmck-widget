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
        let c = new Array();
        let d = 1;
        let e = 1;
        let f = 0;
        let g = 0;
        let h = 0;
        let j = '';
        let k = '';
        let l = '';
        for (let i = 0, post; post = a.feed.entry[i]; i++) {
            // let m = post.published.$t.substring(0, 19) + post.published.$t.substring(23, 29);
            // timestamp = encodeURIComponent(m);
            timestamp = post.published.$t.substring(0, 19) + post.published.$t.substring(23, 29);
            let n = post.title.$t;
            if (n != '') {
                if (f == 0 || (f % blog_paginate.config.pageCount == (blog_paginate.config.pageCount - 1))) {
                    if (b.indexOf(timestamp) != -1) {
                        blog_paginate.currpage = e
                    }
                    if (n != '') e++;
                    c[c.length] = '/search?updated-max=' + timestamp + '&max-results=' + blog_paginate.config.pageCount
                }
            }
            f++
        }
        for (let p = 0; p < c.length; p++) {
            if (p >= (blog_paginate.currpage - blog_paginate.config.displayPageNum - 1) && p < (blog_paginate.currpage + blog_paginate.config.displayPageNum)) {
                if (g == 0 && p == blog_paginate.currpage - 2) {
                    if (blog_paginate.currpage == 2) {
                        k = '<span class="showpage up_page"><a href="/">' + blog_paginate.config.upPageWord + '</a></span>'
                    } else {
                        k = '<span class="showpage up_page"><a href="' + c[p] + '">' + blog_paginate.config.upPageWord + '</a></span>'
                    }
                    g++
                }
                if (p == (blog_paginate.currpage - 1)) {
                    j += '<span class="showpagePoint">' + blog_paginate.currpage + '</span>'
                } else {
                    if (p == 0) {
                        j += '<span class="showpageNum"><a href="/">1</a></span>'
                    } else {
                        j += '<span class="showpageNum"><a href="' + c[p] + '">' + (p + 1) + '</a></span>'
                    }
                }
                if (h == 0 && p == blog_paginate.currpage) {
                    l = '<span class="showpage"> <a href="' + c[p] + '">' + blog_paginate.config.downPageWord + '</a></span>';
                    h++
                }
            }
        }
        let o = document.getElementsByName("pageArea");
        let q = document.getElementById("blog-pager");
        if (blog_paginate.show) {
            if (blog_paginate.currpage > 1) {
                j = '' + k + ' ' + j + ' '
            }
            j = '<div class="showpageArea"><span style="COLOR: #000;" class="showpageOf"> Pages (' + (e - 1) + ')</span>' + j;
            if (blog_paginate.currpage < (e - 1)) {
                j += l
            }
            if (e == 1) e++;
            j += '</div>';

            if (e <= 2) {
                j = ''
            }
            for (let p = 0; p < o.length; p++) {
                o[p].innerHTML = j
            }
            if (o && o.length > 0) {
                j = ''
            }
            if (q) {
                q.innerHTML = j
            }       
        }else{
            if(o.length){
                $(o).append("<span></span>")
            }else{
                $(q).append("<span></span>")
            }
        }

		return {"currpage":blog_paginate.currpage};
	},
	showpageCount2: function(a) {
        let timestamp;
        let b = blog_paginate.home
        let c = new Array();
        let d = b.indexOf("/search/label/") != -1;
        let e = d ? b.substr(b.indexOf("/search/label/") + 14, b.length) : "";
        e = e.indexOf("?") != -1 ? e.substr(0, e.indexOf("?")) : e;
        let g = 1;
        let h = 0;
        let j = 0;
        let k = 0;
        let l = '';
        let m = '';
        let n = '';
        let o = '<span class="showpageNum"><a href="/search/label/' + e + '?&max-results=' + blog_paginate.config.pageCount + '">';
        for (let i = 0, post; post = a.feed.entry[i]; i++) {
            // let q = post.published.$t.substring(0, 19) + post.published.$t.substring(23, 29);
            // timestamp = encodeURIComponent(q);
            timestamp = post.published.$t.substring(0, 19) + post.published.$t.substring(23, 29);
            let r = post.title.$t;
            if (r != '') {
                if (h == 0 || (h % blog_paginate.config.pageCount == (blog_paginate.config.pageCount - 1))) {
                    if (b.indexOf(timestamp) != -1) {
                        blog_paginate.currpage = g
                    }
                    if (r != '') g++;
                    c[c.length] = '/search/label/' + e + '?updated-max=' + timestamp + '&max-results=' + blog_paginate.config.pageCount
                }
            }
            h++
        }
        for (let p = 0; p < c.length; p++) {
            if (p >= (blog_paginate.currpage- blog_paginate.config.displayPageNum - 1) && p < (blog_paginate.currpage+ blog_paginate.config.displayPageNum)) {
                if (j == 0 && p == blog_paginate.currpage- 2) {
                    if (blog_paginate.currpage== 2) {
                        m = '<span class="showpage up_page"><a href="/">' + blog_paginate.config.upPageWord + '</a></span>'
                    } else {
                        m = '<span class="showpage up_page"><a href="' + c[p] + '">' + blog_paginate.config.upPageWord + '</a></span>'
                    }
                    j++
                }
                if (p == (blog_paginate.currpage- 1)) {
                    l += '<span class="showpagePoint">' + blog_paginate.currpage+ '</span>'
                } else {
                    if (p == 0) {
                        l += '<span class="showpageNum"><a href="/">1</a></span>'
                    } else {
                        l += '<span class="showpageNum"><a href="' + c[p] + '">' + (p + 1) + '</a></span>'
                    }
                }
                if (k == 0 && p == blog_paginate.currpage) {
                    n = '<span class="showpage"> <a href="' + c[p] + '">' + blog_paginate.config.downPageWord + '</a></span>';
                    k++
                }
            }
        }
        let s = document.getElementsByName("pageArea");
        let t = document.getElementById("blog-pager");
        if (blog_paginate.show) {
            if (blog_paginate.currpage> 1) {
                if (!d) {
                    l = '' + m + ' ' + l + ' '
                } else {
                    l = '' + m + ' ' + l + ' '
                }
            }
            l = '<div class="showpageArea"><span style="COLOR: #000;" class="showpageOf"> Pages (' + (g - 1) + ')</span>' + l;
            if (blog_paginate.currpage< (g - 1)) {
                l += n
            }
            if (g == 1) g++;
            l += '</div>';

            if (g <= 2) {
                l = ''
            }
            for (let p = 0; p < s.length; p++) {
                s[p].innerHTML = l
            }
            if (s && s.length > 0) {
                l = ''
            }
            if (t) {
                t.innerHTML = l
            }
        }else{
            if(s.length){
                $(s).append("<span></span>")
            }else{
                $(t).append("<span></span>")
            }
        }

		return {"currpage":blog_paginate.currpage};
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
			
		},
		default: function()	{
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