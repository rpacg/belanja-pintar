(function () {
  const CONFIG_KEY = "belanja-pintar-firebase-config";
  let app, auth, db;

  function getConfig() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY)) || null;
    } catch {
      return null;
    }
  }

  function isConfigured() {
    return Boolean(getConfig());
  }

  async function initialize() {
    const config = getConfig();
    if (!config) return null;

    if (!app) {
      app = firebase.initializeApp(config);
      auth = firebase.auth(app);
      db = firebase.firestore(app);

      // Enable offline persistence
      try {
        await db.enablePersistence({ synchronizeTabs: true });
        console.log("Firebase persistence enabled.");
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn("Persistence failed: multiple tabs open.");
        } else if (err.code === 'unimplemented') {
          console.warn("Persistence not supported by browser.");
        }
      }
    }
    return { app, auth, db };
  }

  async function signInWithGoogle() {
    await initialize();
    if (!auth) throw new Error("Firebase not initialized");
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
