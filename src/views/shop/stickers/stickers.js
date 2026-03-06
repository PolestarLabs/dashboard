
STICKERS = new Vue({
  el:'#stickers',
  components:{
    "animated-number": window.AnimatedNumber,
      Hooper: window.Hooper.Hooper,
     Slide: window.Hooper.Slide,
    HooperPagination: window.Hooper.Pagination,
    HooperNavigation: window.Hooper.Navigation
  },
  data:{
    loaded: false,
    STIKS,STKPAK, currentIndex:0, selectedPakComplete:STKPAK[0], selectedPak:STKPAK[0].icon,
    toggleOwned: false,userdata,
    hooperSettings: {
        centerMode: true,
        infiniteScroll: true,
       breakpoints: {
         1800: {itemsToShow: 9},
         1600: {itemsToShow: 8},
         1400: {itemsToShow: 7},
         1200: {itemsToShow: 6},
         1000: {itemsToShow: 5},
          720: {itemsToShow: 4},
          500: {itemsToShow: 3},
          360: {itemsToShow: 2},
          0: {
            itemsToShow: 1.5,
            pagination: 'fraction'
          }}
        //mouseDrag:false,
        //transition: 100,
        //initialSlide: flairsAvailable.indexOf(userdata.modules.flairTop)
      }
  },
  methods:{
      packProgress(){
        let thisPack = this.STIKS.filter(x=>x.series_id == this.selectedPak).map(x=>x.id);
        let val = userdata.profile.stickerInventory.filter(x=> thisPack.includes(x) ).length
        let max = thisPack.length;
        
        return {pct: Math.floor(100/(val==0?100:(max / val))), val,max}
    },
    hasSticker(stk){
        return this.toggleOwned? userdata.profile.stickerInventory.includes(stk.id):true;
    },
    calculateTime(item){
      let timestamp = item._id.toString().substring(0,8)
      return new Date( parseInt( timestamp, 16 ) * 1000 )
    },
    onslidePacks(){
 
      this.$refs.paks.restart()
      let index =this.$refs.paks.currentSlide
      if(index >= STKPAK.length) index = 0; 
      if(index < 0 ) index = STKPAK.length-1;
      this.currentIndex = index
      this.selectPack(index,STKPAK[index],true)
    },
    selectPack(i,p,noscroll){
      
      if(!noscroll)
        this.$refs.paks.slideTo(i),
        this.currentIndex = this.$refs.paks.currentSlide;
      this.selectedPak = p.icon
      this.selectedPakComplete = p
    },
    setStar(sticker){
      return [0,"C","U","R","SR","UR","XR"].indexOf(sticker.rarity)
    },
    updateIndex(){
      if (this.timeout)  clearTimeout(this.timeout);
      this.timeout = setTimeout(()=>{
        let ind = PLX.slider('#slider').index + 2
        this.selectedPak = STKPAK[ind].icon
        this.currentIndex= ind;        
      },300) 
    }
  },
  computed:{
   
  }
})

//PLX.util.on('#slider' ,'itemshown', ()=>STICKERS.updateIndex() )