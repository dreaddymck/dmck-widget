const blog_nav_menu = {

	init: function(){	
		jQuery('.nav-wrapper .nav-menu ul').html('');		
		let hostname = location.hostname;
		let menu_item = blog_nav_menu.menu_home.custom[hostname] ? blog_nav_menu.menu_home.custom[hostname] : blog_nav_menu.menu_home.default;
		
		jQuery('.nav-wrapper .nav-menu ul').append(menu_item);	
		for(let i in blog_nav_menu.menu_ext ){
			if(i == hostname){ continue; }
			jQuery('.nav-wrapper .nav-menu ul').append(blog_nav_menu.menu_ext[i]);
		}	
	},
	menu_home: {
		custom: {
			"iandigaming.blogspot.com" : `
<li class="active has-children">
	<a href="/">Home</a>
	<ul>
		<li itemprop="name">
			<a href="https://dreaddymck.com/Public/MUSIC/AUDIOBOOK/stalker-anomaly/a-loner-story.m3u" itemprop="url">A Loners story (WIP): M3U download</a>
		</li>	
		<li itemprop="name"><a href="https://iandigaming.blogspot.com/p/dump.html" itemprop="url">Post Fail</a></li>
		<li itemprop="name"><a href="https://iandigaming.blogspot.com/p/blog-page.html" itemprop="url">Video Fail</a></li>
	</ul>
</li>		
					`,
			"dreaddymck.blogspot.com" : `
<li class="active has-children">
	<a href="/">Home</a>
	<ul>
		<li itemprop='name'><a href='https://dreaddymck.com' itemprop='url'>Dreaddymck.com</a></li>
	</ul> 
</li>		
					`,					
		},
		default:  `<li class="active"><a href="/">Home</a></li>`,
	},
	menu_ext : {
		"iandigaming.blogspot.com" : `<li> <a href='https://iandigaming.blogspot.com/'>I and I gaming</a> </li>`,
		"iandicoding.blogspot.com" : `<li> <a href='https://iandicoding.blogspot.com/'>I and I coding</a> </li>`,
		"iandiwatching.blogspot.com" : `<li> <a href='https://iandiwatching.blogspot.com/'>I and I watching</a> </li>`,
		"dreaddymck.blogspot.com" : `<li> <a href='https://dreaddymck.blogspot.com/'>I and I dreaddymck</a> </li>`,
		"iandimeme.blogspot.com" : `<li> <a href='https://iandimeme.blogspot.com'>I and I meme</a> </li>`,		
	},
}
// blog_nav_menu.init();