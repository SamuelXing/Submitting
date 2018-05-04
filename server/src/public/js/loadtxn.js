var page = 1, 
    curBlock = 0,
    timers = null; 

$(window).scroll(function() {
    if (($(window).height() + $(window).scrollTop() + 60) >= $(document).height()) {
        clearTimeout(timers);
        timers = setTimeout(function() {
            page++;
            LoadingData();
        }, 300);
    }
});

var LoadingData = function() {
    var dom = '';
    $.ajax({
        type: 'GET',
        async: true,
        dataType: 'json',
        url: '/transactions/api/getpage/'+ curBlock,
        success: function(data) {
            curBlock = data.curBlock;
            txns = data.txns;
            console.log(curBlock);
            for(var i = 0; i < txns.length; i++)
            {
                dom += `
                <tr>
                    <td><p class="overflow"><a href="/transactions/`+ txns[i].hash+`">`+ txns[i].hash +`</a></p></td>
                    <td><a href="/blocks/`+ txns[i].blockNumber+`">`+ txns[i].blockNumber +`</td>
                    <td><p class="overflow">`+ txns[i].from +`</p></td>
                    <td><p class="overflow">`+ txns[i].to + `</p></td>
                    <td>`+ Number(txns[i].value)/1000000000000000000 +`Ether </a></td>
                </tr>
                `;
                document.getElementById("list_box").style.display = "block";
                document.getElementById("loader").style.display = "none";
            }
            
            $('#list_box').append(dom);
        },
        error: function(response) {
        }
    });
};


$(document).ready(function() {
    LoadingData();
});
    