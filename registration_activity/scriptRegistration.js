// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVhOwhWVl5bv5N0v101og2I8iqCzRh8jo",
    databaseURL: "https://rtdb--automated-aquaponics-default-rtdb.asia-southeast1.firebasedatabase.app",
    authDomain: "rtdb--automated-aquaponics.firebaseapp.com",
    projectId: "rtdb--automated-aquaponics",
    storageBucket: "rtdb--automated-aquaponics.appspot.com",
    messagingSenderId: "632510483204",
    appId: "1:632510483204:android:6422c28880f781dbf41e51"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const realtimeDb = firebase.database();

// Used for OTP verification
let confirmationResult;

// Initialize reCAPTCHA verifier
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
});

function registerUser() {
    // Get user input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const number = document.getElementById('number').value;

    if (email && password && username && number) {
        // Send OTP to the provided mobile number
        auth.signInWithPhoneNumber(number, window.recaptchaVerifier)
            .then(result => {
                confirmationResult = result;
                document.getElementById('registerForm').style.display = 'none';
                document.getElementById('otpSection').style.display = 'block';
            })
            .catch(error => {
                console.error("Error during signInWithPhoneNumber:", error);
                alert("Failed to send OTP. Please try again.");
            });
    } else {
        alert("All fields are required to fill.");
    }
}

function verifyOTP() {
    const otpCode = document.getElementById('otpCode').value;

    if (otpCode) {
        confirmationResult.confirm(otpCode).then(() => {
            // OTP verified successfully, proceed to store user data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const username = document.getElementById('username').value;
            const number = document.getElementById('number').value;

            const userData = {
                username: username,
                email: email,
                mobile: mobile,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Store user data in Firestore
            db.collection("user").add(userData).then(() => {
                // Store user data in Realtime Database
                realtimeDb.ref('user' + auth.currentUser.uid).set(userData).then(() => {
                    alert("User registered successfully!");
                    resetForms();
                }).catch(error => {
                    console.error("Error storing user data in Realtime Database:", error);
                    alert("Error storing data in Realtime Database. Please try again.");
                });
            }).catch(error => {
                console.error("Error storing user data in Firestore:", error);
                alert("Registration failed. Please try again.");
            });
        }).catch(error => {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP. Please try again.");
        });
    } else {
        alert("Please enter the OTP.");
    }
}

// Cancel registration and reset form
function cancelRegistration() {
    resetForms();
    alert("Registration cancelled.");
}

function resetForms() {
    // Reset form and redirect if needed
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('registerForm').reset();
    document.getElementById('otpSection').reset();
}
