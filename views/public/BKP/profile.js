function since(x){
    return [moment(x).format('MMMM DD YYYY'), moment(x).fromNow(1)]
}
 

  const RIGHT_COLUMN = new Vue({
     el: '#right',
     data: {
        userprofile,
        commendInfo: {loading:true},
      bgData: {loading:true},
        bgDataMarket: {loading:true},
        completionist:[
         {label: 'Stickers', val: userprofile.modules.stickerInventory.length ||0 , max: stickersSize},
         {label: 'Backgrounds', val: userprofile.modules.bgInventory.length ||0 , max: backgroundsSize},
         {label: 'Medals', val: userprofile.modules.medalInventory.length ||0 , max: medalsSize}
        ]
    }, 
      components:{
      "animated-number": window.AnimatedNumber,
      },
    methods:{
       bgInfo(bgID){
          fetch("https://beta.pollux.gg/api/cosmetics/search?code="+bgID+"&.png").then(r =>
            r.json().then(res => {
                console.log(res)
                this.bgData = res[0] || {name: "UNKNOWN", rarity: "C" };
                if(!res[0]) return;
                fetch("https://beta.pollux.gg/api/marketplace?item_id="+this.bgData._id+"&.png").then(r =>
                    r.json().then(res => {
                      const payload = {}
                      payload.entries = res.length
                     
                      if (payload.entries > 1){
                        payload.cheapest =   res.sort((a,b)=> {
                          let dfcA = a.price , dfcB = b.price;
                          if(a.currency == 'SPH') dfcA = a.price * 5000; 
                          if(b.currency == 'SPH') dfcB = b.price * 5000;
                          return b.price - a.price;
                        })[0]
                      }else if (payload.entries == 1){
                        payload.cheapest = res[0]
                      }
                      
                      this.bgDataMarket = payload;      
                    })
                );
            })
          );       
      },
      udata(commend){
        return this.commendInfo.userdata.find(x=> x.id == commend.id) || {}
      },
     
    }
  })
  const LEFT_COLUMN = new Vue({
    el: '#left',
    data: {
        relationships: {loading:true},
        bgData: {loading:true}
    }, 
    methods:{
        
    },
    computed:{
        wifeData(){
            if(!this.relationships.loading){
                const featRel = this.relationships.find(rel=> rel._id == userprofile.featuredMarriage )
                if(!featRel) return {id:false};
                let _wifeData = featRel.usersData.find(u=> u.id != userprofile.id)
                _wifeData.ring = featRel.ring;
                _wifeData.since = since(featRel.since);
                return _wifeData;
            }
            return {id:false};
        }
    }
  })
  
fetch("https://beta.pollux.gg/api/commends?uid="+userprofile.id+"&.png&full=1").then(r =>
    r.json().then(res =>  RIGHT_COLUMN.commendInfo = res  )
);
  
fetch("https://beta.pollux.gg/api/relationships?uid="+userprofile.id+"&.png").then(r =>
    r.json().then(res =>  LEFT_COLUMN.relationships = res  )
);
