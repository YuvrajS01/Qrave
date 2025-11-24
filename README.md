# Qrave – Modern Dine‑In Experience 🍽️

> **A sleek, full‑stack restaurant app** that lets customers browse menus, place orders, track them in real‑time, and receive printable invoices – all powered by a **local SQLite + Express backend** and a **React Vite frontend**.

---

## ✨ Highlights

- **Dynamic Menu Management** – Admins can add, edit, and remove items on the fly.
- **Live Order Tracking** – Real‑time updates (via polling) keep diners in the loop.
- **Printable Invoices** – Beautiful, printer‑friendly receipts with tax calculations.
- **Mobile‑First Design** – Responsive UI with elegant glass‑morphism, dark mode, and smooth micro‑animations.
- **Local‑Only Stack** – No cloud dependencies; run everything locally with SQLite.
- **Type‑Safe Prisma ORM** – Strong typing for all DB interactions.
- **Extensible Architecture** – Easy to swap Supabase for other backends.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind‑like custom CSS, **lucide‑react** icons |
| **Backend** | Express 4, TypeScript, **tsx**, **Prisma** (SQLite) |
| **Database** | SQLite (file‑based) |
| **Styling** | Vanilla CSS with modern design tokens (dark mode, gradients, glassmorphism) |
| **Testing** | Manual UI testing + Vite dev server |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20 (recommended)
- **npm** (comes with Node)

### Installation

```bash
# Clone the repo
git clone https://github.com/YuvrajS01/Qrave.git
cd Qrave

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` at the project root:

```dotenv
# Server
PORT=3001
DATABASE_URL=file:./prisma/dev.db

# Frontend (Vite)
VITE_API_URL=http://localhost:3001/api
```

> **Note:** The app no longer requires Supabase keys – it runs entirely locally.

### Initialise the Database

```bash
# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Seed demo data (restaurant, menu items)
npx tsx prisma/seed.ts
```

### Run the Application

```bash
# Start the backend (Express)
npm run server

# In a new terminal, start the frontend (Vite)
npm run dev
```

Open <http://localhost:5173> in your browser. The admin dashboard is reachable at <http://localhost:5173/admin>.

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `dev` | Starts Vite dev server |
| `build` | Bundles the app for production |
| `preview` | Serves the production build |
| `server` | Launches the Express backend via `tsx watch` |
| `prisma:generate` | Generates Prisma client |
| `prisma:push` | Pushes schema to SQLite |
| `seed` | Seeds demo data |

---

## 🔗 API Endpoints (Express)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/restaurants/:slug` | Fetch restaurant + menu |
| `GET` | `/api/orders?restaurantId=…` | List orders for a restaurant |
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders/:id` | Retrieve a single order |
| `PATCH` | `/api/orders/:id/status` | Update order status |
| `POST` | `/api/menu-items` | Add a new menu item |
| `PUT` | `/api/menu-items/:id` | **New** – Edit an existing menu item |

---

## 🎨 Design Philosophy

- **Premium Aesthetics** – Vibrant gradients, glass‑morphism cards, and subtle hover animations.
- **Responsive Layouts** – Mobile‑first breakpoints, grid‑based menu, and flexible containers.
- **Accessibility** – Semantic HTML, focus states, and ARIA‑friendly components.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/awesome-feature`).
3. Commit your changes (`git commit -m "feat: add awesome feature"`).
4. Push to your fork and open a Pull Request.

Please ensure your code follows the existing TypeScript conventions and passes linting (`npm run lint`).

---

## 📄 License

MIT © 2025 Yuvraj S.

---

*Happy coding, and enjoy the modern dine‑in experience with Qrave!*