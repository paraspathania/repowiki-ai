import pytest
from app.modules.database_detection.extractor import (
    extract_sqlalchemy_models,
    extract_sql_ddl,
    extract_prisma_models,
    extract_database_schema,
)


def test_extract_sqlalchemy_models():
    content = """
import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=True)

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    total_amount: Mapped[float] = mapped_column()
"""
    tables = extract_sqlalchemy_models(content, "models.py")
    assert len(tables) == 2

    user_table = next(t for t in tables if t.name == "users")
    assert len(user_table.columns) == 3
    
    id_col = next(c for c in user_table.columns if c.name == "id")
    assert id_col.is_primary_key is True
    assert id_col.is_nullable is False
    assert id_col.data_type == "uuid"

    order_table = next(t for t in tables if t.name == "orders")
    fk_col = next(c for c in order_table.columns if c.name == "user_id")
    assert fk_col.is_foreign_key is True
    assert fk_col.references_table == "users"
    assert fk_col.references_column == "id"

    # Check relationship
    assert len(order_table.relationships) == 1
    rel = order_table.relationships[0]
    assert rel.to_table == "users"
    assert rel.to_column == "id"


def test_extract_sql_ddl():
    content = """
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL
);
"""
    tables = extract_sql_ddl(content, "schema.sql")
    assert len(tables) == 2

    cust_table = next(t for t in tables if t.name == "customers")
    id_col = next(c for c in cust_table.columns if c.name == "id")
    assert id_col.is_primary_key is True
    assert id_col.data_type == "integer"

    inv_table = next(t for t in tables if t.name == "invoices")
    fk_col = next(c for c in inv_table.columns if c.name == "customer_id")
    assert fk_col.is_foreign_key is True
    assert fk_col.references_table == "customers"
    assert fk_col.references_column == "id"


def test_extract_prisma_models():
    content = """
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}
"""
    tables = extract_prisma_models(content, "schema.prisma")
    assert len(tables) == 1

    art_table = tables[0]
    assert art_table.name == "article"
    
    id_col = next(c for c in art_table.columns if c.name == "id")
    assert id_col.is_primary_key is True
    assert id_col.data_type == "integer"

    assert len(art_table.relationships) == 1
    rel = art_table.relationships[0]
    assert rel.from_column == "authorId"
    assert rel.to_column == "id"


def test_extract_database_schema_multi_file():
    files = [
        ("app/models.py", """
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
class Base(DeclarativeBase): pass
class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
"""),
        ("migrations/init.sql", """
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    msg TEXT
);
""")
    ]
    tables = extract_database_schema(files)
    table_names = [t.name for t in tables]
    assert "items" in table_names
    assert "logs" in table_names
