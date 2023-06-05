
function addToCart(prodId) {
    $.ajax({
        url: '/addToCart/' + prodId,
        method: 'get',
        success: (response) => {
            console.log(response);
            if (response.status) {
                Swal.fire('successfull', `done`, 'success')
                document.getElementById('cartCount').dataset.notify = response.cartCount;
                document.getElementById('cartCount2').dataset.notify = response.cartCount;
            }
        }
    })
}

//image cropper
document.addEventListener('DOMContentLoaded', function () {
    const image = document.getElementById('imageView');
    const croppingImage = document.getElementById('croppingImage');
    const cropper = new Cropper(croppingImage, {
        aspectRatio: 0, // Set the desired aspect ratio for cropping
        viewMode: 1, // Set the desired view mode for cropping
    });

    // When the crop button in the modal is clicked
    document.getElementById('cropButton').addEventListener('click', function () {
        // Get the cropped image data URL
        const croppedImage = cropper.getCroppedCanvas().toDataURL('image/png');
        // Update the original image source with the cropped image
        image.src = croppedImage;
        // Close the modal
        // Get the cropped image filename

        const modal = document.getElementById('exampleModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();

        const croppedImageFilename = `cropped-${new Date().getTime()}.png`;

        // Set the value of the `profilePic` input field
        document.getElementById('profilePic').value = croppedImageFilename;
    });
});



