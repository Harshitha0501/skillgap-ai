"""Curated free learning resources per skill (official docs, free courses, quality tutorials).

Every entry is free to access without a paywall. Skills without a curated entry fall back to
`fallback_resources()` so every roadmap step always has at least two one-click starting points.
"""

RESOURCES: dict[str, list[tuple[str, str]]] = {
    # languages
    "java": [
        ("Official Java Tutorials (Oracle)", "https://dev.java/learn/"),
        ("Java Programming — freeCodeCamp (4h)", "https://www.freecodecamp.org/news/learn-java-free-java-courses-for-beginners/"),
    ],
    "python": [
        ("The Python Tutorial (official)", "https://docs.python.org/3/tutorial/"),
        ("Python for Everybody (free course)", "https://www.py4e.com/"),
    ],
    "javascript": [
        ("JavaScript Guide — MDN", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"),
        ("javascript.info — The Modern JS Tutorial", "https://javascript.info/"),
    ],
    "typescript": [
        ("TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"),
        ("Type-level TS exercises", "https://www.totaltypescript.com/tutorials"),
    ],
    "sql": [
        ("SQLBolt — interactive SQL lessons", "https://sqlbolt.com/"),
        ("Mode SQL Tutorial", "https://mode.com/sql-tutorial/"),
    ],
    "html": [("HTML basics — MDN", "https://developer.mozilla.org/en-US/docs/Learn/HTML"), ("web.dev Learn HTML", "https://web.dev/learn/html/")],
    "css": [("CSS — MDN Learn", "https://developer.mozilla.org/en-US/docs/Learn/CSS"), ("web.dev Learn CSS", "https://web.dev/learn/css/")],
    "go": [("A Tour of Go", "https://go.dev/tour/"), ("Go by Example", "https://gobyexample.com/")],
    "kotlin": [("Kotlin Docs — Getting started", "https://kotlinlang.org/docs/getting-started.html"), ("Kotlin Koans", "https://play.kotlinlang.org/koans/")],
    "csharp": [("C# Docs (Microsoft Learn)", "https://learn.microsoft.com/en-us/dotnet/csharp/"), ("C# Tutorials", "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/tutorials/")],
    "cpp": [("learncpp.com", "https://www.learncpp.com/"), ("cppreference", "https://en.cppreference.com/w/")],
    "rust": [("The Rust Book", "https://doc.rust-lang.org/book/"), ("Rustlings exercises", "https://github.com/rust-lang/rustlings")],
    "php": [("PHP: The Right Way", "https://phptherightway.com/"), ("PHP Manual", "https://www.php.net/manual/en/")],
    "ruby": [("Ruby in Twenty Minutes", "https://www.ruby-lang.org/en/documentation/quickstart/"), ("The Odin Project — Ruby", "https://www.theodinproject.com/paths/full-stack-ruby-on-rails")],
    "scala": [("Scala Book", "https://docs.scala-lang.org/scala3/book/introduction.html"), ("Scala Exercises", "https://www.scala-exercises.org/")],
    "bash": [("Bash Guide (Greg's Wiki)", "https://mywiki.wooledge.org/BashGuide"), ("ShellCheck — lint your scripts", "https://www.shellcheck.net/")],
    # frameworks
    "spring_boot": [
        ("Spring Boot Guides (official)", "https://spring.io/guides"),
        ("Building a RESTful Web Service", "https://spring.io/guides/gs/rest-service/"),
    ],
    "spring": [("Spring Framework Reference", "https://docs.spring.io/spring-framework/reference/"), ("Spring Core Guides", "https://spring.io/guides")],
    "spring_security": [("Spring Security docs", "https://docs.spring.io/spring-security/reference/"), ("Securing a Web Application", "https://spring.io/guides/gs/securing-web/")],
    "hibernate": [
        ("Hibernate ORM — Getting Started", "https://hibernate.org/orm/documentation/getting-started/"),
        ("Accessing Data with JPA (Spring guide)", "https://spring.io/guides/gs/accessing-data-jpa/"),
    ],
    "jpa": [("Jakarta Persistence spec guide", "https://jakarta.ee/specifications/persistence/"), ("Spring Data JPA reference", "https://docs.spring.io/spring-data/jpa/reference/")],
    "react": [("React Learn (official)", "https://react.dev/learn"), ("Thinking in React", "https://react.dev/learn/thinking-in-react")],
    "nextjs": [("Next.js Learn course", "https://nextjs.org/learn"), ("Next.js App Router docs", "https://nextjs.org/docs/app")],
    "angular": [("Angular Tutorials", "https://angular.dev/tutorials"), ("Angular docs", "https://angular.dev/overview")],
    "vue": [("Vue.js Guide", "https://vuejs.org/guide/introduction.html"), ("Vue Tutorial (interactive)", "https://vuejs.org/tutorial/")],
    "node": [("Node.js Learn", "https://nodejs.org/en/learn"), ("Node.js API docs", "https://nodejs.org/docs/latest/api/")],
    "express": [("Express Getting Started", "https://expressjs.com/en/starter/installing.html"), ("Express/Node tutorial — MDN", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs")],
    "django": [("Django Tutorial (official)", "https://docs.djangoproject.com/en/stable/intro/tutorial01/"), ("Django Girls Tutorial", "https://tutorial.djangogirls.org/")],
    "flask": [("Flask Quickstart", "https://flask.palletsprojects.com/en/stable/quickstart/"), ("Flask Mega-Tutorial", "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world")],
    "fastapi": [("FastAPI Tutorial", "https://fastapi.tiangolo.com/tutorial/"), ("FastAPI Advanced Guide", "https://fastapi.tiangolo.com/advanced/")],
    "dotnet": [("ASP.NET Core tutorials", "https://learn.microsoft.com/en-us/aspnet/core/tutorials/"), (".NET Learn path", "https://dotnet.microsoft.com/en-us/learn")],
    "graphql": [("Learn GraphQL (official)", "https://graphql.org/learn/"), ("How to GraphQL", "https://www.howtographql.com/")],
    "rest_api": [("HTTP & REST — MDN", "https://developer.mozilla.org/en-US/docs/Web/HTTP"), ("Microsoft REST API guidelines", "https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md")],
    "bootstrap": [("Bootstrap docs", "https://getbootstrap.com/docs/5.3/getting-started/introduction/"), ("Bootstrap layout guide", "https://getbootstrap.com/docs/5.3/layout/grid/")],
    "tailwind": [("Tailwind CSS docs", "https://tailwindcss.com/docs/installation"), ("Tailwind utility-first fundamentals", "https://tailwindcss.com/docs/styling-with-utility-classes")],
    "redux": [("Redux Essentials tutorial", "https://redux.js.org/tutorials/essentials/part-1-overview-concepts"), ("Redux Toolkit docs", "https://redux-toolkit.js.org/introduction/getting-started")],
    "pandas": [("10 minutes to pandas", "https://pandas.pydata.org/docs/user_guide/10min.html"), ("pandas Cookbook", "https://pandas.pydata.org/docs/user_guide/cookbook.html")],
    "spark": [("Spark SQL Getting Started", "https://spark.apache.org/docs/latest/sql-getting-started.html"), ("PySpark tutorial", "https://spark.apache.org/docs/latest/api/python/getting_started/index.html")],
    "tensorflow": [("TensorFlow Tutorials", "https://www.tensorflow.org/tutorials"), ("ML Crash Course (Google)", "https://developers.google.com/machine-learning/crash-course")],
    "pytorch": [("PyTorch Tutorials", "https://pytorch.org/tutorials/"), ("Deep Learning with PyTorch: 60 min blitz", "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html")],
    # databases
    "mysql": [("MySQL Tutorial (official)", "https://dev.mysql.com/doc/refman/8.0/en/tutorial.html"), ("SQLBolt practice", "https://sqlbolt.com/")],
    "postgresql": [("PostgreSQL Tutorial (official)", "https://www.postgresql.org/docs/current/tutorial.html"), ("PostgreSQL Exercises", "https://pgexercises.com/")],
    "oracle": [("Oracle PL/SQL docs", "https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/index.html"), ("Oracle SQL Getting Started", "https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html")],
    "sqlserver": [("SQL Server tutorials", "https://learn.microsoft.com/en-us/sql/sql-server/tutorials-for-sql-server-2016"), ("T-SQL reference", "https://learn.microsoft.com/en-us/sql/t-sql/language-reference")],
    "mongodb": [("MongoDB Manual — CRUD", "https://www.mongodb.com/docs/manual/crud/"), ("MongoDB University (free)", "https://learn.mongodb.com/")],
    "nosql": [("NoSQL data modelling guide", "https://www.mongodb.com/docs/manual/data-modeling/"), ("DynamoDB modelling basics", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html")],
    "redis": [("Redis University (free)", "https://redis.io/university/"), ("Redis data types", "https://redis.io/docs/latest/develop/data-types/")],
    "cassandra": [("Cassandra Getting Started", "https://cassandra.apache.org/doc/latest/cassandra/getting-started/"), ("Cassandra data modelling", "https://cassandra.apache.org/doc/latest/cassandra/data_modeling/")],
    "dynamodb": [("DynamoDB Developer Guide", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html"), ("Single-table design basics", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html")],
    "elasticsearch": [("Elasticsearch Guide", "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"), ("Query DSL basics", "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html")],
    # cloud / devops
    "aws": [
        ("AWS Skill Builder — free digital courses", "https://skillbuilder.aws/"),
        ("AWS Getting Started hands-on tutorials", "https://aws.amazon.com/getting-started/hands-on/"),
    ],
    "azure": [("Microsoft Learn — Azure fundamentals", "https://learn.microsoft.com/en-us/training/azure/"), ("Azure architecture center", "https://learn.microsoft.com/en-us/azure/architecture/")],
    "gcp": [("Google Cloud Skills Boost (free tier)", "https://www.cloudskillsboost.google/"), ("GCP docs — tutorials", "https://cloud.google.com/docs/tutorials")],
    "docker": [
        ("Docker Getting Started guide", "https://docs.docker.com/get-started/"),
        ("Play with Docker — free browser lab", "https://labs.play-with-docker.com/"),
    ],
    "kubernetes": [
        ("Kubernetes Basics tutorial", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"),
        ("Killercoda free K8s playground", "https://killercoda.com/playgrounds/scenario/kubernetes"),
    ],
    "jenkins": [("Jenkins Pipeline tutorial", "https://www.jenkins.io/doc/pipeline/tour/getting-started/"), ("Jenkins user handbook", "https://www.jenkins.io/doc/book/")],
    "ci_cd": [("GitHub Actions — quickstart", "https://docs.github.com/en/actions/quickstart"), ("Continuous delivery basics (Google)", "https://cloud.google.com/architecture/devops/devops-tech-continuous-delivery")],
    "terraform": [("Terraform tutorials (HashiCorp)", "https://developer.hashicorp.com/terraform/tutorials"), ("Terraform language docs", "https://developer.hashicorp.com/terraform/language")],
    "ansible": [("Ansible Getting Started", "https://docs.ansible.com/ansible/latest/getting_started/index.html"), ("Ansible playbook guide", "https://docs.ansible.com/ansible/latest/playbook_guide/index.html")],
    "linux": [("Linux Journey", "https://linuxjourney.com/"), ("The Linux Command Line (free book)", "https://linuxcommand.org/tlcl.php")],
    "prometheus": [("Prometheus — first steps", "https://prometheus.io/docs/introduction/first_steps/"), ("Grafana fundamentals", "https://grafana.com/tutorials/grafana-fundamentals/")],
    # tooling
    "git": [("Pro Git (free book)", "https://git-scm.com/book/en/v2"), ("Learn Git Branching (interactive)", "https://learngitbranching.js.org/")],
    "maven": [("Maven in 5 Minutes", "https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html"), ("Maven Getting Started guide", "https://maven.apache.org/guides/getting-started/index.html")],
    "gradle": [("Gradle Tutorials", "https://docs.gradle.org/current/userguide/getting_started_eng.html"), ("Gradle build basics", "https://docs.gradle.org/current/userguide/build_lifecycle.html")],
    "postman": [("Postman Learning Center", "https://learning.postman.com/docs/getting-started/introduction/"), ("API testing basics", "https://learning.postman.com/docs/writing-scripts/test-scripts/")],
    "jira": [("Jira Software free tutorials", "https://www.atlassian.com/software/jira/guides"), ("Agile boards guide", "https://www.atlassian.com/agile/tutorials")],
    "webpack": [("Vite Guide", "https://vite.dev/guide/"), ("Webpack Concepts", "https://webpack.js.org/concepts/")],
    # architecture
    "microservices": [
        ("microservices.io — pattern catalogue", "https://microservices.io/patterns/index.html"),
        ("Spring Cloud microservices guide", "https://spring.io/microservices"),
    ],
    "kafka": [
        ("Apache Kafka Quickstart", "https://kafka.apache.org/quickstart"),
        ("Confluent free Kafka courses", "https://developer.confluent.io/courses/"),
    ],
    "rabbitmq": [("RabbitMQ Tutorials", "https://www.rabbitmq.com/tutorials"), ("AMQP concepts", "https://www.rabbitmq.com/tutorials/amqp-concepts")],
    "message_queue": [("Messaging patterns (AWS)", "https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/asynchronous-messaging.html"), ("Enterprise integration patterns", "https://www.enterpriseintegrationpatterns.com/patterns/messaging/")],
    "system_design": [
        ("System Design Primer (GitHub)", "https://github.com/donnemartin/system-design-primer"),
        ("Google SRE Book (free)", "https://sre.google/sre-book/table-of-contents/"),
    ],
    "design_patterns": [("Refactoring.Guru — design patterns", "https://refactoring.guru/design-patterns"), ("SOLID principles explained", "https://refactoring.guru/design-principles")],
    "caching": [("Caching strategies (AWS)", "https://aws.amazon.com/caching/best-practices/"), ("HTTP caching — MDN", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching")],
    "serverless": [("AWS Lambda Getting Started", "https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html"), ("Serverless Land patterns", "https://serverlessland.com/patterns")],
    "oauth": [("OAuth 2.0 Simplified", "https://www.oauth.com/"), ("Introduction to JWT", "https://jwt.io/introduction")],
    "agile": [("Atlassian Agile Coach", "https://www.atlassian.com/agile"), ("Scrum Guide (free)", "https://scrumguides.org/scrum-guide.html")],
    # testing
    "junit": [("JUnit 5 User Guide", "https://junit.org/junit5/docs/current/user-guide/"), ("Testing with Spring Boot", "https://spring.io/guides/gs/testing-web/")],
    "mockito": [("Mockito docs", "https://site.mockito.org/"), ("Mockito javadoc cookbook", "https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html")],
    "pytest": [("pytest — Get Started", "https://docs.pytest.org/en/stable/getting-started.html"), ("pytest fixtures guide", "https://docs.pytest.org/en/stable/how-to/fixtures.html")],
    "jest": [("Jest — Getting Started", "https://jestjs.io/docs/getting-started"), ("React Testing Library docs", "https://testing-library.com/docs/react-testing-library/intro/")],
    "selenium": [("Selenium docs", "https://www.selenium.dev/documentation/"), ("Playwright Getting Started", "https://playwright.dev/docs/intro")],
    "testing": [("Testing best practices (Google)", "https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html"), ("Test Pyramid — Martin Fowler", "https://martinfowler.com/articles/practical-test-pyramid.html")],
}


def fallback_resources(label: str) -> list[tuple[str, str]]:
    from urllib.parse import quote_plus

    q = quote_plus(f"{label} tutorial")
    return [
        (f"freeCodeCamp articles on {label}", f"https://www.freecodecamp.org/news/search?query={quote_plus(label)}"),
        (f"Free video course: {label}", f"https://www.youtube.com/results?search_query={q}"),
    ]


def resources_for(key: str, label: str) -> list[dict]:
    rows = RESOURCES.get(key) or fallback_resources(label)
    return [{"label": name, "url": url} for name, url in rows]
