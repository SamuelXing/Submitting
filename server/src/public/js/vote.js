var bid = $('#bid');
bid.click(function(){
    web3.eth.sendTransaction({from: web3.eth.accounts[0], to: "0x3d67a6bd741c2ca0c99dcaafc6b7f0e75726f41c", value: "100"}, function(err, transactionHash){
        if(!err)
            console.log(transactionHash);
        else
            console.error(err);
    })
});

$('.upvote').click(function(){
    var id = $(this).children('#id').html();
    console.log(id);
    $.ajax({
        type: 'POST',
        async: false,
        url: '/piazza/api/upvote/'+id,
        success: function(response) {
            $("#"+id).html(response); 
        }
        
    })
});