# Welcome to Trip Points

Trip Points is a [Next.js](https://nextjs.org/) project.

The building and development the project was done using npm, so we recommend using it to install, build and run the project.

## Installation

First, install the dependencies:

```bash
npm install
```

Then, you'll need to create a `.env` file in the root of the project with the following credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<FIREBASE_API_KEY>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<FIREBASE_AUTH_DOMAIN>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<FIREBASE_PROJECT_ID>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<FIREBASE_STORAGE_BUCKET>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<FIREBASE_MESSAGING_SENDER_ID>
NEXT_PUBLIC_FIREBASE_APP_ID=<FIREBASE_APP_ID>

NEXT_PUBLIC_MAPS_API_KEY=<GOOGLE_MAPS_API_KEY>
```

## Getting Started

Then, run the development server:

```bash
npm run dev
```

This starts a local server on [http://localhost:3000](http://localhost:3000) in development mode.


For production, you can build the project using:

```bash
npm run build
```

And then start the server using:

```bash
npm start
```

The project automatically deploys changes to the `main` branch to [Vercel](https://vercel.com/).

The project is currently live at
 [https://trip-points-project.vercel.app/](https://trip-points-project.vercel.app/).
