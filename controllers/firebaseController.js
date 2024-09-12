// Import Firebase modules in a modular way
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
} = require("firebase/firestore");
const {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
} = require("firebase/auth");
const adminAuth = require("./admin"); // Import the Firebase Admin SDK setup

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

// Authenticate or create a user based on Telegram username
exports.authenticateOrCreateUser = async (username) => {
  try {
    const userDoc = await getUserByUsername(username);

    if (userDoc) {
      // User exists, authenticate them
      const token = await generateCustomToken(userDoc.uid); // Generate a custom token
      await signInWithCustomToken(auth, token);
      return userDoc.uid;
    } else {
      // User does not exist, create a new user
      const newUser = await createNewUser(username);
      return newUser.uid;
    }
  } catch (error) {
    console.error("Error authenticating or creating user: ", error);
    throw new Error("Authentication failed");
  }
};

// Create a new user document
const createNewUser = async (username) => {
  try {
    const usersCollection = collection(db, "users");
    const newUserRef = doc(usersCollection);
    await setDoc(newUserRef, { username });
    return { uid: newUserRef.id };
  } catch (error) {
    console.error("Error creating new user: ", error);
    throw new Error("Error creating new user");
  }
};

// Get user by Telegram username
const getUserByUsername = async (username) => {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    let userDoc = null;

    querySnapshot.forEach((doc) => {
      if (doc.data().username === username) {
        userDoc = { ...doc.data(), uid: doc.id };
      }
    });

    if (userDoc) {
      return userDoc;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user by username: ", error);
    return null;
  }
};

// Generate a custom token for the user
const generateCustomToken = async (uid) => {
  try {
    const token = await adminAuth.createCustomToken(uid);
    return token;
  } catch (error) {
    console.error("Error generating custom token: ", error);
    throw new Error("Error generating custom token");
  }
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
