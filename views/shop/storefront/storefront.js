let default_img = "https://via.placeholder.com/120x120";
 
 

STORE = new Vue({
    el:'#storefront',
    components:{
        Hooper: window.Hooper.Hooper,
        Slide: window.Hooper.Slide,
       HooperPagination: window.Hooper.Pagination,
       HooperNavigation: window.Hooper.Navigation
    },
    data:{
        backgrounds: {loading:true},
        medals: {loading:true},
        boosters: {loading:true},
        stickers: {loading:true},
        hooperSettings:{
            infiniteScroll: true,
            centerMode: true,
            itemsToSlide: 3,
            transition: 800,
            breakpoints:{
                
                1000: {itemsToShow: 3},
                 720: {itemsToShow: 3},
                 500: {itemsToShow: 3},
                 460: {itemsToShow: 1.5,itemsToSlide:1},
                 0: {
                   itemsToShow: 1.2,
                   pagination: 'fraction',
                   itemsToSlide:1
                }}
        },
        hooperSettingsNarrow:{
            infiniteScroll: true,
            centerMode: true,
            breakpoints:{                
                1000: {itemsToShow: 5},
                 720: {itemsToShow: 5},
                 500: {itemsToShow: 3},
                 460: {itemsToShow: 2},
                 0: {
                   itemsToShow: 1.5,
                   pagination: 'fraction',
                   itemsToSlide:1
                }}
        },
        search: "",
        arrivals : [
          
          ]
    },
    methods:{
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

fetch("/api/cosmetics/search?skip=710&lim=100").then(r =>
    r.json().then(async res =>  STORE.arrivals = shuffle(res).slice(0,10)  )
);

fetch("/api/cosmetics/search?type=background").then(r =>
    r.json().then(async res =>  STORE.backgrounds = shuffle(res).slice(0,24)  )
);


fetch("/api/cosmetics/search?type=medal").then(r =>
    r.json().then(async res =>  STORE.medals = shuffle(res).slice(0,24)  )
);


fetch("/api/items/search?type=boosterpack").then(r =>
    r.json().then(async res =>  STORE.stickers = shuffle(res).slice(0,24)  )
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
  