"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create database_connections table
    op.create_table('database_connections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('db_type', sa.String(), nullable=False),
        sa.Column('host', sa.String(), nullable=False),
        sa.Column('port', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('database_name', sa.String(), nullable=False),
        sa.Column('ssl_enabled', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('connection_status', sa.String(), nullable=True),
        sa.Column('last_tested', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_database_connections_id'), 'database_connections', ['id'], unique=False)

    # Create selected_tables table
    op.create_table('selected_tables',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('connection_id', sa.Integer(), nullable=False),
        sa.Column('schema_name', sa.String(), nullable=True),
        sa.Column('table_name', sa.String(), nullable=False),
        sa.Column('is_selected', sa.Boolean(), nullable=True),
        sa.Column('columns_info', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['connection_id'], ['database_connections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create table_models table
    op.create_table('table_models',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('connection_id', sa.Integer(), nullable=False),
        sa.Column('table_name', sa.String(), nullable=False),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('primary_key_columns', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['connection_id'], ['database_connections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

# Create queries table
    op.create_table('queries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('connection_id', sa.Integer(), nullable=True),
        sa.Column('natural_language_query', sa.Text(), nullable=False),
        sa.Column('generated_sql', sa.Text(), nullable=True),
        sa.Column('execution_result', sa.JSON(), nullable=True),
        sa.Column('ai_insights', sa.Text(), nullable=True),
        sa.Column('chart_config', sa.JSON(), nullable=True),
        sa.Column('execution_time_ms', sa.Float(), nullable=True),
        sa.Column('is_successful', sa.Boolean(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['connection_id'], ['database_connections.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create table_relationships table
    op.create_table('table_relationships',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('from_table_id', sa.Integer(), nullable=False),
        sa.Column('to_table_id', sa.Integer(), nullable=False),
        sa.Column('from_column', sa.String(), nullable=False),
        sa.Column('to_column', sa.String(), nullable=False),
        sa.Column('relationship_type', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['from_table_id'], ['table_models.id'], ),
        sa.ForeignKeyConstraint(['to_table_id'], ['table_models.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create calculated_fields table
    op.create_table('calculated_fields',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('table_model_id', sa.Integer(), nullable=False),
        sa.Column('field_name', sa.String(), nullable=False),
        sa.Column('expression', sa.Text(), nullable=False),
        sa.Column('data_type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['table_model_id'], ['table_models.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('calculated_fields')
    op.drop_table('table_relationships')
    op.drop_table('queries')
    op.drop_table('table_models')
    op.drop_table('selected_tables')
    op.drop_index(op.f('ix_database_connections_id'), table_name='database_connections')
    op.drop_table('database_connections')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')