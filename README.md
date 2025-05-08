# Overview

This project is a Next.js application designed for managing service agreements, plans, systems, and user lists. It includes a robust backend powered by Drizzle ORM and a PostgreSQL database. The application is structured to support modular development and scalability.

# Key Features

- **Service Agreement Management**: Create, revise, and manage service agreements.
- **Plan Management**: Add, update, and delete company plans.
- **System Management**: Manage systems and their associated services.
- **User List Management**: Handle user lists and their items.
- **Authentication**: Secure login and logout functionality for users.
- **Database Migrations**: Manage schema changes using Drizzle ORM.

# Setup

1. Install dependencies:
    ```bash
    npm install
    ```
2. Set up the database by running migrations:
    ```bash
    npm run db:migrate
    ```
3. Seed the database:
    ```bash
    npm run db:seed
    ```
4. Set up PostgreSQL permissions for the `servagre` user. Connect to your PostgreSQL database and run the following commands:

```bash
DO $$
BEGIN
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %I', 'servagre');
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %I', 'servagre');
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO %I', 'servagre');
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO %I', 'servagre');
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO %I', 'servagre');
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO %I', 'servagre');
END $$;
```

5. Start the development server:
    ```bash
    npm run dev
    ```
