document.addEventListener('newTxn', function(e){
    console.log(e);
})

var bid = $('#bid');
bid.click(function(type){
    const fromAddress = $("#user-account").text();
    const amount = $("#amount").val();
    const postId = $("#questionId").text();
    if(amount!='')
    {
        web3.eth.sendTransaction({from: fromAddress, 
            to: "0x7949cbab5bb23342a90e87da70ef20534c6e7c4b", 
            value: web3.toWei(Number(amount), "ether")}, 
            function(err, transactionHash){
                console.log(transactionHash);
                if(!err)
                {
                    web3.eth.getTransaction(transactionHash, function(err, transaction){
                        if(err)
                        {
                            console.log(err);
                        }
                        else{
                            let data = {};
                            data.receipt = transactionHash;
                            data.postId = postId;
                            data.value = amount;
                            callAjax(data);
                        }
                    });
                }
                else
                {
                    alert(err);
                }
        });
    }else
    {
        $('#notify').html('empty amount is not allowed!');
    } 
    console.log('/piazza/api/'+postId+'/pay');
});

function callAjax(data)
{
    console.log(data);
    $.ajax({
        type: 'post',
        async: true,
        data: data,
        // contentType: 'application/json',
        dataType: 'json',
        url: '/piazza/api/pay/',
        success: function(response) {
            console.log(response);
            $("#notify").html('paid successfully! Receipt: '+ data.receipt);
            $("#bid").prop("disabled",true);
            $("#payforit").prop("disabled",true);
            var value = response.data;
            $("#questionVal").html(''+ web3.fromWei(value ,'ether') + ' Eth');
        },
        error: function(response) {
            alert('cannot process your payment');
        }
    });
}

$('.upvote').click(function(){
    var id = $(this).children('#id').html();
    console.log(id);
    $.ajax({
        type: 'POST',
        async: false,
        url: '/piazza/api/upvote/'+id,
        success: function(response) {
            $("#"+id).html(response); 
            setTimeout(function(){
                location.reload();
            },2000);
        },
        error: function(response) {
            alert('you have voted');
        }
    })
});
