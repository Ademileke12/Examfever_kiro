import { affiliateManager } from '@/lib/affiliate/affiliate-manager'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase Server Client
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

// Mock Fraud Detection
jest.mock('@/lib/affiliate/fraud-detection', () => ({
    checkFraudRisk: jest.fn().mockResolvedValue({ isFraudulent: false }),
    getClientIP: jest.fn().mockReturnValue('1.2.3.4'),
    getDeviceFingerprint: jest.fn().mockReturnValue('mock-device'),
    logFraudAttempt: jest.fn().mockResolvedValue(null)
}))

describe('Affiliate Commission Awarding Logic', () => {
    let mockSupabase: any
    let mockRpc: jest.Mock
    let mockUpdate: jest.Mock
    let mockInsert: jest.Mock
    let mockSelect: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockRpc = jest.fn().mockResolvedValue({ error: null })
        mockUpdate = jest.fn().mockImplementation(() => ({
            eq: jest.fn().mockResolvedValue({ error: null })
        }))
        mockInsert = jest.fn().mockResolvedValue({ error: null })
        mockSelect = jest.fn()

        mockSupabase = {
            from: jest.fn((table) => {
                const queryMethods = {
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn(),
                }

                if (table === 'referrals') {
                    queryMethods.single.mockResolvedValue({
                        data: { id: 'ref-123', referrer_id: 'referrer-uuid', status: 'signed_up' },
                        error: null
                    })
                } else if (table === 'affiliate_profiles') {
                    queryMethods.single.mockResolvedValue({
                        data: { is_active: true },
                        error: null
                    })
                } else {
                    queryMethods.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
                }

                return {
                    ...queryMethods,
                    update: mockUpdate,
                    insert: mockInsert,
                }
            }),
            rpc: mockRpc
        }

            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should correctly award 13% commission on payment', async () => {
        const userId = 'referred-user-uuid'
        const amountPaid = 10000 // ₦10,000
        const reference = 'tx-ref-123'

        const result = await affiliateManager.awardCommissionIfEligible(userId, amountPaid, reference)

        expect(result).not.toBeNull()
        expect(result?.commission).toBe(1300) // 13% of 10,000

        // Verify Referral Status Update
        expect(mockSupabase.from).toHaveBeenCalledWith('referrals')
        expect(mockUpdate).toHaveBeenCalledTimes(1)

        // Verify Commission Insertion
        expect(mockSupabase.from).toHaveBeenCalledWith('affiliate_commissions')
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            amount: 1300,
            status: 'paid'
        }))

        // Verify Balance Update RPC
        expect(mockRpc).toHaveBeenCalledWith('update_affiliate_balance', {
            profile_user_id: 'referrer-uuid',
            amount: 1300
        })
    })

    it('should NOT award commission if user was not referred', async () => {
        // Mock no referral record
        mockSupabase.from = jest.fn((table) => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
        }))

        const result = await affiliateManager.awardCommissionIfEligible('unknown-user', 10000, 'ref')
        expect(result).toBeNull()
        expect(mockRpc).not.toHaveBeenCalled()
    })
})
