var items = [
    {name:"Item Name",id:"itemid",rarity:"UR",icon:"https://via.placeholder.com/180x180",mini:"https://via.placeholder.com/80x80",materials:[{id:'someitem2',count:7},{id:'someitem3',count:2}],gemcraft:{JDE:1000}},
    {gemcraft:{JDE:1000},name:"Item Name",id:"someitem2",rarity:"R",icon:"https://via.placeholder.com/180x180",mini:"https://via.placeholder.com/80x80",materials:[{id:'someitem3',count:5}]},
    {name:"Item Name",id:"someitem3",rarity:"C",icon:"https://via.placeholder.com/180x180",mini:"https://via.placeholder.com/80x80",materials:[],gemcraft:{JDE:1000} }
  ];
  
  const BASIC_MATS = new Vue({
    el:"#items-craft",
    data: {
      items,
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
        setTimeout(_=>{
          this.tooltip = konoitem;
        },3000)
      }
    }
  })