import type { APIRoute } from 'astro'
import { createSupabase } from '@/lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData()
    const email = formData.get('email')?.toString()

    if (!email) {
        return new Response('Email is required', { status: 400 })
    }

    const supabase = createSupabase(cookies, request)

    // Vercel routes internal requests which can make request.url read as localhost.
    // Use the explicit SITE env or the forwarded host header to determine the true origin.
    const siteUrl = import.meta.env.SITE || import.meta.env.PUBLIC_SITE_URL || 'https://cs4all-vn.vercel.app';
    const forwardedHost = request.headers.get('x-forwarded-host');
    const origin = forwardedHost ? `https://${forwardedHost}` : siteUrl;

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${origin}/api/auth/callback`,
        },
    })

    if (error) {
        return new Response(error.message, { status: 500 })
    }

    return redirect('/?alert=check_email', 303)
}
