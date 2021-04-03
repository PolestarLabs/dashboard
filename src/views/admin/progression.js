//const upformula = (y,u1,u2) => ~~((Math.pow(y,u1/100)+y*u2));
//const level_to_xp = (lv,u1,u2) => ~~( Math.pow(u1/100,2) * Math.pow(lv - ~~(u1/1000) ,2)) / (Math.pow(u2,2) + 2);
//const xp_to_level = (xp,u1,u2) => ~~( Math.sqrt( xp*Math.pow(u2,2) + 3 * xp ) / (u1/100) ) + ~~(u1/1000) ;

//const xp_to_level =  (xp,u1,u2) => Math.floor(  Math.sqrt(xp + u2 * Math.sqrt(xp)) * (u1/1000) / 2 );
//const level_to_xp =  (lv,u1,u2) => Math.floor( (8*Math.pow(lv,2)+Math.pow(u2,2)*Math.pow(u1/1000,2)- (u2)*(u1/1000)*Math.sqrt(16*Math.pow(lv,2) + Math.pow(u2,2)*Math.pow(u1/1000,2))) / (2 * Math.pow(u1/1000,2))  );

//const xp_to_level =  (xp,A,B,C,lim) => Math.max(~~(-(100 * Math.log( ( lim-1 - xp) / (B * xp))) / (C * A)) ,0);
//const level_to_xp =  (lv,A,B,C,lim) =>  Math.max(0,~~((lim / (Math.exp(-C*(A/100)*lv)*B+1)) * 100) / 100)

const xp_to_level = (xp, A,B) => ~~( Math.sqrt( (xp * B) / A ) );
const level_to_xp = (lv, A,B) => ( A*Math.pow(lv,2)/B );

const fetchRanks = () => {
    fetch( `/admin/${serverid}/progression/top100` ).then(res => {
        res.json().then(json => (PROGEDIT.top100 = json));
    });
}

const PROGEDIT = new Vue({
    el:"#progression_edit",
    data:{
        top100:  {loading:true},
        selectedMember:{loading:true},
        usersFromCurrentQuery: [],
        A: upfactorA,
        B: upfactorB,
        C: 1000,
        limit: 250000,        
        defaults: [280,9],
        reset: [upfactorA,upfactorB],
    },
    components:{
        "v-select": VueSelect.VueSelect
    },
    methods:{
        edit(){

        },
        confirmEXPEdit(){
            Swal.fire({
                title: "Enter this member's new EXP amount!",
                input: 'number',
                showCancelButton: true,
                confirmButtonText: 'Do it!',
                showLoaderOnConfirm: true,
                preConfirm: (exp) => {
                    return new Promise((resolve) => {
                        fetch(`/admin/${serverid}/progression/${this.selectedMember.id}/edit`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json; charset=utf-8" },
                            body: JSON.stringify({ amount: Number(exp) })
                        }).then( data =>{
                            if(data.ok){
                                this.selectedMember.polluxData.exp = Number(exp);
                                this.selectedMember.polluxData.level = xp_to_level(Number(exp),upfactorA, upfactorB );
                                this.updateEverything();
                                return Swal.fire("Success!",'Level will update when the member interacts in your server again','success')
                            }else{
                                resolve(Swal.showValidationMessage("Error!","AAAAAAAAAAAAAAAAAAAAA","error"))
                            }
                        })
                    })
                },
            allowOutsideClick: () => !swal.isLoading()         
            }) 
        } ,
        confirmEXPNuke(){
            Swal.fire({
                title: "Are you sure you want to nuke this member's EXP?",
                showCancelButton: true,
                confirmButtonText: 'Yes baby!',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise((resolve) => {
                        fetch(`/admin/${serverid}/progression/${this.selectedMember.id}/edit`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json; charset=utf-8" },
                            body: JSON.stringify({ amount: 0, level: 0 })
                        }).then( data =>{
                            if(data.ok){                               
                                this.selectedMember.polluxData.exp = 0;
                                this.selectedMember.polluxData.level = 0;
                                this.updateEverything();
                                return Swal.fire("Nukes sent!",'This member is gonna start from scratch now. Oof!','success')
                            }else{
                                resolve(Swal.showValidationMessage("Error!","AAAAAAAAAAAAAAAAAAAAA","error"))
                            }
                        })
                    })
                },
            allowOutsideClick: () => !swal.isLoading()         
            }) 
        } ,
        confirmTotalMayhem(){
            Swal.fire({
                title: "Are you sure you want to nuke this entire server's progression data? This cannot be undone!",
                showCancelButton: true,
                confirmButtonText: 'Burn it!',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise((resolve) => {
                        fetch(`/admin/${serverid}/progression/nuke`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json; charset=utf-8" },
                        }).then( data =>{
                            if(data.ok){                               
                                this.updateEverything();
                                return Swal.fire("Nukes sent!",'Total mayhem has ensued! Your server will start anew.','success')
                            }else{
                                resolve(Swal.showValidationMessage("Error!","AAAAAAAAAAAAAAAAAAAAA","error"))
                            }
                        })
                    })
                },
            allowOutsideClick: () => !swal.isLoading()         
            }) 
        } ,
        resetOverride(){
            this.A = this.reset[0];
            this.B = this.reset[1];
        },
        updateEverything(){

            this.reset[0] = this.A;
            this.reset[1] = this.B;
            fetchRanks();
        },
        clear(){
            fetch( `/admin/${serverid}/progression/top100` ).then(res => {
                res.json().then(json => (PROGEDIT.top100 = json));
            });
        },
        setMember(mem,toggle){
            if(toggle){                
                PLX.accordion($("#progression_edit")).toggle(0, true);                
            }
            this.selectedMember = mem
        },
        onSearch(search, loading) {
            if(search.length) {
              loading(true);
              this.search(loading, search, this);
            }
        },
        levelFromXP(xp,curve){
            return  xp_to_level(xp,this.A,this.B,this.C,this.limit);
        },
        search: debounce((loading, search, vm) => {
            fetch(
                `/admin/${serverid}/progression/search?q=${escape(search)}`
            ).then(res => {
              res.json().then(json => (vm.usersFromCurrentQuery = json));
              loading(false);
            });
          }, 350)
        
    }
});

fetchRanks();


function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};





const canvas = document.getElementById("upchart");
const ctx = canvas.getContext('2d');
const SECOND_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim()
Chart.defaults.global.defaultFontColor = "#AAC";
Chart.defaults.global.defaultFontSize = 12;

function estimateTime(label,volume=200){

    let estimate = ~~(label / volume)+1;
    let parsed = estimate === 1 ? estimate+" day"
        : estimate > 365*2 ? ~~(estimate / 365)+" years"
        : estimate > 365 ? ~~(estimate / 365)+" year"
        : estimate > 60 ? ~~(estimate/30)+" months" 
        : estimate > 7 ? ~~(estimate/7)+" weeks"           
        : estimate + " days";
    return parsed;
}
function datagen(A=200,B=1000,C=1.5, limit=150000){ 
    return {  
        labels: ["Level 1", "Level 5", "Level 10", "Level 25", "Level 50","Level 100" ],
            datasets: [
                {
                    label: "EXP",
                    fill: 1,
                    lineTension: .4,
                    cubicInterpolationMode: 'monotone',            
                    borderColor: SECOND_COLOR,            
                    data: [1, 5, 10, 25, 50, 100].map(y=>level_to_xp(y,A,B,C,limit))
                }
            ]
        };
}

const PROGRESSION_GRAPH = new Chart(ctx, {
    type: "line",
    data: datagen(),
    options: {
        tooltips: {
        callbacks: {
            label: function (tooltipItem, data) {
                let label = tooltipItem.yLabel;
                let parsedlabel = label > 1000 ? label / 1000 + "K" : label;
                return `${data.datasets[tooltipItem.datasetIndex].label }: ${parsedlabel} (${estimateTime(label)})`;
            },
        },
        },
        responsive: false,
        layout: {padding: {right: 16}},
        scales: {
        xAxes: [{ticks: { stepSize: 1, autoSkip: false }}],
        yAxes: [
            {
            ticks: {
                callback: value => parseInt(value) / 1000 + "K",            
                suggestedMax: 150e3,
                max: 150e3,
            },
            },
        ],
        },
        legend: { display: 0 },
        title: {
        fontSize: 20,
        display: true,
        text: "Progression Preview",
        },
    },
});

const GRAPH = new Vue({
    el: "#progchart",
    data: {
        A: upfactorA,
        B: upfactorB,
        C: 0,
        limit: 150000,
        defaults: [280,9],
        fast: [145,20],
        slow: [350,3],
        reset: [upfactorA,upfactorB],
    },
    methods: {
        setTemplate(template,animate=0){
            this.A = this[template][0];
            this.B = this[template][1];
            this.updateChart(animate);
        },
        updateChart(animate=0) {
            //this.A,  this.B, this.C, this.limit

            const A = Number(this.A),
                  B = Number(this.B),
                  C = Number(this.C),
                  limit = Number(this.limit);
            console.log(typeof A, {A,B,C,limit})
            PROGRESSION_GRAPH.data = datagen( A,  B, C, limit);
            PROGRESSION_GRAPH.update(animate);
            PROGEDIT.A= A;
            PROGEDIT.B= B;
            PROGEDIT.C= C;
            PROGEDIT.limit= limit;
            return [1, 5, 10, 25, 50, 100].map((y) => `Level ${y}: ~${estimateTime( level_to_xp( y,A,  B, C, limit) )}`);
        },
    },
});


