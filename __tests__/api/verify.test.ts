import { POST } from '@/app/api/subscription/verify/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

// Mock Paystack Fetch
global.fetch = jest.fn()

describe('Payment Verification API', () => {
    let mockUpsert: jest.Mock
    let mockInsert: jest.Mock
    let mockSelect: jest.Mock
    let mockSingle: jest.Mock
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.PAYSTACK_SECRET_KEY = 'mock-secret-key'

        // Setup Spies
        mockUpsert = jest.fn().mockResolvedValue({ error: null })
        mockInsert = jest.fn().mockResolvedValue({ error: null })
        mockSingle = jest.fn()
        mockSelect = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: mockSingle
            })
        })

        mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'test-user-id', email: 'test@example.com' } },
                    error: null
                })
            },
            from: jest.fn((table) => {
                if (table === 'user_subscriptions') {
                    return {
                        select: mockSelect,
                        upsert: mockUpsert
                    }
                }
                if (table === 'payment_transactions') {
                    return {
                        insert: mockInsert
                    }
                }
                return {}
            })
        }

            // Apply Mock Implementation
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should verify Paystack transaction and update user subscription for Starter Bundle', async () => {
        // Mock Paystack success
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                status: true,
                data: {
                    status: 'success',
                    amount: 300000,
                    reference: 'test-ref-1'
                }
            })
        })

        // Mock current subscription (Free plan, 2/2 limits)
        mockSingle.mockResolvedValue({
            data: {
                plan_tier: 'free',
                uploads_allowed: 2,
                exams_allowed: 2
            },
            error: null
        })

        // Create Request
        const req = new NextRequest('http://localhost/api/subscription/verify', {
            method: 'POST',
            body: JSON.stringify({
                reference: 'test-ref-1',
                type: 'addon',
                id: 'package_1'
            })
        })

        const res = await POST(req)
        const body = await res.json()

        expect(body.success).toBe(true)

        // Check Update Logic
        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'test-user-id',
            uploads_allowed: 12, // 2 + 10
            exams_allowed: 12    // 2 + 10
        }))
    })


    it('should verify Paystack transaction and update user subscription for Pro Bundle', async () => {
        // Mock Paystack success
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                status: true,
                data: {
                    status: 'success',
                    amount: 550000,
                    reference: 'test-ref-2'
                }
            })
        })

        // Mock current subscription (Free plan, 2/2 limits)
        mockSingle.mockResolvedValue({
            data: {
                plan_tier: 'free',
                uploads_allowed: 2,
                exams_allowed: 2
            },
            error: null
        })

        const req = new NextRequest('http://localhost/api/subscription/verify', {
            method: 'POST',
            body: JSON.stringify({
                reference: 'test-ref-2',
                type: 'addon',
                id: 'package_2'
            })
        })

        const res = await POST(req)
        const body = await res.json()

        expect(body.success).toBe(true)

        // Check Update Logic: 14 Uploads + 10 Exams
        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'test-user-id',
            uploads_allowed: 16, // 2 + 14
            exams_allowed: 12    // 2 + 10
        }))
    })

    it('should verify Paystack transaction and update user subscription for Ultimate Bundle', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                status: true,
                data: {
                    status: 'success',
                    amount: 850000,
                    reference: 'test-ref-3'
                }
            })
        })

        // Mock current subscription being Standard (10/10)
        mockSingle.mockResolvedValue({
            data: {
                plan_tier: 'standard',
                uploads_allowed: 10,
                exams_allowed: 10
            },
            error: null
        })

        const req = new NextRequest('http://localhost/api/subscription/verify', {
            method: 'POST',
            body: JSON.stringify({
                reference: 'test-ref-3',
                type: 'addon',
                id: 'package_3'
            })
        })

        const res = await POST(req)
        const body = await res.json()

        expect(body.success).toBe(true)

        // Check Update Logic: 20 Uploads + 20 Exams
        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'test-user-id',
            uploads_allowed: 30, // 10 + 20
            exams_allowed: 30    // 10 + 20
        }))
    })
})
