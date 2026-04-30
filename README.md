# 🃏 Jack Masters

Welcome to the **Black Jack Web Game** repository, a web platform where users can register, log into their account, and play Black Jack with a progression system based on gameplay performance.  
Each player can improve their profile, climb through tables with increasing difficulty, view statistics, and compete on leaderboards.

---

## ✨ Main Features

- 👤 User Registration and Login
- 🔐 Session management via PHP and MySQL
- 🎮 Interactive Black Jack game (client-side)
- 📈 Progression system with progressively harder tables
- 🏆 Online player leaderboards
- 📊 Personal statistics (win rate, points, match history)
- 💾 Persistent storage of results and progress in the database

---

## 🧱 Technology Stack

| Technology | Role |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styles and layout |
| Bootstrap | Responsive UI |
| JavaScript | Client-side game logic |
| PHP | Server logic, authentication |
| MySQL | User data and statistics management |
| XAMPP | Local server (Apache + MySQL) |
| phpMyAdmin | Database management interface |

---

## 🏗 System Architecture

The application uses a **client-server** architecture with persistent storage through a database:

- **Client**: HTML, CSS, JS, Bootstrap
- **Server**: PHP
- **Database**: MySQL for users, matches, and leaderboards

---

## 🕹 Game System and Progression

The progression system rewards player performance:

- Earn points by winning or completing matches
- Higher points unlock access to more advanced **tables**
- Each table may feature:
  - Different difficulty
  - Different scoring
  - Separate leaderboards

---

## 📊 Statistics and Leaderboards

Players can view:

- Total matches played
- Total points
- Win rate
- Current table
- Match history

Leaderboards display top players based on:

- Total points
- Current table
- Optional additional metrics

---

## 🖥 Setup & Installation

### ✔ Requirements (classic XAMPP)

- XAMPP or equivalent environment (Apache + PHP + MySQL)
- Modern browser

### 🚀 Installation (XAMPP)

1. Copy or clone the project into the `htdocs/` directory of XAMPP
2. Start **Apache** and **MySQL** from the XAMPP Control Panel
3. Open `phpMyAdmin` and create the database
4. Import `db/blackjack_db.sql`
5. Set DB credentials via environment variables (see [Environment Variables](#-environment-variables)) or they default to `root` / no password / `localhost`
6. Visit `http://localhost/project-name/`

---

## 🐳 Docker – Local Development

> **Requirements**: [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

```bash
# 1. Clone the repository
git clone https://github.com/Na1ky/Jack-Masters.git
cd Jack-Masters

# 2. Start the app + database
docker compose up --build

# 3. Open in the browser
#    http://localhost:8080
```

If you paste the snippet into Windows `cmd`, skip the `#` comment lines and open `http://localhost:8080` in your browser after the containers start.

The `docker-compose.yml` automatically:

- Builds the PHP 8.2 + Apache image
- Starts a MariaDB 10.11 container called `db`
- Imports `db/blackjack_db.sql` on first run
- Mounts the source folder for live-editing

To stop everything:

```bash
docker compose down          # keep database volume
docker compose down -v       # also delete the database volume
```

---

## 🌐 Deploy on InfinityFree (Free hosting with MySQL)

InfinityFree provides free PHP + MySQL hosting. It's a simple option if you don't need Docker.

### Step-by-step

1. **Sign up** at [infinityfree.com](https://infinityfree.com)
2. **Create a new website** and note your:
   - Database name (e.g., `if0_12345678_blackjack`)
   - Database user (e.g., `if0_12345678`)
   - Database password (provided or set by you)
   - Database host (usually `sql1xx.infinityfree.com`)

3. **Upload the project** to your InfinityFree account using FTP or File Manager.
4. **Create a `.env` file** in the root directory with your InfinityFree credentials:

   ```env
   DB_HOST=sql1xx.infinityfree.com
   DB_PORT=3306
   DB_USER=if0_12345678
   DB_PASS=YourDatabasePassword
   DB_NAME=if0_12345678_blackjack
   ```

5. **Import the database** using the InfinityFree MySQL Manager:
   - Go to **Files → Databases** in your InfinityFree panel
   - Open **phpMyAdmin** for your database
   - Click **Import** and select `db/blackjack_db.sql`

6. **Access your site** at `https://your-domain.infinityfree.com`

> **Important**: Keep the `.env` file secure. Do **not** commit it to GitHub. Use `.env.example` as a template for team members.

---

## ☁️ Deploy on Render (24/7)

[Render](https://render.com) supports Docker-based web services and keeps them running continuously.

> **Important**: if you need the site online 24/24, use a paid Render web service. The free tier sleeps after inactivity and is not always-on.

### Step-by-step

1. **Fork / push** this repository to your GitHub account.
2. Go to [render.com](https://render.com) and sign up (free tier available).
3. Click **New → Web Service** and connect your GitHub repository.
4. Render detects `render.yaml` automatically.  
   If the wizard asks, choose:
   - **Environment**: `Docker`
   - **Dockerfile path**: `./Dockerfile`
5. Under **Environment Variables** (in the Render dashboard), add the three variables listed below.
6. Click **Deploy** – Render builds the image and starts the container.
7. Your app is live at `https://<service-name>.onrender.com` 🎉

> **Note**: on the free tier, the service sleeps after ~15 minutes of inactivity and takes a few seconds to wake up on the next request. Upgrade to a paid plan for always-on behaviour.

### Required external database

Render Web Services do not include a persistent MySQL/MariaDB instance.  
You need a managed database – recommended options:

| Provider | Notes |
|---|---|
| **[PlanetScale](https://planetscale.com)** | MySQL-compatible, generous free tier |
| **[Aiven](https://aiven.io)** | MySQL / MariaDB, free trial |
| **[Railway](https://railway.app)** | MySQL add-on, easy setup |
| **[Render PostgreSQL](https://render.com/docs/databases)** | ⚠ Postgres only – requires PHP `pdo_pgsql` and query changes |

After creating the external database, import `db/blackjack_db.sql` using your provider's import tool or the MySQL CLI:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p blackjack < db/blackjack_db.sql
```

---

## 🔑 Environment Variables

The application reads database credentials from the following environment variables.  
If a variable is not set, the fallback (classic XAMPP default) is used.

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | Hostname or IP of the MySQL/MariaDB server |
| `DB_PORT` | `3306` | Port of the MySQL/MariaDB server |
| `DB_USER` | `root` | Database username |
| `DB_PASS` | *(empty)* | Database password |
| `DB_NAME` | `blackjack` | Database name |

Set them in the Render dashboard → **Environment** tab, or in a local `.env` file passed to Docker Compose.

---

## 💾 Persistence Notes

| Concern | Details |
|---|---|
| **Database** | All user data, match history, and leaderboards are stored in MySQL. Use an external managed DB for production. |
| **User avatars** | Avatar URLs are stored as URLs (e.g. Imgur links) – no file uploads to the server. No extra volume needed. |
| **PHP sessions** | Sessions are stored on the filesystem inside the container. They are lost on container restart, which forces users to log in again. For multi-replica deployments, use a Redis session handler. |
| **Static assets** | CSS, JS, and images are bundled in the container image – no persistent volume needed. |

---

## 🖼 Images / Screenshots

![Game Screen](img/preview1.png)  
![Game Screen](img/preview2.png)  
![Game Screen](img/preview3.png)  
![Home](img/home.png)  
![Statistics](img/preview4.png)

---
