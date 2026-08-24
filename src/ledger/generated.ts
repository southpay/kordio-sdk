/**
 * Kordio Ledger API
 *
 * DO NOT EDIT. Generated from the OpenAPI spec.
 * Source: specs/ledger.openapi.yaml
 * Regenerate: bun run generate
 */

/* biome-ignore-all lint: generated file */
export interface paths {
    "/.well-known/oauth-authorization-server": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * RFC 8414 authorization server metadata
         * @description Discovery document for OAuth clients. Tells tooling where the
         *     token endpoint is, what grant types and scopes are supported,
         *     what signing algorithms we use.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Server metadata */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness + DB probe */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Healthy */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            checks?: {
                                database?: boolean;
                            };
                            /** @enum {string} */
                            status?: "ok";
                            version?: string;
                        };
                    };
                };
                /** @description Degraded (database unreachable) */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/oauth/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Issue an access token
         * @description RFC 6749 §4.4 client_credentials. Authenticate with HTTP Basic
         *     (`client_id:client_secret`) **or** with `client_id` and
         *     `client_secret` in the form body.
         *
         *     Tokens are HS256 JWTs valid for one hour. They carry `tenant_id`,
         *     `mode`, and the granted `scope`. Decode them at jwt.io to inspect.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/x-www-form-urlencoded": {
                        client_id?: string;
                        client_secret?: string;
                        /** @enum {string} */
                        grant_type: "client_credentials";
                        /**
                         * @description Space-separated subset of granted scopes. Optional; defaults to all.
                         * @example ledger:read ledger:write
                         */
                        scope?: string;
                    };
                };
            };
            responses: {
                /** @description Token issued */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description HS256 JWT */
                            access_token: string;
                            /** @example 3600 */
                            expires_in: number;
                            scope?: string;
                            /** @enum {string} */
                            token_type: "Bearer";
                        };
                    };
                };
                /** @description invalid_client (bad credentials or disabled client) */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OAuthError"];
                    };
                };
                /** @description invalid_request / unsupported_grant_type / invalid_scope */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OAuthError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/_meta/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Capabilities, guarantees, and limits of this deployment
         * @description Self-describing contract surface. Hit once at boot to discover
         *     what's wired up, what the ledger promises, and what the hard
         *     limits are, instead of hardcoding assumptions.
         *
         *     Three independent version fields:
         *
         *       * `ledger_capabilities_version`: calendar-versioned shape of
         *         this document. Bumps when sections are added/renamed/removed.
         *         Pin against this if you parse the body.
         *       * `api_version`: the URL-prefix version (`v1`). Bumps on
         *         breaking changes to resource paths or shapes.
         *       * `release`: the running build. Useful for debugging; do not
         *         gate behavior on it.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example v1 */
                            api_version: string;
                            auth: {
                                algorithm?: string;
                                discovery?: string;
                                grant_types?: string[];
                                scheme?: string;
                                scopes?: string[];
                            };
                            consistency: {
                                /** @example exactly-once-effect */
                                idempotency?: string;
                                /** @example serialized */
                                per_account_writes?: string;
                                /** @example monotonic */
                                read_after_write?: string;
                                /** @example all-or-nothing */
                                within_transaction?: string;
                            };
                            features: {
                                [key: string]: boolean;
                            };
                            /**
                             * @description What the ledger promises about correctness. Each key
                             *     is a property the deployment will not violate.
                             */
                            guarantees: {
                                append_only?: boolean;
                                balanced_per_currency?: boolean;
                                double_entry_enforced_at?: ("application" | "database_trigger")[];
                                replay_safe?: boolean;
                                serializable_per_account?: boolean;
                            };
                            /** @example 2026-01 */
                            ledger_capabilities_version: string;
                            limits: {
                                [key: string]: unknown;
                            };
                            money_representation: {
                                /** @example debit | credit */
                                direction_field?: string;
                                implicit_conversion?: boolean;
                                /** @enum {string} */
                                rounding?: "never";
                                signed?: boolean;
                                /** @example numeric(38, 0) */
                                storage?: string;
                                /** @enum {string} */
                                unit?: "minor";
                            };
                            /** @enum {string} */
                            object?: "capabilities";
                            pagination: {
                                /** @enum {string} */
                                cursor?: "opaque";
                                default_limit?: number;
                                /** @enum {string} */
                                direction?: "forward_only";
                                max_limit?: number;
                                /** @enum {string} */
                                style?: "cursor";
                            };
                            reconciliation: {
                                default_matcher?: {
                                    fields?: string[];
                                    value_date_window_seconds?: number;
                                };
                                manual_marking?: boolean;
                                sources?: string;
                            };
                            /** @example 0.1.0 */
                            release: string;
                            /**
                             * @description Lifecycle state of the caller's tenant. `suspended`
                             *     and `terminated` tenants can still read (so they can
                             *     export); writes are rejected with `tenant_suspended`
                             *     (403). Dashboards should surface a banner when this
                             *     is not `active`.
                             * @enum {string}
                             */
                            tenant_status?: "active" | "suspended" | "terminated";
                            time: {
                                booking_date_precision?: string;
                                /** @enum {string} */
                                clock?: "utc";
                                period_close_enforced_at?: string[];
                                value_date_precision?: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/account_templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List account templates */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of account templates */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Define an account template
         * @description A template names a reusable shape for accounts: accounting type, allowed
         *     currencies, balance sign rule. When `POST /v1/accounts` is called with
         *     `template: <name>`, the request is validated against the template before
         *     insert. Templates are immutable; create a new name to evolve.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        accounting_type: "asset" | "liability" | "revenue" | "expense" | "equity";
                        /**
                         * @description Empty list means any currency is allowed.
                         * @example [
                         *       "USD",
                         *       "EUR",
                         *       "USDC"
                         *     ]
                         */
                        allowed_currencies?: string[];
                        /**
                         * @description When true, accounts using this template default to overdraft_policy=none.
                         * @default false
                         */
                        balance_non_negative?: boolean;
                        /** @description Paired with `custody_provider`. */
                        custody_external_id?: string;
                        /** @description Optional custody identifier inherited by accounts. */
                        custody_provider?: string;
                        description?: string;
                        /**
                         * @description Default classification inherited by accounts using this template.
                         * @enum {string}
                         */
                        fund_classification?: "client_held" | "operator" | "neutral";
                        metadata?: {
                            [key: string]: unknown;
                        };
                        /** @example accounts_receivable */
                        name: string;
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            accounting_type?: string;
                            allowed_currencies?: string[];
                            balance_non_negative?: boolean;
                            /** Format: date-time */
                            created_at?: string;
                            description?: string | null;
                            metadata?: Record<string, unknown>;
                            name?: string;
                            /** @enum {string} */
                            object?: "account_template";
                        };
                    };
                };
                409: components["responses"]["Error"];
                422: components["responses"]["Error"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/account_templates/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get an account template */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example accounts_receivable */
                    name: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List accounts */
        get: {
            parameters: {
                query?: {
                    /** @description Filter by `counterparty_ref` (typically combined with `kind=reserve`). */
                    counterparty_ref?: string;
                    /** @description Filter by currency ticker. */
                    currency?: string;
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    /** @description Filter to accounts tagged with this `custody_provider`. */
                    custody_provider?: string;
                    /** @description Filter by `fund_classification`. */
                    fund_classification?: "client_held" | "operator" | "neutral";
                    /**
                     * @description Filter by `account_kind`. Use `kind=reserve` to list reserve
                     *     accounts, optionally narrowed by `counterparty_ref`.
                     */
                    kind?: "standard" | "reserve";
                    limit?: components["parameters"]["Limit"];
                    /** @description Filter by accounting type. */
                    type?: "asset" | "liability" | "revenue" | "expense" | "equity";
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of accounts */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /** Create an account */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AccountInput"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"];
                    };
                };
                403: components["responses"]["InsufficientScope"];
                /** @description An account with this `id` already exists in your tenant. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description invalid_request (missing or malformed fields). */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/accounts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get an account */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/accounts/{id}/balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an account's balance (current or point-in-time)
         * @description Pass `?at=<ISO 8601 timestamp>` for a historical balance computed
         *     from `value_date` on each posting. Without `at`, returns the
         *     current balance from the actor's in-memory state.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description ISO 8601 instant. Balance as of that moment.
                     * @example 2026-04-15T00:00:00Z
                     */
                    at?: string;
                };
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Current posted + pending balance */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Balance"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/accounts/{id}/category_balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the rolled-up balance for an account category
         * @description Returns the aggregate balance across all accounts under the
         *     same category as the addressed account (e.g. the sum of every
         *     `accounts_receivable:*` account). Useful for treasury-level
         *     dashboards that want a single number per category.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Rolled-up category balance */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Balance"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/accounts/{id}/postings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List postings on an account */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                    /**
                     * @description Filter by posting tags. Example: `?tags[region]=EU&tags[department]=sales`.
                     *     All clauses ANDed.
                     */
                    tags?: {
                        [key: string]: string;
                    };
                };
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of postings, newest first */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/accounts/{id}/statement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Account statement for a period
         * @description Opening balance at `from`, every posting in `[from, to)` ordered
         *     by `value_date` ascending, closing balance at `to`. The auditor's
         *     per-account view.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Inclusive lower bound on `value_date`.
                     * @example 2026-04-01T00:00:00Z
                     */
                    from?: string;
                    limit?: number;
                    /**
                     * @description Exclusive upper bound on `value_date`. Defaults to now.
                     * @example 2026-05-01T00:00:00Z
                     */
                    to?: string;
                };
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Statement */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List events
         * @description Same payloads webhooks deliver. Use for backfill, debugging, or
         *     as a polling alternative to webhooks.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                    resource_id?: string;
                    /**
                     * @description Restrict results to events inserted at or after this point.
                     *     Accepts an ISO 8601 timestamp (`2026-05-27T00:00:00Z`) or a
                     *     relative duration string with unit suffix `s`, `m`, `h`, or
                     *     `d` (e.g. `24h`, `7d`, `15m`). Unparseable values are
                     *     silently ignored.
                     * @example 24h
                     */
                    since?: string;
                    /** @example transaction.created */
                    type?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of events, newest first */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch one event */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Event"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Queue an async export of the tenant's data
         * @description Queues a background job that streams the tenant's data
         *     (accounts, transactions, postings, events, period_closes,
         *     reconciliation_runs, webhook_endpoints, with secrets stripped) into
         *     NDJSON files and returns signed `download_urls` valid for 7
         *     days. Poll `GET /v1/exports/{id}` to wait for `status: "ready"`.
         *
         *     Idempotent on `Idempotency-Key`: replaying the same key returns
         *     the original row (with header `idempotent-replayed: true`).
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /**
                         * @default ndjson
                         * @enum {string}
                         */
                        format?: "ndjson";
                        /** @description Defaults to all known resources when omitted. */
                        resources?: ("accounts" | "transactions" | "postings" | "events" | "period_closes" | "reconciliation_runs" | "webhook_endpoints")[];
                    };
                };
            };
            responses: {
                /** @description Idempotency-Key replay. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Export"];
                        };
                    };
                };
                /** @description Export queued. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Export"];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Fetch an export
         * @description Returns the export row. Poll until `status` is `ready`, then
         *     download from `download_urls` before `expires_at`.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Export"];
                        };
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external_transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List external transactions
         * @description `status=open` is the break list. Filter by `source_id`,
         *     `currency`, and `from`/`to` on `occurred_at`. Newest first.
         */
        get: {
            parameters: {
                query?: {
                    currency?: string;
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    from?: string;
                    limit?: components["parameters"]["Limit"];
                    source_id?: string;
                    status?: "open" | "matched" | "ignored";
                    to?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of external transactions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external_transactions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch an external transaction */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description External transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external_transactions/{id}/ignore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Exclude an external transaction from matching
         * @description Marks an open row `ignored` (provider fees booked elsewhere,
         *     test rows). Idempotent on already-ignored rows. Matched rows
         *     are rejected with `invalid_state`; unmatch first. Emits
         *     `external_transaction.ignored`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        reason?: string;
                    };
                };
            };
            responses: {
                /** @description Ignored external transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Row is matched (`invalid_state`) */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external_transactions/{id}/match": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Manually match an external transaction to postings
         * @description The postings must be unreconciled, share the row's currency,
         *     and sum exactly to its amount; otherwise 422 with the residual
         *     in the hint. Records a match with strategy `manual` and emits
         *     `reconciliation.match_created`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        note?: string;
                        posting_ids: number[];
                    };
                };
            };
            responses: {
                /** @description External transaction with the new match embedded */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Row is not open (`invalid_state`) */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Postings do not sum to the external amount */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external_transactions/{id}/matches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Match audit trail for an external transaction
         * @description Includes reversed matches (`reversed_at` set).
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List of reconciliation matches, newest first */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external_transactions/{id}/unmatch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Undo a match
         * @description Reopens the matched postings, stamps the match row `reversed_at`
         *     (kept for audit), returns the row to `open`, and emits
         *     `reconciliation.match_reversed`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        reason?: string;
                    };
                };
            };
            responses: {
                /** @description Reopened external transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Row is not matched (`invalid_state`) */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inbound/sources/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Hosted inbound push endpoint
         * @description Unauthenticated except for the per-source HMAC signature (see
         *     the enable endpoint). Unknown or disabled tokens 404. Never
         *     runs matching; queue a run or rely on your scheduled runs.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Per-batch counts */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Missing or invalid signature */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unknown or disabled inbound endpoint */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ledgers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List ledgers in the caller's organization */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of ledgers */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /** Create a ledger */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        metadata?: {
                            [key: string]: unknown;
                        };
                        /** @enum {string} */
                        mode: "live" | "test";
                        /** @example Acme production */
                        name: string;
                    };
                };
            };
            responses: {
                /** @description Ledger created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": Record<string, unknown>;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ledgers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a ledger */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update a ledger */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        metadata?: {
                            [key: string]: unknown;
                        };
                        name?: string;
                    };
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        trace?: never;
    };
    "/v1/oauth_clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List OAuth clients
         * @description Lists every client in the tenant. Secrets are **never** returned
         *     on this endpoint, only on create + rotate. Requires
         *     `ledger:clients:read`.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                    /** @description Optional filter, only clients of the given mode. */
                    mode?: "live" | "test";
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of OAuth clients */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Register an OAuth client
         * @description Mints a new client. The response includes `client_secret`, the
         *     **only** time it is returned. Store it before discarding the
         *     response. Requires `ledger:clients:write`.
         *
         *     `Idempotency-Key` header is accepted.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["OAuthClientInput"];
                };
            };
            responses: {
                /** @description Client created. Body includes one-time `client_secret`. */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OAuthClient"];
                    };
                };
                404: components["responses"]["NotFound"];
                422: components["responses"]["Error"];
                429: components["responses"]["Error"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/oauth_clients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get an OAuth client */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OAuthClient"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        /**
         * Delete an OAuth client
         * @description Removes the client. In-flight access tokens minted by it remain
         *     valid until their natural expiry (JWTs are stateless); no new
         *     tokens can be issued.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Removed */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/oauth_clients/{id}/rotate_secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate the client secret
         * @description Mints a new client secret and returns the plaintext **once**. The
         *     previous secret remains valid for `POST /oauth/token` for 24
         *     hours after rotation, then is destroyed (sweeper job).
         *
         *     Re-rotating before the prior overlap window closes is rejected
         *     with `rotation_in_progress` (409) to prevent a 3-key chain.
         *     `Idempotency-Key` header is accepted.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Rotated. Body includes one-time `client_secret`. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OAuthClient"];
                    };
                };
                404: components["responses"]["NotFound"];
                409: components["responses"]["Error"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/organizations/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Return the caller's organization context
         * @description Resolves the calling client's organization and membership in
         *     one round trip. Useful as a session bootstrap.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/period_closes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List period closes */
        get: {
            parameters: {
                query?: {
                    include_reopened?: boolean;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List of closes, newest period first */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Close a period
         * @description Snapshots the trial balance at `period_end` and locks the
         *     window. After close, any new transaction with `value_date`
         *     inside the window is rejected with `period_closed`. Enforced
         *     both in the coordinator and by a DB trigger.
         *
         *     Overlapping closes are rejected with `already_exists`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /**
                         * @description Person or system signing off on the close. Recorded forever.
                         * @example controller@acme
                         */
                        closed_by_label: string;
                        note?: string;
                        /** Format: date-time */
                        period_end: string;
                        /** Format: date-time */
                        period_start: string;
                    };
                };
            };
            responses: {
                /** @description Period closed; trial balance snapshotted */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Overlapping close already exists */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/period_closes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch a close with full trial-balance snapshot */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Close (full snapshot embedded) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/period_closes/{id}/reopen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reopen a closed period
         * @description Records who reopened and when. Use sparingly; every reopen
         *     invalidates a previously-signed period report. The original
         *     close row is preserved with `reopened_at` + `reopened_by_label`
         *     for audit.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example controller@acme */
                        reopened_by_label: string;
                    };
                };
            };
            responses: {
                /** @description Reopened */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
                /** @description Already reopened */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/postings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List postings, tenant-wide
         * @description Cross-account list. Filter with `reconciled=true|false` to narrow
         *     to settled or open postings; pass `account=<id>` to scope to one
         *     account. For per-account history with the same tags filter, use
         *     `GET /v1/accounts/:id/postings`.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Filter to one account by id.
                     * @example accounts_receivable:acme
                     */
                    account?: string;
                    /**
                     * @description Only return postings with `value_date <` this timestamp.
                     * @example 2026-05-10T00:00:00Z
                     */
                    before_value_date?: string;
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                    /** @description Only reconciled (`true`) or only open (`false`). Omit for both. */
                    reconciled?: boolean;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of postings, oldest first */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/postings/{id}/reconciliations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Manually mark a posting as reconciled
         * @description For ad-hoc cleanups when the automated matcher couldn't pair an
         *     item. Already-reconciled postings are returned untouched.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        external_reference?: string;
                        /** Format: uuid */
                        reconciliation_run_id?: string;
                    };
                };
            };
            responses: {
                /** @description Updated posting */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reconciliation_runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List historic reconciliation runs */
        get: {
            parameters: {
                query?: {
                    limit?: components["parameters"]["Limit"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List of runs (no embedded snapshot; fetch by id for that) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Run a reconciliation
         * @description Match a snapshot of external items against unreconciled
         *     postings. Matching is per-currency, per-amount, with a default
         *     24-hour `value_date` window. Optional `account_id` on each item
         *     narrows the candidate pool.
         *
         *     The response surfaces three sets: `matched`, `unmatched_external`
         *     (items we couldn't pair), and `unmatched_internal` (postings in
         *     the time window that no external item claimed; only populated
         *     when `from`/`to` bound the query).
         *
         *     Idempotent: matched postings get marked once. Items are stored
         *     as external transactions keyed by `(source, external_id)`.
         *     Re-running the same snapshot reports already-matched items in
         *     `matched` with their original attribution; nothing is
         *     double-marked.
         *
         *     Items may carry `reference_rail`, `reference_kind`, and
         *     `reference_value` (all three or none). When the triple resolves
         *     to a transaction external ref, that posting is matched first
         *     with strategy `external_ref` (exact amount required).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /**
                         * @description Absolute minor-unit tolerance budget for auto-resolving small
                         *     breaks. Accepts a decimal string (recommended) or an integer on
                         *     write; returned as a string. A match whose |sum(postings) -
                         *     external_amount| residual is <= this value is treated as matched
                         *     and emits `reconciliation.break_auto_resolved`. Default "0" =
                         *     strictly equal.
                         * @default 0
                         */
                        auto_resolve_below_minor_units?: string | number;
                        /**
                         * @description Free-form pointer back to the snapshot in the external system.
                         * @example cobo:2026-05-14:eth
                         */
                        external_reference?: string;
                        /** Format: date-time */
                        from?: string;
                        items: {
                            /**
                             * @description Optional hint to narrow the candidate set.
                             * @example cash:usd
                             */
                            account_id?: string;
                            /**
                             * @description External amount in minor units. Accepts a decimal string (recommended) or an integer on write. Returned as a string.
                             * @example 10000000
                             */
                            amount: string | number;
                            /** Format: date-time */
                            at: string;
                            /** @example USDC */
                            currency: string;
                            /** @example dep_abc123 */
                            external_id: string;
                            /** @example charge */
                            reference_kind?: string;
                            /** @example stripe */
                            reference_rail?: string;
                            /** @example ch_3Nq */
                            reference_value?: string;
                        }[];
                        note?: string;
                        /**
                         * @description Name the external system you're reconciling against.
                         * @example cobo
                         */
                        source: string;
                        /**
                         * @description Matching strategy. `exact` pairs an external row with at most one
                         *     posting (default, pre-existing behavior). `sum_in_window` pairs an
                         *     external row with a subset of up to five postings whose summed
                         *     amount equals the external amount within
                         *     `auto_resolve_below_minor_units`, with every posting in the subset
                         *     inside `+/- window_seconds` of the external row's `at`.
                         * @default exact
                         * @enum {string}
                         */
                        strategy?: "exact" | "sum_in_window";
                        /** Format: date-time */
                        to?: string;
                        /**
                         * @description Allowed |posting.value_date - item.at| in seconds.
                         * @default 86400
                         */
                        window_seconds?: number;
                    };
                };
            };
            responses: {
                /** @description Run executed */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reconciliation_runs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch a single run with its snapshot */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Full run */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/balance_sheet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Balance sheet (assets / liabilities / equity)
         * @description Point-in-time balance sheet computed against `value_date`. Pass
         *     `?at=` for a historical view; omit for current. `currency` may
         *     be passed to scope the report to a single currency.
         */
        get: {
            parameters: {
                query?: {
                    at?: string;
                    currency?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Balance sheet report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/cash_flow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cash flow over a period
         * @description Cash movement broken out by category over `[from, to)`. Uses
         *     `value_date`.
         */
        get: {
            parameters: {
                query: {
                    currency?: string;
                    from: string;
                    to: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Cash flow report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/fund_segregation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Funds segregation snapshot
         * @description Per-currency totals of `client_held` vs. `custody_held` accounts
         *     plus a delta and a custody breakdown. Feeds regulator-style
         *     client-money reports (EMI, CASP, etc.). The platform itself
         *     does not interpret the classification beyond grouping.
         *
         *     Classifications and custody tags are set by the customer on
         *     accounts or inherited from account templates. The default
         *     classification is `neutral`, so existing ledgers report an
         *     empty `by_currency` until accounts are tagged.
         *
         *     On-demand only at v1: no snapshot history is kept (see Q2 of
         *     `docs/decisions/2026-05-27-platform-open-questions.md`).
         */
        get: {
            parameters: {
                query?: {
                    /** @description Restrict the report to a single currency. */
                    currency?: string;
                    /**
                     * @description Point-in-time cutoff (uses `value_date`, not `booking_date`).
                     *     Defaults to now.
                     */
                    value_date?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Fund segregation snapshot */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FundSegregationReport"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/income_statement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Income statement (revenue / expense over a period)
         * @description Revenue and expense totals over `[from, to)`. Both `from` and
         *     `to` are ISO 8601 instants and use `value_date` for inclusion.
         */
        get: {
            parameters: {
                query: {
                    currency?: string;
                    from: string;
                    to: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Income statement report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/reserves_outstanding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Total reserved per currency per counterparty
         * @description Sums the posted balance of every `account_kind = "reserve"`
         *     account in the ledger, grouped by `(counterparty_ref, currency)`.
         *     Empty when no reserves exist.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Reserves outstanding report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReservesOutstandingReport"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/trial_balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Trial balance as of a timestamp
         * @description Every account's balance, with per-currency debit/credit totals.
         *     A healthy ledger has `totals_by_currency[X].residual == 0` for
         *     every currency. The `healthy` boolean rolls this up.
         *
         *     Uses `value_date` for the cutoff. Pass `?at=` for a historical
         *     view; omit for current.
         */
        get: {
            parameters: {
                query?: {
                    /** @example 2026-04-30T23:59:59Z */
                    at?: string;
                    /** @description Filter to a single currency. */
                    currency?: string;
                    /** @description Include accounts with zero posted + pending. */
                    include_zero?: boolean;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Trial balance report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reserves": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sweep funds into a reserve account
         * @description Creates a reserve account (if it doesn't yet exist) for the
         *     `(template, counterparty_ref, currency)` triple and books a
         *     balanced transaction that debits the source account and credits
         *     the reserve. Reserves model holdbacks, escrow, FX holds, and any
         *     other case where unrestricted funds need to be earmarked for a
         *     named counterparty.
         *
         *     Listing and balance reads use the standard `/v1/accounts`
         *     surface (`?kind=reserve&counterparty_ref=<x>`). The platform
         *     does NOT auto-release on `expires_at`; that's customer policy.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ReserveSweepInput"];
                };
            };
            responses: {
                /** @description Reserve sweep booked */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReserveOpResult"];
                    };
                };
                /**
                 * @description `reserve_insufficient_funds` (source would go negative),
                 *     `reserve_currency_mismatch` (source currency != reserve
                 *     currency), or `account_template_unknown`.
                 */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reserves/{id}/claw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Claw funds from a reserve into an operator account
         * @description Books a balanced transaction debiting the reserve and crediting
         *     `operator_account_id`. Used when the held-back funds are
         *     forfeited to the operator (e.g. a chargeback lost by the
         *     merchant, an expired escrow window). The `reason_code` is
         *     persisted in transaction metadata for audit.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ReserveClawInput"];
                };
            };
            responses: {
                /** @description Claw booked */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReserveOpResult"];
                    };
                };
                404: components["responses"]["NotFound"];
                /**
                 * @description `reserve_release_exceeds_balance` when amount exceeds the
                 *     reserve's posted balance.
                 */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reserves/{id}/release": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Release funds from a reserve to a target account
         * @description Books a balanced transaction debiting the reserve and crediting
         *     `target_account_id`. The target need not be the original source.
         *     Idempotent on `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    /** @example reserve:merchant_payable:acme:usdc */
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ReserveReleaseInput"];
                };
            };
            responses: {
                /** @description Release booked */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReserveOpResult"];
                    };
                };
                404: components["responses"]["NotFound"];
                /**
                 * @description `reserve_release_exceeds_balance` when amount exceeds the
                 *     reserve's posted balance, or `reserve_currency_mismatch`.
                 */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List reconciliation sources */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List of sources */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create a source
         * @description A source names an external system you reconcile against
         *     (a PSP, bank, exchange). Per-source defaults (`default_strategy`,
         *     `default_window_seconds`, `default_tolerance_minor_units`,
         *     `default_account_id`) apply to source-scoped runs.
         *
         *     Names are unique per ledger, lowercased. Creating a name that an
         *     inline `POST /v1/reconciliation_runs` already used implicitly
         *     promotes that source and applies the provided defaults.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        default_account_id?: string;
                        /**
                         * @default exact
                         * @enum {string}
                         */
                        default_strategy?: "exact" | "sum_in_window";
                        /**
                         * @description Absolute minor-unit tolerance budget. Accepts a decimal string (recommended) or an integer on write. Returned as a string.
                         * @default 0
                         */
                        default_tolerance_minor_units?: string | number;
                        /** @default 86400 */
                        default_window_seconds?: number;
                        description?: string;
                        /**
                         * @description Connector kind. Selects the inbound payload adapter.
                         * @default custom
                         */
                        kind?: string;
                        metadata?: Record<string, unknown>;
                        /** @example stripe */
                        name: string;
                    };
                };
            };
            responses: {
                /** @description Source created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description A source with this name already exists */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch a source */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Source */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update a source's defaults */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Updated source */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        trace?: never;
    };
    "/v1/sources/{id}/inbound": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Enable or rotate the source's hosted inbound endpoint
         * @description Mints an inbound URL and signing secret. The plaintext secret is
         *     returned once in this response and never again; calling again
         *     rotates both token and secret, invalidating the old pair
         *     immediately.
         *
         *     Push payloads to the returned `inbound_url` signed with
         *
         *         Kordio-Inbound-Signature: t=<unix_seconds>,v1=<hex>
         *
         *     where `v1 = HMAC-SHA256(secret, "<t>.<raw_body>")`. Timestamps
         *     more than 5 minutes off are rejected. The payload is
         *     `{"items": [...]}` (or one item object) with the same fields as
         *     the batch ingest endpoint; ingestion is idempotent the same way.
         *     The source's `kind` selects the payload adapter; `custom` uses
         *     this generic scheme.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Source with `inbound_url` and one-time `inbound_secret` */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** Disable the source's inbound endpoint */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Source with inbound disabled */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources/{source_id}/external_transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ingest external transactions (idempotent batch)
         * @description Stores up to 1000 external money-movement rows. Idempotent on
         *     `(source, external_id)`: re-submitting a row never mutates the
         *     stored copy and reports `replayed`. Invalid rows report `error`
         *     per item without blocking the rest.
         *
         *     Amounts are integer minor units. `occurred_at` (alias `at`) is
         *     ISO 8601. `reference_rail`/`reference_kind`/`reference_value`
         *     must be provided together; they join against transaction
         *     external refs during matching. `raw` retains the provider
         *     payload.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    source_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        items: {
                            account_id?: string;
                            /**
                             * @description External amount in minor units. Accepts a decimal string (recommended) or an integer on write. Returned as a string.
                             * @example 10000000
                             */
                            amount: string | number;
                            /** @example USDC */
                            currency: string;
                            /** @example txn_1OqIJq */
                            external_id: string;
                            /** Format: date-time */
                            occurred_at: string;
                            raw?: Record<string, unknown>;
                            /** @example charge */
                            reference_kind?: string;
                            /** @example stripe */
                            reference_rail?: string;
                            /** @example ch_3Nq */
                            reference_value?: string;
                        }[];
                    };
                };
            };
            responses: {
                /** @description Per-item ingest result */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources/{source_id}/reconciliation_runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run reconciliation for a source
         * @description Draws open external transactions for the source (optionally
         *     bounded by `from`/`to` on `occurred_at`) and matches them.
         *     Strategy, window, and tolerance default from the source.
         *
         *     Runs with at most 500 open items execute synchronously and
         *     return the full result. Larger runs return `status: queued`
         *     with empty arrays; poll `GET /v1/reconciliation_runs/{id}` and
         *     subscribe to `reconciliation.run_completed`.
         *
         *     One queued or running run per source; a second request returns
         *     `run_in_progress` (409). Inline `items` are rejected here.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    source_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Absolute minor-unit tolerance budget. Accepts a decimal string (recommended) or an integer on write. */
                        auto_resolve_below_minor_units?: string | number;
                        external_reference?: string;
                        /** Format: date-time */
                        from?: string;
                        note?: string;
                        /** @enum {string} */
                        strategy?: "exact" | "sum_in_window";
                        /** Format: date-time */
                        to?: string;
                        window_seconds?: number;
                    };
                };
            };
            responses: {
                /** @description Run executed (completed) or queued */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description A run is already active for this source (`run_in_progress`) */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/tenants/me/anonymize": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Redact tenant metadata and party references
         * @description Right-of-erasure. Wipes `metadata` on every transaction,
         *     posting, account, event, and webhook delivery payload owned by
         *     the tenant, and replaces party-reference keys
         *     (`counterparty_ref`, `sender_party_id`, `recipient_party_id`)
         *     with the literal string `REDACTED`.
         *
         *     Postings, balances, value dates, currencies, and amounts remain.
         *     That is the financial substance retention law requires us to
         *     keep. See `docs/decisions/2026-05-27-platform-open-questions.md`
         *     (Q6) for the full rationale.
         *
         *     Irreversible. All-or-nothing per tenant.
         *
         *     Auth: requires `ledger:write` AND a bearer token issued in the
         *     last 5 minutes. A stale token returns `401
         *     fresh_authentication_required`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AnonymizationRequest"];
                };
            };
            responses: {
                /** @description Anonymization completed. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["AnonymizationResult"];
                        };
                    };
                };
                /**
                 * @description Returned with `error.code: "fresh_authentication_required"`
                 *     when the bearer token was issued more than 5 minutes ago.
                 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Returned when `confirm` is not the literal `"ANONYMIZE"`. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List transactions */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    /**
                     * @description Comma-separated. `postings.account` inlines each posting's
                     *     account object; `balances` adds the post-commit balance of every
                     *     touched account.
                     */
                    expand?: components["parameters"]["Expand"];
                    limit?: components["parameters"]["Limit"];
                    /**
                     * @description Filter by metadata values. Example:
                     *     `?metadata[payment_intent]=pi_acme_1234`.
                     */
                    metadata?: {
                        [key: string]: string;
                    };
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of transactions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create a transaction
         * @description Write a balanced set of postings. Replays of the same
         *     `Idempotency-Key` return the original transaction with status 200.
         *
         *     Set `?dry_run=true` to validate without writing: no idempotency
         *     key required, no events emitted, no balance changes.
         */
        post: {
            parameters: {
                query?: {
                    dry_run?: boolean;
                    /**
                     * @description Comma-separated. `postings.account` inlines each posting's
                     *     account object; `balances` adds the post-commit balance of every
                     *     touched account.
                     */
                    expand?: components["parameters"]["Expand"];
                };
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["TransactionInput"];
                };
            };
            responses: {
                /** @description Replayed (same `Idempotency-Key` as a prior call). */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"] | components["schemas"]["DryRun"];
                    };
                };
                /** @description missing_idempotency_key (required header absent on writes). */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                403: components["responses"]["InsufficientScope"];
                422: components["responses"]["Unbalanced"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/transactions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a transaction */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Comma-separated. `postings.account` inlines each posting's
                     *     account object; `balances` adds the post-commit balance of every
                     *     touched account.
                     */
                    expand?: components["parameters"]["Expand"];
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        /**
         * Not allowed, the ledger is append-only
         * @description Returns `405` with a hint pointing at `/reverse`. This is
         *     intentional: corrections must be auditable transactions, not
         *     silent deletes.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Method not allowed */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update transaction metadata
         * @description Metadata is the only mutable field on a transaction. Any other
         *     field returns `409 immutable_field`. To correct posted data,
         *     write a reversal.
         */
        patch: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /**
                         * @description When true (default), merge with existing metadata. When false, replace.
                         * @default true
                         */
                        merge?: boolean;
                        metadata?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                404: components["responses"]["NotFound"];
                409: components["responses"]["Immutable"];
            };
        };
        trace?: never;
    };
    "/v1/transactions/{id}/commit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Commit pending postings
         * @description Finalizes any `pending: true` postings on a transaction.
         *     Idempotent on `Idempotency-Key`: replays return the original
         *     result without re-emitting events.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Committed */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/transactions/{id}/refund": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refund a transaction (partial or full)
         * @description Books an inverse transaction for the requested amount,
         *     scaling every leg of the original (including legs in other
         *     currencies) by `amount / gross_in(currency)`. Banker's
         *     rounding; residual on the largest leg per currency, so the
         *     new transaction is balanced per currency.
         *
         *     `currency` is the base currency the caller is refunding. For
         *     single-currency originals it may be omitted and is inferred.
         *     For multi-currency originals it is **required**; omitting it
         *     returns `refund_currency_required` (422).
         *
         *     Sum of prior refunds is tracked per currency: a 100% USDC
         *     refund does not block a later 100% BTC refund on a USDC+BTC
         *     original. Refunds that would exceed the original's remaining
         *     amount in the requested currency return
         *     `partial_refund_exceeds_original` (422). Idempotent on
         *     `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: {
                    /**
                     * @description Comma-separated. `postings.account` inlines each posting's
                     *     account object; `balances` adds the post-commit balance of every
                     *     touched account.
                     */
                    expand?: components["parameters"]["Expand"];
                };
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /**
                         * @description Refund amount in minor units. Accepts a positive decimal string (recommended) or an integer on write.
                         * @example 5000000
                         */
                        amount: string | number;
                        /**
                         * @description The base currency to refund. Optional for
                         *     single-currency originals (inferred). Required
                         *     for multi-currency originals; omitting returns
                         *     `refund_currency_required` (422).
                         * @example USDC
                         */
                        currency?: string;
                        /** @description Optional body alternative to the `Idempotency-Key` header. Header wins. */
                        idempotency_key?: string;
                        metadata?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Idempotency replay (original refund returned) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                /** @description Refund transaction created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description Invalid refund amount, or refund would exceed original */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/transactions/{id}/reverse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reverse a transaction
         * @description Creates a new transaction with each posting's direction flipped
         *     and writes a bidirectional link via `reverses` / `reversed_by`.
         *     Idempotent on `Idempotency-Key`.
         */
        post: {
            parameters: {
                query?: {
                    /**
                     * @description Comma-separated. `postings.account` inlines each posting's
                     *     account object; `balances` adds the post-commit balance of every
                     *     touched account.
                     */
                    expand?: components["parameters"]["Expand"];
                };
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Reversal created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description already_reversed */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/transactions/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create many transactions in one call
         * @description Each item carries its own `idempotency_key`. The header
         *     `Idempotency-Key` is ignored on this endpoint; bulk callers
         *     must inline keys.
         *
         *     Returns a `bulk_result` with one entry per input in the same
         *     order. Status per entry: `created`, `replayed`, or `error`.
         *     On any failure the response status is `207 Multi-Status` (or
         *     `201` if every item succeeded).
         *
         *     **Atomic mode is partial today.** `"atomic": true` flags the
         *     intent; failures are still surfaced per-item. Full rollback of
         *     prior successes is not implemented yet; reverse them manually
         *     if you need rollback semantics. We do not silently drop the
         *     request.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @default false */
                        atomic?: boolean;
                        transactions: components["schemas"]["TransactionInput"][];
                    };
                };
            };
            responses: {
                /** @description All items created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Partial failure (some items failed). */
                207: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/transactions/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Look up a transaction by external reference
         * @description Returns the transaction that previously recorded a given
         *     external reference (e.g. a blockchain tx hash, a custody
         *     deposit id, a settlement confirmation id). All three of `rail`,
         *     `kind`, `value` are required and form the lookup tuple.
         *
         *     Use this to verify whether an external event has already been
         *     booked before deciding to write a new transaction.
         */
        get: {
            parameters: {
                query: {
                    /**
                     * @description Comma-separated. `postings.account` inlines each posting's
                     *     account object; `balances` adds the post-commit balance of every
                     *     touched account.
                     */
                    expand?: components["parameters"]["Expand"];
                    /**
                     * @description Type of identifier within the rail.
                     * @example tx_hash
                     */
                    kind: string;
                    /**
                     * @description External system / network identifier.
                     * @example ethereum
                     */
                    rail: string;
                    /**
                     * @description The identifier value.
                     * @example 0xabc123...
                     */
                    value: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Matching transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                /** @description Missing required query parameters */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_deliveries/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch a webhook delivery */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookDelivery"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_deliveries/{id}/redeliver": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Re-enqueue a delivery
         * @description Inserts a NEW `webhook_delivery` row referencing the same event
         *     + endpoint. The source row is not modified. The DeliveryWorker
         *     picks up the new row on its next tick. Replaying the same
         *     `Idempotency-Key` returns the original new row.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description New delivery enqueued. */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookDelivery"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description Endpoint is disabled (`webhook_endpoint_disabled`). */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_endpoints": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List webhook endpoints */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Register a webhook endpoint
         * @description The response includes `signing_secret`, the **only** time it is
         *     returned. Store it before discarding the response.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["WebhookEndpointInput"];
                };
            };
            responses: {
                /** @description Endpoint created. Body includes one-time `signing_secret`. */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookEndpoint"];
                    };
                };
                422: components["responses"]["Error"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_endpoints/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a webhook endpoint */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookEndpoint"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        /** Remove an endpoint */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Removed */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                404: components["responses"]["NotFound"];
            };
        };
        options?: never;
        head?: never;
        /** Update endpoint settings */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        active?: boolean;
                        description?: string;
                        enabled_events?: string[];
                        url?: string;
                    };
                };
            };
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookEndpoint"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        trace?: never;
    };
    "/v1/webhook_endpoints/{id}/deliveries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List recent deliveries for an endpoint
         * @description Returns the recent webhook deliveries for `:id`, newest-first, with
         *     full request/response detail so an integrator can debug a failing
         *     handler without DB access. `request_headers` is sanitized: any
         *     header containing `authorization`, `secret`, or `cookie` is
         *     redacted. The `Kordio-Signature` header is preserved (HMAC,
         *     not the key) so the value can be verified.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     anonymized resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    limit?: components["parameters"]["Limit"];
                    /** @description Filter by delivery status. */
                    status?: "pending" | "succeeded" | "failed";
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["List"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_endpoints/{id}/deliveries/failed_count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Count failed deliveries for an endpoint
         * @description Returns the count of deliveries that exhausted their retries
         *     (`status == failed`) for this endpoint. `since` accepts either
         *     an ISO-8601 timestamp or a relative duration (`24h`, `7d`,
         *     `1h`). Unparseable values are ignored.
         */
        get: {
            parameters: {
                query?: {
                    /** @example 24h */
                    since?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ok */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EnvelopeFields"] & {
                            data?: {
                                count: number;
                                /** @enum {string} */
                                object: "delivery_count";
                                /** Format: date-time */
                                since?: string | null;
                            };
                        };
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_endpoints/{id}/rotate_secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate the signing secret
         * @description Mints a new signing secret and returns the plaintext **once**. The
         *     previous secret remains valid for inbound signature verification
         *     for 24 hours after rotation, then is destroyed (sweeper job).
         *     Outgoing deliveries sign with the current secret only; Kordio
         *     does not dual-sign.
         *
         *     Re-rotating before the prior overlap window closes is rejected
         *     with `rotation_in_progress` (409) to prevent a 3-key chain.
         *     Body accepts no params today; `Idempotency-Key` header supported.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Rotated. Body includes one-time `signing_secret`. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EnvelopeFields"] & {
                            /** Format: uuid */
                            id: string;
                            /** @enum {string} */
                            object: "webhook_endpoint";
                            /**
                             * Format: date-time
                             * @description UTC timestamp 24h in the future. The previous secret
                             *     continues to verify inbound signatures until then.
                             */
                            previous_secret_expires_at: string;
                            /** @description New plaintext signing secret. Shown only on this response. */
                            signing_secret: string;
                        };
                    };
                };
                404: components["responses"]["NotFound"];
                409: components["responses"]["Error"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhook_endpoints/{id}/test_send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Enqueue a synthetic test delivery
         * @description Creates a `webhook_delivery` row for `:id` carrying a synthetic
         *     event. The synthetic event is NOT persisted to `/v1/events`;
         *     test sends shouldn't pollute the durable event tail subscribers
         *     consume. The DeliveryWorker delivers it like any other.
         *
         *     `event_type` defaults to `"webhook.test"`. `payload` defaults to
         *     `{"ping": true, "test": true}`. Both are optional.
         */
        post: {
            parameters: {
                query?: never;
                header?: {
                    /**
                     * @description Required on writes. Stable identifier you choose. The same key
                     *     always returns the same transaction, forever. Can also be supplied as
                     *     `idempotency_key` in the request body. Header wins.
                     *
                     *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
                     *     Max 255 bytes. Replays of an accepted key return the original
                     *     response with header `Idempotent-Replayed: true` so callers can
                     *     tell a replay from a freshly-committed result.
                     */
                    "Idempotency-Key"?: components["parameters"]["IdempotencyKey"];
                };
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @example webhook.test */
                        event_type?: string;
                        payload?: Record<string, unknown>;
                    };
                };
            };
            responses: {
                /** @description Delivery enqueued. */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookDelivery"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description Endpoint is disabled (`webhook_endpoint_disabled`). */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Account: components["schemas"]["EnvelopeFields"] & {
            /**
             * @description `restricted` is set by the platform on accounts created via
             *     `POST /v1/reserves`. Customers can also pass it explicitly
             *     to model reserves they build by hand.
             * @default standard
             * @enum {string}
             */
            account_kind?: "standard" | "restricted";
            /**
             * @description Opaque, customer-defined identifier of the counterparty a
             *     reserve account is held against. Set automatically by
             *     `POST /v1/reserves`; ignored on non-reserve accounts.
             * @example acme
             */
            counterparty_ref?: string | null;
            /**
             * Format: date-time
             * @example 2026-05-14T10:23:45.123456Z
             */
            created_at?: string;
            /** @example USDC */
            currency: string;
            /**
             * @description 6 for USDC, 8 for BTC, 18 for ETH; `null` for unknown.
             * @example 6
             */
            currency_decimals?: number | null;
            /**
             * @example stablecoin
             * @enum {string|null}
             */
            currency_kind?: "fiat" | "crypto" | "stablecoin" | null;
            /**
             * @description Provider-specific identifier (vault id, account id, etc.).
             *     Paired with `custody_provider`.
             * @example vault_42
             */
            custody_external_id?: string | null;
            /**
             * @description Opaque custody-system identifier (e.g. `fireblocks`,
             *     `anchorage`). Paired with `custody_external_id`: both
             *     set or both null.
             * @example fireblocks
             */
            custody_provider?: string | null;
            /**
             * @description Customer-set grouping for funds segregation reporting.
             *     The platform does not interpret this beyond grouping
             *     accounts in `GET /v1/reports/fund_segregation`. Inherited
             *     from the account's template when omitted on create.
             * @default neutral
             * @enum {string}
             */
            fund_classification?: "client_held" | "operator" | "neutral";
            /** @example accounts_receivable:acme */
            id: string;
            metadata?: {
                [key: string]: unknown;
            };
            /** @example Acme payable */
            name?: string;
            /** @enum {string} */
            object: "account";
            /**
             * @description Numeric string. Always nonneg.
             * @example 0
             */
            overdraft_limit?: string;
            /**
             * @example allowed
             * @enum {string}
             */
            overdraft_policy?: "allowed" | "none";
            /**
             * @example liability
             * @enum {string}
             */
            type: "asset" | "liability" | "revenue" | "expense" | "equity";
            /**
             * @description True if `currency` isn't in our metadata registry. The ledger still works.
             * @example false
             */
            unknown_currency?: boolean;
        };
        AccountCompact: {
            currency?: string;
            id?: string;
            /** @enum {string} */
            object?: "account";
            type?: string;
        };
        AccountInput: {
            /**
             * @description ISO 4217 fiat ticker, crypto/token symbol, or any string of
             *     your own (`POINTS`, `GIFT_CARD`). Pinned per account; cannot
             *     be changed. Normalized to uppercase when ticker-shaped.
             * @example USDC
             */
            currency: string;
            /**
             * @description Provider-specific identifier; paired with `custody_provider`.
             * @example vault_42
             */
            custody_external_id?: string;
            /**
             * @description Optional custody-system identifier. Paired with
             *     `custody_external_id`: both or neither.
             * @example fireblocks
             */
            custody_provider?: string;
            /**
             * @description Optional funds-segregation grouping. Defaults to `neutral`
             *     when omitted, or inherits the account's template value.
             * @enum {string}
             */
            fund_classification?: "client_held" | "operator" | "neutral";
            /**
             * @description Caller-chosen string. Stable; cannot be renamed. Unique
             *     within your tenant. Convention: `<purpose>:<scope>` (e.g.
             *     `accounts_receivable:acme`).
             * @example accounts_receivable:acme
             */
            id: string;
            /**
             * @example {
             *       "counterparty": "acme",
             *       "tier": "standard"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            /** @example Acme payable */
            name: string;
            /**
             * @description Maximum negative-balance allowance, in minor units. Stored
             *     as `numeric(38, 0)`. Returned as a JSON string for amounts
             *     beyond JavaScript's safe-integer range.
             * @example 0
             */
            overdraft_limit?: string;
            /**
             * @description `allowed` lets the account go to any balance; `none` rejects
             *     postings that would drive available below `-overdraft_limit`.
             *     Default `allowed` for backward compatibility.
             * @default allowed
             * @enum {string}
             */
            overdraft_policy?: "allowed" | "none";
            /**
             * @example liability
             * @enum {string}
             */
            type: "asset" | "liability" | "revenue" | "expense" | "equity";
        };
        AnonymizationRequest: {
            /**
             * @description Must equal the literal string `ANONYMIZE`.
             * @enum {string}
             */
            confirm: "ANONYMIZE";
            /**
             * @description Free-form label, e.g. `gdpr_erasure`, `customer_request`.
             * @example gdpr_erasure
             */
            reason?: string;
        };
        AnonymizationResult: {
            /** Format: uuid */
            anonymization_id: string;
            /** Format: date-time */
            anonymized_at?: string;
            /** @enum {string} */
            object: "anonymization_result";
            reason?: string | null;
            /** @enum {string} */
            status: "completed";
        };
        Balance: components["schemas"]["EnvelopeFields"] & {
            /** @example accounts_receivable:acme */
            account: string;
            /**
             * @description posted + pending, as a decimal string. Parse with a big-integer or decimal type, never a JS number.
             * @example 9700000
             */
            available: string;
            /** @example USDC */
            currency: string;
            /** @enum {string} */
            object: "balance";
            /**
             * @description Signed minor units from `pending: true` postings, as a decimal string. Parse with a big-integer or decimal type, never a JS number.
             * @example 0
             */
            pending: string;
            /**
             * @description Signed minor units from confirmed postings, as a decimal string. Parse with a big-integer or decimal type, never a JS number.
             * @example 9700000
             */
            posted: string;
        };
        DryRun: components["schemas"]["EnvelopeFields"] & {
            /** @enum {string} */
            object: "dry_run";
            summary: {
                accounts?: string[];
                /**
                 * @description Per-currency debits/credits.
                 * @example {
                 *       "USDC": {
                 *         "debit": "10000000",
                 *         "credit": "10000000"
                 *       }
                 *     }
                 */
                totals?: {
                    [key: string]: {
                        /** @description Minor units as a decimal string. Parse with a big-integer or decimal type, never a JS number. */
                        credit?: string;
                        /** @description Minor units as a decimal string. Parse with a big-integer or decimal type, never a JS number. */
                        debit?: string;
                    };
                };
            };
            /** @example true */
            valid: boolean;
        };
        Envelope: {
            /** @description The resource. Inspect `data.object` for its type. */
            data: Record<string, unknown>;
            /**
             * @description True when the resolved ledger is live. Derived from the access token's ledger claim.
             * @example false
             */
            livemode: boolean;
            /**
             * @description Echoes the `X-Request-Id` response header. Include in support
             *     tickets so we can find the exact request.
             * @example req_3LhM8XKx9q4hQv
             */
            request_id: string;
        };
        EnvelopeFields: {
            /**
             * @description Discriminator naming the shape of this resource (e.g. `account`, `transaction`).
             * @example account
             */
            object?: string;
        };
        ErrorResponse: {
            error: {
                /**
                 * @description Machine-readable. Stable across versions.
                 * @enum {string}
                 */
                code: "invalid_request" | "missing_idempotency_key" | "unauthorized" | "forbidden" | "insufficient_scope" | "invalid_client" | "invalid_grant" | "invalid_scope" | "not_found" | "unbalanced" | "currency_mismatch" | "unknown_account" | "already_exists" | "already_reversed" | "immutable_field" | "insufficient_funds" | "period_closed" | "precondition_failed" | "duplicate_external_ref" | "partial_refund_exceeds_original" | "refund_currency_required" | "rotation_in_progress" | "webhook_endpoint_disabled" | "reserve_insufficient_funds" | "reserve_currency_mismatch" | "reserve_release_exceeds_balance" | "account_template_unknown" | "invalid_state" | "unsupported_grant_type" | "rate_limited" | "internal_error" | "tenant_suspended" | "fresh_authentication_required";
                /** @description Code-specific structured detail (e.g. `by_currency` for unbalanced). */
                details?: {
                    [key: string]: unknown;
                };
                /** Format: uri */
                docs_url?: string;
                /** @description Actionable next step. */
                hint?: string;
                /** @description Human-readable one-liner. */
                message: string;
                /** @description Which request field caused the failure. */
                param?: string | null;
                /** @description Echoes the top-level `request_id`. Stripe-compatible placement. */
                request_id?: string;
            };
            /** @example false */
            livemode: boolean;
            /** @example req_3LhM8XKx9q4hQv */
            request_id: string;
        };
        Event: components["schemas"]["EnvelopeFields"] & {
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            object: "event";
            payload?: {
                [key: string]: unknown;
            };
            resource_id?: string | null;
            /**
             * @description One of: `account.created`, `account.classification_changed`,
             *     `transaction.created`,
             *     `transaction.reversal_created`, `transaction.reversed`,
             *     `transaction.refund_created`, `transaction.updated`,
             *     `transaction.committed`, `oauth_client.created`,
             *     `oauth_client.deleted`, `oauth_client.secret_rotated`,
             *     `oauth_client.rotated`, `oauth_client.revoked`,
             *     `member.invited`, `member.accepted`, `member.role_changed`,
             *     `member.revoked`, `tenant.provisioned`,
             *     `tenant.suspended`, `tenant.unsuspended`,
             *     `webhook_endpoint.secret_rotated`,
             *     `reconciliation.break_auto_resolved`.
             *
             *     Note: `transaction.reversal_created` fires *before*
             *     `transaction.reversed` so subscribers rebuilding state
             *     from the event tail can apply the create before the
             *     link. `transaction.refund_created` fires when a refund
             *     transaction is created; payload includes `refunds`
             *     (original id) and `refund_amount`.
             * @example transaction.created
             */
            type: string;
        };
        Export: {
            /** Format: date-time */
            created_at?: string;
            /**
             * @description Signed URLs valid until `expires_at`. Empty until the
             *     worker has uploaded the files.
             */
            download_urls?: string[];
            error_message?: string | null;
            /** Format: date-time */
            expires_at?: string | null;
            /** @enum {string} */
            format: "ndjson";
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            object: "export";
            /**
             * @example [
             *       "accounts",
             *       "transactions",
             *       "postings",
             *       "events"
             *     ]
             */
            resources: string[];
            /** @enum {string} */
            status: "pending" | "running" | "ready" | "failed";
            /** Format: date-time */
            updated_at?: string;
        };
        FundSegregationReport: components["schemas"]["EnvelopeFields"] & {
            by_currency: {
                /**
                 * @description Net posted balance across every `fund_classification = "client_held"`
                 *     account in this currency, in minor units, as a decimal string.
                 *     Parse with a big-integer or decimal type, never a JS number.
                 * @example 1000000
                 */
                client_held_total: string;
                /** @example USDC */
                currency: string;
                custody_breakdown: {
                    /**
                     * @description Minor units as a decimal string. Parse with a big-integer or decimal type, never a JS number.
                     * @example 1000000
                     */
                    balance: string;
                    /** @example vault_main */
                    custody_external_id: string;
                    /** @example fireblocks */
                    custody_provider: string;
                }[];
                /**
                 * @description Net posted balance across every `fund_classification = "operator"`
                 *     account that has a `custody_provider` set, in minor units, as a
                 *     decimal string. Parse with a big-integer or decimal type, never a JS number.
                 * @example 1000000
                 */
                custody_held_total: string;
                /**
                 * @description `custody_held_total - client_held_total`, in minor units, as a
                 *     decimal string. Positive = surplus, negative = shortfall.
                 *     Customer interprets the sign per their regulatory regime.
                 *     Parse with a big-integer or decimal type, never a JS number.
                 * @example 0
                 */
                delta: string;
            }[];
            /** @enum {string} */
            object: "report";
            /** @enum {string} */
            report: "fund_segregation";
            /** Format: date-time */
            value_date: string;
        };
        List: components["schemas"]["ListEnvelope"];
        ListEnvelope: {
            data: Record<string, unknown>[];
            has_more: boolean;
            /** @example false */
            livemode: boolean;
            next_cursor?: string | null;
            /** @enum {string} */
            object: "list";
            /** @example req_3LhM8XKx9q4hQv */
            request_id: string;
            /** @description Present only when the caller passed `?include_total=true`. */
            total?: number | null;
        };
        OAuthClient: {
            active: boolean;
            /** @description Plaintext secret. Returned only on create + rotate. */
            client_secret?: string;
            /** @description Hint to the integrator that the secret is shown once. */
            client_secret_note?: string;
            /** Format: date-time */
            created_at: string;
            /**
             * @description The `client_id`, prefixed `client_`.
             * @example client_3Jx9XfQwVZBfwUyZQ8H6
             */
            id: string;
            /** Format: date-time */
            last_used_at?: string | null;
            /** Format: uuid */
            ledger_id?: string | null;
            /** @enum {string} */
            mode: "live" | "test";
            /** @example ci-keys */
            name: string;
            /** @enum {string} */
            object: "oauth_client";
            /**
             * Format: date-time
             * @description Returned on rotate. UTC timestamp 24h in the future, until which
             *     the previous secret continues to authenticate at `POST /oauth/token`.
             */
            previous_secret_expires_at?: string;
            scopes: string[];
        };
        OAuthClientInput: {
            /**
             * Format: uuid
             * @description Ledger this client is pinned to. Must match `mode`.
             */
            ledger_id: string;
            /** @enum {string} */
            mode: "live" | "test";
            /** @example ci-keys */
            name: string;
            /**
             * @example [
             *       "ledger:read",
             *       "ledger:write"
             *     ]
             */
            scopes: ("ledger:read" | "ledger:write" | "ledger:period_close" | "ledger:clients:read" | "ledger:clients:write")[];
        };
        OAuthError: {
            /** @enum {string} */
            error: "invalid_request" | "invalid_client" | "invalid_grant" | "unauthorized_client" | "unsupported_grant_type" | "invalid_scope";
            error_description?: string;
            error_uri?: string;
            hint?: string;
        };
        Posting: {
            /** @description A string id by default; an Account object when `?expand=postings.account`. */
            account: string | components["schemas"]["AccountCompact"];
            /**
             * @description Amount in minor units, as a decimal string. Parse with a big-integer or decimal type, never a JS number. 1.00 USDC = "1000000" at 6 decimals.
             * @example 9700000
             */
            amount: string;
            /** Format: date-time */
            created_at?: string;
            /** @example USDC */
            currency: string;
            /**
             * @example credit
             * @enum {string}
             */
            direction: "debit" | "credit";
            /**
             * Format: int64
             * @example 14829
             */
            id?: number;
            /** @enum {string} */
            object: "posting";
            /**
             * @description Pending postings don't move the `posted` balance until committed.
             * @default false
             */
            pending?: boolean;
            /**
             * @example {
             *       "region": "EU",
             *       "department": "sales"
             *     }
             */
            tags?: {
                [key: string]: string;
            };
            transaction?: string | components["schemas"]["Transaction"];
            /** Format: date-time */
            value_date?: string;
        };
        PostingInput: {
            /**
             * @description Account `id` (must already exist in your tenant).
             * @example cash:usd
             */
            account: string;
            /**
             * @description Positive amount in minor units. Accepts a decimal string
             *     (recommended, e.g. "10000000") or an integer on write. Stored
             *     as `numeric(38, 0)` so 18-decimal tokens (ETH, DAI) past
             *     `9.2e18` minor units are fine. Always returned as a string.
             * @example 10000000
             */
            amount: string | number;
            /** @example USDC */
            currency: string;
            /**
             * @example debit
             * @enum {string}
             */
            direction: "debit" | "credit";
            /** @default false */
            pending?: boolean;
            /**
             * @description Flat string-to-string map of dimensions for reporting (department,
             *     region, project, etc.). Filterable via `?tags[key]=value`.
             * @example {
             *       "department": "sales",
             *       "region": "EU"
             *     }
             */
            tags?: {
                [key: string]: string;
            };
        };
        ReserveClawInput: {
            /** @description Amount in minor units to claw back, as a decimal string (recommended) or an integer on write. */
            amount: string | number;
            idempotency_key?: string;
            metadata?: {
                [key: string]: unknown;
            };
            /** @description Operator account where clawed funds land (revenue, write-off, etc.). */
            operator_account_id: string;
            /**
             * @description Free-text audit reason; persisted in transaction metadata.
             * @example chargeback_lost
             */
            reason_code: string;
        };
        ReserveOpResult: components["schemas"]["EnvelopeFields"] & {
            /**
             * @description Reserve posted balance after this op, in minor units, as a decimal string. Parse with a big-integer or decimal type, never a JS number.
             * @example 500000
             */
            balance: string;
            /** @enum {string} */
            object: "reserve_op_result";
            /**
             * @description Alias of `balance`; preserved for symmetry with the decision-doc contract. Decimal string of minor units.
             * @example 500000
             */
            remaining_balance?: string;
            /** @example reserve:merchant_payable:acme:usdc */
            reserve_account_id: string;
            /** Format: uuid */
            transaction_id: string;
        };
        ReserveReleaseInput: {
            /** @description Amount in minor units to release, as a decimal string (recommended) or an integer on write. Must be <= the reserve's posted balance. */
            amount: string | number;
            idempotency_key?: string;
            metadata?: {
                [key: string]: unknown;
            };
            /** @description Account that receives the released funds. Often the original source. */
            target_account_id: string;
        };
        ReservesOutstandingReport: components["schemas"]["EnvelopeFields"] & {
            entries: {
                /** @example acme */
                counterparty_ref: string;
                /** @example USDC */
                currency: string;
                /**
                 * @description Minor units as a decimal string. Parse with a big-integer or decimal type, never a JS number.
                 * @example 500000
                 */
                posted: string;
            }[];
            /** Format: uuid */
            ledger_id: string;
            /** @enum {string} */
            object: "reserves_outstanding";
            /** @example 2 */
            reserve_account_count?: number;
            /**
             * @example {
             *       "USDC": "500000"
             *     }
             */
            totals_by_currency: {
                [key: string]: string;
            };
        };
        ReserveSweepInput: {
            /**
             * @description Amount in minor units to sweep into the reserve. Accepts a decimal string (recommended) or an integer on write.
             * @example 500000
             */
            amount: string | number;
            /**
             * @description Opaque customer-defined identifier of the counterparty the reserve is held for.
             * @example acme
             */
            counterparty_ref: string;
            /**
             * @description Currency of the sweep. Must equal the source account's currency.
             * @example USDC
             */
            currency: string;
            /**
             * Format: date-time
             * @description Informational only. Persisted in transaction metadata so a
             *     customer-side scheduler can find expired reserves and POST
             *     `/release`; the platform does NOT auto-release.
             */
            expires_at?: string | null;
            /** @description Optional body alternative to the `Idempotency-Key` header. Header wins. */
            idempotency_key?: string;
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * @description Account whose balance is debited to fund the reserve.
             * @example payable:acme
             */
            source_account_id: string;
            /**
             * @description Name of a registered `account_template` whose
             *     `accounting_type` matches the reserve's intended sign
             *     (typically `liability` with `balance_non_negative: true`).
             * @example merchant_payable
             */
            template: string;
        };
        Transaction: components["schemas"]["EnvelopeFields"] & {
            /** @description Returned only when `?expand=balances`. */
            balances?: components["schemas"]["Balance"][];
            /**
             * @description Currency that the exchange rate quotes from. Set with `exchange_rate`.
             * @example USD
             */
            base_currency?: string | null;
            /** Format: date-time */
            booking_date?: string;
            /** Format: date-time */
            created_at?: string;
            /**
             * @description Decimal string. Present only when the transaction has
             *     postings in more than one currency. The rate that was
             *     in effect at write time. It is persisted for audit and
             *     restatement, never recomputed.
             * @example 1.0823
             */
            exchange_rate?: string | null;
            /**
             * Format: uuid
             * @example 3061ec4e-c959-49ba-a0f6-99186a7bd5d8
             */
            id: string;
            /** @example pi_acme_1234_capture */
            idempotency_key?: string;
            /**
             * @example {
             *       "payment_intent": "pi_acme_1234",
             *       "channel": "web"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            /** @enum {string} */
            object: "transaction";
            postings: components["schemas"]["Posting"][];
            /**
             * @description Currency that the exchange rate quotes to. Set with `exchange_rate`.
             * @example USDC
             */
            quote_currency?: string | null;
            /** @description Minor units refunded, as a decimal string. Parse with a big-integer or decimal type, never a JS number. Present only on refund transactions. */
            refund_amount?: string | null;
            /**
             * Format: uuid
             * @description Set when this transaction refunds another (partial or full).
             */
            refunds?: string | null;
            /**
             * Format: uuid
             * @description Set when this transaction has been reversed.
             */
            reversed_by?: string | null;
            /**
             * Format: uuid
             * @description Set when this transaction reverses another.
             */
            reverses?: string | null;
            /** Format: date-time */
            updated_at?: string;
            /** Format: date-time */
            value_date?: string;
        };
        TransactionInput: {
            /**
             * @description Alternative to the `Idempotency-Key` header. Required if header
             *     absent. Charset `[A-Za-z0-9_:.-]`, max 255 bytes.
             * @example pi_acme_1234_capture
             */
            idempotency_key?: string;
            /**
             * @description Free-form caller annotations. Mutable via PATCH.
             * @example {
             *       "payment_intent": "pi_acme_1234",
             *       "channel": "web",
             *       "country": "US"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            postings: components["schemas"]["PostingInput"][];
            /**
             * Format: date-time
             * @description When the value transferred (vs `booking_date`, which is when
             *     we recorded the entry). Used by reports. Defaults to the
             *     booking time.
             * @example 2026-05-14T10:00:00Z
             */
            value_date?: string;
        };
        WebhookDelivery: components["schemas"]["EnvelopeFields"] & {
            /** @description How many HTTP attempts this row has made (0 for pending). */
            attempt: number;
            /** Format: date-time */
            created_at?: string;
            /**
             * @description How this delivery was created.
             * @enum {string}
             */
            enqueue_kind?: "event" | "redelivery" | "test_send";
            error_message?: string | null;
            event_id: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            next_attempt_at?: string | null;
            /** @enum {string} */
            object: "webhook_delivery";
            /**
             * Format: uuid
             * @description For `enqueue_kind: redelivery`, the source delivery id.
             */
            redelivers_delivery_id?: string | null;
            request_body?: string | null;
            /**
             * @description Outgoing request headers as sent to the integrator's
             *     endpoint. Sensitive headers (`authorization`, `*secret*`,
             *     `cookie`) are redacted to `[redacted]`. The
             *     `Kordio-Signature` header is preserved because it's an
             *     HMAC value, not a key.
             */
            request_headers?: {
                [key: string]: string;
            } | null;
            /** @example POST */
            request_method?: string | null;
            request_url?: string | null;
            /** Format: date-time */
            response_at?: string | null;
            response_body?: string | null;
            response_headers?: {
                [key: string]: string;
            } | null;
            response_status?: number | null;
            /**
             * @description Public delivery state. Internally the DB also carries a
             *     `dead` value for terminal failures after all retries
             *     exhausted; the API collapses that to `failed`.
             * @enum {string}
             */
            status: "pending" | "succeeded" | "failed";
            /** Format: date-time */
            updated_at?: string;
            /** Format: uuid */
            webhook_endpoint_id: string;
        };
        WebhookEndpoint: components["schemas"]["EnvelopeFields"] & {
            active: boolean;
            /** Format: date-time */
            created_at?: string;
            description?: string;
            enabled_events?: string[];
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            last_delivered_at?: string | null;
            /** @enum {string} */
            mode?: "live" | "test";
            /** @enum {string} */
            object: "webhook_endpoint";
            /** @description Returned only on create + rotate. */
            signing_secret?: string;
            /** @description Hint to the integrator that the secret is shown once. */
            signing_secret_note?: string;
            /** Format: uri */
            url: string;
        };
        WebhookEndpointInput: {
            /** @example Production handler */
            description?: string;
            /**
             * @example [
             *       "transaction.created",
             *       "transaction.reversal_created",
             *       "transaction.refund_created",
             *       "transaction.reversed"
             *     ]
             */
            enabled_events?: string[];
            /**
             * Format: uri
             * @example https://acme.example.com/webhooks/kordio
             */
            url: string;
        };
    };
    responses: {
        /** @description Error */
        Error: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description A non-metadata field cannot be updated. */
        Immutable: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The token is valid but lacks the scope this endpoint needs. */
        InsufficientScope: {
            headers: {
                /** @example Bearer error="insufficient_scope", scope="ledger:write" */
                "WWW-Authenticate"?: string;
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description Not found */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The transaction does not balance per currency. */
        Unbalanced: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
    };
    parameters: {
        /**
         * @description Opaque token from a prior page's `next_cursor`. Do not decode or
         *     construct cursors client-side; their encoding is implementation
         *     detail and may change between releases. Cursors are stable for
         *     the resources they reference (a cursor pointing at a deleted /
         *     anonymized resource still paginates correctly. It points at a
         *     position, not at a row). No documented TTL; treat cursors as
         *     valid until the next forward-incompatible API change.
         */
        Cursor: string;
        /**
         * @description Comma-separated. `postings.account` inlines each posting's
         *     account object; `balances` adds the post-commit balance of every
         *     touched account.
         */
        Expand: ("postings.account" | "balances")[];
        /**
         * @description Required on writes. Stable identifier you choose. The same key
         *     always returns the same transaction, forever. Can also be supplied as
         *     `idempotency_key` in the request body. Header wins.
         *
         *     Allowed character set: `A-Z`, `a-z`, `0-9`, `_`, `:`, `.`, `-`.
         *     Max 255 bytes. Replays of an accepted key return the original
         *     response with header `Idempotent-Replayed: true` so callers can
         *     tell a replay from a freshly-committed result.
         */
        IdempotencyKey: string;
        /**
         * @description Identifies the ledger the request operates on. Required for all
         *     ledger-scoped endpoints (everything except `/v1/ledgers`,
         *     `/v1/organizations`, and OAuth). May also be carried as a
         *     `ledger_id` claim in the access token. When both are present
         *     the token claim wins. The ledger's mode (test/live) determines
         *     the response `livemode`.
         */
        LedgerId: string;
        Limit: number;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
