/**
 * Kordio Agent Control API
 *
 * DO NOT EDIT. Generated from the OpenAPI spec.
 * Source: specs/control.openapi.yaml
 * Regenerate: bun run generate
 */

/* biome-ignore-all lint: generated file */
export interface paths {
    "/.well-known/jwks.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cosignature public keys
         * @description The public keys for offline cosignature verification. Unauthenticated, unthrottled,
         *     and cacheable.
         *
         *     Retired keys stay published and keep verifying; they simply stop signing. A
         *     cosignature issued a minute before a rotation still checks out.
         *
         *     When cosigning is not configured on a deployment this returns an empty key set
         *     rather than an error, and decisions come back with no `cosignature` field rather
         *     than an unverifiable one.
         */
        get: operations["getJwks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Authorize an action
         * @description The call that goes in front of the spend. Runs the full policy evaluation, reserves
         *     budget against the budget, records an intent, and returns the decision.
         *
         *     Branch on the **status code**, not the body.
         *
         *     An intent is recorded even when the outcome is `denied`, so a refusal is auditable.
         *
         *     An agent with no active policy denies everything, with rule `no_policy`. This is
         *     deliberate and fail-closed: write a policy before you expect an allow.
         */
        post: operations["authorizeAction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/actions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read an action intent
         * @description The current state of one intent. This is what you poll while an action sits in `requires_approval`, if you are not using webhooks.
         */
        get: operations["getAction"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/actions/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Report success
         * @description The action succeeded. Settles the reservation and moves the intent from `pending` to
         *     `completed`.
         *
         *     Reporting is not optional. An intent left `pending` holds its budget until the
         *     session closes.
         */
        post: operations["completeAction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/actions/{id}/fail": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Report failure
         * @description The action failed. Releases the reservation back to the budget and moves the intent from `pending` or `requires_approval` to `failed`.
         */
        post: operations["failAction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/actions/simulate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Simulate an action
         * @description Runs the same evaluation and records nothing: no intent, no reservation, no budget
         *     consumed. Always `200`, whatever the outcome.
         *
         *     Use it in tests, and in your own UI to show someone what a policy would do before
         *     they save it. Note that a simulation does write an `action.simulated` audit event,
         *     so simulations are still visible in the trail.
         */
        post: operations["simulateAction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/budgets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Open a budget
         * @description A budget is the budget envelope for one agent run. Every authorized action commits
         *     against it, and it is what a runaway loop runs into.
         *
         *     Budget is claimed with a single conditional update rather than a lock, so parallel
         *     sub-agents under one agent contend at the row instead of queueing.
         */
        post: operations["createSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/budgets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read a budget
         * @description Read the remaining budget on a budget.
         */
        get: operations["getSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/payment_intents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Authorize a payment
         * @description Evaluated as the action type `payment.create` with the counterparty as its
         *     resource, so an agent's caps, windows and allowlists apply across payments and
         *     other actions together. Spend on one consumes headroom for the other.
         *
         *     One difference from `POST /v1/agent/actions` that will bite you if you assume
         *     symmetry:
         *
         *     - **Idempotency is a body field here**, `idempotency_key`, not the
         *       `Idempotency-Key` header. A missing one is a `400`, not a `422`.
         *
         *     Kordio authorizes the payment; it never moves the money. An allowed payment comes
         *     back `pending` with a cosignature. Settle it on your own rail, then report the
         *     outcome with `complete` or `fail`.
         */
        post: operations["createPaymentIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/payment_intents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a payment intent */
        get: operations["getPaymentIntent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/payment_intents/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Report that the money moved
         * @description Your rail settled the payment. Moves the intent from `pending` to `executed` and
         *     keeps the reservation spent.
         *
         *     Reporting is not optional. An intent left `pending` holds its budget until the
         *     budget closes.
         */
        post: operations["completePaymentIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/payment_intents/{id}/fail": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Report that it did not
         * @description Your rail refused or errored. Moves the intent to `failed` and releases the reservation back to the budget.
         */
        post: operations["failPaymentIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/payment_intents/simulate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Simulate a payment
         * @description Evaluates without reserving or recording anything. Always `200`.
         */
        post: operations["simulatePaymentIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/agent/spend_tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Mint a spend token
         * @description A spend token is a single-use ceiling an agent mints against one of its own
         *     budgets and presents later on `POST /v1/agent/payment_intents` via
         *     `spend_token_id`.
         *
         *     It only ever narrows. A token cannot widen a policy, raise a cap, or authorize
         *     something policy would refuse. When a payment cites one, the token is checked
         *     first, and if the token itself refuses, the policy engine never runs.
         *
         *     Pin it to a `counterparty` when you know the payee in advance. That turns "this
         *     agent may spend $200" into "this agent may spend $200, once, to this vendor".
         */
        post: operations["createSpendToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cosign/consume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify a cosignature and spend it
         * @description Unauthenticated. Does everything `verify` does, and then marks the authority spent
         *     so the same cosignature cannot be presented twice.
         *
         *     Use this when you are the executor and you are about to act. `verify` answers "is
         *     this good?"; `consume` answers "is this good, and it is mine now". A second call
         *     with the same cosignature reports `already_settled`.
         *
         *     Send the token either as the body field `authorization` or as an
         *     `Authorization: Bearer <jwt>` header.
         */
        post: operations["consumeCosignature"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cosign/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify a cosignature
         * @description Unauthenticated. Checks the signature and, beyond that, whether the underlying
         *     intent is still spendable and still carries the amount the token claims.
         *
         *     That statefulness is the reason to use this endpoint rather than local
         *     verification: a signature proves authority was granted, not that it has not
         *     already been used. An intent that has already been spent reports `already_settled`.
         *
         *     For the hot path, verify offline against the JWKS instead. This endpoint is for
         *     when you need settlement state.
         *
         *     Send the token either as the body field `authorization` or as an
         *     `Authorization: Bearer <jwt>` header.
         */
        post: operations["verifyCosignature"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/invitations/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Accept an invitation */
        post: operations["acceptInvitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/invitations/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Look up an invitation
         * @description Resolve an invitation token before accepting it, so your UI can show what is being joined and whether the signed-in account matches.
         */
        get: operations["lookupInvitation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List your workspaces
         * @description Every workspace the caller is a member of. This is the one list on the control plane that is not paginated.
         */
        get: operations["listWorkspaces"];
        put?: never;
        /**
         * Create a workspace
         * @description The caller becomes its `owner`.
         */
        post: operations["createWorkspace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a workspace */
        get: operations["getWorkspace"];
        put?: never;
        post?: never;
        /**
         * Delete a workspace
         * @description Requires the `manage_members` capability. You must echo the slug back in `confirm`.
         */
        delete: operations["deleteWorkspace"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/action_intents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List action intents
         * @description Filter by `state=requires_approval` for the approval queue.
         */
        get: operations["listActionIntents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/action_intents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read an action intent */
        get: operations["getActionIntent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/action_intents/{id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve a held action
         * @description Requires the `approve` capability.
         *
         *     Moves the intent from `requires_approval` to `pending`. It does **not** execute
         *     anything. The agent still executes and still reports the outcome with `complete` or
         *     `fail`.
         *
         *     Records `resolved_by_sub` and emits `approval.resolved`.
         */
        post: operations["approveActionIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/action_intents/{id}/deny": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Deny a held action
         * @description Requires `approve`. Moves the intent to `denied` and releases the reserved budget back to the budget.
         */
        post: operations["denyActionIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/action_intents/{id}/impact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * What approving this would do
         * @description Everything an approver needs to decide, before they click: the amount, the rule that
         *     held it, the budget it draws on, how much comes back if it is denied, how
         *     many other holds compete for the same budget, and every window it consumes.
         *
         *     Budget is already reserved while an intent is held, so approving costs no further
         *     headroom. `returns_on_deny_cents` is what denying gives back.
         *
         *     An approver who only sees "approve $2,400?" is rubber-stamping. This is the call
         *     that fixes that.
         */
        get: operations["getActionIntentImpact"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/agents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List agents */
        get: operations["listAgents"];
        put?: never;
        /**
         * Create an agent
         * @description Requires the `manage_policy` capability.
         *
         *     The response carries `api_key` exactly once. Kordio stores only a digest and
         *     compares it in constant time; if you lose the key, rotate the agent.
         *
         *     Creating an agent consumes plan headroom, and creating a `live` agent requires a
         *     plan with live mode. Either limit returns `422`.
         */
        post: operations["createAgent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/agents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read an agent */
        get: operations["getAgent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update an agent
         * @description Requires `manage_policy`. Use this to suspend, revoke, or re-scope an agent.
         *
         *     Suspending stops new authorizations and leaves history intact. Revoking is
         *     permanent. Neither rewrites decisions already made, and neither invalidates a
         *     cosignature already issued, which stays verifiable until it expires.
         */
        patch: operations["updateAgent"];
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/audit_events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List audit events
         * @description The append-only record of everything the control layer did. Every role can read it,
         *     including `member`. An audit trail only some people can see is not much of one.
         *
         *     Filter by `trace_id` to pull the whole story of one action across authorization,
         *     approval and outcome.
         */
        get: operations["listAuditEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/audit_events/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read an audit event */
        get: operations["getAuditEvent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/billing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read plan and entitlements
         * @description The current plan, subscription, entitlement usage, prepaid volume, and the plan catalogue. Console-facing; agents never call this.
         */
        get: operations["getBilling"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/billing/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cancel the subscription
         * @description Requires `manage_members`. Cancels at period end; the plan keeps entitling until then.
         */
        post: operations["cancelSubscription"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/billing/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start a plan checkout
         * @description Requires `manage_members`. Returns a hosted checkout URL, or, if the workspace is already subscribed, changes the plan in place.
         */
        post: operations["startBillingCheckout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/billing/packs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Buy prepaid volume
         * @description Requires `manage_members`.
         */
        post: operations["buyVolumePack"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/billing/portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Open the billing portal
         * @description Requires `manage_members`.
         */
        post: operations["openBillingPortal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/billing/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Re-sync billing state
         * @description Requires `manage_members`. Pulls the current subscription from the billing provider rather than waiting for the next webhook.
         */
        post: operations["refreshBilling"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/budgets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List budgets */
        get: operations["listWorkspaceSessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/budgets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a budget */
        get: operations["getWorkspaceSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Export a workspace
         * @description A full JSON dump of the workspace: agents, policies, policy modules, budgets, spend tokens, action and payment intents, audit events, memberships, webhook endpoints, entitlement grants and the subscription. Requires `manage_members`.
         */
        get: operations["exportWorkspace"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/funds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read workspace funds
         * @description Committed, held and available spend across every active session in the workspace,
         *     plus what the ledger has caught up on.
         *
         *     `unprojected_cents` is the gap between what the control layer has committed and
         *     what the ledger has posted. It is normally near zero and transiently non-zero while
         *     projections settle.
         *
         *     If the ledger is unavailable this degrades rather than failing: `ledger_ready` comes
         *     back `false`, `accounts` is empty, and the control-plane figures are still correct.
         */
        get: operations["getFunds"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List open invitations */
        get: operations["listInvitations"];
        put?: never;
        /**
         * Invite someone
         * @description Requires `manage_members`. A new invitation for an email with an open one supersedes it.
         */
        post: operations["createInvitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/invitations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Revoke an invitation
         * @description Requires `manage_members`.
         */
        delete: operations["revokeInvitation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List members */
        get: operations["listMemberships"];
        put?: never;
        /**
         * Add a member
         * @description Requires `manage_members`. Consumes plan member headroom.
         */
        post: operations["createMembership"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/memberships/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove a member
         * @description Requires `manage_members`. Removing the last owner is refused.
         */
        delete: operations["deleteMembership"];
        options?: never;
        head?: never;
        /**
         * Change a member's role
         * @description Requires `manage_members`. A change that would leave the workspace with no owner is refused.
         */
        patch: operations["updateMembership"];
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/payment_intents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List payment intents */
        get: operations["listPaymentIntents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/payment_intents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a payment intent */
        get: operations["getWorkspacePaymentIntent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/payment_intents/{id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve a held payment
         * @description Requires `approve`.
         *
         *     This grants authority; it does not move money. The intent returns to `pending` and
         *     the agent settles it on its own rail, exactly as it does for an approved action.
         */
        post: operations["approvePaymentIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/payment_intents/{id}/deny": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Deny a held payment
         * @description Requires `approve`. Releases the reservation and enqueues the ledger release.
         */
        post: operations["denyPaymentIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/payment_intents/{id}/impact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * What approving this payment would do
         * @description The same summary as the action-intent impact call, plus the spend token the payment cites, if any.
         */
        get: operations["getPaymentIntentImpact"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/policies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List policies */
        get: operations["listPolicies"];
        put?: never;
        /**
         * Create a policy
         * @description Requires `manage_policy`.
         *
         *     A policy carries two things: typed spend columns for the common cases, and a
         *     general `rules` array. The columns are desugared into rules at compile time, so
         *     they are shorthand, not a separate mechanism.
         *
         *     Everything is validated when you write it, never when an agent is waiting. An
         *     unknown rule kind, a missing setting, or an import naming a module that does not
         *     exist all fail here with a `422`.
         */
        post: operations["createPolicy"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/policies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a policy */
        get: operations["getPolicy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update a policy
         * @description Requires `manage_policy`.
         */
        patch: operations["updatePolicy"];
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/policy_modules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List policy modules
         * @description Sorted by name, ascending.
         */
        get: operations["listPolicyModules"];
        put?: never;
        /**
         * Create a policy module
         * @description Requires `manage_policy`.
         *
         *     A module is a named rule set scoped to the workspace. Policies import it by name
         *     and its rules compile in ahead of their own.
         *
         *     Editing a module changes every policy that imports it. Modules cannot import other
         *     modules, so composition is one level deep and cannot cycle.
         */
        post: operations["createPolicyModule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/policy_modules/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read a policy module
         * @description Modules are addressed by `name`, not by id.
         */
        get: operations["getPolicyModule"];
        put?: never;
        post?: never;
        /**
         * Delete a policy module
         * @description Requires `manage_policy`. A module still imported by a policy will not delete.
         */
        delete: operations["deletePolicyModule"];
        options?: never;
        head?: never;
        /**
         * Update a policy module
         * @description Requires `manage_policy`. `name` is ignored on update; a module cannot be renamed while policies reference it.
         */
        patch: operations["updatePolicyModule"];
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/policy_previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview a draft policy
         * @description Evaluate a policy you have not saved against a synthetic action, and get back the
         *     decision it would produce.
         *
         *     Nothing is persisted: no policy, no session, no intent, and no audit event. This is
         *     the call behind a "what would this do?" affordance in your own console.
         *
         *     Requires only the `read` capability, deliberately. Previewing is not a mutation.
         *
         *     `imports` resolve against the workspace's real saved modules, so you can preview a
         *     draft that builds on modules already in place.
         */
        post: operations["createPolicyPreview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/spend_tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List spend tokens
         * @description Read-only. Tokens are minted on the agent side only.
         */
        get: operations["listSpendTokens"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/spend_tokens/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a spend token */
        get: operations["getSpendToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/webhook_endpoints": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List webhook endpoints */
        get: operations["listWebhookEndpoints"];
        put?: never;
        /**
         * Create a webhook endpoint
         * @description Requires `manage_policy`.
         *
         *     The response carries `secret` exactly once. Store it immediately; if you lose it,
         *     rotate the endpoint.
         *
         *     An empty `enabled_events` array subscribes to **every** event type. Name the ones
         *     you handle instead.
         */
        post: operations["createWebhookEndpoint"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/webhook_endpoints/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a webhook endpoint */
        get: operations["getWebhookEndpoint"];
        put?: never;
        post?: never;
        /**
         * Delete a webhook endpoint
         * @description Requires `manage_policy`.
         */
        delete: operations["deleteWebhookEndpoint"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/workspaces/{workspace_slug}/webhook_endpoints/{id}/rotate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate a signing secret
         * @description Requires `manage_policy`. Returns a new `secret`, once. The previous secret stops verifying immediately.
         */
        post: operations["rotateWebhookEndpointSecret"];
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
        ActionDecisionResponse: {
            /** @description A compact ES256 JWS over the authorization. Present only when the outcome is `allowed` and cosigning is configured; the key is absent otherwise, never `null`. */
            cosignature?: string;
            data: components["schemas"]["ActionIntent"];
            decision: components["schemas"]["Decision"];
        };
        ActionIntent: {
            action_type?: string;
            /** Format: uuid */
            agent_id?: string;
            /** Format: uuid */
            budget_id?: string;
            cost_cents?: number;
            /** Format: date-time */
            created_at?: string;
            currency?: string;
            decision?: {
                [key: string]: unknown;
            } | null;
            failure_reason?: string | null;
            /** Format: uuid */
            id?: string;
            idempotency_key?: string;
            ledger_transaction_id?: string | null;
            metadata?: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            resolved_at?: string | null;
            /** @description The identity that approved or denied this, when a person did. */
            resolved_by_sub?: string | null;
            resource?: string | null;
            /** @enum {string} */
            state?: "pending" | "requires_approval" | "completed" | "failed" | "denied";
            trace_id?: string | null;
            /** Format: date-time */
            updated_at?: string;
            /** Format: uuid */
            workspace_id?: string;
        };
        ActionIntentEnvelope: {
            data: components["schemas"]["ActionIntent"];
        };
        ActionRequest: {
            /**
             * @description Lowercase, dot separated.
             * @example payment.create
             */
            action_type: string;
            /**
             * Format: uuid
             * @description An active session belonging to this agent.
             */
            budget_id: string;
            /**
             * @description Minor units. Omit or `0` for an action that spends nothing.
             * @default 0
             */
            cost_cents: number;
            /** @description Any dot path here is addressable from the condition language as `metadata.*`. */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * @description The counterparty or target. Matched by allowlists.
             * @example acme-supplies.example
             */
            resource?: string | null;
            /** @description Yours if you have one, generated otherwise. Links the whole audit trail. */
            trace_id?: string | null;
        };
        Agent: {
            /**
             * @description The first 12 characters of the key, for identifying it in a list.
             * @example krt_test_9f3
             */
            api_key_prefix?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: uuid */
            id?: string;
            /** Format: date-time */
            last_used_at?: string | null;
            /**
             * @description The largest budget this agent may open, in minor units. Set from the dashboard only. Null means the agent chooses its own, which is the default for agents created before ceilings existed.
             * @example 50000
             */
            max_budget_cents?: number | null;
            /** @enum {string} */
            mode?: "test" | "live";
            name?: string;
            scopes?: string[];
            /** @enum {string} */
            status?: "active" | "suspended" | "revoked";
            /** Format: date-time */
            updated_at?: string;
        };
        ApprovalImpact: {
            agent?: {
                /** Format: uuid */
                id?: string;
                /** @enum {string} */
                mode?: "test" | "live";
                name?: string;
                scopes?: string[];
            };
            amount_cents?: number;
            currency?: string;
            /** @description Always false. Nothing has run yet. */
            executed?: boolean;
            /** @description The rule that held this intent. */
            rule?: string | null;
            session?: {
                budget_cents?: number;
                /** Format: uuid */
                id?: string;
                /** @description How many other held intents compete for this same budget. */
                open_holds?: number;
                remaining_cents?: number;
                /** @description What denying gives back to the budget. */
                returns_on_deny_cents?: number;
                spent_cents?: number;
            };
            spend_token?: {
                amount_ceiling_cents?: number;
                counterparty?: string | null;
                /** Format: date-time */
                expires_at?: string | null;
                /** Format: uuid */
                id?: string;
                single_use?: boolean;
            } | null;
            windows?: {
                cap_cents?: number;
                /** @enum {string} */
                kind?: "velocity" | "monthly";
                remaining_cents?: number;
                spent_cents?: number;
                window_seconds?: number | null;
            }[];
        };
        AuditEvent: {
            /**
             * @description What happened.
             * @enum {string}
             */
            action?: "action.allowed" | "action.denied" | "action.requires_approval" | "action.completed" | "action.failed" | "action.simulated" | "payment_intent.allowed" | "payment_intent.denied" | "payment_intent.requires_approval" | "payment_intent.executed" | "payment_intent.failed" | "approval.granted" | "approval.denied" | "session.created" | "spend_token.issued" | "spend_token.expired" | "policy.created" | "policy.updated" | "policy_module.created" | "policy_module.updated" | "policy_module.deleted" | "agent.created" | "membership.created" | "membership.role_changed" | "membership.removed" | "invitation.created" | "invitation.revoked" | "invitation.accepted" | "workspace.created" | "billing.checkout.started" | "billing.pack.started" | "billing.plan.changed" | "billing.subscription.cancel_requested";
            /** Format: date-time */
            created_at?: string;
            /** Format: uuid */
            id?: string;
            /** @description The state captured at the moment of the event. */
            snapshot?: {
                [key: string]: unknown;
            };
            /** Format: uuid */
            subject_id?: string;
            subject_type?: string;
            trace_id?: string | null;
        };
        BillingOverview: {
            /** @description Whether billing is wired up on this deployment. */
            configured?: boolean;
            /** @description Per-dimension `{limit, used, remaining}` for agents, members, payment_authorizations, action_authorizations and gated_volume, plus `live_mode`, `overage_cents`, `audit_retention_days` and the period bounds. */
            entitlements?: {
                [key: string]: unknown;
            };
            plan?: string;
            plans?: {
                [key: string]: unknown;
            }[];
            prepaid?: {
                [key: string]: unknown;
            };
            subscription?: {
                [key: string]: unknown;
            } | null;
        };
        /**
         * @description A boolean expression over the action. Combinators are `all_of`, `any_of` and `not`,
         *     nestable to ten levels; an empty `all_of` or `any_of` is rejected at write time.
         *
         *     A leaf is `{field, operator, value}`.
         *
         *     Fields are `action_type`, `resource`, `cost_cents`, `currency`, `agent_id`,
         *     `agent_mode`, `budget_id`, and any `metadata.*` dot path. A missing field never
         *     raises; it simply fails to match. Unknown fields and operators are rejected when the
         *     policy is written, never when an agent is waiting.
         *
         *     The ordered comparisons (`gt`, `gte`, `lt`, `lte`) are numeric. A non-numeric
         *     operand makes the comparison `false` rather than an error.
         */
        ConditionExpression: {
            all_of?: components["schemas"]["ConditionExpression"][];
            any_of?: components["schemas"]["ConditionExpression"][];
            /** @example metadata.preapproved */
            field?: string;
            not?: components["schemas"]["ConditionExpression"];
            /** @enum {string} */
            operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "starts_with" | "ends_with" | "exists";
            /** @description Omitted or null for operators that do not need one. */
            value?: unknown;
        };
        CosignatureVerificationInvalid: {
            /** @enum {string} */
            reason?: "malformed" | "unknown_key" | "expired" | "wrong_issuer" | "not_yet_valid" | "bad_signature" | "unknown_intent" | "already_settled" | "amount_mismatch";
            /** @constant */
            valid?: false;
        };
        CosignatureVerificationValid: {
            action_type?: string;
            /** Format: uuid */
            agent_id?: string;
            amount_cents?: number;
            currency?: string;
            /** Format: date-time */
            expires_at?: string;
            /** Format: uuid */
            intent_id?: string;
            reason?: string | null;
            resource?: string | null;
            /** @constant */
            valid?: true;
        };
        Decision: {
            /** @description The numbers behind the decision, keyed by what the rule cared about. */
            detail: {
                [key: string]: unknown;
            };
            /** @description What is left on every limit that applied, reduced to the tightest value per key. Give it to your agent: one that knows it has $380 left picks a cheaper vendor, one that only knows it was refused retries into the same wall. */
            headroom: {
                [key: string]: number;
            };
            /** @enum {string} */
            outcome: "allowed" | "denied" | "requires_approval";
            /** @description The compiled policies as they stood when this decision was made. */
            policy_snapshot?: {
                [key: string]: unknown;
            }[];
            /**
             * @description The rule that produced this outcome, `null` when allowed with nothing to report. Rules from the typed policy columns surface under their column name: `per_transaction_cap`, `velocity_cap`, `monthly_cap`, `counterparty_allowlist`, `approval_threshold`. Rules written in the `rules` array surface under their `rule_name`, defaulting to the rule kind.
             * @example per_transaction_cap
             * @example session_budget
             * @example agent_scope
             * @example session_inactive
             * @example no_policy
             * @example not_allowlisted
             * @example spend_token_ceiling
             */
            rule: string | null;
        };
        Error: {
            error: {
                /**
                 * @description Stable where present, `null` otherwise. Only a defined set of failures carry a code.
                 * @enum {string|null}
                 */
                code?: "runtime_key_required" | "invalid_runtime_key" | "identity_token_required" | "invalid_identity_token" | "budget_ceiling" | "parent_budget_exhausted" | "already_consumed" | "idempotency_conflict" | "insufficient_role" | "idempotency_key_required" | "authorization_required" | "rate_limited" | "billing_unavailable" | "invalid_signature" | "identity_unavailable" | "identity_not_configured" | "mfa_required" | "email_verification_required" | null;
                /** @description For humans. Do not switch on it. */
                message: string;
            };
        };
        Funds: {
            /** @description Unspent budget across every active session. */
            available_cents?: number;
            by_agent?: {
                /** Format: uuid */
                agent_id?: string;
                agent_name?: string;
                committed_cents?: number;
                currency?: string;
                held_cents?: number;
                /** @example spend:7d2a6c15-3f89-4b02-9e64-8a15d7c0b3f2 */
                ledger_account?: string;
            }[];
            /** @description Spent across active budgets, as the control layer sees it. */
            committed_cents?: number;
            currency?: string;
            /** @description Reserved by intents waiting on a person. */
            held_cents?: number;
            /** @description Posted to the ledger. */
            ledger_committed_cents?: number;
            /** @description False when the ledger is disabled, the workspace has no ledger, or the call failed. The control-plane figures above stay correct either way. */
            ledger_ready?: boolean;
            /** @description `committed_cents - ledger_committed_cents`, floored at zero. Spend the ledger has not caught up on yet. */
            unprojected_cents?: number;
        };
        Invitation: {
            /** Format: date-time */
            created_at?: string;
            email?: string;
            /** Format: date-time */
            expires_at?: string;
            /** Format: uuid */
            id?: string;
            role?: components["schemas"]["Role"];
            status?: string;
        };
        ListEnvelope: {
            data: Record<string, unknown>[];
            /** @description True when the page filled to the limit. A final page that exactly fills the limit still reports `true`; the next request returns an empty page. */
            has_more: boolean;
            /** @description Pass back as `starting_after`. */
            next_cursor: string | null;
        };
        Membership: {
            capabilities?: string[];
            /** Format: date-time */
            created_at?: string;
            email?: string | null;
            /** Format: uuid */
            id?: string;
            role?: components["schemas"]["Role"];
            /** Format: date-time */
            updated_at?: string;
            user_sub?: string;
        };
        PaymentDecisionResponse: {
            cosignature?: string;
            data: components["schemas"]["PaymentIntent"];
            decision: components["schemas"]["Decision"];
        };
        PaymentIntent: {
            /** Format: uuid */
            agent_id?: string;
            amount_cents?: number;
            /** Format: uuid */
            budget_id?: string;
            counterparty?: string | null;
            /** Format: date-time */
            created_at?: string;
            currency?: string;
            decision_context?: {
                [key: string]: unknown;
            } | null;
            failure_reason?: string | null;
            /** Format: uuid */
            id?: string;
            idempotency_key?: string;
            ledger_transaction_id?: string | null;
            /** Format: date-time */
            resolved_at?: string | null;
            resolved_by_sub?: string | null;
            /** Format: uuid */
            spend_token_id?: string | null;
            /** @enum {string} */
            state?: "pending" | "requires_approval" | "executed" | "failed" | "denied";
            trace_id?: string | null;
            /** Format: date-time */
            updated_at?: string;
            /** Format: uuid */
            workspace_id?: string;
        };
        PaymentIntentEnvelope: {
            data: components["schemas"]["PaymentIntent"];
        };
        Policy: components["schemas"]["PolicyDraft"] & {
            /** Format: uuid */
            agent_id?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: uuid */
            id?: string;
            /** @enum {string} */
            status?: "active" | "disabled";
            /** Format: date-time */
            updated_at?: string;
        };
        /** @description The policy shape, without an agent binding. Used for previews. */
        PolicyDraft: {
            approval_threshold_cents?: number | null;
            counterparty_allowlist?: string[];
            /** @description Policy module names. Their rules compile in ahead of `rules`. */
            imports?: string[];
            /**
             * @description `blocklist` permits unless a rule denies. `allowlist` inverts it: denied unless an `allow` rule matches, reported as `not_allowlisted`. Each allowlist policy is an independent gate, so attaching two means both must be satisfied. A `deny` still overrides an `allow`.
             * @default blocklist
             * @enum {string}
             */
            mode: "blocklist" | "allowlist";
            monthly_cap_cents?: number | null;
            per_transaction_cap_cents?: number | null;
            rules?: components["schemas"]["PolicyRule"][];
            velocity_cap_cents?: number | null;
            velocity_window_seconds?: number | null;
        };
        PolicyModule: {
            /** Format: date-time */
            created_at?: string;
            description?: string | null;
            /** Format: uuid */
            id?: string;
            name?: string;
            rules?: components["schemas"]["PolicyRule"][];
            /** Format: date-time */
            updated_at?: string;
        };
        /** @description One rule. Every kind accepts an optional `rule_name`, echoed back as `decision.rule`, and an optional stable `id` assigned on write if you do not supply one. Every kind except `action_allowlist` accepts `action_types` to scope the rule; an empty array means all action types. */
        PolicyRule: {
            /** @description For `approval_threshold`. Holds rather than refuses. */
            above_cents?: number;
            action_types?: string[];
            /** @description For `action_allowlist` and `resource_allowlist`. An empty array is a no-op, not a deny-all. */
            allow?: string[];
            /**
             * @description For `condition`.
             * @default deny
             * @enum {string}
             */
            effect: "allow" | "deny" | "require_approval";
            /** Format: uuid */
            id?: string;
            /** @enum {string} */
            kind: "action_allowlist" | "resource_allowlist" | "cost_cap" | "spend_window" | "monthly_spend_cap" | "rate_limit" | "approval_threshold" | "condition";
            /** @description For `rate_limit`. Counts every action, not just spend, which is what catches a loop that costs nothing per call. */
            max_actions?: number;
            /** @description For `cost_cap`, `spend_window`, `monthly_spend_cap`. */
            max_cents?: number;
            /** @description Defaults to the kind name. */
            rule_name?: string;
            when?: components["schemas"]["ConditionExpression"];
            /** @description For `spend_window` and `rate_limit`. */
            window_seconds?: number;
        };
        PolicyWrite: {
            /**
             * Format: uuid
             * @description Required on create.
             */
            agent_id?: string;
            /**
             * @default active
             * @enum {string}
             */
            status: "active" | "disabled";
        } & components["schemas"]["PolicyDraft"];
        /**
         * @description `owner` carries read, approve, manage_policy and manage_members. `admin` carries read, approve and manage_policy. `member` carries read.
         * @default member
         * @enum {string}
         */
        Role: "owner" | "admin" | "member";
        Session: {
            /** Format: uuid */
            agent_id?: string;
            budget_cents?: number;
            /** Format: date-time */
            created_at?: string;
            currency?: string;
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            parent_budget_id?: string | null;
            remaining_cents?: number;
            spent_cents?: number;
            /** @enum {string} */
            status?: "active" | "exhausted" | "closed";
            /** Format: date-time */
            updated_at?: string;
        };
        SessionEnvelope: {
            data: components["schemas"]["Session"];
        };
        SpendToken: {
            amount_ceiling_cents?: number;
            /** Format: uuid */
            budget_id?: string;
            /** Format: date-time */
            consumed_at?: string | null;
            counterparty?: string | null;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            expires_at?: string | null;
            /** Format: uuid */
            id?: string;
            /** @enum {string} */
            status?: "issued" | "consumed" | "expired" | "void";
            /** Format: date-time */
            updated_at?: string;
        };
        SpendTokenEnvelope: {
            data: components["schemas"]["SpendToken"];
        };
        WebhookEndpoint: {
            /** Format: date-time */
            created_at?: string;
            enabled_events?: components["schemas"]["WebhookEventType"][];
            /** Format: uuid */
            id?: string;
            /** @enum {string} */
            status?: "active" | "disabled";
            /** Format: date-time */
            updated_at?: string;
            /** Format: uri */
            url?: string;
        };
        /** @enum {string} */
        WebhookEventType: "action.requires_approval" | "action.completed" | "action.failed" | "payment.requires_approval" | "payment.executed" | "payment.failed" | "approval.resolved" | "budget.low" | "spend_token.expired";
        Workspace: {
            capabilities?: ("read" | "approve" | "manage_policy" | "manage_members")[];
            /** Format: date-time */
            created_at?: string;
            /** Format: uuid */
            id?: string;
            name?: string;
            role?: components["schemas"]["Role"];
            slug?: string;
            /** Format: date-time */
            updated_at?: string;
        };
    };
    responses: {
        /** @description Missing (`runtime_key_required`) or unrecognised (`invalid_runtime_key`) agent key. */
        AgentUnauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "message": "Agent key is required",
                 *         "code": "runtime_key_required"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Missing or invalid identity token. */
        IdentityUnauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Your membership does not carry the capability this call requires. */
        InsufficientRole: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "message": "Insufficient role",
                 *         "code": "insufficient_role"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description The record does not belong to this agent. Kordio does not confirm existence across a tenancy boundary, so this is a `404` rather than a `403`. */
        NotFoundForAgent: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Too many requests. Back off per the `Retry-After` header. Agent endpoints allow 1200 requests per minute per key; workspace endpoints allow 300. */
        RateLimited: {
            headers: {
                "Retry-After"?: number;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "message": "Rate limit exceeded",
                 *         "code": "rate_limited"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description The request was understood but cannot be applied. */
        ValidationFailed: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description The workspace does not exist, or you are not a member of it. These are deliberately indistinguishable. */
        WorkspaceNotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        /** @description Unique per action, scoped to the agent. A replay returns the original intent and the original decision, at the original status, rather than reserving budget twice. */
        IdempotencyKeyRequired: string;
        /** @description Page size. Defaults to 50, clamped to 1..200. */
        Limit: number;
        PathId: string;
        /** @example vendor-allowlist */
        PolicyModuleName: string;
        /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
        StartingAfter: string;
        /** @example acme-procurement */
        WorkspaceSlug: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getJwks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A JWKS document. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        keys: {
                            /** @example ES256 */
                            alg?: string;
                            /** @example P-256 */
                            crv?: string;
                            kid?: string;
                            /** @example EC */
                            kty?: string;
                            /** @example sig */
                            use?: string;
                            x?: string;
                            y?: string;
                        }[];
                    };
                };
            };
        };
    };
    authorizeAction: {
        parameters: {
            query?: never;
            header: {
                /** @description Unique per action, scoped to the agent. A replay returns the original intent and the original decision, at the original status, rather than reserving budget twice. */
                "Idempotency-Key": components["parameters"]["IdempotencyKeyRequired"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActionRequest"];
            };
        };
        responses: {
            /** @description `allowed`. Execute the action, then report the outcome with `complete` or `fail`. A `cosignature` is included when cosigning is configured. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "data": {
                     *         "id": "9b2ef0c1-6a3d-4e75-8c19-2f4b7d5a0e63",
                     *         "workspace_id": "1c4f8b20-9e77-4a31-b5d2-06a8c3e91f4d",
                     *         "agent_id": "7d2a6c15-3f89-4b02-9e64-8a15d7c0b3f2",
                     *         "budget_id": "3f1c8a92-5d41-4c8e-9f2b-7a6e1d0c4b83",
                     *         "action_type": "payment.create",
                     *         "resource": "acme-supplies.example",
                     *         "cost_cents": 12000,
                     *         "currency": "USD",
                     *         "state": "pending",
                     *         "idempotency_key": "order-4471-attempt-1",
                     *         "trace_id": "5e8c1a47-2b93-4d06-a7f1-9c3e05b8d24a",
                     *         "ledger_transaction_id": null,
                     *         "failure_reason": null,
                     *         "resolved_by_sub": null,
                     *         "resolved_at": null,
                     *         "metadata": {
                     *           "order_id": "4471"
                     *         },
                     *         "created_at": "2026-08-04T09:12:04Z",
                     *         "updated_at": "2026-08-04T09:12:04Z"
                     *       },
                     *       "decision": {
                     *         "outcome": "allowed",
                     *         "rule": null,
                     *         "detail": {},
                     *         "headroom": {
                     *           "session_remaining_cents": 38000,
                     *           "monthly_remaining_cents": 188000
                     *         },
                     *         "policy_snapshot": []
                     *       },
                     *       "cosignature": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImtleV8xIiwidHlwIjoiSldUIn0"
                     *     }
                     */
                    "application/json": components["schemas"]["ActionDecisionResponse"];
                };
            };
            /** @description `requires_approval`. A rule held the action for a person. No cosignature is issued. The budget stays reserved while it waits. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "data": {
                     *         "id": "9b2ef0c1-6a3d-4e75-8c19-2f4b7d5a0e63",
                     *         "state": "requires_approval",
                     *         "action_type": "payment.create",
                     *         "cost_cents": 240000,
                     *         "currency": "USD"
                     *       },
                     *       "decision": {
                     *         "outcome": "requires_approval",
                     *         "rule": "approval_threshold",
                     *         "detail": {
                     *           "above_cents": 100000
                     *         },
                     *         "headroom": {
                     *           "session_remaining_cents": 260000
                     *         },
                     *         "policy_snapshot": []
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ActionDecisionResponse"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            /** @description `denied`. Do not execute. `decision.rule` names what refused. The intent is still recorded, in state `denied`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "data": {
                     *         "id": "9b2ef0c1-6a3d-4e75-8c19-2f4b7d5a0e63",
                     *         "state": "denied",
                     *         "cost_cents": 120000
                     *       },
                     *       "decision": {
                     *         "outcome": "denied",
                     *         "rule": "per_transaction_cap",
                     *         "detail": {
                     *           "max_cents": 50000,
                     *           "requested_cents": 120000
                     *         },
                     *         "headroom": {
                     *           "session_remaining_cents": 380000
                     *         },
                     *         "policy_snapshot": []
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ActionDecisionResponse"];
                };
            };
            /** @description The budget does not belong to this agent. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description The `Idempotency-Key` header is missing (`idempotency_key_required`), or the body is invalid. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "message": "Idempotency-Key header is required",
                     *         "code": "idempotency_key_required"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            429: components["responses"]["RateLimited"];
        };
    };
    getAction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionIntentEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
        };
    };
    completeAction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The executed intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionIntentEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
            /** @description The intent is not in a state that can be completed. Only `pending` intents settle. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    failAction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Stored on the intent and shown in the audit trail. Defaults to `execution_failed`.
                     * @example vendor returned 502
                     */
                    reason?: string;
                };
            };
        };
        responses: {
            /** @description The failed intent, with its reservation released. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionIntentEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
            /** @description The intent is not in a state that can fail. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    simulateAction: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActionRequest"];
            };
        };
        responses: {
            /** @description The decision that would have been produced. No `id`, because no intent exists. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["Decision"];
                    };
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            /** @description The budget does not belong to this agent. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            429: components["responses"]["RateLimited"];
        };
    };
    createSession: {
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
                     * @description The ceiling for this run, in minor units. Refused with `budget_ceiling` if it exceeds the agent's `max_budget_cents`, and with `parent_budget_exhausted` if a parent is named and has less than this left.
                     * @example 50000
                     */
                    budget_cents: number;
                    /**
                     * @default USD
                     * @example USD
                     */
                    currency?: string;
                    /**
                     * Format: uuid
                     * @description Delegates from an existing session belonging to the same agent.
                     */
                    parent_budget_id?: string | null;
                };
            };
        };
        responses: {
            /** @description The open session. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            /** @description The parent session does not belong to this agent. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            422: components["responses"]["ValidationFailed"];
        };
    };
    getSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The budget. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
        };
    };
    createPaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @example 12000 */
                    amount_cents: number;
                    /** Format: uuid */
                    budget_id: string;
                    /** @example acme-supplies.example */
                    counterparty?: string | null;
                    /** @description Free-form context stored with the intent and echoed back, with the decision merged in under the key `decision`. Provenance only: policy never reads it. Put anything a rule must evaluate in `metadata`. */
                    decision_context?: {
                        [key: string]: unknown;
                    };
                    /**
                     * @description Required, and sent in the body rather than as a header. Unique per agent. A replay returns the original intent and decision at the original status.
                     * @example order-4471-attempt-1
                     */
                    idempotency_key: string;
                    /** @description Facts the policy engine evaluates, reachable in a rule as `metadata.<key>` with dot paths for nested values. Same field, same meaning, as on `POST /v1/agent/actions`. */
                    metadata?: {
                        [key: string]: unknown;
                    };
                    /**
                     * Format: uuid
                     * @description A token minted by this agent against the same session.
                     */
                    spend_token_id?: string | null;
                    trace_id?: string | null;
                };
            };
        };
        responses: {
            /** @description `allowed`. The payment is `pending` until you settle it and report back. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "data": {
                     *         "id": "4a7c2e18-9b05-4f63-8d21-6e0a3c7f5b94",
                     *         "workspace_id": "1c4f8b20-9e77-4a31-b5d2-06a8c3e91f4d",
                     *         "agent_id": "7d2a6c15-3f89-4b02-9e64-8a15d7c0b3f2",
                     *         "budget_id": "3f1c8a92-5d41-4c8e-9f2b-7a6e1d0c4b83",
                     *         "spend_token_id": null,
                     *         "amount_cents": 12000,
                     *         "currency": "USD",
                     *         "counterparty": "acme-supplies.example",
                     *         "state": "pending",
                     *         "failure_reason": null,
                     *         "idempotency_key": "order-4471-attempt-1",
                     *         "created_at": "2026-08-04T09:12:04Z"
                     *       },
                     *       "decision": {
                     *         "outcome": "allowed",
                     *         "rule": null,
                     *         "detail": {},
                     *         "headroom": {
                     *           "session_remaining_cents": 38000
                     *         },
                     *         "policy_snapshot": []
                     *       },
                     *       "cosignature": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImtleV8xIiwidHlwIjoiSldUIn0"
                     *     }
                     */
                    "application/json": components["schemas"]["PaymentDecisionResponse"];
                };
            };
            /** @description `requires_approval`. Nothing has moved. Approving returns the intent to `pending` for you to settle and report; denying releases the reservation. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentDecisionResponse"];
                };
            };
            /** @description `idempotency_key` is missing from the body. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            /** @description `denied`. Nothing was executed. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentDecisionResponse"];
                };
            };
            /** @description The budget or spend token does not belong to this agent. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getPaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The payment intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentIntentEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
        };
    };
    completePaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The executed intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentIntentEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
            /** @description The intent is not in a state that can be settled. Only `pending` intents settle, so a payment still held for a person is refused here. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    failPaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Your own description of what went wrong. Stored verbatim as `failure_reason`. Defaults to `execution_failed`.
                     * @example rail_declined
                     */
                    reason?: string;
                };
            };
        };
        responses: {
            /** @description The failed intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentIntentEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            404: components["responses"]["NotFoundForAgent"];
            /** @description The intent is not in a state that can be failed. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    simulatePaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    amount_cents: number;
                    /** Format: uuid */
                    budget_id: string;
                    counterparty?: string | null;
                    trace_id?: string | null;
                };
            };
        };
        responses: {
            /** @description The decision that would have been produced. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["Decision"];
                    };
                };
            };
            401: components["responses"]["AgentUnauthorized"];
        };
    };
    createSpendToken: {
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
                     * @description The most this token may authorize, in minor units.
                     * @example 20000
                     */
                    amount_ceiling_cents: number;
                    /** Format: uuid */
                    budget_id: string;
                    /**
                     * @description Pins the token to one payee. A payment to anyone else is refused with `spend_token_counterparty`.
                     * @example acme-supplies.example
                     */
                    counterparty?: string | null;
                    /** Format: date-time */
                    expires_at?: string | null;
                };
            };
        };
        responses: {
            /** @description The minted token. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpendTokenEnvelope"];
                };
            };
            401: components["responses"]["AgentUnauthorized"];
            /** @description The budget does not belong to this agent. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            422: components["responses"]["ValidationFailed"];
        };
    };
    consumeCosignature: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The cosignature JWT. May be sent as a bearer header instead. */
                    authorization?: string;
                    /** @description Optional label for whoever spent it, recorded on the consumption. */
                    consumed_by?: string;
                };
            };
        };
        responses: {
            /** @description The signature was valid and the authority is now spent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["CosignatureVerificationValid"];
                    };
                };
            };
            /** @description No cosignature was supplied. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description The cosignature did not verify, or the authority was already spent. `reason` says which. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["CosignatureVerificationInvalid"];
                    };
                };
            };
        };
    };
    verifyCosignature: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description The cosignature JWT. May be sent as a bearer header instead. */
                    authorization?: string;
                };
            };
        };
        responses: {
            /** @description The signature is valid and the intent is still spendable. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["CosignatureVerificationValid"];
                    };
                };
            };
            /** @description No token was supplied in the body or the header. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "message": "authorization is required",
                     *         "code": "authorization_required"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description The cosignature did not verify. `reason` says why. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "data": {
                     *         "valid": false,
                     *         "reason": "already_settled"
                     *       }
                     *     }
                     */
                    "application/json": {
                        data: components["schemas"]["CosignatureVerificationInvalid"];
                    };
                };
            };
        };
    };
    acceptInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    token: string;
                };
            };
        };
        responses: {
            /** @description The membership you now hold. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            role?: components["schemas"]["Role"];
                            workspace_slug?: string;
                        };
                    };
                };
            };
            /** @description The invitation is no longer open. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    lookupInvitation: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The invitation preview. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            already_member?: boolean;
                            email?: string;
                            /** Format: date-time */
                            expires_at?: string;
                            matches_account?: boolean;
                            role?: components["schemas"]["Role"];
                            signed_in_as?: string | null;
                            workspace_name?: string;
                            workspace_slug?: string;
                        };
                    };
                };
            };
            /** @description Unknown token. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description The invitation was already accepted, revoked, or has expired. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listWorkspaces: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Your workspaces. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["Workspace"][];
                    };
                };
            };
            401: components["responses"]["IdentityUnauthorized"];
        };
    };
    createWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @example Acme Procurement */
                    name: string;
                    /**
                     * @description Derived from `name` when omitted.
                     * @example acme-procurement
                     */
                    slug?: string;
                };
            };
        };
        responses: {
            /** @description The new workspace. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Workspace"];
                    };
                };
            };
            401: components["responses"]["IdentityUnauthorized"];
            422: components["responses"]["ValidationFailed"];
        };
    };
    getWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The workspace, with your role and capabilities. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Workspace"];
                    };
                };
            };
            401: components["responses"]["IdentityUnauthorized"];
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    deleteWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Must equal the workspace slug exactly. */
                    confirm: string;
                };
            };
        };
        responses: {
            /** @description Deleted. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description `confirm` did not match the slug. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listActionIntents: {
        parameters: {
            query?: {
                action_type?: string;
                agent_id?: string;
                /** @description Narrow to intents whose agent runs in this mode. Any other value is a `400`, rather than a silent full listing. */
                agent_mode?: "live" | "test";
                budget_id?: string;
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
                state?: "pending" | "requires_approval" | "completed" | "failed" | "denied";
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of action intents. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["ActionIntent"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getActionIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The action intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionIntentEnvelope"];
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    approveActionIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The approved intent, now `pending`. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionIntentEnvelope"];
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description The intent is not in `requires_approval`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    denyActionIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Defaults to `approval_denied`. */
                    reason?: string;
                };
            };
        };
        responses: {
            /** @description The denied intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionIntentEnvelope"];
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description The intent is not in `requires_approval`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getActionIntentImpact: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The impact summary. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["ApprovalImpact"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    listAgents: {
        parameters: {
            query?: {
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of agents, newest first. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["Agent"][];
                    };
                };
            };
            401: components["responses"]["IdentityUnauthorized"];
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    createAgent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @default test
                     * @enum {string}
                     */
                    mode?: "test" | "live";
                    /** @example procurement agent */
                    name: string;
                    /**
                     * @description Which action types this key may even ask about. An exact match (`payment.create`), a namespace wildcard (`payment.*`), or `*`. An empty array means unrestricted.
                     * @example [
                     *       "payment.*",
                     *       "tool.invoke"
                     *     ]
                     */
                    scopes?: string[];
                    /**
                     * @default active
                     * @enum {string}
                     */
                    status?: "active" | "suspended" | "revoked";
                };
            };
        };
        responses: {
            /** @description The agent, including its plaintext key. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Agent"] & {
                            /**
                             * @description Shown exactly once, at creation.
                             * @example krt_test_9f3a1c7e42b8d05a6e1f8c3d
                             */
                            api_key?: string;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description Validation failed, or a plan limit was reached. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAgent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The agent. Never includes the key. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Agent"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    updateAgent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name?: string;
                    scopes?: string[];
                    /** @enum {string} */
                    status?: "active" | "suspended" | "revoked";
                };
            };
        };
        responses: {
            /** @description The updated agent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Agent"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            422: components["responses"]["ValidationFailed"];
        };
    };
    listAuditEvents: {
        parameters: {
            query?: {
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
                subject_id?: string;
                subject_type?: "Session" | "SpendToken" | "ActionIntent" | "PaymentIntent" | "Policy" | "PolicyModule" | "Agent" | "Workspace" | "WorkspaceMembership" | "WorkspaceInvitation" | "Subscription";
                trace_id?: string;
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of audit events, newest first. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["AuditEvent"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getAuditEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The audit event. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["AuditEvent"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getBilling: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The billing overview. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["BillingOverview"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    cancelSubscription: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The updated billing overview. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["BillingOverview"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
        };
    };
    startBillingCheckout: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email?: string;
                    /** @enum {string} */
                    plan: "sandbox" | "build" | "growth" | "scale" | "enterprise";
                };
            };
        };
        responses: {
            /** @description A checkout URL, or confirmation that the plan changed in place. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            checkout_id?: string;
                            /** Format: uri */
                            checkout_url?: string;
                            plan?: string;
                        } | {
                            plan?: string;
                            plan_changed?: boolean;
                            status?: string;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
        };
    };
    buyVolumePack: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email?: string;
                    units: number;
                };
            };
        };
        responses: {
            /** @description A checkout URL for the pack. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            checkout_id?: string;
                            /** Format: uri */
                            checkout_url?: string;
                            units?: number;
                            volume_cents?: number;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
        };
    };
    openBillingPortal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A portal URL. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            /** Format: uri */
                            portal_url?: string;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            /** @description The workspace has never been billed. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    refreshBilling: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The refreshed billing overview. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["BillingOverview"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
        };
    };
    listWorkspaceSessions: {
        parameters: {
            query?: {
                agent_id?: string;
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of budgets. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["Session"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getWorkspaceSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The budget. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionEnvelope"];
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    exportWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The export. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            counts?: {
                                [key: string]: number;
                            };
                            /** Format: date-time */
                            exported_at?: string;
                            workspace?: components["schemas"]["Workspace"];
                        } & {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getFunds: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The funds summary. Not paginated; a single object. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["Funds"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    listInvitations: {
        parameters: {
            query?: {
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of open invitations. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["Invitation"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    createInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email: string;
                    role?: components["schemas"]["Role"];
                };
            };
        };
        responses: {
            /** @description The invitation. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Invitation"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            /** @description That person is already a member. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    revokeInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Revoked. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    listMemberships: {
        parameters: {
            query?: {
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of memberships, oldest first. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["Membership"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    createMembership: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email?: string;
                    role?: components["schemas"]["Role"];
                    user_sub: string;
                };
            };
        };
        responses: {
            /** @description The membership. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Membership"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            /** @description Validation failed, or the plan member limit was reached. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteMembership: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Removed. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["InsufficientRole"];
            /** @description This is the last owner. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateMembership: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    role: components["schemas"]["Role"];
                };
            };
        };
        responses: {
            /** @description The updated membership. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Membership"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            /** @description The change would leave the workspace ownerless. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPaymentIntents: {
        parameters: {
            query?: {
                agent_id?: string;
                /** @description Narrow to intents whose agent runs in this mode. Any other value is a `400`, rather than a silent full listing. */
                agent_mode?: "live" | "test";
                budget_id?: string;
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
                state?: "pending" | "requires_approval" | "executed" | "failed" | "denied";
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of payment intents. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["PaymentIntent"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getWorkspacePaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The payment intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentIntentEnvelope"];
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    approvePaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The released payment intent, now `pending`. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentIntentEnvelope"];
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description The intent is not in `requires_approval`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    denyPaymentIntent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
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
            /** @description The denied payment intent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentIntentEnvelope"];
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description The intent is not in `requires_approval`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getPaymentIntentImpact: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The impact summary. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["ApprovalImpact"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    listPolicies: {
        parameters: {
            query?: {
                agent_id?: string;
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of policies. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["Policy"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    createPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PolicyWrite"];
            };
        };
        responses: {
            /** @description The policy, with a stable `id` assigned to every rule. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Policy"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            /** @description A rule did not compile, or an import named an unknown module. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The policy. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Policy"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    updatePolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PolicyWrite"];
            };
        };
        responses: {
            /** @description The updated policy. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Policy"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
            422: components["responses"]["ValidationFailed"];
        };
    };
    listPolicyModules: {
        parameters: {
            query?: {
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `name` of the last module on the previous page. Modules paginate by name, not by id. */
                starting_after?: string;
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of modules. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["PolicyModule"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    createPolicyModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    description?: string | null;
                    /**
                     * @description Lowercase, dash separated. Unique per workspace.
                     * @example vendor-allowlist
                     */
                    name: string;
                    rules?: components["schemas"]["PolicyRule"][];
                };
            };
        };
        responses: {
            /** @description The module. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["PolicyModule"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            422: components["responses"]["ValidationFailed"];
        };
    };
    getPolicyModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example vendor-allowlist */
                name: components["parameters"]["PolicyModuleName"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The module. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["PolicyModule"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    deletePolicyModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example vendor-allowlist */
                name: components["parameters"]["PolicyModuleName"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deleted. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["InsufficientRole"];
            /** @description The module is still imported by at least one policy. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "message": "Module vendor-allowlist is still imported by 2 policies",
                     *         "code": null
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updatePolicyModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example vendor-allowlist */
                name: components["parameters"]["PolicyModuleName"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    description?: string | null;
                    rules?: components["schemas"]["PolicyRule"][];
                };
            };
        };
        responses: {
            /** @description The updated module. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["PolicyModule"];
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            422: components["responses"]["ValidationFailed"];
        };
    };
    createPolicyPreview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @example payment.create */
                    action_type: string;
                    /** Format: uuid */
                    agent_id: string;
                    /** @example 75000 */
                    cost_cents?: number;
                    metadata?: {
                        [key: string]: unknown;
                    };
                    policy?: components["schemas"]["PolicyDraft"];
                    resource?: string | null;
                    /**
                     * @description The synthetic session budget to evaluate against.
                     * @default 100000
                     */
                    session_budget_cents?: number;
                };
            };
        };
        responses: {
            /** @description The decision the draft would produce. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["Decision"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
            /** @description The draft policy did not validate. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listSpendTokens: {
        parameters: {
            query?: {
                budget_id?: string;
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of spend tokens. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["SpendToken"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    getSpendToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The spend token. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpendTokenEnvelope"];
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    listWebhookEndpoints: {
        parameters: {
            query?: {
                /** @description Page size. Defaults to 50, clamped to 1..200. */
                limit?: components["parameters"]["Limit"];
                /** @description The `id` of the last record on the previous page. An unknown or foreign id is ignored and returns the first page. */
                starting_after?: components["parameters"]["StartingAfter"];
            };
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of endpoints. Secrets are never returned here. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEnvelope"] & {
                        data?: components["schemas"]["WebhookEndpoint"][];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    createWebhookEndpoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @example [
                     *       "action.requires_approval",
                     *       "approval.resolved"
                     *     ]
                     */
                    enabled_events?: components["schemas"]["WebhookEventType"][];
                    /**
                     * @default active
                     * @enum {string}
                     */
                    status?: "active" | "disabled";
                    /**
                     * Format: uri
                     * @example https://app.example.com/webhooks/kordio
                     */
                    url: string;
                };
            };
        };
        responses: {
            /** @description The endpoint, including its signing secret. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["WebhookEndpoint"] & {
                            /**
                             * @description Shown exactly once.
                             * @example whsec_4bSFH1YTkjwsgiMrHMwWJfJTIzsov60WxxsziZAE
                             */
                            secret?: string;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            /** @description The URL is malformed, or an event name is not recognised. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getWebhookEndpoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The endpoint. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["WebhookEndpoint"];
                    };
                };
            };
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    deleteWebhookEndpoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deleted. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
    rotateWebhookEndpointSecret: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["PathId"];
                /** @example acme-procurement */
                workspace_slug: components["parameters"]["WorkspaceSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The endpoint with its new secret. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["WebhookEndpoint"] & {
                            secret?: string;
                        };
                    };
                };
            };
            403: components["responses"]["InsufficientRole"];
            404: components["responses"]["WorkspaceNotFound"];
        };
    };
}
