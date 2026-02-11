/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddOnStore } from '@/components/subscription/AddOnStore'

// Mock Hooks
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

// Mock Supabase Client
const mockGetUser = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: mockGetUser
        }
    })
}))

describe('AddOnStore Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all three bundles with correct prices', () => {
        render(<AddOnStore />)

        // Check Starter Bundle
        expect(screen.getByText('Starter Bundle')).toBeInTheDocument()
        expect(screen.getByText('₦3,000')).toBeInTheDocument()

        // Check Pro Bundle
        expect(screen.getByText('Pro Bundle')).toBeInTheDocument()
        expect(screen.getByText('₦5,500')).toBeInTheDocument()

        // Check Ultimate Bundle
        expect(screen.getByText('Ultimate Bundle')).toBeInTheDocument()
        expect(screen.getByText('₦8,500')).toBeInTheDocument()
    })

    it('redirects to checkout on purchase click if user is logged in', async () => {
        // Mock logged in user
        mockGetUser.mockResolvedValue({
            data: { user: { email: 'test@example.com' } }
        })

        render(<AddOnStore />)

        // Click Purchase on Starter Bundle
        // There are 3 buttons, we click the first one (Starter Bundle)
        const buttons = screen.getAllByText('Purchase Bundle')
        fireEvent.click(buttons[0])

        // Wait for router push
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/checkout?addon=package_1')
        })
    })
})
