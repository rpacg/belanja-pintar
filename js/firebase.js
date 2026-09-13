(function () {
  const CONFIG_KEY = "belanja-pintar-firebase-config";
  let app, auth, db;

  const DEFAULT_CONFIG = {
    apiKey: "AIzaSyAKIB1G3SiN9CJxaijQMUUmuZRnZLjr6Fo",
    authDomain: "belanja-pintar.firebaseapp.com",
    projectId: "belanja-pintar",
    storageBucket: "belanja-pintar.firebasestorage.app",
    messagingSenderId: "893555930148",
    appId: "1:893555930148:web:819fc198f4f90a229a14b1"
  };

  function getConfig() {
    try {
      const stored = JSON.parse(localStorage.getItem(CONFIG_KEY));
      if (stored && typeof stored === 'object' && stored.apiKey) {
        return stored;
      }
    } catch (e) {}
    return DEFAULT_CONFIG;
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(config && config.apiKey);
  }

  async function initialize() {
    if (typeof firebase === 'undefined') {
      throw new Error("Library Firebase belum termuat. Periksa koneksi internet Anda.");
    }

    const config = getConfig();
    if (!app) {
      // Cek apakah sudah ada app yang jalan (biar tidak error 'already exists')
      if (firebase.apps.length > 0) {
        app = firebase.app();
      } else {
        app = firebase.initializeApp(config);
      }
      auth = firebase.auth(app);
      db = firebase.firestore(app);

      // Enable offline persistence (opsional, jangan blokir login jika gagal)
      db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        console.warn("Persistence failed:", err.code);
      });
    }

    // Pastikan auth selalu ada
    if (!auth) auth = firebase.auth(app);
    return { app, auth, db };
  }

  async function signInWithGoogle() {
    const { auth } = await initialize();
    if (!auth) throw new Error("Firebase Auth tidak dapat dijalankan.");
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
  }

  async function signOut() {
    if (auth) await auth.signOut();
  }

  async function saveCloudData(payload) {
    const { auth, db } = await initialize();
    if (!auth?.currentUser) return { error: new Error("User not logged in") };

    try {
      await db.collection("shopping_data").doc(auth.currentUser.uid).set({
        payload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { data: true };
    } catch (error) {
      return { error };
    }
  }

  async function loadCloudData() {
    const { auth, db } = await initialize();
    if (!auth?.currentUser) return { data: null, error: new Error("User not logged in") };

    try {
      const doc = await db.collection("shopping_data").doc(auth.currentUser.uid).get();
      return { data: doc.exists ? doc.data().payload : null };
    } catch (error) {
      return { data: null, error };
    }
  }

  function subscribeToCloud(onUpdate) {
    let unsubscribe = () => {};
    initialize().then(({ auth, db }) => {
      if (!auth?.currentUser) return;
      unsubscribe = db.collection("shopping_data").doc(auth.currentUser.uid)
        .onSnapshot((doc) => {
          if (doc.exists && doc.data().payload) {
            onUpdate(doc.data().payload);
          }
        });
    });
    return () => unsubscribe();
  }

  window.BelanjaFirebase = {
    isConfigured,
    getConfig,
    initialize,
    signInWithGoogle,
    signOut,
    saveCloudData,
    loadCloudData,
    subscribeToCloud,
    saveConfig: (config) => localStorage.setItem(CONFIG_KEY, JSON.stringify(config)),
    getCurrentUser: () => auth?.currentUser
  };
}());
