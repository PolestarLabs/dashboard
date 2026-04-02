var items = [
    {name:"Item Name",id:"itemid",rarity:"UR",icon:"https://via.placeholder.com/180x180",mini:"https://via.placeholder.com/80x80",materials:[{id:'someitem2',count:7},{id:'someitem3',count:2}],gemcraft:{JDE:1000}},
    {gemcraft:{JDE:1000},name:"Item Name",id:"someitem2",rarity:"R",icon:"https://via.placeholder.com/180x180",mini:"https://via.placeholder.com/80x80",materials:[{id:'someitem3',count:5}]},
    {name:"Item Name",id:"someitem3",rarity:"C",icon:"https://via.placeholder.com/180x180",mini:"https://via.placeholder.com/80x80",materials:[],gemcraft:{JDE:1000} }
  ];
  
  const BASIC_MATS = new Vue({
    el:"#items-craft",
    data: {
      items: [],
      items_basic: [],
      items_extra: [],
      tooltip:{loading:true}
    },
    methods:{
      parseItem(item){
        return this.items.find(x=> x.id == item.id);
      },
      loadTooltip(item){
        this.tooltip = {loading:true};
        let konoitem = this.items.find(x=> x.id == item.id);
        console.log({konoitem,item,inv:this.items})
        fetch("/api/v1/v1/items/"+item.id).then((r) => r.json().then((res) => (this.tooltip = res)));
        
      },

      miliarize(numstring,strict,symbol){
        let sym = symbol||"." 
        if (!numstring)return 0 ;
          if (typeof numstring == "number"){
              numstring = numstring.toString()
          }
          if(numstring.length < 4)return numstring;
  
          var stashe = numstring.replace(/\B(?=(\d{3})+(?!\d))/g, sym).toString();
  
          if(strict==="ultra"){
              return stashe;
          }
          
          if(strict){
  
              //log(stashe)
              //log(typeof stashe)
              var stash = stashe.split(sym)
          switch(stash.length){
              case 1:
                  return stash;
              case 2:
                  if(stash[1]!="000") break;
                  return stash[0]+"K";
              case 3:
                  if(stash[2]!="000") break;
                  return stash[0]+sym+stash[1][0]+stash[1][1]+"Mi";
              case 4:
                  if(stash[3]!="000") break;
                  return stash[0]+sym+stash[1][0]+stash[1][1]+"Bi";
               }
  
              return stashe;
          }        
  
          stash = stashe.split(sym)
          switch(stash.length){
              case 1:
                  return stash.join(" ");
              case 2:
                  if(stash[0].length<=1) break;
                  return stash[0]+"K";
              case 3:
                  return stash[0]+"Mi";
              case 4:
                  return stash[0]+"Bi";
               }
           return stashe;
        }
    }
  })

  fetch("/api/v1/items/search?craftables=1&type=material").then((r) => r.json().then((res) => (BASIC_MATS.items = res)));