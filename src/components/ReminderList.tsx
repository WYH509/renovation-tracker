'use client'

import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Reminder {
  id: number
  message: string
  reminderDate: string
  isCompleted: boolean
  item: { name: string }
}

export default function ReminderList({ reminders, onComplete }: { reminders: Reminder[]; onComplete: (id: number) => void }) {
  const pending = reminders.filter(r => !r.isCompleted)
  const completed = reminders.filter(r => r.isCompleted)

  const getIcon = (reminder: Reminder) => {
    if (reminder.isCompleted) return <CheckCircle className="text-ios-green" size={18} />
    const date = new Date(reminder.reminderDate)
    const now = new Date()
    const isOverdue = date < now
    return isOverdue ? <AlertCircle className="text-ios-red" size={18} /> : <Clock className="text-ios-orange" size={18} />
  }

  return (
    <div className="space-y-5">
      {/* 待处理 */}
      <div>
        <h3 className="ios-headline text-gray-900 mb-3 flex items-center gap-2">
          <span>⏰</span> 待处理提醒
          {pending.length > 0 && (
            <span className="bg-red-100 text-ios-red text-xs px-2 py-0.5 rounded-full font-medium">{pending.length}</span>
          )}
        </h3>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">暂无待处理提醒</p>
        ) : (
          <div className="space-y-3">
            {pending.map(reminder => {
              const date = new Date(reminder.reminderDate)
              const now = new Date()
              const isOverdue = date < now
              return (
                <div key={reminder.id} className={`ios-card p-4 ${isOverdue ? 'border-l-4 border-ios-red' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(reminder)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{reminder.item.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{reminder.message}</p>
                      <p className={`text-xs mt-1 ${isOverdue ? 'text-ios-red font-medium' : 'text-gray-400'}`}>
                        {isOverdue ? '⚠️ 已逾期 · ' : ''}提醒: {formatDate(reminder.reminderDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => onComplete(reminder.id)}
                      className="ios-action-btn ios-action-btn-edit flex-shrink-0"
                    >
                      完成
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 已完成 */}
      {completed.length > 0 && (
        <div>
          <h3 className="ios-headline text-gray-900 mb-3 flex items-center gap-2">
            <span>✓</span> 已完成
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">{completed.length}</span>
          </h3>
          <div className="space-y-3">
            {completed.map(reminder => (
              <div key={reminder.id} className="ios-card p-4 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle className="text-ios-green" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-600 text-sm">{reminder.item.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{reminder.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(reminder.reminderDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
