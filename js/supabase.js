(function () {
  const URL_KEY = "belanja-pintar-supabase-url";
  const KEY_KEY = "belanja-pintar-supabase-key";
  const SESSION_KEY = "belanja-pintar-supabase-session";

  function getConfig() {
    const url = (localStorage.getItem(URL_KEY) || "").trim();
    const key = (localStorage.getItem(KEY_KEY) || "").trim();
    return { url, key };
  }

  function isConfigured() {
    const { url, key } = getConfig();
    return Boolean(url && key && url.includes("supabase.co"));
  }

  function createClient() {
    if (!isConfigured()) return null;
    if (!window.supabase) {
      console.warn("Supabase client is not loaded yet.");
      return null;
    }
    const { url, key } = getConfig();
    return window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  async function getSession() {
    const client = createClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn("Supabase session error:", error.message);
      return null;
    }
    return data?.session || null;
  }

  async function signInWithPassword(email, password) {
    const client = createClient();
    if (!client) return { error: new Error("Supabase is not configured.") };
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (!error && data?.session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.user, email: data.user.email }));
    }
    return { data, error };
  }

  async function signInWithGoogle() {
    const client = createClient();
    if (!client) return { error: new Error("Supabase is not configured.") };
    return client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  }

  async function signOut() {
    const client = createClient();
    if (!client) return { error: new Error("Supabase is not configured.") };
    const result = await client.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    return result;
  }

  async function saveCloudData(payload) {
    const client = createClient();
    const session = await getSession();
    if (!client || !session?.user?.id) {
      return { error: new Error("Supabase is not connected.") };
    }

    const record = {
      user_id: session.user.id,
      payload,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client.from("shopping_data").upsert(record, { onConflict: "user_id" });
    if (error) {
      return { error };
    }
    return { data };
  }

  async function loadCloudData() {
    const client = createClient();
    const session = await getSession();
    if (!client || !session?.user?.id) {
      return { data: null, error: new Error("Supabase is not connected.") };
    }

    const { data, error } = await client
      .from("shopping_data")
      .select("payload, updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }
    return { data: data?.payload || null, error: null };
  }

  function subscribeToCloud(onUpdate) {
    const client = createClient();
    if (!client || typeof onUpdate !== "function") return () => {};

    const sessionPromise = getSession();
    let channel = null;

    sessionPromise.then((session) => {
      if (!session?.user?.id) return;
      channel = client.channel("shopping-sync").on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shopping_data",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload?.new?.payload) {
            onUpdate(payload.new.payload);
          }
        }
      ).subscribe();
    });

    return () => {
      if (channel) client.removeChannel(channel);
    };
  }

  function getSavedEmail() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      return value?.email || "";
    } catch {
      return "";
    }
  }

  window.BelanjaSupabase = {
    isConfigured,
    getConfig,
    createClient,
    getSession,
    signInWithPassword,
    signInWithGoogle,
    signOut,
    saveCloudData,
    loadCloudData,
    subscribeToCloud,
    getSavedEmail,
  };
}());
