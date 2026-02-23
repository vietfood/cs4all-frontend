import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'

export const createSupabase = (
    cookies: AstroCookies,
    request: Request
) => {
    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    const cookieHeader = request.headers.get('Cookie') ?? ''
                    return parseCookieHeader(cookieHeader).map((c) => ({
                        ...c,
                        value: c.value ?? '',
                    }))
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookies.set(name, value, {
                            path: '/',
                            ...options,
                        })
                    })
                },
            },
        }
    )
}
