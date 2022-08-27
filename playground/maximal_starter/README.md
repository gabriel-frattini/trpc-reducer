<h2 align="center">Sideclub &#128101; &#128173;</h2>

![sideclub](https://user-images.githubusercontent.com/96744665/187024508-331490b2-70e1-4591-b3e3-d8ac10fb70a9.jpg)

<h4>sideclub is a simple social network that allows members to share a sideproject idea and invite other members to join them or request to join someone else. &#9997;</h4>
<h4>Features include a simple Markdown-based editor with preview, join and invite, comments and votes, image drag-and-drop and a clean responsive layout &#9889;</h4>

## Setup

### Clone the repo

```bash
git clone https://github.com/gabriel-frattini/sideclub
```

### Install dependencies

```bash
npm install
```

### Create a database

- [Create a PlanetScale database](https://docs.planetscale.com/tutorials/planetscale-quick-start-guide#create-a-database)
- Create a [connection string](https://docs.planetscale.com/concepts/connection-strings#creating-a-password) to connect to your database. Choose **Prisma** for the format
- **Alternatively**, your PlanetScale database and connection string can be generated using the [pscale CLI](https://github.com/planetscale/cli) or GitHub Actions. [View instructions](doc/pscale-actions-setup.md).
- Set up the environment variables:

```bash
cp .env.example .env
```

- Open `.env` and set the `DATABASE_URL` variable with the connection string from PlanetScale
- Create the database schema:

```bash
npx prisma db push
```

### Configure authentication

- [Configuring GitHub authentication](doc/github_setup.md)

Sideclub uses [NextAuth.js](https://next-auth.js.org/), so if you prefer to use one of the [many providers](https://next-auth.js.org/providers/) it supports, you can customize your own installation. Simply update the [`lib/auth.ts`](/lib/auth.ts#L11) file to add your own provider.

## Running the app locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Authenticating with GitHub

## Deploying to Vercel

One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fplanetscale%2Fbeam)

⚠️ Remember to update your callback URLs after deploying.
