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
4. Start the development server:
    ```bash
    npm run dev
    ```
