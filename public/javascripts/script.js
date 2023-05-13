function addToCart(prodId){
    $.ajax({
        url:'/addToCart/'+prodId,
        method:'get',
        success:(response)=>{
            console.log(response);
            if(response.status){
                Swal.fire('successfull',`done`,'success')
            }
        }
    })
}

function addProduct() {
    
}