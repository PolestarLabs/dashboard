const MENU = new Vue({
    el:"#main",
    data:{
        items: [],
        seluid:"",
        cosmetics: [],
        quests: [],
        selectedItem: "",
        itemToAward: "",
        selectedUser: {},
        selectedServer: {},
        relationships:[],
        stickers: [],
        bgs: [],
        medals: [],
        flairs: [],
        gemsaward: 0,
        gemToAward: "RBN"
        

    },
    methods:{
        selectUser(){
            fetch("/api/v1/user/"+this.seluid).then(r =>
                r.json().then(res =>  this.selectedUser = res  )
            );  
            
        },
        selectServer(){
            fetch("/api/v1/server/"+this.selectedServerID).then(r =>
                r.json().then(res =>  this.selectedServer = res  )
            );  
            
        },
        giveItem(id){
             
            fetch(`/godmode/giveitem/${this.seluid}/${id}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
               // body: JSON.stringify({ pot, item }),
            }).then(r =>
          
                alert("OK")
            );
        },
        giveBg(id){
             
            fetch(`/godmode/givebg/${this.seluid}/${id}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
               // body: JSON.stringify({ pot, item }),
            }).then(r =>
                
                alert("OK")
            );
        },
        giveSticker(id){
             
            fetch( `/godmode/givesticker/${this.seluid}/${id}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
               // body: JSON.stringify({ pot, item }),
            }).then(r =>
                
                alert("OK")
            );
        },
        giveMedal(id){
             
            fetch(`/godmode/givemedal/${this.seluid}/${id}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
               // body: JSON.stringify({ pot, item }),
            }).then(r =>
                
                alert("OK")
            );
        },
        giveGems(q,id){
             
            fetch(`/godmode/givegems/${this.seluid}/${id}/${q}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
               // body: JSON.stringify({ pot, item }),
            }).then(r =>
               
                alert("OK")
            );
        },
        
    }
})


  

fetch("/api/v1/cosmetics/all").then(r =>
    r.json().then(res =>  MENU.stickers = res  )
);

fetch("/api/v1/cosmetics/all").then(r =>
    r.json().then(res =>  MENU.cosmetics = res  )
);

fetch("/api/v1/cosmetics/all").then(r =>
    r.json().then(res =>  MENU.bgs = res  )
);

fetch("/api/v1/cosmetics/all").then(r =>
    r.json().then(res =>  MENU.medals = res  )
);

fetch("/api/v1/cosmetics/all").then(r =>
    r.json().then(res =>  MENU.flairs = res  )
);

fetch("/api/v1/items/all").then(r =>
    r.json().then(res =>  MENU.items = res  )
);