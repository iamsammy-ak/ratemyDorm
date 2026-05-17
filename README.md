# 🏠 RateMyDorm Italy

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-4CAF50?style=for-the-badge" alt="License">
</p>

<p align="center">
  A crowdsourced student residence review platform for universities in Italy 🇮🇹
</p>

<p align="center">
  <a href="https://github.com/iamsammy-ak/ratemyDorm/issues">Report Bug</a>
  ·
  <a href="https://github.com/iamsammy-ak/ratemyDorm/issues">Request Feature</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Campus Map** | Interactive map showing residence locations with Leaflet |
| ⭐ **Reviews & Ratings** | Detailed ratings across multiple categories |
| ⚖️ **Residence Comparison** | Side-by-side comparison of multiple residences |
| 🔍 **Search & Filter** | Find residences by location, price, and amenities |
| 📸 **Photo Gallery** | Visual tour of each residence |
| 📊 **Statistics Dashboard** | Visual breakdown of ratings with Recharts |

---

## 🛠️ Tech Stack

<p align="center">

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Radix UI |
| **Database** | PostgreSQL with Prisma ORM |
| **Auth** | Supabase (optional) |
| **State** | TanStack Query |
| **Charts** | Recharts |
| **Maps** | Leaflet, React-Leaflet |

</p>

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18.18.0` or higher
- npm, yarn, pnpm, or bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/iamsammy-ak/ratemyDorm.git
cd ratemyDorm

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Set up the database
npx prisma generate
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

> 🌐 Open [http://localhost:3000](http://localhost:3000) to view the app

---

## 📁 Project Structure

```
ratemyDorm/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── residences/        # Residence pages
│   └── compare/           # Comparison page
├── components/            # React components
│   └── residence/         # Residence-specific components
├── lib/                   # Utilities and types
├── prisma/                # Database schema and seed
└── public/                # Static assets
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npx prisma studio` | Open Prisma Studio |
| `npx prisma seed` | Seed the database |

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<p align="center">
  <strong>Made with ❤️ by <a href="https://github.com/iamsammy-ak">Abhishek Kumar</a></strong>
</p>

<p align="center">
  <a href="https://github.com/iamsammy-ak/ratemyDorm">
    <img src="https://img.shields.io/github/stars/iamsammy-ak/ratemyDorm?style=social" alt="Stars">
  </a>
  <a href="https://github.com/iamsammy-ak/ratemyDorm/fork">
    <img src="https://img.shields.io/github/forks/iamsammy-ak/ratemyDorm?style=social" alt="Forks">
  </a>
  <a href="https://github.com/iamsammy-ak/ratemyDorm/watchers">
    <img src="https://img.shields.io/github/watchers/iamsammy-ak/ratemyDorm?style=social" alt="Watchers">
  </a>
</p>