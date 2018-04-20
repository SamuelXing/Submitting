var page = 1, 
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
        url: '/blocks/api/getpage/'+page,
        success: function(blocks) {
            for(var i = 0; i < blocks.length; i++)
            {
                dom += `
                <tr>
                    <td><a href="/blocks/`+ blocks[i].number+`">`+ blocks[i].number +`</a></td>
                    <td>`+ blocks[i].timestamp +`</td>
                    <td>`+ blocks[i].difficulty +`</td>
                    <td>`+ blocks[i].gasUsed +`</td>
                    <td>`+ blocks[i].gasLimit + `</td>
                    <td class="overflow"><a href="#">`+ blocks[i].miner +`</a></td>
                </tr>
                `
            }
            $('#list_box').append(dom);
        },
        error: function(response) {
            alert('cannot get data');
        }
    });
};

$(document).ready(function() {
    LoadingData();
});
    