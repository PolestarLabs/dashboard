const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path');

router.get('/:gallery', async function (req, res) {

    let GAL = req.params.gallery;
    const GalleryPath = path.resolve(__dirname+"/../../assets/build/galleries/"+GAL)


    fs.readdir(GalleryPath, function (err, files) {

        let rand = randomize(0, files.length - 1);       
        let filepath_l = path.resolve(GalleryPath+"/" +files[rand])
        //let file = fs.readFileSync(filepath);
    
        if(req.query.json==1){
            return res.json(HOST+"/build/galleries/"+files[rand])
      } 
        res.sendFile(filepath_l)

      });

});
router.get('/guess/:gallery', async function (req, res) {

    let GAL = req.params.gallery;
    const GalleryPath = path.resolve(__dirname+"/../../assets/build/guessing/"+GAL)

    fs.readdir(GalleryPath, function (err, files) {

        let rand = randomize(0, files.length - 1);       
        let filepath_l = path.resolve(GalleryPath+"/" +files[rand])
        //let file = fs.readFileSync(filepath);
    
        if(req.query.json==1){
            return res.json({url:HOST+"/build/guessing/"+GAL+"/"+files[rand], names:files[rand].replace(/-/g,' ').split('.')[0].split(',') })
      } 
        res.sendFile(filepath_l)

      });

});

router.get('/redir/:gallery/', async function (req, res) {
      let GAL = req.params.gallery;    
      const GalleryPath = path.resolve(__dirname+"/../../assets/build/galleries/"+GAL)
      fs.readdir(GalleryPath, function (err, files) {
            let rand = randomize(0, files.length - 1);       
            let filepath = HOST + "/build/galleries/"+GAL+"/" + encodeURIComponent(files[rand])   
            if(req.query.json==1){
                  return res.json(filepath)
            } 
            res.redirect(filepath)  
      });  
  });
router.get('/:gallery/size', async function (req, res) {
      let GAL = req.params.gallery;   
      const GalleryPath = path.resolve(__dirname+"/../../assets/build/galleries/"+GAL)   
      fs.readdir(GalleryPath, function (err, files) {
          res.json(files.length)  
        });  
  });

router.get('/:gallery/:index', async function (req, res) {
      let GAL = req.params.gallery;
      const GalleryPath = path.resolve(__dirname+"/../../assets/build/galleries/"+GAL)
      let IND = Number(req.params.index.split('.')[0]) || 0;      
      fs.readdir(GalleryPath, function (err, files) {
            IND =  Math.abs(IND) >= files.length  ? files.length - 1 : Math.abs(IND) ;   
          let filepath_l = path.resolve(GalleryPath+"/" +files[IND])
          res.sendFile(filepath_l)
        });  
  });


router.get('/:gallery/filter/:filter', async function (req, res) {
      let GAL = req.params.gallery;
      let FIL =  req.params.filter.split('.')[0];
      const GalleryPath = path.resolve(__dirname+"/../../assets/build/galleries/"+GAL)

      fs.readdir(GalleryPath, function (err, files) {
            files=files.filter(f=>f.includes(FIL))||files;
            let rand = randomize(0, files.length - 1);
            let filepath_l = path.resolve(GalleryPath+"/" +files[rand])
            if(req.query.json=="1") return res.json(HOST+"/build/galleries/"+GAL+"/" +files[rand]);
            res.sendFile(filepath_l)
        });  
  });


module.exports = router