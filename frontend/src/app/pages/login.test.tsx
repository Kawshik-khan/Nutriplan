import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './login'
import * as authHooks from '../hooks/use-auth'

// Mock the auth hooks
vi.mock('../hooks/use-auth', () => ({
  useLogin: vi.fn(),
}))

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('Login Component', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;vi.mocked(authHooks.useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
      failureReason: null,
      reset: vi.fn(),
    } as any)
  })

  it('renders login form', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('validates email format', async () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const submitButton = screen.getByRole('button', { name: /Sign In/i })
    
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.click(submitButton)
    
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i })
    await userEvent.click(submitButton)
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('calls login mutation with valid data', async () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitButton = screen.getByRole('button', { name: /Sign In/i })
    
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object)
      )
    })
  })

  it('disables submit button while loading', () => {
    ;vi.mocked(authHooks.useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
      failureReason: null,
      reset: vi.fn(),
    } as any)
    
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /Signing In/i })
    expect(submitButton).toBeDisabled()
  })
})
