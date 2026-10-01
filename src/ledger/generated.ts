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
    "/ledger/v1/_meta/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Capabilities of this deployment
         * @description Self-describing contract surface. Hit once at boot to discover
         *     which features are available to your organization instead of
         *     hardcoding assumptions.
         *
         *     `ledger_capabilities_version` is the calendar version of this
         *     document's shape. Pin against it if you parse the body.
         *     `api_version` is the URL-prefix version (`v1`).
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
                            conditional_posting: {
                                /**
                                 * @example [
                                 *       "lock_version",
                                 *       "min_available_balance",
                                 *       "max_available_balance"
                                 *     ]
                                 */
                                condition_keys?: string[];
                                /** @example precondition_failed */
                                error_code_on_mismatch?: string;
                            };
                            /**
                             * @description The balance engine that enforces double entry and overdraft policy.
                             * @example tigerbeetle
                             */
                            engine: string;
                            /**
                             * @description Feature flags. Values are booleans, except `webhooks`,
                             *     which is `"workspace"`: ledger events are delivered by
                             *     your workspace's Kordio webhooks, not by ledger-level
                             *     endpoints. `reconciliation`, `reserves` and `exports`
                             *     are `false`.
                             * @example {
                             *       "idempotency_keys": true,
                             *       "bulk_transactions": true,
                             *       "period_close": true,
                             *       "webhooks": "workspace",
                             *       "reconciliation": false,
                             *       "reserves": false,
                             *       "exports": false
                             *     }
                             */
                            features: {
                                [key: string]: boolean | string;
                            };
                            /** @example 2026-10-01 */
                            ledger_capabilities_version: string;
                            /** @description True when your plan permits writes to live ledgers. Live data stays readable either way. */
                            live_mode: boolean;
                            /** @enum {string} */
                            object: "capabilities";
                            organization_model: {
                                /**
                                 * @example [
                                 *       "organization",
                                 *       "ledger",
                                 *       "account|transaction|posting"
                                 *     ]
                                 */
                                hierarchy?: string[];
                                many_ledgers_per_org?: boolean;
                                /** @example ledger */
                                mode_lives_on?: string;
                                modes_per_org?: ("live" | "test")[];
                            };
                            /** @description Your organization's current plan. */
                            plan: string;
                            /** @enum {string} */
                            tenant_status: "active";
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
    "/ledger/v1/account_templates": {
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
                     *     archived resource still paginates correctly. It points at a
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
                        "application/json": components["schemas"]["AccountTemplate"];
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
    "/ledger/v1/account_templates/{name}": {
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
                    content: {
                        "application/json": components["schemas"]["AccountTemplate"];
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
    "/ledger/v1/accounts": {
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
                    /** @description Filter by `counterparty_ref`. */
                    counterparty_ref?: string;
                    /** @description Filter by currency ticker. */
                    currency?: string;
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     archived resource still paginates correctly. It points at a
                     *     position, not at a row). No documented TTL; treat cursors as
                     *     valid until the next forward-incompatible API change.
                     */
                    cursor?: components["parameters"]["Cursor"];
                    /** @description Filter to accounts tagged with this `custody_provider`. */
                    custody_provider?: string;
                    /** @description Filter by `fund_classification`. */
                    fund_classification?: "client_held" | "operator" | "neutral";
                    /** @description Filter by `account_kind`. */
                    kind?: "standard" | "restricted";
                    ledgerable_id?: string;
                    ledgerable_type?: string;
                    limit?: components["parameters"]["Limit"];
                    /** @description Filter to direct children of this account. */
                    parent_id?: string;
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
    "/ledger/v1/accounts/{id}": {
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
        /**
         * Update an account
         * @description Updates the mutable fields of an account. `id`, `type`,
         *     `currency` and the overdraft settings cannot change; other
         *     fields in the body are ignored. A change to
         *     `fund_classification`, `custody_provider` or
         *     `custody_external_id` emits `account.classification_changed`.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AccountUpdate"];
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description `precondition_failed`: the account was modified concurrently. Retry. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description `invalid_request`: a blank name, non-object metadata, an unknown classification, or only one of the custody pair. */
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
        trace?: never;
    };
    "/ledger/v1/accounts/{id}/balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an account's balance (current or point-in-time)
         * @description Pass `?at=<ISO 8601 timestamp>` for a historical balance computed
         *     from `value_date` on each posting; the response then carries
         *     `as_of`. Without `at`, returns the current balance from the
         *     balance engine.
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
    "/ledger/v1/accounts/{id}/category_balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the rolled-up balance for an account category
         * @description Sums the balance of the addressed account and every account
         *     below it through `parent_id`, at any depth. All members must
         *     share one currency; a mixed-currency subtree returns
         *     `invalid_request`.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example accounts_receivable */
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
                        "application/json": components["schemas"]["CategoryBalance"];
                    };
                };
                404: components["responses"]["NotFound"];
                422: components["responses"]["Error"];
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
    "/ledger/v1/accounts/{id}/close": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Close an account
         * @description Permanently closes an account. Both its posted and pending
         *     balance must be zero, or the call returns
         *     `409 account_balance_nonzero`. A closed account rejects new
         *     postings with `account_closed`. Closing an account that is
         *     already closed returns it unchanged. Emits `account.closed`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example accounts_receivable:acme */
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /**
                         * @description Person or system closing the account. Recorded for audit.
                         * @example controller@acme
                         */
                        closed_by_label: string;
                    };
                };
            };
            responses: {
                /** @description Closed (or already closed) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Account"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description account_balance_nonzero */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description `invalid_request`: `closed_by_label` is missing. */
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
    "/ledger/v1/accounts/{id}/postings": {
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
                     *     archived resource still paginates correctly. It points at a
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
    "/ledger/v1/accounts/{id}/statement": {
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
                        "application/json": components["schemas"]["AccountStatement"];
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
    "/ledger/v1/events": {
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
                     *     archived resource still paginates correctly. It points at a
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
    "/ledger/v1/events/{id}": {
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
    "/ledger/v1/ledgers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List ledgers in the caller's organization
         * @description Returns every ledger in one page, oldest first.
         */
        get: {
            parameters: {
                query?: {
                    include_archived?: boolean;
                    mode?: "live" | "test";
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
                        description?: string;
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
                        "application/json": components["schemas"]["Ledger"];
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
    "/ledger/v1/ledgers/{id}": {
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
                        "application/json": components["schemas"]["Ledger"];
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
                        /**
                         * Format: date-time
                         * @description Set to archive the ledger; `null` to unarchive.
                         */
                        archived_at?: string | null;
                        description?: string;
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
                        "application/json": components["schemas"]["Ledger"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/ledger/v1/oauth_clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List OAuth clients
         * @description Lists every client in the organization in one page. Secrets are
         *     **never** returned on this endpoint, only on create + rotate.
         *     Requires `ledger:clients:read`.
         */
        get: {
            parameters: {
                query?: {
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
    "/ledger/v1/oauth_clients/{id}": {
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            deleted: true;
                            id: string;
                            /** @enum {string} */
                            object: "oauth_client";
                        };
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ledger/v1/oauth_clients/{id}/rotate_secret": {
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
    "/ledger/v1/organizations/me": {
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
                        "application/json": components["schemas"]["Organization"];
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
    "/ledger/v1/period_closes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List period closes
         * @description Returns every close in one page. List entries omit `trial_balance`.
         */
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
         *     inside the window is rejected with `period_closed`.
         *
         *     A period whose trial balance does not net to zero per currency
         *     is rejected with `period_close_imbalanced`; pass `force: true`
         *     to record the imbalanced close deliberately; it emits
         *     `period.closed_forced` as well as `period.closed`. Overlapping closes
         *     are rejected with `already_exists`. Writes into the window that
         *     are still being applied return `in_progress`. Requires the
         *     `ledger:period_close` scope.
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
                        /**
                         * @description Close even if the trial balance is imbalanced. Recorded as `forced`.
                         * @default false
                         */
                        force?: boolean;
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
                        "application/json": components["schemas"]["PeriodClose"];
                    };
                };
                /** @description `already_exists` (overlapping close) or `in_progress`. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description `period_close_imbalanced`, or invalid bounds. */
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
    "/ledger/v1/period_closes/{id}": {
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
                    content: {
                        "application/json": components["schemas"]["PeriodClose"];
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
    "/ledger/v1/period_closes/{id}/reopen": {
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
         *     for audit. Requires the `ledger:period_close` scope.
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
                    content: {
                        "application/json": components["schemas"]["PeriodClose"];
                    };
                };
                404: components["responses"]["NotFound"];
                /** @description Already reopened (`already_exists`) */
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
    "/ledger/v1/postings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List postings, tenant-wide
         * @description Cross-account list, newest first. Pass `account=<id>` to scope
         *     to one account. For per-account history with a tags filter, use
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
                     *     archived resource still paginates correctly. It points at a
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
    "/ledger/v1/reports/balance_sheet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Balance sheet (assets / liabilities / equity)
         * @description Point-in-time balance sheet computed against `value_date`. Pass
         *     `?at=` for a historical view; omit for current. Revenue minus
         *     expense is reported as `retained_earnings`.
         */
        get: {
            parameters: {
                query?: {
                    at?: string;
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
                        "application/json": components["schemas"]["BalanceSheetReport"];
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
    "/ledger/v1/reports/cash_flow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cash flow over a period
         * @description Net movement on asset accounts over `[from, to)`, using
         *     `value_date`, classified as operating, investing, financing or
         *     uncategorized by the type of the counterparty legs. Pending
         *     postings are excluded. Pass `granularity` with both bounds to
         *     add a `series` of per-period buckets.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Inclusive lower bound on `value_date`. Omit to start at the beginning of the ledger.
                     * @example 2026-04-01T00:00:00Z
                     */
                    from?: components["parameters"]["ReportFrom"];
                    /**
                     * @description Adds a `series` of per-period buckets. Requires both `from` and
                     *     `to`. At most 400 buckets.
                     */
                    granularity?: components["parameters"]["Granularity"];
                    /**
                     * @description Exclusive upper bound on `value_date`. Defaults to now.
                     * @example 2026-05-01T00:00:00Z
                     */
                    to?: components["parameters"]["ReportTo"];
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
                        "application/json": components["schemas"]["CashFlowReport"];
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
    "/ledger/v1/reports/income_statement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Income statement (revenue / expense over a period)
         * @description Revenue and expense totals over `[from, to)`, using
         *     `value_date` for inclusion. `from` defaults to the beginning of
         *     the ledger, `to` to now. Pass `granularity` with both bounds to
         *     add a `series` of per-period buckets.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Inclusive lower bound on `value_date`. Omit to start at the beginning of the ledger.
                     * @example 2026-04-01T00:00:00Z
                     */
                    from?: components["parameters"]["ReportFrom"];
                    /**
                     * @description Adds a `series` of per-period buckets. Requires both `from` and
                     *     `to`. At most 400 buckets.
                     */
                    granularity?: components["parameters"]["Granularity"];
                    /**
                     * @description Exclusive upper bound on `value_date`. Defaults to now.
                     * @example 2026-05-01T00:00:00Z
                     */
                    to?: components["parameters"]["ReportTo"];
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
                        "application/json": components["schemas"]["IncomeStatementReport"];
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
    "/ledger/v1/reports/trial_balance": {
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
                        "application/json": components["schemas"]["TrialBalanceReport"];
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
    "/ledger/v1/transactions": {
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
                    /** @description Only transactions with a posting on this account. */
                    account?: string;
                    /** @description Only transactions with a posting of at least this amount, in minor units. */
                    amount_gte?: number;
                    /** @description Only transactions with a posting of at most this amount, in minor units. */
                    amount_lte?: number;
                    /** @description Only transactions with a posting in this currency. */
                    currency?: string;
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     archived resource still paginates correctly. It points at a
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
                    /** @description Adds `total`, the count of all matching transactions. */
                    include_total?: boolean;
                    limit?: components["parameters"]["Limit"];
                    /**
                     * @description Filter by metadata values. Example:
                     *     `?metadata[payment_intent]=pi_acme_1234`.
                     */
                    metadata?: {
                        [key: string]: string;
                    };
                    ref_kind?: string;
                    /** @description Only transactions with an external ref on this rail. */
                    ref_rail?: string;
                    ref_value?: string;
                    /** @description `true` for reversed transactions only, `false` for unreversed only. Omit for both. */
                    reversed?: boolean;
                    status?: "pending" | "posted" | "archived";
                    /** @description Inclusive lower bound on `value_date`. */
                    value_date_from?: string;
                    /** @description Exclusive upper bound on `value_date`. */
                    value_date_to?: string;
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
         * @description Write a balanced set of postings, at most 250. Replays of the
         *     same `Idempotency-Key` return the original transaction with
         *     status 200. A replay that arrives while the original is still
         *     being applied returns `409 in_progress`; retry with the same key.
         *
         *     Set `?dry_run=true` (or `"dry_run": true` in the body) to
         *     validate without writing: no idempotency key required, no events
         *     emitted, no balance changes. Dry runs answer `200`.
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
                /** @description Replayed (same `Idempotency-Key` as a prior call), or a dry run. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"] | components["schemas"]["DryRun"];
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
                403: components["responses"]["InsufficientScope"];
                /** @description `in_progress`, `period_closed`, `precondition_failed`, `duplicate_external_ref`, or `account_closed`. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                422: components["responses"]["Unbalanced"];
                /** @description `unavailable`: the balance engine could not be reached. Retry with the same idempotency key. */
                503: {
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
    "/ledger/v1/transactions/{id}": {
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
         * @description Metadata is the only mutable field on a transaction. Sending
         *     `postings`, `idempotency_key`, `reverses` or `reversed_by`
         *     returns `409 immutable_field`. Values are stored as strings. To
         *     correct posted data, write a reversal.
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
    "/ledger/v1/transactions/{id}/commit": {
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
         * @description Finalizes every `pending: true` posting on a transaction and
         *     moves it to `status: posted`. Committing a transaction that is
         *     already posted returns it unchanged, without re-emitting events.
         *     A reversed transaction cannot be committed: its pending postings
         *     were voided by the reversal, and the call returns
         *     `409 invalid_state`.
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
                header?: never;
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
                /** @description invalid_state (the transaction was reversed) */
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
    "/ledger/v1/transactions/{id}/refund": {
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
    "/ledger/v1/transactions/{id}/refunds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List refunds of a transaction
         * @description Every refund booked against the transaction, newest first.
         *     Refunds are the transactions whose `metadata._refund_of` is
         *     this id.
         */
        get: {
            parameters: {
                query?: {
                    /**
                     * @description Opaque token from a prior page's `next_cursor`. Do not decode or
                     *     construct cursors client-side; their encoding is implementation
                     *     detail and may change between releases. Cursors are stable for
                     *     the resources they reference (a cursor pointing at a deleted /
                     *     archived resource still paginates correctly. It points at a
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
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A page of refund transactions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ListEnvelope"] & {
                            data?: components["schemas"]["Transaction"][];
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
    "/ledger/v1/transactions/{id}/reverse": {
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
         * @description Creates a new transaction with each posted leg's direction
         *     flipped and writes a bidirectional link via `reverses` /
         *     `reversed_by`. The original moves to `status: archived`.
         *
         *     Pending postings on the original are not flipped. They are
         *     voided: their hold is released, they get a `voided_at`, and they
         *     no longer count toward any balance. A reversed transaction can
         *     no longer be committed.
         *
         *     If the original's `value_date` falls in a closed period, the
         *     reversal is dated now and carries `_reverses_value_date` in its
         *     metadata. Idempotent on `Idempotency-Key`: a replay returns the
         *     existing reversal with status 200.
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
                /** @description Idempotency replay (the existing reversal is returned) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Transaction"];
                    };
                };
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
    "/ledger/v1/transactions/bulk": {
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
         *     Without `atomic`, items succeed or fail independently: an item
         *     rejected for `insufficient_funds` does not affect the others.
         *
         *     With `"atomic": true`, the batch is all or nothing. If any item
         *     fails, nothing is written; the failing items carry their own
         *     error and every other item carries `invalid_request` ("atomic
         *     batch aborted"). An atomic batch carries at most 250 postings
         *     across all of its transactions.
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
                        /** @description An empty array returns `422 invalid_request` with `param` `transactions`. */
                        transactions: components["schemas"]["BulkTransactionInput"][];
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
    "/ledger/v1/transactions/lookup": {
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
                404: components["responses"]["NotFound"];
                /** @description Missing required query parameters (`invalid_request`) */
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
         * @description RFC 6749 section 4.4 client_credentials. Authenticate with HTTP Basic
         *     (`client_id:client_secret`) **or** with `client_id` and
         *     `client_secret` in the form body.
         *
         *     Tokens are HS256 JWTs valid for one hour. They carry
         *     `workspace_id`, `mode`, the granted `scope`, and `ledger_id`
         *     when the client is pinned to a ledger. Decode them at jwt.io to
         *     inspect.
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
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Account: components["schemas"]["EnvelopeFields"] & {
            /**
             * @description `restricted` marks accounts held against a counterparty.
             *     Accounts created through this API are `standard`.
             * @default standard
             * @enum {string}
             */
            account_kind?: "standard" | "restricted";
            /** Format: date-time */
            closed_at?: string | null;
            closed_by_label?: string | null;
            /**
             * @description Opaque identifier of the counterparty a `restricted` account is held against.
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
             * @description Customer-set grouping. The platform stores it and filters
             *     on it; it does not interpret it. Inherited from the
             *     account's template when omitted on create.
             * @default neutral
             * @enum {string}
             */
            fund_classification?: "client_held" | "operator" | "neutral";
            /** @example accounts_receivable:acme */
            id: string;
            ledgerable_id?: string | null;
            ledgerable_type?: string | null;
            /** @description Increments on every change. Use it in transaction `conditions` for optimistic concurrency. */
            lock_version?: number;
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
            parent_id?: string | null;
            /** @enum {string} */
            status?: "open" | "closed";
            /** @description Template the account was created from. */
            template?: string | null;
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
             * @description Id of the object in your system. Paired with `ledgerable_type`.
             * @example acme
             */
            ledgerable_id?: string;
            /**
             * @description Type of the object in your system this account belongs to. Paired with `ledgerable_id`.
             * @example merchant
             */
            ledgerable_type?: string;
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
             * @description `allowed` lets the account go to any balance. `none` rejects
             *     any posting that would take `available` (posted minus pending
             *     outflows; pending inflows never count) below
             *     `-overdraft_limit`. A rejected write returns
             *     `insufficient_funds`.
             * @default allowed
             * @enum {string}
             */
            overdraft_policy?: "allowed" | "none";
            /**
             * @description Id of a parent account. Used by `GET /v1/accounts/:id/category_balance`.
             * @example accounts_receivable
             */
            parent_id?: string;
            /**
             * @description Name of an account template. The template's type, allowed
             *     currencies and defaults are applied before insert.
             * @example accounts_receivable
             */
            template?: string;
            /**
             * @example liability
             * @enum {string}
             */
            type: "asset" | "liability" | "revenue" | "expense" | "equity";
        };
        AccountStatement: {
            /** @example cash:usd */
            account: string;
            closing_balance: components["schemas"]["StatementBalance"];
            /** @example USDC */
            currency: string;
            entries: components["schemas"]["Posting"][];
            entry_count: number;
            /** @enum {string} */
            object: "account_statement";
            opening_balance: components["schemas"]["StatementBalance"];
            period: {
                /** Format: date-time */
                from: string | null;
                /** Format: date-time */
                to: string;
            };
            /** @description True when the period held more entries than `limit` returned. */
            truncated: boolean;
        };
        AccountTemplate: {
            /** @enum {string} */
            accounting_type: "asset" | "liability" | "revenue" | "expense" | "equity";
            allowed_currencies?: string[];
            balance_non_negative?: boolean;
            /** Format: date-time */
            created_at: string;
            custody_external_id?: string | null;
            custody_provider?: string | null;
            description?: string | null;
            /** @enum {string|null} */
            fund_classification?: "client_held" | "operator" | "neutral" | null;
            metadata?: {
                [key: string]: unknown;
            };
            /** @example accounts_receivable */
            name: string;
            /** @enum {string} */
            object: "account_template";
        };
        AccountUpdate: {
            custody_external_id?: string | null;
            /** @description Set together with `custody_external_id`, or clear both. */
            custody_provider?: string | null;
            /** @enum {string} */
            fund_classification?: "client_held" | "operator" | "neutral";
            ledgerable_id?: string | null;
            ledgerable_type?: string | null;
            metadata?: {
                [key: string]: unknown;
            };
            name?: string;
            parent_id?: string | null;
        };
        Balance: components["schemas"]["EnvelopeFields"] & {
            /** @example accounts_receivable:acme */
            account: string;
            /**
             * Format: date-time
             * @description Present only on point-in-time reads (`?at=`).
             */
            as_of?: string;
            /**
             * @description `posted` minus every open pending outflow. Pending inflows
             *     never count until committed. This is the same figure the
             *     `overdraft_policy: none` write check uses. Decimal string;
             *     parse with a big-integer or decimal type, never a JS
             *     number.
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
        BalanceSheetReport: {
            accounts: components["schemas"]["ReportAccountRow"][];
            /** Format: date-time */
            as_of: string;
            by_currency: {
                [key: string]: {
                    assets: string;
                    equity: string;
                    liabilities: string;
                    residual: string;
                    retained_earnings: string;
                    total_liabilities_and_equity: string;
                };
            };
            healthy: boolean;
            /** Format: uuid */
            ledger_id: string;
            /** @enum {string} */
            object: "balance_sheet";
        };
        BulkTransactionInput: {
            /**
             * @description Required on every item. Charset `[A-Za-z0-9_:.-]`, max 255 bytes.
             * @example cap_a
             */
            idempotency_key: string;
            metadata?: {
                [key: string]: unknown;
            };
            postings: components["schemas"]["PostingInput"][];
            /** Format: date-time */
            value_date?: string;
        };
        CashFlowReport: {
            accounts: {
                account: string;
                currency: string;
                name: string;
                net_change: string;
            }[];
            by_currency: {
                [key: string]: {
                    financing: string;
                    investing: string;
                    net_change: string;
                    operating: string;
                    uncategorized: string;
                };
            };
            /**
             * @description Present when the request passed `granularity`.
             * @enum {string}
             */
            granularity?: "day" | "week" | "month";
            /** Format: uuid */
            ledger_id: string;
            /** @enum {string} */
            object: "cash_flow";
            period: components["schemas"]["ReportPeriod"];
            /** @description Present when the request passed `granularity`. One bucket per period, each with the same `by_currency` shape. */
            series?: components["schemas"]["ReportBucket"][];
        };
        CategoryBalance: {
            available: string;
            /** @example USDC */
            currency: string;
            /** @example 3 */
            member_count: number;
            /**
             * @example [
             *       "accounts_receivable",
             *       "accounts_receivable:acme",
             *       "accounts_receivable:globex"
             *     ]
             */
            members: string[];
            /** @enum {string} */
            object: "category_balance";
            pending: string;
            posted: string;
            /** @example accounts_receivable */
            root: string;
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
                code: "invalid_request" | "missing_idempotency_key" | "unauthorized" | "forbidden" | "insufficient_scope" | "invalid_client" | "invalid_grant" | "invalid_scope" | "not_found" | "unbalanced" | "currency_mismatch" | "unknown_account" | "already_exists" | "already_reversed" | "immutable_field" | "insufficient_funds" | "period_closed" | "period_close_imbalanced" | "account_balance_nonzero" | "account_closed" | "precondition_failed" | "duplicate_external_ref" | "partial_refund_exceeds_original" | "refund_currency_required" | "rotation_in_progress" | "account_template_unknown" | "plan_required" | "invalid_state" | "in_progress" | "unsupported_grant_type" | "rate_limited" | "internal_error" | "unavailable";
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
            /** @description Event payload. Shape depends on `type`. */
            data?: {
                [key: string]: unknown;
            };
            /** Format: uuid */
            id: string;
            /** @description True when the event belongs to a live ledger. */
            livemode?: boolean;
            /** @enum {string} */
            object: "event";
            resource_id?: string | null;
            /**
             * @description One of: `account.created`, `account.closed`,
             *     `account.classification_changed`, `transaction.created`,
             *     `transaction.reversal_created`, `transaction.reversed`,
             *     `transaction.refund_created`, `transaction.updated`,
             *     `transaction.committed`, `period.closed`,
             *     `period.closed_forced`, `period.reopened`,
             *     `oauth_client.created`,
             *     `oauth_client.secret_rotated`, `oauth_client.deleted`.
             *
             *     Note: `transaction.reversal_created` fires *before*
             *     `transaction.reversed` so subscribers rebuilding state
             *     from the event tail can apply the create before the
             *     link. `transaction.refund_created` fires when a refund
             *     transaction is created; `data` includes `refunds`
             *     (original id) and `refund_amount`.
             * @example transaction.created
             */
            type: string;
        };
        ExternalRef: {
            /** Format: date-time */
            created_at?: string;
            id: string;
            metadata?: {
                [key: string]: unknown;
            };
            /** @enum {string} */
            object: "external_ref";
            /** @example ethereum */
            rail: string;
            /** @example tx_hash */
            ref_kind: string;
            /** @example 0xabc123 */
            value: string;
        };
        ExternalRefInput: {
            /** @example tx_hash */
            kind: string;
            metadata?: {
                [key: string]: unknown;
            };
            /** @example ethereum */
            rail: string;
            /** @example 0xabc123 */
            value: string;
        };
        IncomeStatementReport: {
            accounts: components["schemas"]["ReportAccountRow"][];
            by_currency: {
                [key: string]: {
                    expense: string;
                    net_income: string;
                    revenue: string;
                };
            };
            /**
             * @description Present when the request passed `granularity`.
             * @enum {string}
             */
            granularity?: "day" | "week" | "month";
            /** Format: uuid */
            ledger_id: string;
            /** @enum {string} */
            object: "income_statement";
            period: components["schemas"]["ReportPeriod"];
            /** @description Present when the request passed `granularity`. One bucket per period, each with the same `by_currency` shape. */
            series?: components["schemas"]["ReportBucket"][];
        };
        Ledger: {
            /** Format: date-time */
            archived_at?: string | null;
            /** Format: date-time */
            created_at: string;
            description?: string | null;
            /** Format: uuid */
            id: string;
            metadata?: {
                [key: string]: unknown;
            };
            /** @enum {string} */
            mode: "test" | "live";
            name: string;
            /** @enum {string} */
            object: "ledger";
            /** Format: date-time */
            updated_at: string;
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
            /** @example https://docs.kordio.io/ledger/authentication#invalid_client */
            error_uri?: string;
            hint?: string;
        };
        Organization: {
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            id: string;
            metadata?: {
                [key: string]: unknown;
            };
            name: string;
            /** @enum {string} */
            object: "organization";
            plan: string;
            /** Format: date-time */
            updated_at: string;
        };
        PeriodClose: {
            /**
             * @description Who closed it, as you labelled them. Not a Kordio identity.
             * @example controller@acme
             */
            closed_by_label: string;
            /** Format: date-time */
            created_at: string;
            /** @description True when the period was closed with `force=true` despite an imbalanced trial balance. */
            forced?: boolean;
            /** Format: date-time */
            forced_at?: string | null;
            forced_by_label?: string | null;
            /** Format: uuid */
            id: string;
            note?: string | null;
            /** @enum {string} */
            object: "period_close";
            /** Format: date-time */
            period_end: string;
            /** Format: date-time */
            period_start: string;
            /** Format: date-time */
            reopened_at?: string | null;
            reopened_by_label?: string | null;
            /**
             * @description The trial balance as it stood at the moment of closing:
             *     `as_of`, `ledger_id`, `healthy`, `accounts` and
             *     `totals_by_currency`, shaped as in the trial balance report.
             *     Returned on create and on `GET /v1/period_closes/:id`, not in
             *     lists or on reopen.
             */
            trial_balance?: {
                [key: string]: unknown;
            };
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
            /** Format: date-time */
            reconciled_at?: string | null;
            reconciliation_reference?: string | null;
            /** @description Present only on account statement entries. Posted balance after this entry. */
            running_balance?: string;
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
            /**
             * Format: date-time
             * @description Set when a pending posting was voided by reversing its transaction. A voided posting no longer counts toward any balance.
             */
            voided_at?: string | null;
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
        ReportAccountRow: {
            account: string;
            credit_total?: string;
            currency: string;
            debit_total?: string;
            name: string;
            pending?: string;
            posted: string;
            /** @enum {string} */
            type: "asset" | "liability" | "revenue" | "expense" | "equity";
        };
        ReportBucket: {
            by_currency: {
                [key: string]: {
                    [key: string]: string;
                };
            };
            /** Format: date-time */
            period_end: string;
            /** Format: date-time */
            period_start: string;
        };
        ReportPeriod: {
            /** Format: date-time */
            from: string | null;
            /** Format: date-time */
            to: string;
        };
        StatementBalance: {
            currency: string;
            pending: string;
            posted: string;
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
            external_refs?: components["schemas"]["ExternalRef"][];
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
            /**
             * @description `pending` while any posting is pending, `posted` once
             *     committed or written without pending postings, `archived`
             *     once reversed.
             * @enum {string}
             */
            status?: "pending" | "posted" | "archived";
            /** Format: date-time */
            updated_at?: string;
            /** Format: date-time */
            value_date?: string;
        };
        /** @description Needs `account` plus at least one of the other fields. */
        TransactionCondition: {
            /** @example cash:usd */
            account: string;
            /** @description The account's current `lock_version`. Fails if the account changed since you read it. */
            lock_version?: number;
            /** @description Fails if the account's available balance is above this, in minor units. */
            max_available_balance?: string | number;
            /** @description Fails if the account's available balance is below this, in minor units. */
            min_available_balance?: string | number;
        };
        TransactionInput: {
            /**
             * @description Preconditions checked atomically with the write. A failed
             *     condition returns `precondition_failed` and writes nothing.
             */
            conditions?: components["schemas"]["TransactionCondition"][];
            /**
             * @description Identifiers of this transaction in external systems. Each
             *     `(rail, kind, value)` can be attached to one transaction per
             *     ledger; a second attempt returns `duplicate_external_ref`.
             *     Find a transaction by reference with
             *     `GET /v1/transactions/lookup`.
             */
            external_refs?: components["schemas"]["ExternalRefInput"][];
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
        TrialBalanceReport: {
            accounts: components["schemas"]["ReportAccountRow"][];
            /** Format: date-time */
            as_of: string;
            /** @description True when every currency nets to a zero residual. */
            healthy: boolean;
            /** Format: uuid */
            ledger_id: string;
            /** @enum {string} */
            object: "trial_balance";
            totals_by_currency: {
                [key: string]: {
                    credit: string;
                    debit: string;
                    residual: string;
                };
            };
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
         *     archived resource still paginates correctly. It points at a
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
         * @description Adds a `series` of per-period buckets. Requires both `from` and
         *     `to`. At most 400 buckets.
         */
        Granularity: "day" | "week" | "month";
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
        /**
         * @description Inclusive lower bound on `value_date`. Omit to start at the beginning of the ledger.
         * @example 2026-04-01T00:00:00Z
         */
        ReportFrom: string;
        /**
         * @description Exclusive upper bound on `value_date`. Defaults to now.
         * @example 2026-05-01T00:00:00Z
         */
        ReportTo: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
