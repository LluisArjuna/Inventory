# Movie App – Explorador i Gestor de Favorits

Aplicació web SPA desenvolupada amb Angular que permet explorar pel·lícules, consultar detalls i gestionar una llista de favorits sincronitzada amb Firebase.

---

## 🚀 Objectiu del projecte

Permetre als usuaris:

Explorar pel·lícules populars
Cercar pel·lícules per nom
Consultar informació detallada (cast, director, etc.)
Marcar i desmarcar pel·lícules com a favorites
Persistir els favorits al núvol (Firebase)
Visualitzar una llista de pel·lícules favorites en temps real

L’objectiu és practicar arquitectura moderna en Angular amb integració real de backend i experiència d’usuari reactiva.

---

## 🛠️ Tecnologies utilitzades

- Angular (Standalone Components + Angular 17/21 control flow)
- TypeScript
- Signals + RxJS
- Firebase (Auth + Firestore)
- TMDB API (The Movie Database)
- CSS (responsive design)

---

## 🖥️ System Requirements

### Required Software

1️⃣ Node.js

2️⃣ npm

3️⃣ Angular CLI

```bash
npm install -g @angular/cli
```

### Project Installation

Clone the repository:

```bash
git clone https://github.com/LluisArjuna/project-movies.git
cd project-movies
```

### Environment Configuration

Create an environment.ts file with:

```bash
export const environment = {
  firebase: {
    apiKey: 'YOUR_KEY',
    authDomain: 'YOUR_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_BUCKET',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  },
  tmdbApiKey: 'YOUR_TMDB_API_KEY'
};
```

---

### Project Execution

```bash
ng serve --open
```

---

## 📦 Estructura del projecte

```bash
src/app/
├── core/ → API config, layouts
├── features/
│   ├── movies/ → Lògica de pel·lícules
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── models/
│   ├── firestore/ → Gestió d'Usuaris (Firestore)

```