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

//edit profile starts

        // $('#editProfile').submit((e) => {
        //     e.preventDefault();
        //     var formData = new FormData($('#editProfile')[0]);
        //     formData.append("image", $("#profilePic")[0].files[0]);
        //     console.log(formData);
        //     $.ajax({
        //         url: '/postEditProfile',
        //         method: 'post',
        //         data: formData,
        //         processData: false,
        //         success: (response) => {
        //             if (response) {
        //                 Swal.fire({
        //                     title: "profile edited successfully",
        //                     text: "Your profile edited successfully.",
        //                     icon: "success",
        //                     confirmButton: {
        //                         text: "OK",
        //                         className: "btn btn-primary"
        //                     }
        //                 }).then(() => {
        //                     window.location.href = "/userProfile";
        //                 });
        //             }
        //         }
        //     })
        // });

//edit profile ends

