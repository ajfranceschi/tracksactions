import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "tracksactions-5c269.firebaseapp.com",
  databaseURL: "https://tracksactions-5c269.firebaseio.com",
  projectId: "tracksactions-5c269",
  storageBucket: "tracksactions-5c269.appspot.com",
  messagingSenderId: "805060211787",
  appId: "1:805060211787:web:798184b65ac0760fcf09ce",
  measurementId: "G-HG17SV2YJC"
};

firebase.initializeApp(config);
// firebase.analytics();

export const auth = firebase.auth();

// create firebase Account
export const createUserAccount = data => {
  return fetch("/api/users/register", data).then(response => response.data);
};

// login user
export const loginUser = async (email, password) => {
  const user = await auth
    .signInWithEmailAndPassword(email, password)
    .then(response => response.user)
    .catch(error => error);
  if (!user.code) {
    try {
      const authToken = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/users/getUserObject`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ uid: user.uid })
      });
      return await response.json();
    } catch (error) {
      return error
    }
  }
  return user;

};

export default firebase;