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
            to: "0x3d67a6bd741c2ca0c99dcaafc6b7f0e75726f41c", 
            value: web3.toWei(Number(amount), "ether")}, 
            function(err, transactionHash){
                console.log(transactionHash);
                if(!err)
                {
                    var transaction = web3.eth.getTransaction(transactionHash);
                    let data = {};
                    data.receipt = transactionHash;
                    data.postId = postId;
                    data.value = web3.fromWei(transaction.value, 'ether');
                    callAjax(data);
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
            var value = web3.fromWei(response.data, 'ether');
            $("#questionVal").html(value + ' Eth');
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
        },
        error: function(response) {
            alert('you have voted');
        }
    })
});
