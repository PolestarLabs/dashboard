let default_img = "https://via.placeholder.com/120x120";

function miliarize(numstring, strict, symbol) {
  let sym = symbol || ".";
  if (!numstring) return 0;
  if (typeof numstring == "number") {
    numstring = numstring.toString();
  }
  if (numstring.length < 4) return numstring;

  var stashe = numstring.replace(/\B(?=(\d{3})+(?!\d))/g, sym).toString();

  if (strict === "ultra") {
    return stashe;
  }

  if (strict) {
    var stash = stashe.split(sym);
    switch (stash.length) {
      case 1:
        return stash;
      case 2:
        if (stash[1] != "000") break;
        return stash[0] + "K";
      case 3:
        if (stash[2] != "000") break;
        return stash[0] + sym + stash[1][0] + stash[1][1] + "Mi";
      case 4:
        if (stash[3] != "000") break;
        return stash[0] + sym + stash[1][0] + stash[1][1] + "Bi";
    }

    return stashe;
  }

  stash = stashe.split(sym);
  switch (stash.length) {
    case 1:
      return stash.join(" ");
    case 2:
      if (stash[0].length <= 1) break;
      return stash[0] + "K";
    case 3:
      return stash[0] + "Mi";
    case 4:
      return stash[0] + "Bi";
  }
  return stashe;
}
console.log(miliarize);
console.log(Vue);
const STORE = new Vue({
  el: "#storefront",
  components: {},
  data: {
    userdata,
    backgrounds: { loading: true },
    medals: { loading: true },
    boosters: { loading: true },
    stickers: { loading: true },
    market: { loading: true },
    defaultPrices: { loading: true },
    search: "",
    arrivals: [],
    currentModalItem: null
  },
  computed: {
    marketItems() {
      if (this.market.map) {
        return this.market.map((x) => x.metadata).filter((x) => !!x);
      } else {
        return [];
      }
    },
  },
  methods: {
    setCurrentItem(item){
      this.currentModalItem = item
    },
    hasItem(i) {
      if (!this.userdata) return false;
      if (i.type == "background")
        return this.userdata.modules.bgInventory.includes(i.code);
      if (i.type == "medal")
        return this.userdata.modules.medalInventory.includes(i.icon);
      if (i.type == "sticker")
        return this.userdata.modules.stickerInventory.includes(i.id);
      if (i.type == "skin")
        return this.userdata.modules.skinInventory.includes(i.id);
      return false;
    },
    timeFun(i) {
      return i * 20 + i * 80;
    },
    miliarize,
    selectPack(i, ref, noscroll) {
      console.log("aaa");
      if (!noscroll)
        this.$refs[ref].slideTo(i),
          (this.currentIndex = this.$refs[ref].currentSlide);
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
  },
});
console.log(STORE);
Promise.all([
  fetch("/api/cosmetics/search?type=background&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=medal&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=sticker&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=skin&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=flair&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/items/search?lim=10").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
]).then(res=>{
  STORE.arrivals.sort((a,b)=> b.release - a.release)
});

  fetch("/api/cosmetics/search?type=background").then((r) =>
    r.json().then(async (res) => (STORE.backgrounds = res.slice(0, 24)))
  ),

  fetch("/api/cosmetics/search?type=medal").then((r) =>
    r.json().then(async (res) => (STORE.medals = res.slice(0, 24)))
  ),

fetch("/api/items/search?type=boosterpack").then((r) =>
  r.json().then(async (res) => (STORE.boosters = res.slice(0, 24)))
);

fetch("/api/marketplace?limit=10").then((r) =>
  r.json().then(async (res) => (STORE.market = res))
);

fetch("/api/marketplace/rates").then((r) =>
  r
    .json()
    .then(
      async (res) =>
        (STORE.defaultPrices = Object.assign(res,{
          medal: res.medalPrices,
          background: res.bgPrices,
        }))
    )
);

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



// MODALS
 
  function buyStoreItem(type,item,currency="RBN"){
    Swal.fire({
      title: 'Select color',
      allowEscapeKey: () => !Swal.isLoading(),
      allowOutsideClick: () => !Swal.isLoading(),
      showConfirmButton: false,
      showLoaderOnConfirm: true,
      onOpen: Swal.clickConfirm,    
      preConfirm: () =>
        fetch(
          `/api/shop/${type}/buy/${item}`,
          {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ currency })
          }
        ).then((r) =>
          r.json().then( val=> {
            if(!r.ok){
              const newSwalOptions = {
                showCancelButton : true,
                showCloseButton : true,
              }
              if(val.code == 0xC1){
                currency = currency == 'RBN' ? 'SPH' : 'RBN';
                newSwalOptions.confirmButtonText = `Try with ${currency}`
                newSwalOptions.confirmButtonColor = currency == 'SPH' ? '#5599F0' : '#F03355';                    
              }
              if([0xB1,0xB2].includes(val.code)){
                newSwalOptions.showConfirmButton = false;
                if(val.code == 0xB1)
                  newSwalOptions.cancelButtonText = "Ah I can't have two?";
                if(val.code == 0xB2)
                  newSwalOptions.cancelButtonText = "Wow ok.";
              }
              if((val.code||00).toString(16).startsWith("f")){
                newSwalOptions.showConfirmButton = false;
                newSwalOptions.cancelButtonText = "😬"
              }
              
              Swal.update( newSwalOptions );
              return Swal.showValidationMessage(val.status);
            }
            return Swal.fire("wew")
            

          })
        )
    });
}
