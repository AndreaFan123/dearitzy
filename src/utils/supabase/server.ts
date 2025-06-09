import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async (
  cookieStorePromise: ReturnType<typeof cookies>
) => {
  const cookieStore = await cookieStorePromise;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            console.warn(
              "Failed to set cookies in the cookie store. This might happen if the `setAll` method was called from a Server Component."
            );
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
