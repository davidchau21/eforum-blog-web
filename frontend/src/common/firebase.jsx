import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD54kEnTGJB01eg58vrh6YtIHjAmaAm6BI",
    authDomain: "edu-blog-website.firebaseapp.com",
    projectId: "edu-blog-website",
    storageBucket: "edu-blog-website.appspot.com",
    messagingSenderId: "527821371733",
    appId: "1:527821371733:web:ef8dc185e389821eae17dc"
  };

const app = initializeApp(firebaseConfig);

// google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {

    let user = null;

    await signInWithPopup(auth, provider)
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err)
    })

    return user;
}
