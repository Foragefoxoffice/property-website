'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getAssetBaseURL } from '@/utils/baseURL'

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
    let socketInstance: Socket | null = null

    const checkAndConnect = () => {
      const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      
      // Only connect if user is logged in
      if (currentUserId && !socketInstance) {
        const socketTarget = getAssetBaseURL()
        socketInstance = io(socketTarget, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        })

        socketInstance.on('connect', () => {
          setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
          setIsConnected(false)
        })

        // Listen for account deactivation
        socketInstance.on('accountDeactivated', ({ userId }: { userId: string }) => {
          const activeUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
          if (userId === activeUserId) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('userId')
              localStorage.removeItem('userName')
              localStorage.removeItem('userRole')
            }
            window.location.href = '/login?error=inactive'
          }
        })

        setSocket(socketInstance)
      } else if (!currentUserId && socketInstance) {
        // Disconnect if user logged out
        socketInstance.disconnect()
        socketInstance = null
        setSocket(null)
        setIsConnected(false)
      }
    }

    // Check on mount
    checkAndConnect()

    // Periodically check auth status since login/logout uses router.push without full reload
    const intervalId = setInterval(checkAndConnect, 2000)

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId)
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
