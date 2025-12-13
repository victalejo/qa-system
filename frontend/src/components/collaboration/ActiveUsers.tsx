import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import './ActiveUsers.css'

interface User {
  id: string
  name: string
  email: string
}

interface ActiveUsersProps {
  viewers: User[]
  maxDisplay?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    '#4A90E2', '#E2574A', '#50C878', '#FFB347',
    '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function ActiveUsers({ viewers, maxDisplay = 4 }: ActiveUsersProps) {
  if (viewers.length === 0) return null

  const displayedUsers = viewers.slice(0, maxDisplay)
  const remainingCount = Math.max(0, viewers.length - maxDisplay)

  return (
    <div className="active-users">
      <Users size={14} className="active-users-icon" />
      <span className="active-users-label">Viendo:</span>
      <div className="active-users-avatars">
        <AnimatePresence mode="popLayout">
          {displayedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              className="active-user-avatar"
              style={{
                backgroundColor: getAvatarColor(user.name),
                zIndex: displayedUsers.length - index
              }}
              title={`${user.name} (${user.email})`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {getInitials(user.name)}
            </motion.div>
          ))}
          {remainingCount > 0 && (
            <motion.div
              key="remaining"
              className="active-user-avatar active-user-remaining"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              +{remainingCount}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ActiveUsers
