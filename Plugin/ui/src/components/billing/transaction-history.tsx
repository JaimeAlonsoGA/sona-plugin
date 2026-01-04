/**
 * Transaction History Component
 * 
 * Displays recent token transactions
 */

import { motion } from 'framer-motion'
import { Card } from '../shared'
import type { TokenTransaction } from '../../types/stripe.types'
import { useTokenTransactions } from '@/lib/hooks'

export function TransactionHistory() {
  const { data: transactions, isLoading } = useTokenTransactions()

  if (isLoading) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-[var(--sona-text-muted)] mb-3">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-[var(--sona-border)] rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <h3 className="text-sm font-medium text-[var(--sona-text-muted)] mb-3">
            Recent Activity
          </h3>
          <div className="py-6 text-center">
            <p className="text-[var(--sona-text-subtle)] text-sm">
              No transactions yet
            </p>
            <p className="text-[var(--sona-text-subtle)] text-xs mt-1">
              Purchase tokens to get started!
            </p>
          </div>  
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card>
        <h3 className="text-sm font-medium text-[var(--sona-text-muted)] mb-3">
          Recent Activity
        </h3>
        <div className="space-y-2 h-[300px] overflow-auto">
          {transactions.slice(0, 5).map((tx: TokenTransaction) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function TransactionItem({ transaction }: { transaction: TokenTransaction }) {
  const isCredit = transaction.amount > 0
  
  const typeIcons: Record<string, string> = {
    purchase: '💳',
    usage: '🎵',
    bonus: '🎁',
    refund: '↩️',
    subscription: '⭐',
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--sona-elevated)]/50 hover:bg-[var(--sona-elevated)] transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {typeIcons[transaction.type] || '•'}
        </span>
        <div>
          <p className="text-[var(--sona-text)] text-sm">
            {transaction.description}
          </p>
          <p className="text-[var(--sona-text-subtle)] text-xs">
            {formatDate(transaction.created_at)}
          </p>
        </div>
      </div>
      <span className={`font-medium text-sm ${
        isCredit ? 'text-[var(--sona-sage)]' : 'text-[var(--sona-text-muted)]'
      }`}>
        {isCredit ? '+' : ''}{transaction.amount}
      </span>
    </div>
  )
}
