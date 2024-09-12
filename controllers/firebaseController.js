// Import Firebase modules
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
} = require("firebase/firestore");

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

// Check if user exists by username without authentication
exports.checkUserExistsByUsername = async (username) => {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    let userDoc = null;

    querySnapshot.forEach((doc) => {
      if (doc.data().username === username) {
        userDoc = { ...doc.data(), uid: doc.id };
      }
    });

    return userDoc || null;
  } catch (error) {
    console.error("Error checking user by username: ", error);
    return null;
  }
};

// Save new user data to the cloud
exports.saveNewUserToCloud = async (username, linkData) => {
  try {
    const usersCollection = collection(db, "users");
    const newUserRef = doc(usersCollection);
    await setDoc(newUserRef, { username, links: [linkData] });
    return newUserRef.id;
  } catch (error) {
    console.error("Error saving new user to cloud: ", error);
    throw new Error("Error saving new user");
  }
};

// Get user links
exports.getLinksByUsername = async (username) => {
  const userDoc = await this.checkUserExistsByUsername(username);
  return userDoc ? userDoc.links : [];
};

// Save link to the cloud under existing user
exports.saveLinkToCloud = async (userId, linkData) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userLinks = userSnap.data().links || [];
      userLinks.push(linkData);
      await setDoc(userRef, { links: userLinks }, { merge: true });
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error saving link to cloud: ", error);
    throw new Error("Error saving link to cloud");
  }
};
