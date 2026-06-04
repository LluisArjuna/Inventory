# Inventory App

Aplicació web SPA desenvolupada amb Angular per gestionar inventaris d'objectes amb localització geogràfica, fotos i categories.

## 🛠️ Tecnologies

- Angular 21 (Standalone Components, Signals)
- TypeScript
- RxJS
- Firebase Authentication
- Leaflet (mapes interactius)
- Chart.js / ng2-charts (estadístiques)
- Tailwind CSS 4
- PostCSS

## Requirements

- Node.js
- npm
- Angular CLI (`npm install -g @angular/cli`)

## Instal·lació

```bash
npm install
```

## Execució

```bash
ng serve --open
```

## Estructura

```
src/app/
├── core/          → Guards, interceptors, serveis compartits
│   ├── constants/ → Constants de l'aplicació
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/        → Components, models i serveis reutilitzables
│   ├── components/
│   │   ├── back-button/
│   │   ├── google-sign-in/
│   │   ├── or-divider/
│   │   ├── form/
│   │   ├── modal/
│   │   └── ...altres components compartits
│   ├── models/
│   ├── services/
│   └── utils/
├── features/      → Mòduls de funcionalitat
│   ├── auth/      → Login i registre
│   ├── inventories/ → CRUD d'inventaris
│   └── items/     → CRUD d'items
```
