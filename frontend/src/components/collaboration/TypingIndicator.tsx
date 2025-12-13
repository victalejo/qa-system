import { motion, AnimatePresence } from 'framer-motion'
import './TypingIndicator.css'

interface TypingUser {
  userId: string
  userName: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const names = typingUsers.map(u => u.userName)
  let text = ''

  if (names.length === 1) {
    text = `${names[0]} está escribiendo`
  } else if (names.length === 2) {
    text = `${names[0]} y ${names[1]} están escribiendo`
  } else {
    text = `${names[0]} y ${names.length - 1} más están escribiendo`
  }

  return (
    <AnimatePresence>
      <motion.div
        className="typing-indicator"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <div className="typing-dots">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <span className="typing-text">{text}</span>
      </motion.div>
    </AnimatePresence>
  )
}

export default TypingIndicator
