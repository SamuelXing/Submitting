document.addEventListener('newTxn', function(e){
    console.log(e);
})

var bid = $('#bid');
bid.click(function(type){
    const fromAddress = $("#user-account").text();
    const amount = $("#amount").val();
    const postId = $("#questionId").text();
    // if(amount!='')
    // {
    //     web3.eth.sendTransaction({from: fromAddress, 
    //         to: "0x3d67a6bd741c2ca0c99dcaafc6b7f0e75726f41c", 
    //         value: web3.toWei(Number(amount), "ether")}, 
    //         function(err, transactionHash){
    //             console.log(transactionHash);
    //             if(!err)
    //             {
    //                 let data = {};
    //                 data.receipt = transactionHash;
    //                 return callAjax(data, postId)
    //             }
    //             else
    //             {
    //                 alert(err);
    //             }
    //     });
    // }else
    // {
    //     $('#notify').html('empty amount is not allowed!');
    // } 
    console.log('/piazza/api/'+postId+'/pay');
    // let data = {};
    // data.receipt = "0x094075acf52678c27ab6dd29568d4247b10c2e8044a08f95883d811f925f18c2";
    $.ajax({
        type: 'post',
        async: true,
        // data: {data: "stringvalue"},
        // contentType: 'application/json',
        // dataType: 'json',
        url: '/piazza/api/'+postId+'/pay',
        success: function(response) {
            $('#notify').html('paid successfully!');
        },
        error: function(response) {
            alert('cannot process your payment');
        }
    });
});

// function callAjax(data, postId)
// {
//     console.log(data, postId);
//      $.ajax({
//         type: 'POST',
//         async: true,
//         contentType: 'application/json',
//         url: '/piazza/api/'+postId+'/pay',
//         data: JSON.stringify(data),
//         success: function(response) {
//             $('#notify').html('paid successfully!');
//         },
//         error: function(response) {
//             alert('cannot process your payment');
//         }
//     });
// }

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