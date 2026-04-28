'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false })

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection - Ensure we use the base URL, not the /api/v1 path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const socketTarget = apiUrl.replace(/\/api\/v1\/?$/, '') || apiUrl

    const socketInstance = io(socketTarget, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error)
    })

    // Listen for account deactivation
    socketInstance.on('accountDeactivated', ({ userId }: { userId: string }) => {
      const currentUserId =
        typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      console.log(`Deactivation event received for: ${userId}. Current: ${currentUserId}`)

      if (userId === currentUserId) {
        console.error('Your account has been deactivated. Logging out...')

        // Clear all auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('userRole')
        }

        // Redirect to login with a message
        window.location.href = '/login?error=inactive'
      }
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
