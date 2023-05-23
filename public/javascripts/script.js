function addToCart(prodId){
    $.ajax({
        url:'/addToCart/'+prodId,
        method:'get',
        success:(response)=>{
            console.log(response);
            if(response.status){
                Swal.fire('successfull',`done`,'success')
                document.getElementById('cartCount').dataset.notify = response.cartCount;
                document.getElementById('cartCount2').dataset.notify = response.cartCount;
            }
        }
    })
}



