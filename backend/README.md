FastAPI backend for GenBI Platform - Text-to-SQL, Text-to-Charts and AI-generated insights platform.

## Features

- **Authentication**: JWT-based authentication
- **Database Management**: Connect to PostgreSQL, MySQL, SQLite
- **Text-to-SQL**: Convert natural language to SQL using GPT-4
- **AI Insights**: Generate business insights from query results
- **Chart Generation**: Auto-generate Plotly chart configurations
- **Schema Management**: Table modeling and relationships

## Quick Start

### Using Docker (Recommended)

1. Clone the repository
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your-key-here
   ```

4. Start the services:
   ```bash
   make run
   ```

5. Create admin user:
   ```bash
   make create-admin
   ```

6. Access the API at: http://localhost:8000

### Manual Installation

1. Install dependencies:
   ```bash
   make install
   ```

2. Start PostgreSQL and update DATABASE_URL in `.env`

3. Run migrations:
   ```bash
   make migrate
   ```

4. Create admin user:
   ```bash
   make create-admin
   ```

5. Start development server:
   ```bash
   make dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Database Connections
- `POST /api/connections/` - Create database connection
- `GET /api/connections/` - List user connections
- `PUT /api/connections/{id}` - Update connection
- `DELETE /api/connections/{id}` - Delete connection
- `GET /api/connections/{id}/tables` - Get available tables
- `POST /api/connections/{id}/tables` - Select tables for modeling

### Queries
- `POST /api/queries/` - Execute natural language query
- `GET /api/queries/` - Get query history
- `GET /api/queries/stats` - Get user statistics

### Table Modeling
- `POST /api/tables/{connection_id}/models` - Create table model
- `GET /api/tables/{connection_id}/models` - List table models
- `POST /api/tables/relationships` - Create table relationship
- `POST /api/tables/calculated-fields` - Create calculated field

## Database Schema

### Users
- Authentication and user management
- One database connection per user limit

### Database Connections
- Store connection details for user databases
- Support PostgreSQL, MySQL, SQLite
- Connection testing and validation

### Table Models
- User-defined table models and relationships
- Calculated fields support
- Schema introspection

### Queries
- Query history and performance metrics
- AI-generated insights and chart configs
- Success/failure tracking

## Development

### Creating Migrations
```bash
make create-migration MESSAGE="Add new table"
```

### Running Tests
```bash
make test
```

### Viewing Logs
```bash
make logs      # Backend logs
make db-logs   # Database logs
```

### Accessing Container Shell
```bash
make shell
```

## Configuration

Key environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - GPT model to use (default: gpt-4)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - JWT expiration

## Security Considerations

1. Change default SECRET_KEY in production
2. Use strong passwords for database
3. Enable SSL for database connections
4. Implement rate limiting for API endpoints
5. Encrypt database passwords in storage
6. Use HTTPS in production

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure firewall allows connections

### OpenAI API Issues
- Verify API key is valid
- Check OpenAI usage limits
- Monitor API response times

### Performance Optimization
- Add database indexes for frequently queried columns
- Implement query result caching
- Use connection pooling
- Monitor memory usage

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License

MIT License