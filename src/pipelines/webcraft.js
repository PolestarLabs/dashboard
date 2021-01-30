const ECO = ('../database/Economy')
// const DB = require('../database')

exports.run = async function(ITEM_IN,checking,req,res){
  
  let noteno_feed = []  
  let ITEMS = await DB.items.getAll();    
 
  
  let crafted_item = ITEMS.find(itm=>itm.id==ITEM_IN||itm.code==ITEM_IN);
    
  const userData = await DB.userDB.findOne({id:req.user.id},{"modules.JDE":1,"modules.SPH":1,"modules.RBN":1,"modules.inventory":1});
  if(crafted_item){
    let ID = crafted_item.id
    let NAME = crafted_item.name
    
    let ICON = crafted_item.icon || '';
    
    let CODE = crafted_item.code
    let MAT = crafted_item.materials
    let GC = crafted_item.gemcraft
    let fails = 0
        
    let UNNAFORDS = [
      
    ]
    async function breakit(item,USID){
      DB.userDB.findOneAndUpdate({
      'id':USID,
      'modules.inventory':item
      },{$set:{'modules.inventory.$':'DRAGGE'}}).then(async x=>{        
        await DB.userDB.findOneAndUpdate({'id':USID},{$pull:{'modules.inventory':'DRAGGE'}});
      })
    };    
    
    console.log(GC)
    
    if(GC.JDE){
      let afford = userData.modules.JDE >= GC.JDE;
      let diff = Math.abs(userData.modules.JDE - GC.JDE);
      let icona='yep';
      if(!afford){
        fails+=1
        UNNAFORDS.push("Jades ("+diff+")")
      }
     }
      
      
    
    if(GC.RBN){
      let afford = userData.modules.RBN >= GC.RBN;
          let diff = Math.abs(userData.modules.RBN - GC.RBN);
      let icona='yep';
      if(!afford){
        fails+=1
        UNNAFORDS.push("Rubines ("+diff+")")
      }
     }
      
      
    
    if(GC.SPH){
      let afford = userData.modules.SPH >= GC.SPH;
      let diff = Math.abs(userData.modules.SPH - GC.SPH);
      let icona='yep';
      if(!afford){
        fails+=1
         UNNAFORDS.push("Sapphires ("+diff+")")
      }
    }     
      
    
    MAT.forEach(material=>{
      if (userData.modules.inventory&&userData.modules.inventory.includes(material)){
        
      }else{
        fails+=1
        UNNAFORDS.push(ITEMS.find(x=>x.id==material).name)
      }
    })
    
    
    if (fails > 0 ) {

      if(checking==="true") return res.send(res.send({title:'UNNAFORD',UNNAFORDS}));
     res.send(payload);
    }else{   
      if(checking==="true") return res.send({title:"SUCCESS!"});
      
            await ECO.pay(req.user.id,GC.RBN,"crafting_dash","RBN");
            await ECO.pay(req.user.id,GC.JDE,"crafting_dash","JDE");
            await ECO.pay(req.user.id,GC.SPH,"crafting_dash","SPH");
            
            MAT.forEach(async itm=>{
              await breakit(itm,req.user.id);
            })
            
            await DB.userDB.set(req.user.id,{$push:{'modules.inventory': crafted_item.id}});

            res.send({title:"SUCCESS!"})
          }

      
      }
}