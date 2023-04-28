const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require('twilio')(accountSid, authToken);

module.exports = {

    sendOTP: (mobileNo) => {
        try {
            return new Promise((resolve, reject) => {
                client.verify.v2.services(serviceSid)
                    .verifications
                    .create({
                        to: '+91' + mobileNo,
                        channel: 'sms'
                    })
                    .then((verification) => {
                        console.log(verification);
                        resolve(verification.sid)
                    }).catch((error) => {
                        console.log(error);
                    })
            })

        } catch (error) {
            console.log(error);
        }
    },
    verifyOtp: (mobileNo, otp) => {
        return new Promise((resolve, reject) => {
            client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({
                    to: '+91' + mobileNo,
                    code: otp
                })
                .then((verification) => {
                    console.log(verification.status);
                    resolve(verification.valid)
                }).catch((error) => {
                    console.log(error);
                });
        })
    }

}