[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# DUST

React app for DUST

## Utvikling

- Klon ned repoet
- Installer avhengigheter:  `npm i`
- Lag en lokal .env fil slik som [env.example](env.example)
- Start utviklingsserver: `npm run dev`

## Demomodus

- `npm run demo`
- Setter demobruker og tokens i session
- Returner mock data fra API

## Mock

- Bruker biblioteket [msw](https://mswjs.io/)
- Oppsett ligger i [src/mock](src/mock)
- Legg ruter som skal mockes i [handlers.js](src/mock/handlers.js)

## Sentry

Applikasjonen bruker [Sentry](http://sentry.io/) for å logge feil fra frontend. For å aktivere Sentry-logging må man legge inn korrekt *dsn* (Data Source Name) fra Sentry-prosjektet i .env `REACT_APP_SENTRY_DSN`. *Environment* hentes fra `NODE_ENV`, ellers kan det spesifiseres i miljøvariabel `REACT_APP_SENTRY_ENV`.

## Lisens

[MIT](./LICENSE)
