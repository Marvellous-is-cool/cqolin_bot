// Import Firebase modules in a modular way
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
} = require("firebase/firestore");
const { getAuth, onAuthStateChanged } = require("firebase/auth");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the current authenticated user's UID
const getCurrentUserId = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error("User not authenticated"));
      }
    });
  });
};

// Get links by current user
exports.getLinksByCurrentUser = async () => {
  try {
    const userId = await getCurrentUserId();
    const linksCollection = collection(db, "users", userId, "links");
    const querySnapshot = await getDocs(linksCollection);
    const links = [];
    querySnapshot.forEach((doc) => {
      links.push(doc.data());
    });
    return links;
  } catch (error) {
    console.error("Error getting links: ", error);
    return [];
  }
};

// Get user profile data
exports.getUserProfile = async () => {
  try {
    const userId = await getCurrentUserId();
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return null;
  }
};

// Save link to cloud
exports.saveToCloud = async (req, res, linkData) => {
  try {
    const userId = await getCurrentUserId();
    const linksCollection = collection(db, "users", userId, "links");
    await addDoc(linksCollection, linkData);
    res.redirect(`/home`);
  } catch (error) {
    console.error("Error saving to cloud: ", error);
    res.render("create", { message: "Error saving link to cloud" });
  }
};
