const gulp = require("gulp");//引入gulp
const gulp_uglify = require("gulp-uglify");//压缩文件
const gulp_concat = require("gulp-concat");//合并文件
const sass = require("gulp-sass");//编译sass
const minifyCss = require("gulp-minify-css");//压缩css
const gulp_clean = require("gulp-clean");//清空磁盘
const rev = require("gulp-rev");//md5加密
const collector = require("gulp-rev-collector")//动态替换html内静态资源
const minifyHtml = require("gulp-minify-html")//压缩html
const rename = require("gulp-rename")//重命名
const connect = require("gulp-connect");//创建连接
const respond = require("gulp-respond");//响应
const path = require("path");
const fs = require("fs");
//清理磁盘
gulp.task("clean", function(){
	return gulp.src("./build")
		.pipe( gulp_clean())
})
//压缩Js
gulp.task("minifyJs",["clean"],function(){
	return gulp.src(["./src/js/*.js"])
		.pipe(gulp_uglify())
		.pipe(gulp_concat("all.min.js"))
		.pipe(rev()) //加密文件
		.pipe(gulp.dest("./build/js"))
		.pipe(rev.manifest('js.json'))
		.pipe(gulp.dest('./cache'))
}) 
//压缩css
gulp.task("minifyCss",["clean"],function(){
	return gulp.src(["./src/css/*.scss"])
		.pipe(sass()) //编译scss
		.pipe(minifyCss()) //压缩css
		.pipe(gulp_concat("all.css"))
		// .pipe(rev()) //加密文件
		.pipe(gulp.dest("./build/css"))//输出文件
		.pipe(rev.manifest("css.json"))
		.pipe(gulp.dest("./cache"))
})
//压缩html
gulp.task("minifyHtml",["clean"], function(){
	return gulp.src("./index.html")
		.pipe(minifyHtml())
		.pipe(rename(function(opt){
			opt.basename = "reindex"
		}))
		.pipe(gulp.dest("./build/html"))
})
//动态替换html的静态资源
gulp.task("rev",["minifyJs","minifyCss","minifyHtml"],function(){
	gulp.src(["./cache/*.json","./build/reindex.html"])
		.pipe(collector())
		.pipe(gulp.dest("./"))
})
//监听时的数据
const arr = [
	"./src/js/*.js",
	"./src/css/*.scss"
]
//设置服务启动
gulp.task("connect",function(){
	connect.server({
		"root":"./",
		"port":8080,
		"middleware":function(){
			return [
				function(req, res){
					var pathname = req.url.split("?").shift()
						pathname = pathname == "/" ? "./build/html/reindex.html":pathname
					var url = path.join(__dirname, pathname)
					//fs获取数据
					// res.end(fs.readFileSync(url))
					//gulp获取
						return gulp.src(url)
							       .pipe(respond(res))
				}
			]
		}
	})
})

//设置监听
gulp.task("watch",function(){
	return gulp.watch(arr, ["main"])
})

gulp.task("main",["watch","rev"])
