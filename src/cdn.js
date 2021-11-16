const Express = require('express');
const path = require('path');

const app = Express();

const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";
const cacheOpts = {
  "cache": [
    {
      "path": "(.*).(jpg|png)$",
      "ttl": 3600
    }
  ]
}

app.use(cacheMid(cacheOpts));
app.use(Express.static(path.join(__dirname, './public')));
app.use(Express.static(path.join( ASSETS_PATH, './imgres')));
app.use(Express.static(path.join( ASSETS_PATH, './cosmetics')));
app.use(["/images/artwork","/artwork"], Express.static(path.join( ASSETS_PATH, './artwork')));
app.use("/images", Express.static(path.join(__dirname, './public/images')));
app.use("/images", Express.static(path.join( ASSETS_PATH, './website')));
app.use("/flairs",    Express.static(path.join( ASSETS_PATH, './cosmetics/flairs')));
app.use("/medals",    Express.static(path.join( ASSETS_PATH, './cosmetics/medals')));
app.use("/stickers",  Express.static(path.join( ASSETS_PATH, './cosmetics/stickers')));
app.use("/items",  Express.static(path.join( ASSETS_PATH, './build/items')));
app.use("/boosters",  Express.static(path.join( ASSETS_PATH, './build/boosters')));
app.use("/backdrops", Express.static(path.join( ASSETS_PATH, './cosmetics/backdrops')));
app.use("/build",     Express.static(path.join( ASSETS_PATH, './build')));
//backwards compat
app.use("/build/backdrops", Express.static(path.join( ASSETS_PATH, './cosmetics/backdrops')));
app.use("/build/stickers",  Express.static(path.join( ASSETS_PATH, './cosmetics/stickers')));
app.use("/build/flairs/top",    Express.static(path.join( ASSETS_PATH, './cosmetics/flairs')));
 
// CATCH 404
app.use(function (req, res, next) {
  if(req.handled) return; 
  if (res.headersSent) return next(err);
  res.status(404).send('404'); 
});

// ERROR HANDLER
app.use(async function (err, req, res, next) {
    console.error(err);
    res.status(500).send('500'); 
})

process.on('unhandledRejection', function (reason, p) {
  console.error("Possibly Unhandled Rejection at: Promise \n".red, p, "\n\n reason: ".red, reason);
  process.exit(1)
});
process.on('uncaughtException', function (err) {
  console.error(err)
  process.exit(1)
});

const port = process.env.DASHPORT;
app.listen(port, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:'+port)
})



function cacheMid(opts){
  return function (req, res, next) {
    if (typeof opts === 'object' && typeof opts.cache === 'object') {
        opts.cache.forEach(function (route) {

            if (req.path.match(new RegExp(route.path, 'g'))) {
                res.set('Cache-Control', 'max-age=' + route.ttl);
            }
        });
    }

    next();
  }
}