import type { APIRoute } from 'astro'
import { createSupabase } from '@/lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const supabase = createSupabase(cookies, request)
    await supabase.auth.signOut()

    return redirect('/')
}
