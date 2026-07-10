# SDD Workshop

Spec-driven development workshop.

## Demo Project
Monorepo fro AstroBookings project.

| Piece  | Path           | Docs                    |
| ------ | -------------- | ----------------------- |
| API    | `src/back/`    | [README](src/back/README.md) |
| Client | `src/front/`   | [README](src/front/README.md) |
| E2E    | `src/e2e/`     | [README](src/e2e/README.md) |

### Quick start

> [!IMPORTANT]
> this projects uses `nub` as a package manager and runner.

1. Install nub: the fastest tooling manager for Node.js projects.
```bash
npm install -g --ignore-scripts=false @nubjs/nub   # one-time, system-level
nub node install 26 && nub node pin 26 # Enjoy latest Node.js 26 LTS
```

2. Install dependencies and run the servers
```bash
nub install # install all dependencies in one go
nub run dev # run the servers: back :3000 + front :4000
```

---

-**Author**

- [Alberto Basalo](https://albertobasalo.dev)
- [A.I. Code Academy](https://aicode.academy) 
- [AIDDbot](https://github.com/AIDDbot/AIDDbot)
