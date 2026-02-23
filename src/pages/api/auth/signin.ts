import type { APIRoute } from 'astro'
import { createSupabase } from '@/lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData()
    const email = formData.get('email')?.toString()

    if (!email) {
        return new Response('Email is required', { status: 400 })
    }

    const supabase = createSupabase(cookies, request)

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
        },
    })

    if (error) {
        return new Response(error.message, { status: 500 })
    }

    return redirect('/?alert=check_email', 303)
}
