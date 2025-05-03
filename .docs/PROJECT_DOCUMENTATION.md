# Project Documentation

## Project Structure

The project is organized as follows:

- **`src/`**: Contains the main application code.

    - **`actions/`**: Server-side actions for CRUD operations.
    - **`app/`**: Next.js application pages and components.
    - **`components/`**: Reusable UI components.
    - **`core/`**: Core business logic and domain models.
    - **`db/`**: Database schema, migrations, and seed data.
    - **`hooks/`**: Custom React hooks.
    - **`lib/`**: Utility functions and shared logic.
    - **`zod-schemas/`**: Zod schemas for data validation.

- **`public/`**: Static assets like images and icons.
- **`vendor/`**: External dependencies.

## Features

The project provides the following key functionalities:

### Authentication

- Secure login and logout functionality for users.
- Session management to ensure secure access to resources.
- Integration with middleware for route protection and user role validation.

### Service Agreement Management

- Create, revise, and manage service agreements.
- Support for agreement revisions with detailed tracking of changes.
- Integration with plans and services for comprehensive agreement management.

### Plan Management

- Add, update, and delete company plans.
- Manage plan details such as codes, descriptions, and associated financial data.

### System Management

- Manage systems and their associated services.
- Link systems to services for better organization and tracking.

### User List Management

- Create and manage user lists for services.
- Add, update, and delete user list items with detailed metadata.

### Database Management

- Schema migrations and seeding using Drizzle ORM.
- Database studio for exploring and managing data.

### Testing and Validation

- Comprehensive testing setup using Jest.
- Data validation using Zod schemas to ensure consistency and reliability.

### Deployment

- Configured for deployment on Vercel with optimized build settings.
- Easy integration with CI/CD pipelines for automated deployments.

## Development

### Prerequisites

- Node.js
- PostgreSQL

### Database Commands

The following commands are available for managing the database:

- **`npm run db:studio`**: Opens the Drizzle ORM studio for database exploration.
- **`npm run db:generate`**: Generates Drizzle ORM schema files.
- **`npm run db:push`**: Pushes schema changes to the database.
- **`npm run db:migrate`**: Runs database migrations using the `migrate.ts` script.
- **`npm run db:seed`**: Seeds the database using the `seed.ts` script.

### Testing

Run tests using Jest:

```bash
npm test
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)
