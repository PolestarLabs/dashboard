  let default_img = "https://via.placeholder.com/120x120";
  
function miliarize(numstring,strict,symbol){
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
  }
  console.log(miliarize)
  console.log(Vue)
  const STORE = new Vue({
      el:'#storefront',
      components:{
          
      },
      data:{
          userdata,
          backgrounds: {loading:true},
          medals: {loading:true},
          boosters: {loading:true},
          stickers: {loading:true},
          market: {loading:true},
          defaultPrices:  {loading:true},
          search: "",
          arrivals : [
            
            ]
      },
      computed: {
        marketItems(){
          if(this.market.map){
            return this.market.map(x=>x.metadata).filter(x=>!!x)
          }else{
            return []
          }
        },
      },
      methods:{
        hasItem(i){
          if (!this.userdata) return false;
          if (i.type == 'background')
            return this.userdata.modules.bgInventory.includes(i.code);
          if (i.type == 'medal')
            return this.userdata.modules.medalInventory.includes(i.icon);
          if (i.type == 'sticker')
            return this.userdata.modules.stickerInventory.includes(i.id);
          if (i.type == 'skin')
            return this.userdata.modules.skinInventory.includes(i.id);
          return false;  
          
        },
        timeFun(i){
          return i*20+i*80
        },
          miliarize,
          selectPack(i,ref,noscroll){
              console.log('aaa')
              if(!noscroll)
                this.$refs[ref].slideTo(i),
                this.currentIndex = this.$refs[ref].currentSlide;
            },
          filterMeds() {
              if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
              }
              this.timer = setTimeout(() => {
                var input = this.search;
                var filter = document.getElementById("filter-arrivals");
                if (input == "") filter.setAttribute("plx-filter-control", "");
                else
                  filter.setAttribute(
                    "plx-filter-control",
                    "filter:[data-search*='" + input + "'i] ; group:search"
                  );
        
                filter.click();
              }, 800);
            },
      }
  })
  console.log(STORE)
  fetch("/api/cosmetics/search?skip=710&lim=100").then(r =>
      r.json().then(async res =>  STORE.arrivals = shuffle(res).slice(0,24)  )
  );

  fetch("/api/cosmetics/search?type=background").then(r =>
      r.json().then(async res =>  STORE.backgrounds = shuffle(res).slice(0,24)  )
  );


  fetch("/api/cosmetics/search?type=medal").then(r =>
      r.json().then(async res =>  STORE.medals = shuffle(res).slice(0,24)  )
  );


  fetch("/api/items/search?type=boosterpack").then(r =>
      r.json().then(async res =>  STORE.boosters = shuffle(res).slice(0,24)  )
  );

  fetch("/api/marketplace?limit=10").then(r =>
      r.json().then(async res =>  STORE.market = res)
  );
 
  fetch("/api/meta/rates").then(r =>
      r.json().then(async res =>  STORE.defaultPrices = {medal: res.medalPrices, background: res.bgPrices})
  );
 

  function shuffle(array) {


          let currentIndex = array.length, temporaryValue, randomIndex;
          
          while (0 !== currentIndex) {
              
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      
      return (array);

    }
    