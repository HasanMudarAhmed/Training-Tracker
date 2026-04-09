# Training Tracker — Claude Code Context

## Project
Internal enterprise web app to track employee training completion for ~60 employees.
Stack: React 18 + Vite + Tailwind CSS + MUI v5 (frontend) | Django 4.2 + DRF + SQLite/PostgreSQL (backend) | Celery + Redis (tasks)

## Structure
```
E:\Training Tracker\
├── frontend/   React SPA (Vite + Tailwind CSS + MUI v5)
├── backend/    Django project
└── CLAUDE.md
```

## Role Hierarchy
```
Admin
  └── Department (IT, HR, etc.) — admin creates from /admin/departments
        └── Manager(s) — 1-2 per dept, admin assigns
              └── Supervisor(s) — manager adds via /manager/supervisors
                    └── Employee(s) — supervisor OR manager adds
```

| Role | Access |
|------|--------|
| `admin` | Full access — all employees, departments, trainings, reports, settings |
| `manager` | Department scope — adds supervisors AND employees, edits/deactivates supervisors, tracks dept completion, assigns trainings to employees+supervisors |
| `supervisor` | Own team only — adds employees, creates trainings, assigns trainings to their employees, tracks team completion |
| `employee` | Own data only — view assigned trainings, upload certificates |

## User Model Fields
- `id` (UUID PK), `email` (unique), `first_name`, `last_name`
- `role` — choices: `admin` | `manager` | `supervisor` | `employee`
- `department` (FK → Department, nullable)
- `manager` (FK → self, nullable, limit_choices_to={'role':'manager'}) — for supervisors
- `supervisor` (FK → self, nullable, limit_choices_to={'role':'supervisor'}) — for employees (optional; employee can belong directly to dept under manager)
- `job_title`, `phone`, `is_active`, `date_joined`

## Role-Scoped Business Rules

### Creating Users
| Actor | Can create | Auto-assigned fields |
|-------|-----------|----------------------|
| `supervisor` | `employee` only | `supervisor=self`, `department=self.department` |
| `manager` | `supervisor` or `employee` | supervisor creation: `manager=self`, `department=self.department`; employee creation: `department=self.department`, `supervisor` optional |
| `admin` | any role | all fields manual |

### Querying Users (`UserViewSet.get_queryset`)
| Role | Sees |
|------|------|
| `admin` | all users |
| `manager` | self + all supervisors in dept + all employees in dept |
| `supervisor` | employees where `supervisor=self` |
| `employee` | self only |

### Updating / Deleting Users
- `manager`: can update/deactivate supervisors and employees **in their own department** only (`IsManagerOrAdmin` permission + `_check_manager_scope` enforcement)
- `admin`: can update/delete any user
- Deletes are **soft-deletes** (`is_active = False`), never hard deletes

### Training Assignment (`bulk_assign`)
| Actor | Can assign to |
|-------|--------------|
| `admin` | any non-admin user |
| `manager` | employees + supervisors in their department |
| `supervisor` | their own employees only |

### Training Creation
- `admin`, `manager`, `supervisor` can all create trainings (`IsSupervisorOrAdmin`)
- Only `admin` can update or delete trainings

## Key Conventions
- All API endpoints under `/api/`
- JWT auth: access token (15 min) + refresh token (7 days) stored in httpOnly cookies
- UUIDs as primary keys on all models
- All dates stored in UTC
- Training status values: `assigned` | `in_progress` | `completed` | `overdue` | `expired`
- Celery Beat jobs: status auto-update at midnight, email reminders at 8am daily
- File uploads: certificates go to `media/certificates/`, served via protected endpoint only
- `VITE_API_BASE_URL` should be empty or unset — Vite proxies `/api` and `/media` to `localhost:8000`
- Pagination: custom `StandardPagination` (page_size=20, max=500, param=`page_size`) in `apps/common/pagination.py`

## Running Locally

### Backend
```bash
cd backend
venv\Scripts\python.exe manage.py runserver 8000
# OR in a persistent terminal:
# powershell -Command "Start-Process cmd -ArgumentList '/k cd /d \"e:\Training Tracker\backend\" && venv\Scripts\python.exe manage.py runserver 8000'"
```

### Frontend
```bash
# In a persistent terminal:
# powershell -Command "Start-Process cmd -ArgumentList '/k cd /d \"e:\Training Tracker\frontend\" && npm run dev'"
# Runs on http://localhost:5173
```

### Celery (separate terminals)
```bash
cd backend
venv\Scripts\celery -A config worker -l info
venv\Scripts\celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Redis (Docker)
```bash
docker run -d -p 6379:6379 redis:7
```

## Test Accounts (dev only)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@company.com` | `Admin@123` |
| Manager | `manager@company.com` | `Manager@123` |
| Supervisor | `supervisor@company.com` | `Supervisor@123` |
| Employee | `employee@company.com` | `Employee@123` |

Quick login buttons are visible on the login page when `import.meta.env.DEV === true`.

## Environment Variables

### backend/.env
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
DB_NAME=training_tracker   # not used — app uses SQLite in dev (db.sqlite3)
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
VITE_API_BASE_URL=
```
Leave `VITE_API_BASE_URL` empty so Vite proxy handles all `/api` calls (fixes cookie SameSite issues).

## Do Not
- Never hardcode secrets — always use environment variables
- Never skip RBAC permission checks on any API view
- Never serve certificate files directly from `/media/` — always use the protected `/api/assignments/{id}/certificate/` endpoint
- Never trust role claims from the frontend — always enforce server-side
- Never assign same training to same employee if an active assignment (assigned/in_progress) already exists
- Never set `VITE_API_BASE_URL` to a remote URL — use Vite proxy instead
- Never hard-delete users — always soft-delete (`is_active = False`)
- Never allow a manager to edit/delete users outside their department — `_check_manager_scope` enforces this

## Permissions (backend/apps/accounts/permissions.py)
| Class | Roles allowed |
|---|---|
| `IsAdmin` | admin |
| `IsManager` | manager |
| `IsManagerOrAdmin` | admin, manager |
| `IsSupervisorOrAdmin` | admin, manager, supervisor |
| `IsOwnerOrSupervisorOrAdmin` | object-level: admin=all, manager=dept, supervisor=team, employee=own |

### UserViewSet permission matrix
| Action | Permission |
|--------|-----------|
| `list`, `retrieve`, `minimal`, `user_trainings` | `IsAuthenticated` |
| `create` | `IsSupervisorOrAdmin` |
| `update`, `partial_update`, `destroy` | `IsManagerOrAdmin` + scope check |
| all others | `IsAdmin` |

## API Overview
- `POST /api/auth/login/` — JWT login
- `GET /api/auth/me/` — current user profile
- `GET /api/auth/users/` — list users (role-filtered by queryset)
- `POST /api/auth/users/` — create user (IsSupervisorOrAdmin — scope enforced in serializer)
- `PATCH /api/auth/users/:id/` — update user (IsManagerOrAdmin — scope enforced in view)
- `DELETE /api/auth/users/:id/` — soft-deactivate user (IsManagerOrAdmin — scope enforced in view)
- `GET /api/auth/users/minimal/` — lightweight list for dropdowns (IsAuthenticated, role-scoped)
- `GET /api/auth/users/:id/trainings/` — user's assignments (IsAuthenticated)
- `GET /api/auth/departments/` — list departments
- `GET /api/trainings/` — training catalog
- `GET /api/assignments/` — assignments (role-filtered)
- `POST /api/assignments/bulk/` — bulk assign (scoped to role boundaries)
- `GET /api/reports/summary/` — KPI data (scoped)
- `GET /api/notifications/` — in-app notifications

## Training Categories (16 total)
`safety` | `health` | `fire_safety` | `hazmat` | `emergency` | `electrical` | `environmental` |
`machinery` | `materials_handling` | `housekeeping` | `compliance` | `technical` | `soft_skills` | `hr` | `leadership` | `other`

## Frontend Pages
| Path | Page | Roles |
|------|------|-------|
| `/login` | Login (+ quick login dev buttons) | public |
| `/forgot-password` | Forgot Password | public |
| `/admin/dashboard` | Admin Dashboard | admin |
| `/admin/departments` | Departments Management | admin |
| `/admin/employees` | Employees List | admin |
| `/admin/employees/:id` | Employee Detail | admin |
| `/admin/trainings` | Trainings Catalog | admin |
| `/admin/trainings/:id` | Training Detail | admin |
| `/admin/assign` | Assign Training (4-step wizard page) | admin |
| `/admin/reports` | Reports | admin |
| `/admin/settings` | Settings | admin |
| `/manager/dashboard` | Manager Dashboard | manager |
| `/manager/supervisors` | Supervisors List + Add/Edit/Deactivate Supervisor | manager |
| `/manager/team` | All Dept Employees (filterable by supervisor via `?supervisor=id`) | manager |
| `/manager/team/:id` | Employee Detail | manager |
| `/manager/assign` | Assign Training (4-step wizard page) | manager |
| `/supervisor/dashboard` | Supervisor Dashboard | supervisor |
| `/supervisor/team` | Team List + Add Employee | supervisor |
| `/supervisor/team/:id` | Team Member Detail | supervisor |
| `/supervisor/assign` | Assign Training (4-step wizard page) | supervisor |
| `/employee/dashboard` | Employee Dashboard | employee |
| `/employee/my-trainings` | My Trainings | employee |
| `/notifications` | Notifications | all |
| `/certificates/:assignmentId` | Certificate View | all |

## Shared Components
| Component | Purpose |
|-----------|---------|
| `AssignTrainingDialog` | 4-step assign wizard as popup dialog (used by manager+supervisor from team pages) |
| `CreateTrainingDialog` | Create new training with autocomplete from PREDEFINED_TRAININGS |
| `AssignTrainingPage` | Same wizard as full page (used via sidebar "Assign Training" link for all roles) |
| `AddEmployeeDialogManager` | Manager adds employee (supervisor optional) |
| `AddSupervisorDialog` | Manager adds supervisor |
| `EditSupervisorDialog` | Manager edits supervisor (name, email, job title, phone) |

## Frontend Stack Details
- **Styling**: Tailwind CSS v3 + MUI v5 (Tailwind for layout/shell/new components, MUI for complex widgets)
- **Design tokens**: Untitled UI-inspired — Inter font, brand-600 primary, gray-900 text, gray-50 bg, rounded-lg, shadow-sm
- **CSS utility classes** (defined in `src/index.css`):
  - Buttons: `btn btn-primary`, `btn-secondary`, `btn-destructive`, `btn-ghost`, `btn-sm`, `btn-lg`
  - Cards: `card`
  - Inputs: `input`, `input-label`
  - Badges: `badge badge-gray/blue/green/yellow/red`
  - Tables: `table-header`, `table-cell`, `table-row`
- **Icons**: `@untitled-ui/icons-react` (free) + MUI Icons
- **State**: React Query (server state, `staleTime: 0` on employee/training lists), react-hook-form (forms)
- **Notifications**: notistack

## Key Files
| File | Purpose |
|------|---------|
| `backend/apps/accounts/models.py` | User + Department models |
| `backend/apps/accounts/permissions.py` | All permission classes |
| `backend/apps/accounts/serializers.py` | User/Dept serializers + create validation (role-scoped) |
| `backend/apps/accounts/views.py` | UserViewSet with role-scoped queryset, scope-checked update/destroy |
| `backend/apps/trainings/views.py` | Training + Assignment views, bulk_assign scoped by role |
| `backend/apps/reports/views.py` | Report views (all scoped by role) |
| `backend/apps/common/pagination.py` | StandardPagination (page_size=20, max=500) |
| `frontend/src/context/AuthContext.jsx` | Auth state: user, isAdmin, isManager, isSupervisor, isEmployee |
| `frontend/src/router/AppRouter.jsx` | All routes + role guards |
| `frontend/src/components/common/AppSidebar.jsx` | Role-based nav (admin/manager/supervisor/employee) |
| `frontend/src/components/common/AssignTrainingDialog.jsx` | Reusable 4-step assign dialog |
| `frontend/src/components/common/CreateTrainingDialog.jsx` | Reusable create training dialog |
| `frontend/src/utils/statusUtils.js` | ROLE_LABELS, CATEGORY_LABELS, STATUS_CONFIG, PREDEFINED_TRAININGS |
| `frontend/src/api/employees.api.js` | getUsers, createUser, updateUser, deleteUser, getUsersMinimal, etc. |
| `frontend/tailwind.config.js` | Tailwind config with Untitled UI color tokens |
| `frontend/src/index.css` | Tailwind directives + utility component classes |
