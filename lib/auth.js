import jwt from 'jsonwebtoken'

const SECRET = process.env.NEXTAUTH_SECRET || 'lostfound_secret_2024'

export function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET)
    } catch {
        return null
    }
}

export function withAuth(handler, allowedRoles = []) {
    return async (request, context) => {
        const { NextResponse } = await import('next/server')
        const token = request.cookies.get('auth_token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const user = verifyToken(token)
        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        request.user = user
        return handler(request, context)
    }
}
