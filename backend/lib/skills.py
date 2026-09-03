"""Deterministic tech-skill dictionary powering the rule engine.

Each entry: canonical key -> label, category, aliases, learning days, deps, adjacent.
`adjacent` marks skills that make a gap "partial" (⚠️) instead of "missing" (❌).
"""

CATEGORY_WEIGHTS = {
    "language": 0.30,
    "framework": 0.25,
    "database": 0.15,
    "cloud_devops": 0.15,
    "architecture": 0.08,
    "testing": 0.04,
    "tooling": 0.03,
}

CATEGORY_LABELS = {
    "language": "Languages",
    "framework": "Frameworks & Libraries",
    "database": "Databases",
    "cloud_devops": "Cloud & DevOps",
    "architecture": "Architecture",
    "testing": "Testing",
    "tooling": "Tooling",
}


def _s(label, category, aliases=(), days=3, deps=(), adjacent=()):
    return {
        "label": label,
        "category": category,
        "aliases": list(aliases),
        "days": days,
        "deps": list(deps),
        "adjacent": list(adjacent),
    }


SKILLS = {
    # ---------- languages ----------
    "java": _s("Java", "language", ["core java", "java 8", "java 11", "java 17"], 21),
    "python": _s("Python", "language", ["python3", "py"], 18),
    "javascript": _s("JavaScript", "language", ["js", "es6", "ecmascript"], 14),
    "typescript": _s("TypeScript", "language", ["ts"], 7, ["javascript"], ["javascript"]),
    "csharp": _s("C#", "language", ["c#", ".net c#"], 20),
    "cpp": _s("C++", "language", ["c++", "cplusplus"], 24),
    "go": _s("Go", "language", ["golang"], 14),
    "kotlin": _s("Kotlin", "language", [], 10, ["java"], ["java"]),
    "php": _s("PHP", "language", [], 14),
    "ruby": _s("Ruby", "language", [], 14),
    "scala": _s("Scala", "language", [], 18, [], ["java"]),
    "rust": _s("Rust", "language", [], 25),
    "sql": _s("SQL", "language", ["structured query language"], 7, [], ["mysql", "postgresql", "oracle"]),
    "html": _s("HTML", "language", ["html5"], 3),
    "css": _s("CSS", "language", ["css3"], 4),
    "bash": _s("Shell / Bash", "language", ["shell scripting", "shell", "linux scripting"], 4),
    # ---------- frameworks ----------
    "spring": _s("Spring", "framework", ["spring framework", "spring mvc"], 10, ["java"], ["spring boot"]),
    "spring_boot": _s("Spring Boot", "framework", ["springboot", "spring-boot"], 12, ["java"], ["spring"]),
    "spring_security": _s("Spring Security", "framework", [], 5, ["spring_boot"], ["spring_boot"]),
    "hibernate": _s("Hibernate", "framework", ["hibernate orm"], 4, ["java", "sql"], ["jpa", "spring_boot"]),
    "jpa": _s("JPA", "framework", ["java persistence api", "spring data jpa"], 3, ["java"], ["hibernate"]),
    "react": _s("React", "framework", ["react.js", "reactjs"], 14, ["javascript"], ["javascript"]),
    "nextjs": _s("Next.js", "framework", ["next js", "nextjs"], 8, ["react"], ["react"]),
    "angular": _s("Angular", "framework", ["angularjs", "angular 2+"], 16, ["typescript"], ["react", "vue"]),
    "vue": _s("Vue", "framework", ["vue.js", "vuejs"], 12, ["javascript"], ["react"]),
    "node": _s("Node.js", "framework", ["node", "nodejs"], 12, ["javascript"], ["javascript"]),
    "express": _s("Express", "framework", ["express.js", "expressjs"], 4, ["node"], ["node"]),
    "django": _s("Django", "framework", [], 14, ["python"], ["python", "flask"]),
    "flask": _s("Flask", "framework", [], 7, ["python"], ["python", "django"]),
    "fastapi": _s("FastAPI", "framework", [], 6, ["python"], ["flask", "django"]),
    "dotnet": _s(".NET", "framework", [".net core", "asp.net", "dotnet core"], 18, ["csharp"], ["csharp"]),
    "bootstrap": _s("Bootstrap", "framework", ["bootstrap 5"], 3, ["css"], ["css", "tailwind"]),
    "tailwind": _s("Tailwind CSS", "framework", ["tailwindcss"], 3, ["css"], ["css", "bootstrap"]),
    "graphql": _s("GraphQL", "framework", [], 6, [], ["rest_api"]),
    "rest_api": _s("REST API", "framework", ["rest", "restful", "rest apis", "restful api"], 5, [], ["graphql"]),
    "spark": _s("Apache Spark", "framework", ["spark", "pyspark"], 15, [], ["python", "scala"]),
    "pandas": _s("Pandas", "framework", [], 6, ["python"], ["python"]),
    "tensorflow": _s("TensorFlow", "framework", [], 20, ["python"], ["pytorch"]),
    "pytorch": _s("PyTorch", "framework", [], 20, ["python"], ["tensorflow"]),
    "redux": _s("Redux", "framework", ["redux toolkit"], 5, ["react"], ["react"]),
    # ---------- databases ----------
    "mysql": _s("MySQL", "database", [], 6, ["sql"], ["sql", "postgresql"]),
    "postgresql": _s("PostgreSQL", "database", ["postgres"], 6, ["sql"], ["sql", "mysql"]),
    "oracle": _s("Oracle DB", "database", ["oracle database", "plsql", "pl/sql"], 8, ["sql"], ["sql"]),
    "mongodb": _s("MongoDB", "database", ["mongo"], 7, [], ["nosql"]),
    "nosql": _s("NoSQL", "database", [], 5, [], ["mongodb", "cassandra", "dynamodb"]),
    "redis": _s("Redis", "database", [], 4, [], ["nosql"]),
    "cassandra": _s("Cassandra", "database", [], 10, [], ["nosql"]),
    "dynamodb": _s("DynamoDB", "database", [], 6, ["aws"], ["nosql"]),
    "elasticsearch": _s("Elasticsearch", "database", ["elastic search", "opensearch"], 9, [], ["nosql"]),
    "sqlserver": _s("SQL Server", "database", ["mssql", "ms sql"], 7, ["sql"], ["sql"]),
    # ---------- cloud / devops ----------
    "aws": _s("AWS", "cloud_devops", ["amazon web services", "ec2", "s3"], 15, [], ["azure", "gcp"]),
    "azure": _s("Azure", "cloud_devops", ["microsoft azure"], 15, [], ["aws", "gcp"]),
    "gcp": _s("GCP", "cloud_devops", ["google cloud", "google cloud platform"], 15, [], ["aws", "azure"]),
    "docker": _s("Docker", "cloud_devops", ["containers", "containerization"], 5, [], ["kubernetes"]),
    "kubernetes": _s("Kubernetes", "cloud_devops", ["k8s", "eks", "aks"], 12, ["docker"], ["docker"]),
    "jenkins": _s("Jenkins", "cloud_devops", [], 5, [], ["ci_cd"]),
    "ci_cd": _s("CI/CD", "cloud_devops", ["ci cd", "cicd", "continuous integration", "github actions", "gitlab ci"], 6, [], ["jenkins"]),
    "terraform": _s("Terraform", "cloud_devops", ["iac", "infrastructure as code"], 8, [], ["ansible"]),
    "ansible": _s("Ansible", "cloud_devops", [], 6, [], ["terraform"]),
    "linux": _s("Linux", "cloud_devops", ["unix"], 8, [], ["bash"]),
    "git": _s("Git", "tooling", ["github", "gitlab", "bitbucket", "version control"], 3),
    "maven": _s("Maven", "tooling", [], 2, [], ["gradle"]),
    "gradle": _s("Gradle", "tooling", [], 2, [], ["maven"]),
    "jira": _s("Jira", "tooling", [], 1),
    "postman": _s("Postman", "tooling", [], 1),
    "webpack": _s("Webpack", "tooling", ["vite", "bundler"], 3),
    "prometheus": _s("Prometheus", "cloud_devops", ["grafana", "observability", "monitoring"], 5),
    # ---------- architecture ----------
    "microservices": _s("Microservices", "architecture", ["micro services", "microservice architecture"], 10, ["rest_api"], ["rest_api", "spring_boot"]),
    "kafka": _s("Apache Kafka", "architecture", ["kafka"], 8, [], ["rabbitmq", "message queue"]),
    "rabbitmq": _s("RabbitMQ", "architecture", [], 6, [], ["kafka"]),
    "message_queue": _s("Message Queues", "architecture", ["message queue", "messaging", "jms", "sqs"], 5, [], ["kafka", "rabbitmq"]),
    "system_design": _s("System Design", "architecture", ["scalability", "distributed systems", "high availability"], 20, [], ["microservices"]),
    "design_patterns": _s("Design Patterns", "architecture", ["oop design", "solid principles", "solid"], 10),
    "caching": _s("Caching", "architecture", ["cache", "caching strategies"], 4, [], ["redis"]),
    "serverless": _s("Serverless", "architecture", ["lambda", "aws lambda", "cloud functions"], 6, [], ["aws"]),
    "oauth": _s("OAuth / JWT", "architecture", ["oauth2", "jwt", "sso", "openid"], 5, [], ["spring_security"]),
    "agile": _s("Agile / Scrum", "architecture", ["agile", "scrum", "kanban"], 3),
    # ---------- testing ----------
    "junit": _s("JUnit", "testing", ["junit5", "junit 5"], 3, ["java"], ["testing", "mockito"]),
    "mockito": _s("Mockito", "testing", [], 2, ["junit"], ["junit"]),
    "pytest": _s("Pytest", "testing", [], 3, ["python"], ["testing"]),
    "jest": _s("Jest", "testing", ["react testing library", "vitest"], 3, ["javascript"], ["testing"]),
    "selenium": _s("Selenium", "testing", ["cypress", "playwright", "e2e testing"], 6, [], ["testing"]),
    "testing": _s("Unit Testing", "testing", ["unit tests", "tdd", "test driven development"], 5, [], ["junit", "pytest", "jest"]),
}

# alias -> canonical key, longest phrases first so "spring boot" wins over "spring"
ALIAS_INDEX: list[tuple[str, str]] = []
for _key, _meta in SKILLS.items():
    ALIAS_INDEX.append((_meta["label"].lower(), _key))
    ALIAS_INDEX.append((_key.replace("_", " "), _key))
    for _a in _meta["aliases"]:
        ALIAS_INDEX.append((_a.lower(), _key))
ALIAS_INDEX = sorted(set(ALIAS_INDEX), key=lambda p: -len(p[0]))


def label_of(key: str) -> str:
    meta = SKILLS.get(key)
    return meta["label"] if meta else key.replace("_", " ").title()


def category_of(key: str) -> str:
    meta = SKILLS.get(key)
    return meta["category"] if meta else "tooling"


def days_of(key: str) -> int:
    meta = SKILLS.get(key)
    return meta["days"] if meta else 5


def deps_of(key: str) -> list[str]:
    meta = SKILLS.get(key)
    return meta["deps"] if meta else []


def adjacent_of(key: str) -> list[str]:
    meta = SKILLS.get(key)
    return meta["adjacent"] if meta else []


def all_skills_grouped() -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    for key, meta in SKILLS.items():
        grouped.setdefault(meta["category"], []).append({"key": key, "label": meta["label"]})
    for items in grouped.values():
        items.sort(key=lambda i: i["label"].lower())
    return grouped
