import { checkFraudRisk } from '@/lib/affiliate/fraud-detection'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

describe('Affiliate Business Logic & Fraud Prevention', () => {
    let mockSupabase: any
    let mockChain: any

    beforeEach(() => {
        jest.clearAllMocks()

        mockChain = {
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            // Default response
            then: jest.fn().mockImplementation((resolve) => resolve({ data: [], error: null }))
        }

        mockSupabase = {
            from: jest.fn().mockReturnValue(mockChain)
        }

            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should detect fraud when IP addresses match', async () => {
        const referrerId = 'ref-1'
        const referredUserId = 'new-1'
        const currentIP = '1.2.3.4'
        const currentDevice = 'dev-xyz'

        // First call: referrer fraud logs
        // Second call: referred user signup attempt
        mockChain.then
            .mockImplementationOnce((resolve) => resolve({
                data: [{ ip_address: '1.2.3.4', device_id: 'other-dev' }],
                error: null
            }))
            .mockImplementationOnce((resolve) => resolve({
                data: [{ ip_address: '1.2.3.4', device_id: 'dev-xyz' }],
                error: null
            }))

        const result = await checkFraudRisk(referrerId, referredUserId, currentIP, currentDevice)

        expect(result.isFraudulent).toBe(true)
        expect(result.reason).toContain('IP address detected')
    })

    it('should detect fraud when Device IDs match', async () => {
        const referrerId = 'ref-1'
        const referredUserId = 'new-1'
        const currentIP = '1.2.3.4'
        const currentDevice = 'dev-xyz'

        mockChain.then
            .mockImplementationOnce((resolve) => resolve({
                data: [{ ip_address: '9.9.9.9', device_id: 'dev-xyz' }],
                error: null
            }))
            .mockImplementationOnce((resolve) => resolve({
                data: [{ ip_address: '1.2.3.4', device_id: 'dev-xyz' }],
                error: null
            }))

        const result = await checkFraudRisk(referrerId, referredUserId, currentIP, currentDevice)

        expect(result.isFraudulent).toBe(true)
        expect(result.reason).toContain('device fingerprint detected')
    })

    it('should allow legitimate referrals with no overlap', async () => {
        const referrerId = 'ref-1'
        const referredUserId = 'new-1'
        const currentIP = '1.2.3.4'
        const currentDevice = 'dev-xyz'

        mockChain.then
            .mockImplementationOnce((resolve) => resolve({
                data: [{ ip_address: '10.0.0.1', device_id: 'legit-dev' }],
                error: null
            }))
            .mockImplementationOnce((resolve) => resolve({
                data: [{ ip_address: '1.2.3.4', device_id: 'dev-xyz' }],
                error: null
            }))

        const result = await checkFraudRisk(referrerId, referredUserId, currentIP, currentDevice)

        expect(result.isFraudulent).toBe(false)
    })
})
