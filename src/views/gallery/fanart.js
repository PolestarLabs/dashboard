const FANA = new Vue({
    el: "#fana",
    data: {
        hearts: ((userdata.counters||{}).hearts || []),
        galhearts
    },
    methods:{
        heartit(item){
            let action = this.hearts.includes(item) ? "remove" : "add";

            if(action == "remove"){
                this.hearts = this.hearts.filter(a=>a!==item);
                this.galhearts.find(i=>i.id===item).hearts--
            }
            else{
                this.hearts.push(item);
                this.galhearts.find(i=>i.id===item).hearts++
            }

            
            fetch("/api/user/fanart-hearts/"+(action)+"/"+item, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" }
            }).then(async res => {
                if (res.ok == true)
                    PLX.notify("Heart added!")
                else 
                    PLX.notify("ERROR")
            });
        },
        isHearted(item){
            return this.hearts.includes(item);
        },
        heartsOf(item){
            return (this.galhearts.find(i=>i.id===item)||{}).hearts || 0
        }
    }
})