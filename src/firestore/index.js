import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyB_w9xBOkjJAmp6_sce6drR1Dn3Zco-rrg",
  authDomain: "shopsharer-675c7.firebaseapp.com",
  databaseURL: "https://shopsharer-675c7.firebaseio.com",
  projectId: "shopsharer-675c7",
  storageBucket: "shopsharer-675c7.appspot.com",
  messagingSenderId: "606001631410",
  appId: "1:606001631410:web:0790664d6927e293d239ab",
  measurementId: "G-6M8X2HGHHX",
};

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();
const storage = firebaseApp.storage();

export async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  await auth.signInWithPopup(provider);
  window.location.reload();
}

export function checkAuth(cb) {
  auth.onAuthStateChanged(cb);
}

export async function logOut() {
  await auth.signOut();
  window.location.reload();
}

export async function getCollection(id) {
  const snapshot = await db.collection(id).get();
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log(data);
}

export async function getUserList(userId) {
  const snapshots = await db
    .collection("lists")
    .where("author", "==", userId)
    .get();
  return snapshots.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

function uploadCoverImage(file) {
  const uploadTask = storage
    .ref(`images/${file.name}-${file.lastModified}`)
    .put(file);
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => console.log("image uploading", snapshot),
      reject,
      () => {
        storage
          .ref("images")
          .child(`${file.name}-${file.lastModified}`)
          .getDownloadURL()
          .then(resolve);
      }
    );
  });
}

export async function createList(list, user) {
  const { name, description, image } = list;
  await db.collection("lists").add({
    name,
    description,
    image: image ? await uploadCoverImage(image) : null,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    author: user.uid,
    userIds: [user.uid],
    users: [
      {
        id: user.uid,
        name: user.displayName,
      },
    ],
  });
}
