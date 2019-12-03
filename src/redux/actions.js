export const handleAuth = (user) => ({
  type: 'LOGGED_IN',
  payload: user
})

export const handleVisitor = (uid) => ({
  type: 'HANDLE_VISITOR',
  payload: uid
})