
function since(x){
    return [moment(x).format('MMMM DD YYYY'), moment(x).fromNow(1)]
}
 

  const PROFILE = new Vue({
     el: '#profile',
     data: {
        userprofile,
        AS1:'',
        AS2:'',
        AS3:'',
        boorucollection: {loading:true},
        commendInfo: {loading:true},
        commendRank:{
          in: {loading:true},
          out:  {loading:true}
        },
        bgData: {loading:true},
        relationships: {loading:true},
        bgDataMarket: {loading:true},
        sticker: {loading:true},
        background: {loading:true},
        medals: [null,null,null,null,null,null,null,null,null],
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
      miliarize(numstring,strict,symbol){
        let sym = symbol||"." 
        if (!numstring)return 0 ;
          if (typeof numstring == "number"){
              numstring = numstring.toString()
          }
          if(numstring.length < 4) return numstring;
  
          var stashe = numstring.replace(/\B(?=(\d{3})+(?!\d))/g, sym).toString();
  
          if(strict==="ultra"){
              return stashe;
          }
          
          if(strict){
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
        },

        parseWife(rel){
          return rel ? rel.usersData.find(x=> this.userprofile.id != x.id ) : null;
        }
    },
    computed:{
      wifeData(){
          if(!this.relationships.loading){
              const featRel = this.relationships.find(rel=> rel.id == userprofile.featuredMarriage )
              if(!featRel) return {id:false};
              let _wifeData = featRel.usersData.find(u=> u.id != userprofile.id)
              _wifeData.ring = featRel.ring;
              _wifeData.lovepoints = featRel.lovepoints;
              _wifeData.since = since(featRel.since);
              return _wifeData;
          }
          return {id:false};
      }
  },
  mounted(){
    this.AS1 = $('#ads .bottom').html()
    this.AS2 = $('#ads .sidebar').html()
    this.AS3 = $('#ads .sidebar').html()
  }
  })
 
  
fetch("/api/commends?uid="+userprofile.id+"&.png&full=1").then(r =>
    r.json().then(res =>  PROFILE.commendInfo = res  )
);
fetch("/api/commendrank/"+userprofile.id+"/in?.png&full=1").then(r =>
    r.json().then(res =>  PROFILE.commendRank.in = res  )
);
  
fetch("/api/commends?uid="+userprofile.id+"&.png&full=1").then(r =>
    r.json().then(res =>  PROFILE.commendInfo = res  )
);
  
fetch("/api/relationships?uid="+userprofile.id+"&plxdata=1").then(r =>
    r.json().then(res =>  PROFILE.relationships = res  )
);

fetch("/api/cosmetics/search?type=sticker&id="+userprofile.modules.sticker+"&.png").then(r =>
    r.json().then(res =>  PROFILE.sticker = res[0]  )
);

fetch("/api/cosmetics/search?type=background&code="+userprofile.modules.bgID+"&.png").then(r =>
    r.json().then(res =>  PROFILE.background = res[0]  )
);


userprofile.modules.medals.forEach((medal,i)=>{
  
  fetch("/api/cosmetics/search?type=medal&icon="+userprofile.modules.medals[i]+"&.png").then(r =>{
  
    r.json().then(res => {
      PROFILE.medals[i] = res[0]
      if(!res[0]){
        fetch("/api/achievements/"+userprofile.modules.medals[i]+"&.png").then(rr =>
          rr.json().then(res2 =>  {
            if(!res2) return PROFILE.medals[i] = {name:"Unknown ",type:'achievement'};
            PROFILE.medals[i] = res2[0];
          })
        );
      }
    })
  });
})


$.fn.parallax = function(resistance, mouse) {
  $el = $(this);
  TweenLite.to($el, 0.52, {
    x: -((mouse.clientX - window.innerWidth / 2) / (resistance*60)  ),
    y: -((mouse.clientY - window.innerHeight / 2) / (resistance*80)  ),
    duration: 1,
    ease: 'circ'
  });
};
$(document).mousemove(function(e) {
  $(".parallax-back").parallax(-3, e);
  $(".parallax-fore-4").parallax(.5, e);
  $(".parallax-fore-3").parallax(1, e);
  $(".parallax-fore-2").parallax(2, e);
  $(".parallax-fore-1").parallax(3, e);
  $(".parallax-fore-0").parallax(4, e);
  });
 
window.onload = (event) => {
  (()=>{
    document.querySelector(".avatar-frame").style.setProperty('--total-length', document.querySelector(".avatar-frame .plx-svg path").getTotalLength() + "px");
  })();
};


fetch("/dash/imgbookmarks/"+userprofile.id+"?.png").then(r =>
  r.json().then(res =>  PROFILE.boorucollection = res  )
);