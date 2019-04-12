"use strict"
const dmck_client =  {
    init: function(arrObj){        
        let r = new dmck_widget();
        r.settings = arrObj;
        // enabled pagination on wordpress front page
        if(typeof paginate !== "undefined" && ! paginate.enabled && jQuery("body").hasClass("home") ) {            
            paginate.func = function(){
                dmck_client.init(arrObj);
            };
            paginate.enabled = true;
            paginate.setup();            
        }
        r.init();
        return;      
    },
    hide_title: function(selector){ if( jQuery(selector).length ){ jQuery(selector).hide() } },//hide blogger widget title,
    label: function(){let e="/search/label/";if(-1!=location.href.indexOf(e))return-1!=location.href.indexOf("?updated-max")?location.href.substring(location.href.indexOf(e)+e.length,location.href.indexOf("?updated-max")):-1!=location.href.indexOf("?&max")?location.href.substring(location.href.indexOf(e)+e.length,location.href.indexOf("?&max")):-1!=location.href.indexOf("?max-results")?location.href.substring(location.href.indexOf(e)+e.length,location.href.indexOf("?max-results")):location.href.substring(location.href.indexOf(e)+e.length,location.href.length)},
    query: function(){ 
        let params = new URLSearchParams(window.location.search); 
        if(params.has("q")){
            return params.get("q");
        }
        else 
        if(params.has("s")){
            return params.get("s");
        }
        else 
        if(typeof socache !== "undefined" ){            
            if( typeof socache.tags === "string" ){
                let tags = socache.tags.replace("|", " OR "); 
                return tags;                
            } 
            else
            if( typeof socache.category === "string" ){
                let category = socache.category.replace("|", " OR "); 
                return category;                
            } 
        }
        else
        {
            return "";
        } 
    },
    page: {
        set: function(id,value) {
            id = window.btoa(id)
            // we will use global objects - if available - to host paging information
            // paginate is used on the front page to scroll through gallery
            if(typeof paginate !== "undefined" && paginate.enabled){
                if(!paginate.paging[id]){ paginate.paging[id] = []; }
                paginate.paging[id][paginate.paging.page] = value;
            }
            else // socache is a custom wordpress plugin that renders a global object with page numbers
            if(typeof socache !== "undefined" && socache.page){
                if(typeof Cookies.get("paging") !== "undefined"){ 
                    socache.paging = JSON.parse(Cookies.get("paging"));
                }else{
                    socache.paging = {}; 
                }
                if(!socache.paging[id]){ socache.paging[id] = {}; }
                socache.paging[id][socache.page] = value;
                Cookies.set("paging", JSON.stringify(socache.paging));
            }
        },
        wordpress: function(){ 
            let res = "";
            if(typeof paginate !== "undefined" && paginate.enabled ){ res = "&page=" + paginate.paging.page; }
            else
            if(typeof socache !== "undefined" && socache.page ){ res = "&page=" + socache.page; }
            return res;
        },
        limitoffset: function(limit){
            let res = "&limit=" + limit + "&offset=0"; 
            if(typeof paginate !== "undefined" && paginate.enabled ){ 
                res = "&limit=" + limit + "&offset=" + (parseInt(paginate.paging.page) - 1) * limit; 
            }
            else
            if(typeof socache !== "undefined" && socache.page ){ 
                res = "&limit=" + limit + "&offset=" + (parseInt(socache.page) - 1) * limit; 
            }            
            return res;            
        },
        blogger: function(id){
            id = window.btoa(id);
            let res = ""            
            if(typeof paginate !== "undefined" && paginate.enabled ){
                let p = paginate.paging.page  - 1 ;                
                if(p && paginate.paging[id]){
                    res = (typeof paginate.paging[id][p] !== "undefined") ? "&pageToken=" + paginate.paging[id][p].nextPageToken : "";    
                }
            }
            else
            if( typeof Cookies.get("paging") !== "undefined" && socache.page ){
                socache.paging = JSON.parse(Cookies.get("paging")); 
                let p = socache.page  - 1 ;                
                if(p && socache.paging && socache.paging[id]){
                    res = (typeof socache.paging[id][p] !== "undefined") ? "&pageToken=" + socache.paging[id][p].nextPageToken : "";    
                }
            }            
            return  res           
        }
    },
    tiny_rss: function(data,config){        
        let render = function(entry){
            jQuery('<h2>').append(
                jQuery('<a>',{ text: entry.title, title: entry.title, href: entry.link["@attributes"].href})
            ).appendTo(config.target);
            jQuery(entry.content).appendTo(config.target);
        }
        data = JSON.parse(data);
        if( data.entry instanceof Array ){
            for(var d in data.entry){ render(data.entry[d]); }
        } else { render(data.entry); }
        if(typeof config.callback === "function"){ config.callback(); }
        jQuery("<br>").addClass("clear").appendTo(config.target);
        jQuery(config.target).show();
    },       
    wp_render: function(data,config){
        let truncate_func=function(t){return"undefined"!==jQuery.truncate&&(t.str=jQuery.truncate(t.str,{length:t.length?t.length:150,finishBlock:!0,ellipsis:t.url?" <a href='"+t.url+"' target='_blank' title='more'>[...]</a>":""})),t.str};    
        let title = "";
        let href = "";
        let id ="";
        let attachments = function(data){            
            href = "";
            if( typeof data._links["wp:featuredmedia"] !== "undefined" && data._links["wp:featuredmedia"][0].embeddable){
                href = data._links["wp:featuredmedia"][0].href;                    
            }else
            if( typeof data._links["wp:attachment"] !== "undefined"  && data._links["wp:attachment"][0].embeddable ){
                href = data._links["wp:attachment"][0].href;                     
            } 
            if(!href){return}
            id = data.slug + "-media";
            title = jQuery("<span>").html( data.title.rendered )[0].innerText;
            jQuery('<a>',{ title: title, href: data.link, click: function(){return;}, target:""}).append(
                jQuery("<img>").attr({ src:"", width:"100%", height:"auto", id:id, })
            ).appendTo(config.target);
            jQuery.ajax({ type: "GET", url:href })
            .done(function (data) { 
                jQuery("#" + id).attr({src:data.source_url}) 
            })
            .fail(function (xhr, textStatus, errorThrown) {
                console.log(xhr.responseText);
                console.log(textStatus);
            });             
        }
        let render = function(data){
            if(config.header && config.header.title){
                jQuery('<h2>').append(
                    jQuery('<a>',{ text: config.header.title, title: config.header.title, href: config.header.url, click: function(){return;}, target:""})
                ).appendTo(config.target);
            }
            attachments(data);
            title = jQuery("<span>").html( data.title.rendered )[0].innerText;
            jQuery('<h3>').html(
                jQuery('<a>',{ text: title, title: title, href: data.link, click: function(){return;}, target:""})
            ).appendTo(config.target);
            if(config.truncate){ data.content.rendered = truncate_func({str: data.content.rendered , url: data.link, length:config.truncate}) }    
            jQuery('<p>').html(data.content.rendered).appendTo(config.target);
        }
        if( data instanceof Array ){
            for(var d in data){ render(data[d]); }
        } else { render(data); }    
        if(typeof config.callback === "function"){ config.callback(); }  
        jQuery("<br>").addClass("clear").appendTo(config.target);          
        jQuery(config.target).show();
    },
    blogger_render:function(data, config){
        let truncate_func=function(t){return"undefined"!==jQuery.truncate&&(t.str=jQuery.truncate(t.str,{length:t.length?t.length:150,finishBlock:!0,ellipsis:t.url?" <a href='"+t.url+"' target='_blank' title='more'>[...]</a>":""})),t.str};    
        // setting up nextpage token for googleapi
        dmck_client.page.set( config.header.title, { nextPageToken: data.nextPageToken } );       
        for(var d in data.items){
            jQuery('<h2>').append(
                jQuery('<a>',{ text: config.header.title, title: config.header.title, href: config.header.url, click: function(){return;}, target:""})
            ).appendTo(config.target);
            jQuery('<h3>').append(
                jQuery('<a>',{ text: data.items[d].title, title: data.items[d].title, href: data.items[d].url, click: function(){return;}, target:""})
            ).appendTo(config.target);
            if(config.truncate){ data.items[d].content = truncate_func({str: data.items[d].content , url: data.items[d].url, length:config.truncate}) }
            jQuery(data.items[d].content).appendTo(config.target);
            jQuery(config.target).find("img").attr({ height: 'auto', width: '100%' }).closest("a").attr({href: data.items[d].url})                
            jQuery(config.target).find("iframe").detach()
        }  
        if(typeof config.callback === "function"){ config.callback(); }
        jQuery("<br>").addClass("clear").appendTo(config.target);                  
        jQuery(config.target).show();
    },
    youtube_playlist: function(data, config){
        dmck_client.page.set( config.header.title, { nextPageToken: data.nextPageToken } );       
        jQuery('<h2>').append(
            jQuery('<a>',{ text: config.header.title, title: config.header.title, href: config.header.url, click: function(){return;}, target:""})
        ).appendTo(config.target);
        let src = "";
        for(var d in data.items){
            src = "https://www.youtube.com/embed/?listType=playlist&list=" + data.items[d].id.playlistId
            jQuery("<iframe>").attr({"src": src, "width": "100%", "height": "auto", "frameborder": "0", "allowfullscreen": "true" }).appendTo(config.target);
        }   
        if(typeof config.callback === "function"){ config.callback(); } 
        jQuery("<br>").addClass("clear").appendTo(config.target);                        
        jQuery(config.target).show();
    },    
    reddit_render: function(data, config){
        if (data.data.children.length > 0) {
            let t = "";
            let truncate_func=function(t){return"undefined"!==jQuery.truncate&&(t.str=jQuery.truncate(t.str,{length:t.length?t.length:150,finishBlock:!0,ellipsis:t.url?" <a href='"+t.url+"' target='_blank' title='more'>[...]</a>":""})),t.str};    
            let media_render = function(res){
                let content = jQuery("<span>").html(res.data.media_embed.content)[0].innerText;
                jQuery(config.target).append( content )
                jQuery(config.target).find('iframe').attr({ height:'auto',width:'100%'});
            }             
            jQuery.each(data.data.children, function(idx, res) {
                let title = config.header.title;
                let url = config.header.url;
                if(res.data.subreddit_name_prefixed){ 
                    title = res.data.subreddit_name_prefixed;
                    url = config.header.url + "/" +  res.data.subreddit_name_prefixed;
                }                
                jQuery('<h2>').append(
                    jQuery('<a>',{ text: title, title: title, href:url, click: function(){return;}, target:""})
                ).appendTo(config.target);
                jQuery('<h3>').append(
                    jQuery('<a>',{ text: res.data.title, title: res.data.title, href: res.data.url, click: function(){return;}, target:""})
                ).appendTo(config.target);

                if( dmck_client.is_image( res.data.url ) ){
                    jQuery("<img>").attr({"src":res.data.url,"width":"auto","height":"auto"}).appendTo(config.target);
                }
                
                if(res.data.media_embed.content){
                    media_render(res);
                }
                t = jQuery("<p>").html( res.data.selftext_html )[0].innerText;

                if(config.truncate){ t = truncate_func({str: t , url: res.data.url, length:config.truncate}) }

                jQuery(config.target).append( t ) ;                            
            });
            if(typeof config.callback === "function"){ config.callback(); }
            jQuery("<br>").addClass("clear").appendTo(config.target);
            jQuery(config.target).show();
        } else {
            console.log("No subreddits match the search query!");
        }
    },
    is_url: function(str){
      let regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
            if (regexp.test(str)) { return true; }
           return false;
    },
    is_image: function(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
                          
}


class dmck_widget {
	constructor() { if (window.jQuery) {        
        // truncate.js
        !function(e){var t=/(\s*\S+|\s)jQuery/,n=/^(\S*)/;e.truncate=function(t,n){return e("<div></div>").append(t).truncate(n).html()},e.fn.truncate=function(r){e.isNumeric(r)&&(r={length:r});var i=e.extend({},e.truncate.defaults,r);return this.each(function(){var r=e(this);i.noBreaks&&r.find("br").replaceWith(" ");var s=r.text(),l=s.length-i.length;if(i.stripTags&&r.text(s),i.words&&l>0){var a=s.slice(0,i.length).replace(t,"").length;l=i.keepFirstWord&&0===a?s.length-n.exec(s)[0].length-1:s.length-a-1}l<0||!l&&!i.truncated||e.each(r.contents().get().reverse(),function(t,n){var r=e(n),s=r.text().length;return s<=l?(i.truncated=!0,l-=s,void r.remove()):3===n.nodeType?(i.finishBlock?e(n.splitText(s)).replaceWith(i.ellipsis):e(n.splitText(s-l-1)).replaceWith(i.ellipsis),!1):(r.truncate(e.extend(i,{length:s-l})),!1)})})},e.truncate.defaults={stripTags:!1,words:!1,keepFirstWord:!1,noBreaks:!1,finishBlock:!1,length:1/0,ellipsis:"…"}}(jQuery);
        this.settings = [];
    }};    
    init(){
        for(let s in this.settings){ 
            if(jQuery(this.settings[s].config.target).length){
                this.before_request(this.settings[s]);
            }
        }
    };
    before_request(settings){
        // hasClasses
        jQuery.fn.extend({hasClasses:function(s){for(var n in s)if(jQuery(this).hasClass(s[n]))return!0;return!1}});            
        if( ! Object.keys(settings.display).includes(window.location.host) ) { return; }

        let request = function(config){
            let url = config.url; 
            let reg = new RegExp( /&limit\=\d&offset\=\d/, 'g' ) //a hack to fix tiny rss pagination routine
            
            if(config.url.match(/wp-json\/wp\/v2\/posts\?per_page=1/)){
                url = url + dmck_client.page.wordpress();
            }else
            if(config.url.match(/www.googleapis.com\/blogger\/v3/)){
                url = url + dmck_client.page.blogger(config.header.title);
            }else
            if(config.url.match(/www.googleapis.com\/youtube\/v3/)){
                url = url + dmck_client.page.blogger(config.header.title);
            }else
            if( config.data && config.data.route && config.data.route.match(/public.php\?op\=rss/) && config.data.route.match(reg) ){
                let lo  = dmck_client.page.limitoffset(1);
                config.data.route = config.data.route.replace(reg, lo);
            }
            jQuery(config.target).html("").hide();
            if(config.data && !config.data.q && !config.data.route){return}
            jQuery.ajax({ 
                type: config.type?config.type:"GET", 
                url:url,
                dataType:config.dataType?config.dataType:"", 
                data:config.data?config.data:"",
            })
            .done(function (data) { dmck_client[config.render](data,config); })
            .fail(function (xhr, textStatus, errorThrown) {
                console.log(xhr.responseText);
                console.log(textStatus);
            }); 
        }
        if( jQuery("body").hasClasses( settings.display[window.location.host] ) ){
            new Promise(function(resolve, reject) { resolve( request(settings.config) ); });
        }
    }; 

}       

