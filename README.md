# GenBI Platform

AI-powered data analytics platform with natural language querying, automatic visualizations, and intelligent insights.

## 🚀 Features

- **Natural Language Queries**: Ask questions in plain English and get SQL generated automatically
- **Multiple Database Support**: Connect to PostgreSQL, MySQL, SQLite
- **AI-Powered Insights**: Get intelligent analysis and recommendations from your data
- **Auto Visualizations**: Generate beautiful charts and graphs instantly
- **Multi-language Support**: English, Russian, and Uzbek languages
- **Dark/Light Theme**: Customizable user interface
- **Real-time Analytics**: Live query execution and results

## 📁 Project Structure

```
genbi/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   ├── alembic/            # Database migrations
│   ├── scripts/            # Utility scripts
│   └── Dockerfile          # Backend Docker image
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend Docker image
├── docker-compose.yml      # Docker orchestration
├── Makefile               # Development commands
├── nginx.conf             # Nginx configuration
└── requirements.txt       # Python dependencies
```

## 🛠️ Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- OpenAI API key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd genbi

# Setup environment
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 2. Full Docker Setup (Recommended)

```bash
# Complete setup for new developers
make setup

# Or manually:
make build
make up
make migrate
make create-admin
```

### 3. Local Development Setup

```bash
# Install dependencies
make install

# Start database
docker-compose up db -d

# Start backend (in one terminal)
make dev-backend

# Start frontend (in another terminal)
make dev-frontend
```

## 🐳 Docker Commands

```bash
# Start all services
make up

# View logs
make logs
make backend-logs
make frontend-logs

# Access shells
make backend-shell
make db-shell

# Stop services
make down

# Clean up
make clean
```

## 🗄️ Database Management

```bash
# Run migrations
make migrate

# Create new migration
make migration MESSAGE="Add new table"

# Create admin user
make create-admin

# Backup database
make backup

# Restore database
make restore FILE=backup.sql
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5433

## 👤 Default Admin User

After running `make create-admin`:
- **Username**: admin
- **Password**: admin123

⚠️ **Change the password after first login!**

## 🔧 Development

### Backend Development

```bash
# Install Python dependencies
cd backend
pip install -r ../requirements.txt

# Run backend locally
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run tests
pytest tests/ -v

# Format code
black app/ --line-length 88
isort app/

# Lint code
flake8 app/
```

### Frontend Development

```bash
# Install Node dependencies
cd frontend
npm install

# Run frontend locally
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Database Schema

The platform uses PostgreSQL with the following main tables:

- **users**: User authentication and profiles
- **database_connections**: User database connections
- **queries**: Query history and results
- **table_models**: Table modeling and relationships
- **selected_tables**: User-selected tables for analysis

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Copy production environment
cp .env.example .env.prod

# Edit .env.prod with production values
# - Change SECRET_KEY
# - Set DEBUG=false
# - Configure SSL certificates
# - Set production database credentials

# Deploy with Nginx
make deploy-prod

# Or manually
docker-compose --profile production up -d --build
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `SECRET_KEY` | JWT secret key | `change-me-in-production` |
| `OPENAI_API_KEY` | OpenAI API key | `required` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `DEBUG` | Enable debug mode | `false` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:8000` |

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Database Connections
- `GET /api/connections/` - List connections
- `POST /api/connections/` - Create connection
- `PUT /api/connections/{id}` - Update connection
- `DELETE /api/connections/{id}` - Delete connection
- `GET /api/connections/{id}/tables` - Get available tables

### Queries
- `POST /api/queries/` - Execute natural language query
- `GET /api/queries/` - Get query history
- `GET /api/queries/stats` - Get user statistics

### Table Modeling
- `POST /api/tables/{connection_id}/models` - Create table model
- `GET /api/tables/{connection_id}/models` - List table models
- `POST /api/tables/relationships` - Create table relationship

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS protection
- Environment-based configuration
- SSL support for database connections

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test file
docker-compose exec backend pytest tests/test_auth.py -v

# Run with coverage
docker-compose exec backend pytest --cov=app tests/
```

## 📈 Monitoring and Logging

```bash
# View service health
make health

# Monitor logs in real-time
make logs

# Check specific service
make backend-logs
make frontend-logs
make db-logs
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   make db-logs
   
   # Restart database
   docker-compose restart db
   ```

2. **Frontend Not Loading**
   ```bash
   # Check frontend logs
   make frontend-logs
   
   # Rebuild frontend
   docker-compose build frontend
   ```

3. **OpenAI API Errors**
   - Verify your OpenAI API key in `.env`
   - Check API usage limits
   - Ensure correct model name

4. **Migration Issues**
   ```bash
   # Reset migrations (development only)
   docker-compose exec backend alembic downgrade base
   docker-compose exec backend alembic upgrade head
   ```

### Performance Optimization

1. **Database Indexing**
   - Add indexes for frequently queried columns
   - Monitor query performance

2. **Caching**
   - Implement Redis for query result caching
   - Cache OpenAI responses

3. **Connection Pooling**
   - Configure PostgreSQL connection pooling
   - Optimize database connection settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- **Python**: Follow PEP 8, use Black for formatting
- **JavaScript**: Follow ESLint rules, use Prettier
- **Commits**: Use conventional commit format

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Open an issue on GitHub
4. Contact the development team

## 🗺️ Roadmap

### Upcoming Features

- [ ] Advanced chart types (heatmaps, scatter plots)
- [ ] Real-time collaboration
- [ ] Data export functionality
- [ ] Custom dashboard creation
- [ ] Advanced SQL query builder
- [ ] Integration with more databases (MongoDB, ClickHouse)
- [ ] API rate limiting
- [ ] Advanced user permissions
- [ ] Query scheduling and alerts
- [ ] Mobile responsive design improvements

### Technical Improvements

- [ ] Implement Redis caching
- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and alerting
- [ ] Implement database connection pooling
- [ ] Add request/response compression
- [ ] Optimize bundle size
- [ ] Add progressive web app features

---

**Built with ❤️ using FastAPI, React, and OpenAI**