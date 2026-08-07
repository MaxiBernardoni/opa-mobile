import { storage } from './supabase'

const KEY = 'opa_remembered_accounts'

// Cuentas en las que se inició sesión alguna vez en este dispositivo — permite
// el switcher multi-cuenta (personal ⇄ marca) sin volver a pedir contraseña.
// Guarda el refresh_token de cada cuenta; supabase-js rota el refresh_token en
// cada renovación, así que se re-escribe en cada SIGNED_IN/TOKEN_REFRESHED
// (ver app/_layout.tsx) para que el guardado nunca quede desactualizado.
export interface RememberedAccount {
  userId: string
  email: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  isBrand: boolean
  accessToken: string
  refreshToken: string
  updatedAt: string
}

async function readAll(): Promise<RememberedAccount[]> {
  const raw = await storage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as RememberedAccount[]
  } catch {
    return []
  }
}

async function writeAll(accounts: RememberedAccount[]): Promise<void> {
  await storage.setItem(KEY, JSON.stringify(accounts))
}

export async function getRememberedAccounts(): Promise<RememberedAccount[]> {
  return readAll()
}

export async function upsertRememberedAccount(account: RememberedAccount): Promise<void> {
  const accounts = await readAll()
  const next = accounts.filter((a) => a.userId !== account.userId)
  next.push(account)
  await writeAll(next)
}

export async function removeRememberedAccount(userId: string): Promise<void> {
  const accounts = await readAll()
  await writeAll(accounts.filter((a) => a.userId !== userId))
}
