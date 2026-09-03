"""Deterministic interview-question bank + generators (no AI).

Each entry is (question, answer_hint) so the UI can show model-answer pointers inline.
"""

BANK: dict[str, dict[str, list[tuple[str, str]]]] = {
    "java": {
        "basic": [
            (
                "What is the difference between ArrayList and LinkedList?",
                "ArrayList = resizable array, O(1) random access, O(n) mid-list insert. LinkedList = doubly linked nodes, O(1) insert/remove at a known node, O(n) access. Say which you would pick and why: ArrayList for reads, LinkedList for queue-like churn.",
            ),
            (
                "Explain the difference between == and equals() in Java.",
                "== compares references (identity) for objects and values for primitives; equals() compares logical state and is overridable. Mention the equals/hashCode contract and that String literals are interned, which is why == sometimes 'works'.",
            ),
            (
                "What are the four pillars of OOP and how does Java implement each?",
                "Encapsulation (private fields + accessors), inheritance (extends, single class inheritance), polymorphism (overriding + interface dispatch), abstraction (abstract classes/interfaces). Give one line of real code per pillar from your own project.",
            ),
        ],
        "intermediate": [
            (
                "How does the Java memory model split heap and stack, and when does GC run?",
                "Stack = per-thread frames with locals and references; heap = objects, split into young (eden + survivor) and old gen. GC runs when a region fills: minor GC on eden, major/full on old gen. Mention that you cannot force it — System.gc() is a hint.",
            ),
            (
                "Explain HashMap internals: hashing, buckets, and treeification after Java 8.",
                "hash(key) is spread over n buckets; collisions form a linked list that converts to a red-black tree past 8 entries in one bucket, so worst case moves from O(n) to O(log n). Resize doubles capacity at load factor 0.75. Stress that mutable keys break lookups.",
            ),
            (
                "What problem do streams and lambdas solve compared to imperative loops?",
                "They express what, not how: declarative pipelines, lazy intermediate ops, easy parallelism. Trade-off is debuggability and overhead on small collections — say you use them for transformations, loops for tight hot paths.",
            ),
        ],
    },
    "spring_boot": {
        "basic": [
            (
                "What is dependency injection in Spring and why is it useful?",
                "The container constructs and wires collaborators instead of the class doing `new`. Benefit: swap implementations, mock in tests, single place for lifecycle. Prefer constructor injection so dependencies are final and required.",
            ),
            (
                "What does @SpringBootApplication actually enable?",
                "It is @Configuration + @EnableAutoConfiguration + @ComponentScan on the current package. Mention that component scanning starts from that class's package, which is why misplaced classes 'are not found'.",
            ),
        ],
        "intermediate": [
            (
                "Explain Spring Boot auto-configuration and how you would override it.",
                "Starters put candidates on the classpath; auto-config classes apply conditionally (@ConditionalOnClass / @ConditionalOnMissingBean). Override by defining your own bean, setting properties, or excluding the auto-config class. Mention `--debug` to print the condition report.",
            ),
            (
                "How do bean scopes (singleton vs prototype vs request) change behaviour?",
                "Singleton = one instance per context (default, must be stateless/thread-safe); prototype = new instance per lookup and Spring stops managing its destruction; request/session = one per web request/session. Warn about injecting a prototype into a singleton.",
            ),
        ],
    },
    "hibernate": {
        "basic": [
            (
                "What is an ORM and what problem does Hibernate solve?",
                "It maps objects to relational rows so you write domain code, not boilerplate JDBC. Hibernate adds caching, dirty checking, lazy loading and dialect portability. Add the honest cost: you must understand the SQL it generates.",
            )
        ],
        "intermediate": [
            (
                "How does Hibernate manage entity relationships and lazy loading?",
                "Mappings via @OneToMany / @ManyToOne / @OneToOne / @ManyToMany with a mappedBy owning side. Lazy collections are proxies filled on first access inside an open session — outside it you get LazyInitializationException. Fix with fetch joins or DTO projections, not by making everything EAGER.",
            ),
            (
                "What is the N+1 select problem and how do you fix it?",
                "One query for the parents, then one per child collection. Fix with `join fetch`, @EntityGraph, or batch size. Say how you detected it — SQL logging / query counts — because that is what interviewers want.",
            ),
        ],
    },
    "jpa": {
        "basic": [
            (
                "What is the difference between JPA and Hibernate?",
                "JPA is the specification (annotations, EntityManager, JPQL); Hibernate is an implementation of it plus extras. Coding to JPA keeps you portable; you drop to Hibernate APIs only for features the spec lacks.",
            )
        ],
        "intermediate": [
            (
                "Explain the JPA entity lifecycle: transient, managed, detached, removed.",
                "Transient = new, unknown to the context. Managed = tracked, dirty checks flush automatically. Detached = context closed, changes are not persisted until merge(). Removed = scheduled for delete on flush. Tie it to a bug you fixed by calling merge or keeping the transaction open.",
            )
        ],
    },
    "sql": {
        "basic": [
            (
                "What is the difference between INNER JOIN and LEFT JOIN?",
                "INNER keeps only matching rows on both sides; LEFT keeps all left rows and NULLs the right side when unmatched. Mention that filtering the right table in WHERE silently turns a LEFT JOIN back into an INNER one — move it into the ON clause.",
            ),
            (
                "What does a primary key guarantee that a unique index does not?",
                "PK = unique AND not-null, one per table, is the row's identity and default clustering/FK target. A unique index allows NULLs (implementation-dependent) and can exist many times per table.",
            ),
        ],
        "intermediate": [
            (
                "How would you diagnose a slow query, and what does an index actually cost you?",
                "Read EXPLAIN / EXPLAIN ANALYZE for scan type, row estimates and join order; check selectivity and whether the index is usable (leading column, no function on the column). Cost: extra writes, storage and planner choices — so index for real access patterns, not 'just in case'.",
            ),
            (
                "Explain GROUP BY with HAVING versus filtering in WHERE.",
                "WHERE filters rows before aggregation, HAVING filters groups after it. Push predicates into WHERE whenever possible because it shrinks the set being aggregated.",
            ),
        ],
    },
    "python": {
        "basic": [
            (
                "What is the difference between a list and a tuple?",
                "List is mutable and unhashable; tuple is immutable and hashable, so it can key a dict. Use tuples for fixed records and safe defaults, lists for collections you mutate.",
            ),
            (
                "How does a dict maintain order in modern Python?",
                "Since 3.7 insertion order is a language guarantee, backed by a compact entries array plus an index table. Lookups stay average O(1) by hash.",
            ),
        ],
        "intermediate": [
            (
                "Explain decorators and a real case where you used one.",
                "A callable that wraps another and returns a replacement, applied with @. Give a concrete case — retry, timing, auth check — and mention functools.wraps to keep the name and docstring.",
            ),
            (
                "What is the GIL and when does it hurt you?",
                "One interpreter lock means one thread runs Python bytecode at a time, so threads help I/O-bound work but not CPU-bound. For CPU-bound work use multiprocessing, native extensions, or move the job out of process.",
            ),
        ],
    },
    "javascript": {
        "basic": [
            (
                "Explain var vs let vs const.",
                "var is function-scoped and hoisted as undefined; let/const are block-scoped with a temporal dead zone; const forbids rebinding but not mutation of the object. Default to const, reach for let when reassigning.",
            ),
            (
                "What is the event loop?",
                "The call stack runs to completion, then microtasks (promises) drain, then one macrotask (timer, I/O) is taken from the queue. That ordering is why a promise callback beats setTimeout(0).",
            ),
        ],
        "intermediate": [
            (
                "How do closures work and where do they leak memory?",
                "An inner function keeps a live reference to its defining scope. Leaks happen when a long-lived listener or interval closes over something large — the fix is removing the listener or nulling the reference.",
            ),
            (
                "Explain promise chaining vs async/await error handling.",
                ".then/.catch composes handlers; async/await uses try/catch and reads sequentially. Common bug: forgetting to await, so the rejection escapes the try block and becomes an unhandled rejection.",
            ),
        ],
    },
    "typescript": {
        "basic": [
            (
                "What is the difference between interface and type?",
                "interface is extendable and mergeable, ideal for object shapes; type aliases anything including unions, tuples and mapped types. Convention: interface for public object contracts, type for unions and utilities.",
            )
        ],
        "intermediate": [
            (
                "Explain generics with a constraint and why unknown beats any.",
                "`<T extends { id: string }>` keeps the concrete type flowing through while guaranteeing a shape. `any` disables checking everywhere it spreads; `unknown` forces a narrowing check before use, so errors stay local.",
            )
        ],
    },
    "react": {
        "basic": [
            (
                "What is the virtual DOM and why does React use keys?",
                "React diffs a lightweight tree and patches only what changed. Keys give list children a stable identity so state is not reassigned to the wrong row — never use the array index for a reorderable list.",
            ),
            (
                "Difference between props and state?",
                "Props flow in from the parent and are read-only; state is owned locally and drives re-render on update. Lift state up when two siblings need the same value.",
            ),
        ],
        "intermediate": [
            (
                "When does useMemo actually help, and how do you avoid stale closures in useEffect?",
                "useMemo pays off for genuinely expensive computations or referential stability of deps — not for cheap maths. Stale closures come from missing deps; fix with a complete dep array or a functional state update, not by disabling the lint rule.",
            )
        ],
    },
    "node": {
        "basic": [
            (
                "Why is Node.js called non-blocking?",
                "I/O is delegated to libuv and answered via callbacks on the event loop, so one thread serves many concurrent connections instead of one thread per request.",
            )
        ],
        "intermediate": [
            (
                "How would you handle CPU-bound work in a Node service?",
                "Move it off the loop: worker_threads, a child process, or a queue plus a separate worker service. Explain the symptom you would see first — latency spikes on unrelated endpoints.",
            )
        ],
    },
    "rest_api": {
        "basic": [
            (
                "What makes an API RESTful?",
                "Resource-oriented URIs, correct HTTP verbs and status codes, statelessness, and representations negotiated by content type. Bonus points for mentioning idempotency and cacheability.",
            ),
            (
                "Difference between PUT and PATCH?",
                "PUT replaces the whole resource and is idempotent; PATCH applies a partial change. Say which you used and how you validated partial payloads.",
            ),
        ],
        "intermediate": [
            (
                "How do you version a public REST API without breaking clients?",
                "URI versioning (/v1) or media-type versioning, additive-only changes inside a version, deprecation headers plus a sunset window. Emphasise never repurposing an existing field's meaning.",
            )
        ],
    },
    "microservices": {
        "basic": [
            (
                "What problems do microservices solve compared to a monolith?",
                "Independent deploys, per-service scaling and team ownership. Be balanced: you buy that with network failure modes, distributed data and heavier ops — a modular monolith is often the right first step.",
            )
        ],
        "intermediate": [
            (
                "How do services discover each other, and how do you keep data consistent across them?",
                "Discovery via a registry (Eureka/Consul) or platform DNS behind a gateway. Consistency is eventual: database-per-service, outbox pattern, saga with compensating actions — no distributed transactions.",
            ),
            (
                "Explain the circuit breaker pattern and where you would place it.",
                "Wrap a remote call: after a failure threshold it opens and fails fast, then half-opens to probe recovery. Place it on the caller side of every downstream dependency, with a timeout, retry budget and fallback.",
            ),
        ],
    },
    "docker": {
        "basic": [
            (
                "What is the difference between an image and a container?",
                "The image is an immutable layered filesystem plus metadata; a container is a running instance with a writable layer. Anything written there dies with the container unless you mount a volume.",
            )
        ],
        "intermediate": [
            (
                "How do you shrink an image and why are multi-stage builds useful?",
                "Build with the full toolchain in stage one, copy only the artefact into a slim/distroless runtime stage. Also order layers so dependencies cache, and avoid secrets in layers — they persist in history.",
            )
        ],
    },
    "kubernetes": {
        "basic": [
            (
                "What is a Pod and what does a Deployment add on top?",
                "A Pod is the smallest schedulable unit — one or more containers sharing network and volumes. A Deployment manages ReplicaSets to give you desired replica count, rolling updates and rollback.",
            )
        ],
        "intermediate": [
            (
                "How do liveness and readiness probes change a rolling update?",
                "Readiness gates traffic and the rollout: unready pods get no requests and the rollout waits. Liveness restarts a wedged container. A liveness probe that is really a readiness probe causes restart storms under load.",
            )
        ],
    },
    "aws": {
        "basic": [
            (
                "What is the difference between EC2, ECS and Lambda?",
                "EC2 = you manage the VM; ECS/EKS = you ship containers and the platform schedules them; Lambda = you ship a function and pay per invocation with no idle cost but cold starts and time limits.",
            )
        ],
        "intermediate": [
            (
                "How would you design a private subnet architecture for a REST backend + RDS?",
                "ALB in public subnets, app in private subnets across two AZs, RDS in isolated subnets reachable only from the app security group, NAT gateway for egress, secrets in Secrets Manager, least-privilege IAM roles instead of keys.",
            )
        ],
    },
    "kafka": {
        "basic": [
            (
                "What are topics, partitions and consumer groups?",
                "A topic is an append-only log split into partitions for parallelism; each partition is consumed by exactly one member of a consumer group, which is how you scale and how you cap parallelism.",
            )
        ],
        "intermediate": [
            (
                "How does Kafka give you ordering guarantees, and what breaks them?",
                "Order is per partition, so a good key keeps a customer's events ordered. It breaks with retries plus multiple in-flight requests, repartitioning, or parallel handlers inside one consumer. Mention idempotent producers and at-least-once semantics.",
            )
        ],
    },
    "mongodb": {
        "basic": [
            (
                "When would you choose MongoDB over a relational database?",
                "Flexible or evolving documents, aggregate-oriented access, horizontal sharding. Be candid: if your data is highly relational and you need multi-table transactions, SQL is the better tool.",
            )
        ],
        "intermediate": [
            (
                "How do you model a one-to-many relationship: embed or reference?",
                "Embed when the children are bounded, read with the parent and rarely change; reference when they are unbounded, shared or queried independently. Cite the 16 MB document limit and your read pattern as the deciding factors.",
            )
        ],
    },
    "junit": {
        "basic": [
            (
                "What makes a good unit test?",
                "Fast, isolated, deterministic, one reason to fail, and named after the behaviour. Arrange-act-assert, no shared mutable state, no network or clock dependency.",
            )
        ],
        "intermediate": [
            (
                "How do you mock a repository so the test stays fast and deterministic?",
                "Inject the dependency, stub it with Mockito (when/thenReturn), verify interactions that matter. Mock only what you own at the boundary — over-mocking couples tests to implementation details.",
            )
        ],
    },
    "git": {
        "basic": [
            (
                "Difference between merge and rebase?",
                "Merge preserves history and adds a merge commit; rebase rewrites your commits onto a new base for a linear history. Rule of thumb: rebase local work, never rewrite shared branches.",
            )
        ],
        "intermediate": [
            (
                "Walk me through recovering a commit you accidentally reset away.",
                "git reflog to find the old HEAD, then git reset --hard <sha> or git cherry-pick it. Point out that objects survive until garbage collection, which is why reflog rescues you.",
            )
        ],
    },
    "system_design": {
        "basic": [
            (
                "What is horizontal vs vertical scaling?",
                "Vertical = bigger machine, simple but capped and a single point of failure. Horizontal = more machines behind a balancer, needs statelessness and a data-partitioning story but scales further.",
            )
        ],
        "intermediate": [
            (
                "Design a URL shortener that handles 10k writes per second.",
                "Clarify requirements and QPS, then: ID generation (counter range or base62 of a snowflake), write path to a partitioned store, read path served from cache with high hit rate, CDN/redirect semantics (301 vs 302), and analytics written async through a queue.",
            )
        ],
    },
    "oauth": {
        "basic": [
            (
                "What does a JWT contain and where should you store it in a browser?",
                "header.payload.signature — signed, not encrypted, so never put secrets in the payload. In a browser prefer an httpOnly, SameSite cookie over localStorage, which any XSS can read.",
            )
        ],
        "intermediate": [
            (
                "Explain the OAuth2 authorization code flow with PKCE.",
                "Client redirects with a code_challenge, user authenticates, the provider returns a short-lived code, and the client exchanges it with the code_verifier for tokens. PKCE stops interception of the code by a malicious app because no client secret is shipped.",
            )
        ],
    },
}

PROJECT_TEMPLATES = [
    (
        "Suppose your API starts receiving 10,000 requests per minute. Walk through how you would find the bottleneck and improve throughput.",
        "Measure before changing: latency percentiles, slow-query log, thread/connection pool saturation. Then in order — add indexes and fix N+1, cache hot reads, batch or queue writes, scale horizontally behind a balancer. Close with how you would verify the improvement.",
    ),
    (
        "Describe the architecture of your most complex project — what would you redesign today and why?",
        "Give a 60-second tour (client → API → data), name one concrete constraint you designed for, then one honest regret with the reasoning. Self-critique reads as seniority.",
    ),
    (
        "A production bug only reproduces for 1% of users. How do you debug it with the logs you have?",
        "Find what that 1% share (region, device, feature flag, data shape), add a correlation id and targeted logging, reproduce from real request payloads, then ship a guarded fix with a metric that proves it worked.",
    ),
    (
        "How would you introduce {skill} into an existing codebase without a big-bang rewrite?",
        "Start with one low-risk slice behind an interface or flag, prove it in staging with metrics, document the pattern, then migrate incrementally and delete the old path once traffic has moved.",
    ),
    (
        "Your database is the bottleneck under load. What are your first three moves, in order?",
        "1) Read EXPLAIN on the top queries and fix indexes/N+1. 2) Cache the hottest read path and check connection pool sizing. 3) Only then offload — read replicas, partitioning or async writes. Emphasise measuring between each step.",
    ),
]


def _hint_for_gap(label: str, role_title: str) -> str:
    return (
        f"Show structure even without production experience: define {label} in one sentence, name the problem it "
        f"solves, sketch how it would slot into a {role_title or 'production'} system, and finish with one pitfall "
        f"(and say honestly that your exposure so far is study/side-project level)."
    )


def _hint_for_strength(label: str) -> str:
    return (
        f"Answer with a story, not a definition: the task, what you built with {label}, the trade-off you chose, "
        f"and the measurable result. Keep it under 90 seconds and invite a follow-up."
    )


def build_questions(required: list[str], strong: list[str], gaps: list[str], role_title: str) -> list[dict]:
    """Return a flat list of {tier, skill, question, hint} rows."""
    out: list[dict] = []
    seen: set[str] = set()

    def add(tier: str, skill: str, q: str, hint: str) -> None:
        if q in seen:
            return
        seen.add(q)
        out.append({"tier": tier, "skill": skill, "question": q, "hint": hint})

    for key in required:
        entry = BANK.get(key)
        if not entry:
            continue
        for q, hint in entry.get("basic", [])[:2]:
            add("basic", key, q, hint)
        for q, hint in entry.get("intermediate", [])[:2]:
            add("intermediate", key, q, hint)

    focus = (gaps[:1] or strong[:1] or required[:1] or ["your stack"])[0]
    from lib.skills import label_of

    focus_label = label_of(focus) if focus != "your stack" else "a new technology"
    for tpl, hint in PROJECT_TEMPLATES:
        add("project", focus, tpl.replace("{skill}", focus_label), hint)

    for key in gaps[:6]:
        add(
            "jd_specific",
            key,
            f"This role explicitly requires {label_of(key)}. Explain what it is, how you would use it "
            f"in a {role_title or 'production'} context, and one pitfall to avoid.",
            _hint_for_gap(label_of(key), role_title),
        )
    for key in strong[:4]:
        add(
            "jd_specific",
            key,
            f"The JD lists {label_of(key)} as a core requirement. Describe a concrete task you shipped with it "
            f"and the trade-off you made.",
            _hint_for_strength(label_of(key)),
        )
    return out
