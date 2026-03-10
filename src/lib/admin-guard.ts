import { Session } from 'next-auth';
import { apiError, HTTP } from '@/lib/api-response';

type AdminRole = 'ADMIN' | 'MODERATOR';

/**
 * Checks if the session user has one of the allowed admin roles.
 * Returns an error Response if not authorized, or null if authorized.
 * Usage: const err = requireAdmin(session); if (err) return err;
 */
export function requireAdmin(
  session: Session | null,
  allowedRoles: AdminRole[] = ['ADMIN', 'MODERATOR']
) {
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  const role = session.user.role as string;
  if (!allowedRoles.includes(role as AdminRole)) {
    return apiError('Forbidden: Admin access required', HTTP.FORBIDDEN);
  }

  return null; // authorized
}
