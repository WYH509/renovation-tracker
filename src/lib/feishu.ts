// Feishu Bitable API Client
// Docs: https://open.feishu.cn/document/server-docs/docs/bitable/bitable-app-overview

export interface FeishuRecord {
  record_id: string
  fields: Record<string, unknown>
}

export interface FeishuListResponse {
  data: {
    items: FeishuRecord[]
    page_token?: string
    has_more: boolean
    total?: number
  }
}

const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis'

// Simple in-memory token store (in production you'd want proper OAuth)
let accessToken = ''

export async function getAccessToken(): Promise<string> {
  if (accessToken) return accessToken
  
  // Use tenant_access_token for bitable access (requires FEISHU_APP_ID + FEISHU_APP_SECRET)
  const appId = process.env.FEISHU_APP_ID
  const appSecret = process.env.FEISHU_APP_SECRET
  
  if (!appId || !appSecret) {
    throw new Error('FEISHU_APP_ID and FEISHU_APP_SECRET are required')
  }

  const res = await fetch(`${FEISHU_API_BASE}/auth/v3/tenant_access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  })
  
  const data = await res.json()
  if (data.code !== 0) throw new Error(`Failed to get access token: ${data.msg}`)
  
  accessToken = data.tenant_access_token
  return accessToken
}

async function feishuRequest(path: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  
  const res = await fetch(`${FEISHU_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }
  })

  const data = await res.json()
  
  if (data.code !== 0) {
    throw new Error(`Feishu API error ${data.code}: ${data.msg}`)
  }
  
  return data
}

export async function listRecords(
  appToken: string,
  tableId: string,
  pageToken?: string,
  pageSize: number = 500
): Promise<FeishuRecord[]> {
  const allRecords: FeishuRecord[] = []
  let token = pageToken
  let hasMore = true

  while (hasMore) {
    const params = new URLSearchParams({ page_size: String(pageSize) })
    if (token) params.set('page_token', token)

    const data = await feishuRequest(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params}`
    )

    allRecords.push(...data.data.items)
    hasMore = data.data.has_more
    token = data.data.page_token
  }

  return allRecords
}

export async function createRecord(
  appToken: string,
  tableId: string,
  fields: Record<string, unknown>
): Promise<FeishuRecord> {
  const data = await feishuRequest(
    `/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    {
      method: 'POST',
      body: JSON.stringify({ fields }),
    }
  )
  return data.data
}

export async function updateRecord(
  appToken: string,
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<FeishuRecord> {
  const data = await feishuRequest(
    `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    }
  )
  return data.data
}

export async function deleteRecord(
  appToken: string,
  tableId: string,
  recordId: string
): Promise<void> {
  await feishuRequest(
    `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    { method: 'DELETE' }
  )
}

// Helper to convert Feishu date fields (ms timestamp) to JS Date
export function feishuDateToDate(value: unknown): Date | null {
  if (!value) return null
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') return new Date(value)
  return null
}

// Helper to safely convert any value to number
export function d2n(val: unknown): number {
  if (!val) return 0
  if (typeof val === 'string') return parseFloat(val) || 0
  if (typeof val === 'number') return val
  if (Array.isArray(val)) return val.length
  return 0
}

// Fund data types
export interface FundRecord {
  recordId: string
  name: string
  buyDate: Date | null
  buyAmount: number
  share: number
  todayNav: number
  lastWeekNav: number
  lastMonthNav: number
  yearStartNav: number
  totalDividend: number
}

export interface FundStats {
  name: string
  buyAmount: number
  yearStartValue: number
  currentValue: number
  weekProfit: number
  weekReturn: number
  monthProfit: number
  monthReturn: number
  yearProfit: number
  yearReturn: number
}

// Renovation data types
export interface RenovationRecord {
  recordId: string
  projectName: string
  category: string[]
  amount: number
  buyDate: Date | null
  notes: string
  status: string[]
}

export interface RenovationStats {
  totalSpent: number
  totalPaid: number
  totalUnpaid: number
  byCategory: { name: string; spent: number; paid: number }[]
  byStatus: { name: string; count: number; amount: number }[]
}