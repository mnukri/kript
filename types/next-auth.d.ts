import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      name?:        string | null
      email?:       string | null
      image?:       string | null
      userId:       number
      staffId:      number
      globalRole:   'admin' | 'manager' | 'staff'
      permissions:  { program_id: number; access_level: 'read' | 'write' | 'approve' }[]
    }
  }
}
