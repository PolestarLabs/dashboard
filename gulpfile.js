const { parallel, series, src, dest } = require("gulp");
const cleanCSS = require("gulp-clean-css");
const image = require("gulp-image");
const debug = require("gulp-debug");
const minify = require("gulp-minify");
const clean = require("gulp-clean");
const font = require("gulp-font");

const ignore = ["!./**/*OLD*/**.*", "!./**/*OLD*.*", "!./**/_OLD/**/*.*"];

const inDir = "src"
const outDir = "dist";
const out = (file) => file.base.replace(inDir, outDir);

function clear() {
	return src("./dist", { allowEmpty: true })
		.pipe(clean({ force: true }));
}

function css() {
    return src(["./src/**/*.css", ...ignore])
        .pipe(debug())
        .pipe(cleanCSS())
        .pipe(dest(out));
}

function js() {
    return src(["./src/+(views|public)/**/*.js", ...ignore])
        .pipe(debug())
        .pipe(minify())
        .pipe(dest(out));
}

function assets() {
    return src([`./src/**/*.{${imgExt}}`,`../../DEV/dashboard/src/**/*.{${imgExt}}`, ...ignore])
        .pipe(image())
        .pipe(dest(out));
}

// TODO modular check for best font per type
// TODO add convertion of ttf to woff if no woff
function fonts() {
	return src(["./src/public/fonts/proximasoft/*.woff", "./src/public/fonts/!(proximasoft)/*.woff2"])
		.pipe(debug())
		.pipe(dest(out));
}

function others() {
    return src(["./src/**/*.*", "!./src/+(public|views)/**/*.js", "!./src/public/fonts/**/*.*", `!./src/**/*.{css,${imgExt}}`, ...ignore])
        .pipe(debug())
        .pipe(dest(out));
}

exports.build = series(css, js, assets, fonts, others);
exports.buildClean = series(clear, css, js, assets, fonts, others);
exports.buildNoAssets = series( css, js, fonts, others);

const imgExt = [
	"ase",
	"art",
	"bmp",
	"blp",
	"cd5",
	"cit",
	"cpt",
	"cr2",
	"cut",
	"dds",
	"dib",
	"djvu",
	"egt",
	"exif",
	"gif",
	"gpl",
	"grf",
	"icns",
	"ico",
	"iff",
	"jng",
	"jpeg",
	"jpg",
	"jfif",
	"jp2",
	"jps",
	"lbm",
	"max",
	"miff",
	"mng",
	"msp",
	"nitf",
	"ota",
	"pbm",
	"pc1",
	"pc2",
	"pc3",
	"pcf",
	"pcx",
	"pdn",
	"pgm",
	"PI1",
	"PI2",
	"PI3",
	"pict",
	"pct",
	"pnm",
	"pns",
	"ppm",
	"psb",
	"psd",
	"pdd",
	"psp",
	"px",
	"pxm",
	"pxr",
	"qfx",
	"raw",
	"rle",
	"sct",
	"sgi",
	"rgb",
	"int",
	"bw",
	"tga",
	"tiff",
	"tif",
	"vtf",
	"xbm",
	"xcf",
	"xpm",
	"3dv",
	"amf",
	"ai",
	"awg",
	"cgm",
	"cdr",
	"cmx",
	"dxf",
	"e2d",
	"egt",
	"eps",
	"fs",
	"gbr",
	"odg",
	"svg",
	"stl",
	"vrml",
	"x3d",
	"sxd",
	"v2d",
	"vnd",
	"wmf",
	"emf",
	"art",
	"xar",
	"png",
    "webp",
    "webm",
	"jxr",
	"hdp",
	"wdp",
	"cur",
	"ecw",
	"iff",
	"lbm",
	"liff",
	"nrrd",
	"pam",
	"pcx",
	"pgf",
	"sgi",
	"rgb",
	"rgba",
	"bw",
	"int",
	"inta",
	"sid",
	"ras",
	"sun",
	"tga"
].join(",");