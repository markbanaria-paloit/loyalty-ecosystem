/** Central configuration, read from environment with sensible dev defaults. */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5176',
  openLoyalty: {
    baseUrl: process.env.OPENLOYALTY_BASE_URL ?? 'http://localhost:8181',
    storeCode: process.env.OPENLOYALTY_STORE_CODE ?? 'default',
    // Admin credentials, used by the campaign studio to read/write config.
    adminUsername: process.env.OPENLOYALTY_ADMIN_USER ?? 'admin',
    adminPassword: process.env.OPENLOYALTY_ADMIN_PASSWORD ?? 'admin',
    /**
     * Static API key, sent as `X-AUTH-TOKEN`.
     *
     * The spec offers two auth schemes — JWT from `login_check`, and this
     * header. Set it and admin-scoped calls use it instead of logging in, which
     * is what a hosted instance issuing an API key expects. Leave it unset and
     * the username/password flow is used.
     */
    apiKey: process.env.OPENLOYALTY_API_KEY ?? null,
  },
  console: {
    /**
     * Signs till sessions. Rotating it signs every till out, which is the
     * intended way to revoke access.
     */
    sessionSecret: process.env.CONSOLE_SESSION_SECRET ?? 'dev-console-secret-change-me',
    /** Who may sign a till in. */
    operators: [
      {
        username: process.env.TILL_USERNAME ?? 'till',
        password: process.env.TILL_PASSWORD ?? 'till',
        role: 'till' as const,
      },
    ],
  },

  member: {
    /**
     * Label that marks a member as belonging to the union, and the tier they
     * are placed on because of it.
     *
     * Tier conditions are metric-only, so this cannot be configured as a
     * qualification rule on the platform — the tier has to be assigned. Naming
     * the tier rather than hardcoding an id keeps it survivable across tenants,
     * where the ids differ.
     */
    /**
     * Exactly as the tenant's campaign matches it — `membertype` /
     * `unionmember`, no underscore, all lowercase. The label is a string
     * comparison on their side, so a near-miss silently grants nothing.
     */
    unionLabelKey: process.env.UNION_LABEL_KEY ?? 'membertype',
    unionLabelValue: process.env.UNION_LABEL_VALUE ?? 'unionmember',
  },

  /*
   * There is deliberately no welcome-bonus setting here. Enrolment awards are
   * campaigns configured in the loyalty platform (Campaign Admin → Campaigns),
   * so the amount, the eligibility and the tier that comes with it are all
   * programme configuration rather than a value baked into this service.
   */
  studio: {
    /**
     * Without a key the studio falls back to a deterministic planner so the
     * app still runs end-to-end — see `src/studio/offline.ts`.
     */
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? null,
    model: process.env.STUDIO_MODEL ?? 'claude-opus-5',
  },
};
