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

// upsert/remove hacen "leer todo → modificar → escribir todo" — sin encolar,
// dos llamadas disparadas casi al mismo tiempo (ej. un TOKEN_REFRESHED de la
// cuenta actual justo cuando se está iniciando sesión con otra vía "Agregar
// cuenta") pueden pisarse: la segunda escritura sobreescribe la primera con
// datos ya viejos, dejando guardado un refresh_token que Supabase ya rotó/
// invalidó. Efecto real: la próxima vez que se intenta volver a esa cuenta
// desde el switcher, el token guardado no sirve ("sesión vencida") y se saca
// de la lista — como si esa cuenta nunca hubiera quedado recordada. Se
// encadenan todas las escrituras sobre una cola en memoria para que cada una
// lea el estado ya actualizado por la anterior, en vez de una foto vieja.
let writeQueue: Promise<unknown> = Promise.resolve()

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation)
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

// También encolada: si se llama justo después de un upsert/remove todavía en
// vuelo (ej. abrir el switcher apenas se cierra sesión), espera a que esa
// escritura termine antes de leer, en vez de devolver una foto vieja.
export function getRememberedAccounts(): Promise<RememberedAccount[]> {
  return enqueue(readAll)
}

export function upsertRememberedAccount(account: RememberedAccount): Promise<void> {
  console.log('[DEBUG remembered] upsert llamado para', account.userId, account.email)
  return enqueue(async () => {
    const accounts = await readAll()
    console.log('[DEBUG remembered] upsert', account.email, '-> antes:', accounts.map((a) => a.email))
    const next = accounts.filter((a) => a.userId !== account.userId)
    next.push(account)
    await writeAll(next)
    console.log('[DEBUG remembered] upsert', account.email, '-> después:', next.map((a) => a.email))
  })
}

export function removeRememberedAccount(userId: string): Promise<void> {
  console.log('[DEBUG remembered] remove llamado para', userId)
  return enqueue(async () => {
    const accounts = await readAll()
    console.log('[DEBUG remembered] remove', userId, '-> antes:', accounts.map((a) => `${a.email}(${a.userId})`))
    const next = accounts.filter((a) => a.userId !== userId)
    await writeAll(next)
    console.log('[DEBUG remembered] remove', userId, '-> después:', next.map((a) => a.email))
  })
}
