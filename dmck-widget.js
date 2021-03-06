"use strict"
const dmck_client =  {
    init: function(widget){ 
        let r = new dmck_widget();
        r.settings = widget;
        r.init();
        return;      
    },
    globals:{},    
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
        if(typeof dmck_client !== "undefined" ){            
            if( typeof dmck_client.globals.tags  !== "undefined" ){
                return dmck_client.globals.tags;                
            } 
            else
            if( typeof dmck_client.globals.category !== "undefined" ){
                return dmck_client.globals.category;                
            } 
            else 
            if( typeof dmck_client.globals.label !== "undefined" ) {
                return dmck_client.globals.label;
            }           
        }
        return "";
    },
    page: {
        set: function(id,value) {
            id = window.btoa(id)
            let paging = {};
            // we will use global objects - if available - to host paging information
            // paginate is used on the front page to scroll through gallery
            if(typeof paginate !== "undefined" && paginate.enabled){
                if(!paginate.paging[id]){ paginate.paging[id] = []; }
                paginate.paging[id][paginate.paging.page] = value;
            }
            else 
            if( dmck_client.globals.page ){
                if(typeof Cookies !== "undefined") {
                    if(typeof Cookies.get("paging") !== "undefined"){ 
                        paging = JSON.parse(Cookies.get("paging"));
                    }else{
                        paging = {}; 
                    }
                    if(!paging[id]){ paging[id] = {}; }
                    paging[id][dmck_client.globals.page] = value;
                    Cookies.set("paging", JSON.stringify(paging));                    
                }
            }
        },
        wordpress: function(){ 
            let res = "";
            if(typeof paginate !== "undefined" && paginate.enabled ){ res = paginate.paging.page; }
            else
            if( dmck_client.globals.page ){ res = dmck_client.globals.page; }
            return res;
        },
        limitoffset: function(params){
            let res = "&limit=" + params.limit + "&offset=" + params.offset; 
            if(typeof paginate !== "undefined" && paginate.enabled ){ 
                res = "&limit=" + params.limit + "&offset=" + (parseInt(paginate.paging.page) - 1) * params.limit; 
            }
            else
            if(dmck_client.globals.page ){ 
                res = "&limit=" + params.limit + "&offset=" + (parseInt(dmck_client.globals.page) - 1) * params.limit; 
            }       
            return res;            
        },
        blogger: function(id){
            id = window.btoa(id);
            let paging = {};
            let res = "";                        
            if(typeof paginate !== "undefined" && paginate.enabled ){
                let p = paginate.paging.page  - 1 ;                
                if(p && paginate.paging[id]){
                    res = (typeof paginate.paging[id][p] !== "undefined") ? "&pageToken=" + paginate.paging[id][p].nextPageToken : "";    
                }
            }
            else
            if( typeof Cookies !== "undefined" && typeof Cookies.get("paging") !== "undefined" ){                
                if( dmck_client.globals.page ){                    
                    paging = JSON.parse(Cookies.get("paging")); 
                    let p = dmck_client.globals.page  - 1 ;                
                    if(p && paging && paging[id]){
                        res = (typeof paging[id][p] !== "undefined") ? "&pageToken=" + paging[id][p].nextPageToken : "";    
                    }
                }
            }            
            return  res           
        }
    },
    tiny_rss: function(data,config){        
        let render = function(entry){
            let link = "#";
            
            if(typeof entry.link === "object"){
                link = entry.link[0] ? entry.link[0]["@attributes"].href : entry.link["@attributes"].href;
            }
            
            jQuery('<h2>').append(
                jQuery('<a>',{ text: entry.title, title: entry.title, href: link})
            ).appendTo(config.target);
            jQuery(entry.content).appendTo(config.target);
            if(config.show_summary){
                jQuery(entry.summary).appendTo(config.target);
            }            
            jQuery("<br>").addClass("clear").appendTo(config.target);
        }
        data = JSON.parse(data);
        if( data.entry instanceof Array ){
            for(var d in data.entry){ render(data.entry[d]); }
        } else { 
            render(data.entry); 
        }
        if(typeof config.callback === "function"){ config.callback(); }        
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
            jQuery("<br>").addClass("clear").appendTo(config.target); 
        }
        if( data instanceof Array ){
            for(var d in data){ render(data[d]); }
        } else { render(data); }    
        if(typeof config.callback === "function"){ config.callback(); }                 
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
            jQuery(config.target).find("iframe").detach();
            jQuery(config.target).find("blockquote").detach()
            jQuery("<br>").addClass("clear").appendTo(config.target);
        }  
        if(typeof config.callback === "function"){ config.callback(); }                          
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
            jQuery("<br>").addClass("clear").appendTo(config.target);
        }   
        if(typeof config.callback === "function"){ config.callback(); }                                
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
                jQuery("<br>").addClass("clear").appendTo(config.target);                          
            });
            if(typeof config.callback === "function"){ config.callback(); }            
            jQuery(config.target).show();
        } else {
            console.log("No subreddits match the search query!");
        }
    },
    get_params: function(url){
        let param = url.substring(url.indexOf('?') + 1).split('&');
        let result = {};
        for(let i = 0; i < param.length; i++){
            param[i] = param[i].split('=');
            result[param[i][0]] = param[i][1];
        }
        return result; 
    },
    is_url: function(str){
      let regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
            if (regexp.test(str)) { return true; }
           return false;
    },
    is_image: function(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    },
    is_mobile: function(){
        let isMobile = false; //initiate as false
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            isMobile = true;
        }
        return isMobile;        
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
            let reg_lim_off = new RegExp( /&limit\=\d&offset\=\d/, 'g' ) //tiny tiny rss pagination routine
            let reg_q = new RegExp(/q\=&/,'g') // youtube query
            let reg_word = new RegExp(/per_page\=\d/,'g')
            
            if(url.match(/wp-json\/wp\/v2\/posts/)){
                if(url.match(reg_word)){
                    url = url + "&page=" + dmck_client.page.wordpress(); // apply wordpress page number
                }else
                if(typeof config.data !== 'undefined' && config.data.per_page != ""){
                    config.data.page = dmck_client.page.wordpress(); // apply wordpress page number
                }                 
            }else
            if(url.match(/www.googleapis.com\/blogger\/v3/)){
                url = url + dmck_client.page.blogger(config.header.title); //apply next/previous page tokens
            }else
            if(url.match(/www.googleapis.com\/youtube\/v3/)){                
                if(url.match(reg_q)) {
                    url = url + dmck_client.page.blogger(config.header.title); //apply next/previous page tokens
                    let q = dmck_client.query();
                    if(q){ url = url.replace(reg_q,"q=" + q + "&") }
                    else{return}
                }else
                if(typeof config.data !== 'undefined' && config.data.q == ""){
                    let q = dmck_client.query();
                    if(q){ 
                        config.data.q = q
                        config.data.pageToken = dmck_client.page.blogger(config.header.title);
                    }
                    else{return}
                }
            }else
            if(url.match(/www.reddit.com\/search.json/)){
                config.data.q = config.data.q ? config.data.q : dmck_client.query();
            }else
            if(config.data && config.data.route && config.data.route.match(/tiny-rss\/public.php\?op\=rss/) ){
                if(config.data.route.match(reg_lim_off)){
                    let params = dmck_client.get_params(config.data.route);
                    let limitoffset  = dmck_client.page.limitoffset(params);
                    config.data.route = config.data.route.replace(reg_lim_off, limitoffset);
                }
            }
            jQuery(config.target).html("").hide();
            // if(config.data && !config.data.q && !config.data.route){return}
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
        let show = function(){  
            if( typeof settings.display === "object"){ return jQuery("body").hasClasses( settings.display[window.location.host] ); }
            return true;
        }
        let hide = function(){ 
            if( typeof settings.hide === "object"){ return !jQuery("body").hasClasses( settings.hide[window.location.host] ); }
            return true;            
        }
        if( show() && hide() ){
            new Promise(function(resolve, reject) { resolve( request(settings.config) ); });
        }
    }; 

}       

