import { GET } from '@/app/api/affiliate/stats/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

describe('Affiliate Security & RBAC', () => {
    let mockSupabase: any
    let mockUser: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockUser = { id: 'legit-user-id', email: 'legit@example.com' }

        mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: mockUser },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { referral_code: 'REF123', total_balance: 100, referred_count: 5 },
                    error: null
                }),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis()
            })
        }

            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should enforce RBAC by using authenticated user ID for stats', async () => {
        const req = new NextRequest('http://localhost/api/affiliate/stats')
        await GET(req)

        // Verify that the query was scoped to the logged-in user, not a client-supplied ID
        expect(mockSupabase.from).toHaveBeenCalledWith('affiliate_profiles')
        expect(mockSupabase.from('affiliate_profiles').eq).toHaveBeenCalledWith('user_id', 'legit-user-id')
    })

    it('should return 401 if user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

        const req = new NextRequest('http://localhost/api/affiliate/stats')
        const res = await GET(req)

        expect(res.status).toBe(401)
    })

    it('should prevent IDOR by not looking at query parameters for user identification', async () => {
        // Even if an attacker passes a different user_id in the URL (if the API supported it)
        // our implementation should ignore it and use the auth context.
        const req = new NextRequest('http://localhost/api/affiliate/stats?user_id=attacker-id')
        await GET(req)

        expect(mockSupabase.from('affiliate_profiles').eq).toHaveBeenCalledWith('user_id', 'legit-user-id')
        expect(mockSupabase.from('affiliate_profiles').eq).not.toHaveBeenCalledWith('user_id', 'attacker-id')
    })
})
