export type KotahiUser = { id?: string; username?: string }

export type WaxUser = {
  userId: string
  username: string
  userColor: { addition: string; deletion: string }
}

export const toWaxUser = (user: KotahiUser = {}): WaxUser => ({
  userId: user.id || '-',
  userColor: { addition: 'royalblue', deletion: 'indianred' },
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
