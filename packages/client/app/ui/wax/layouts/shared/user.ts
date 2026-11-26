export type KotahiUser = { id?: string; username?: string }

export type WaxUser = {
  userId: string
  username: string
}

export const toWaxUser = (user: KotahiUser = {}): WaxUser => ({
  userId: user.id || '-',
  username: user.username || 'demo',
})

export const allowAll = (
  allowed: boolean,
): {
  own: { accept: boolean; reject: boolean }
  others: { accept: boolean; reject: boolean }
} => ({
  own: { accept: allowed, reject: allowed },
  others: { accept: allowed, reject: allowed },
})
