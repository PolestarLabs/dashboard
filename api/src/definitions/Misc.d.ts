// ── Service response envelope (shared across all services) ──────────────────

export interface ServiceResponse<T = unknown> {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
}

// Dashboard RPG Variables
export type RPGVariable = {
    tag: string;
    value: string;
};

// Patreon Connection
export type PatreonConnection = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    version?: number;
    identity?: {
        full_name: string;
        thumb_url: string;
        discord_user_id?: string;
        discord_role_ids?: string[] | string | null;
        tier?: string | null;
    };
};

