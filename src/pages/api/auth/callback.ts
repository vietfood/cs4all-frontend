import type { APIRoute } from 'astro'
import { createSupabase } from '@/lib/supabase'

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = createSupabase(cookies, request)
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return redirect('/')
        }
    }

    // Redirect to error page or back to home with error
    return redirect('/?alert=auth_error')
}
