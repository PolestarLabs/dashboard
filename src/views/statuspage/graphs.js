var ctx = document.getElementById('myChart').getContext('2d');


var LABELS = statusDatabase.filter(sd => sd.shard == 0).map(itm => { return itm.timestamp; }).slice(-100);
var DATA   = meanArray(shards.map((shd, _i) => { return statusDatabase.filter(tm => tm.shard === shd).map(itm => itm.api_ping || 1).slice(-100) }));

var latencyChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: LABELS,
        datasets: [
            {
                label: "Average Latency",
                backgroundColor: "#FF6699",
                data: DATA
            },
            /* {
             label: "Active Users",                                  
             backgroundColor: "#9966FF",
             data:  meanArray(shards.map((shd,i,a)=>{return statusDatabase.filter(tm=>tm.shard === shd).map(itm=>itm.users||1).slice(-100)})),   
             }*/
        ]
    },
    options: {
        animation:false,
        scales: {
            xAxes: [{
                stacked: true,
                ticks: {
                    stepSize: 600000,
                    callback: function (value) {
                        return moment(value).format(" h:mm a")
                    }
                },
            }],
            yAxes: [{
                stacked: false,
                //type:"logarithmic",
                ticks: {
                    min: 0,
                    stepSize: 100,
                    // max: 1000,
                    callback: function (value) {
                        return Number(value.toString());
                    }
                }
            }]
        }
    },
    //responsive: true,
    maintainAspectRatio: false 
});



function meanArray(arrays) {
    result = [];
    for (var i = 0; i < arrays[0].length; i++) {
        var num = 0;
        for (var i2 = 0; i2 < arrays.length; i2++) {
            num += arrays[i2][i];
        }
        result.push(1 + Math.round(num / arrays.length));
    }
    return result;
}