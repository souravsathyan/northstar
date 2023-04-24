{/* <script>
    const form = document.getElementById('form')

                        form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

    // Call the validateForm() function to validate the form
    validateForm();

    // Check if there are any validation errors
    const emailError = document.getElementById('email-error');
    const passError = document.getElementById('password-error');

    if (emailError.innerHTML !== '' || passError.innerHTML !== '') {
                                // If there are validation errors, do not submit the form
                                return false;
                            } else {
        // If there are no validation errors, submit the form
        form.submit();
                            }
                        });


    function validateForm() {

                            //emial Validation
                            var emailValue = document.getElementById("email").value;
    const emailError = document.getElementById('email-error')

    if (emailValue.trim() == "") {
        emailError.innerHTML = 'emial id is reqired'
    } else if (!emailValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        emailError.innerHTML = 'type a valid emial id'
    } else if (emailValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        emailError.innerHTML = "";
                            }

    //password validation
    var passwordValue = document.getElementById('password').value
    const passError = document.getElementById('password-error')

    if (passwordValue.trim() == "") {
        passError.innerHTML = 'please enter a password'
    } else if (!passwordValue.match(/^(?=.*[\W_])[\w\W]|^[a-zA-Z]|^.{8,}$/)) {
        passError.innerHTML = 'please enter a valid password please'
    } else if (passwordValue.match(/^(?=.*[\W_])[\w\W]|^[a-zA-Z]|^.{8,}$/)) {
        passError.innerHTML = ''
    }
                        }

</script> */}