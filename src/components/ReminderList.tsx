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
    if (reminder.isCompleted) return <CheckCircle className="text-emerald-500" size={18} />
    const date = new Date(reminder.reminderDate)
    const now = new Date()
    const isOverdue = date < now
    return isOverdue ? <AlertCircle className="text-red-500" size={18} /> : <Clock className="text-amber-500" size={18} />
  }

  return (
    <div className="space-y-6">
      {/* 待处理 */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-amber-500">⏰</span> 待处理提醒
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
        </h3>
        {pending.length === 0 ? (
          <p className="text-slate-400 text-sm py-4">暂无待处理提醒</p>
        ) : (
          <div className="space-y-2">
            {pending.map(reminder => {
              const date = new Date(reminder.reminderDate)
              const now = new Date()
              const isOverdue = date < now
              return (
                <div key={reminder.id} className={`bg-white rounded-lg p-4 border ${isOverdue ? 'border-red-200' : 'border-slate-200'} flex items-start gap-3`}>
                  {getIcon(reminder)}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{reminder.item.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{reminder.message}</p>
                    <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                      {isOverdue ? '⚠️ 已逾期' : ''} 提醒日期: {formatDate(reminder.reminderDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => onComplete(reminder.id)}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-lg hover:bg-emerald-200"
                  >
                    完成
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 已完成 */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-emerald-500">✓</span> 已完成
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{completed.length}</span>
          </h3>
          <div className="space-y-2">
            {completed.map(reminder => (
              <div key={reminder.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start gap-3 opacity-60">
                <CheckCircle className="text-emerald-400" size={18} />
                <div className="flex-1">
                  <p className="font-medium text-slate-600">{reminder.item.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{reminder.message}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDate(reminder.reminderDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}