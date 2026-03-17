# Training Tracker — Claude Code Context

## Project
Internal enterprise web app to track employee training completion for ~60 employees.
Stack: React 18 + Vite + MUI v5 (frontend) | Django 4.2 + DRF + PostgreSQL (backend) | Celery + Redis (tasks)

## Structure
```
E:\Training Tracker\
├── frontend/   React SPA (Vite)
├── backend/    Django project
└── CLAUDE.md
```

## Roles
| Role | Access |
|------|--------|
| `admin` | Full access — all employees, all trainings, reports, settings |
| `supervisor` | Own team only — assign trainings, track team progress |
| `employee` | Own data only — view assigned trainings, upload certificates |

## Key Conventions
- All API endpoints under `/api/`
- JWT auth: access token (15 min) + refresh token (7 days) stored in httpOnly cookies
- UUIDs as primary keys on all models
- All dates stored in UTC
- Training status values: `assigned` | `in_progress` | `completed` | `overdue` | `expired`
- Celery Beat jobs: status auto-update at midnight, email reminders at 8am daily
- File uploads: certificates go to `media/certificates/`, served via protected endpoint only

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements/development.txt
cp .env.example .env          # fill in DB creds, secret key, email config
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # set VITE_API_BASE_URL=http://localhost:8000
npm run dev                   # runs on http://localhost:5173
```

### Celery (separate terminals)
```bash
cd backend
celery -A config worker -l info
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Redis (Docker)
```bash
docker run -d -p 6379:6379 redis:7
```

## Environment Variables

### backend/.env
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=training_tracker
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@company.com
EMAIL_HOST_PASSWORD=your-email-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Training Tracker <no-reply@company.com>
FRONTEND_URL=http://localhost:5173
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:8000
```

## Do Not
- Never hardcode secrets — always use environment variables
- Never skip RBAC permission checks on any API view
- Never serve certificate files directly from `/media/` — always use the protected `/api/assignments/{id}/certificate/` endpoint
- Never trust role claims from the frontend — always enforce server-side
- Never assign same training to same employee if an active assignment (assigned/in_progress) already exists

## API Overview
- `POST /api/auth/login/` — JWT login
- `GET /api/auth/me/` — current user profile
- `GET /api/users/` — list users (role-filtered)
- `GET /api/trainings/` — training catalog
- `GET /api/assignments/` — assignments (role-filtered)
- `POST /api/assignments/bulk/` — bulk assign
- `GET /api/reports/summary/` — KPI data
- `GET /api/notifications/` — in-app notifications

## Frontend Pages
| Path | Page | Roles |
|------|------|-------|
| `/login` | Login | public |
| `/forgot-password` | Forgot Password | public |
| `/admin/dashboard` | Admin Dashboard | admin |
| `/admin/employees` | Employees List | admin |
| `/admin/employees/:id` | Employee Detail | admin |
| `/admin/trainings` | Trainings List | admin |
| `/admin/trainings/:id` | Training Detail | admin |
| `/admin/assign` | Assign Training | admin |
| `/admin/reports` | Reports | admin |
| `/admin/settings` | Settings | admin |
| `/supervisor/dashboard` | Supervisor Dashboard | supervisor |
| `/supervisor/team` | Team List | supervisor |
| `/supervisor/team/:id` | Team Member Detail | supervisor |
| `/employee/dashboard` | Employee Dashboard | employee |
| `/employee/my-trainings` | My Trainings | employee |
| `/notifications` | Notifications | all |
| `/certificates/:assignmentId` | Certificate View | all |
