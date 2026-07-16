import mysql.connector
from mysql.connector import pooling
import config

pool = pooling.MySQLConnectionPool(
    pool_name="sureserve_pool",
    pool_size=10,
    host=config.DB_HOST,
    user=config.DB_USER,
    password=config.DB_PASSWORD,
    database=config.DB_NAME,
)


def get_db():
    """Get a connection from the pool."""
    return pool.get_connection()


def query(sql, params=None, fetchone=False):
    """Execute a SELECT query and return results as list of dicts."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        rows = cursor.fetchone() if fetchone else cursor.fetchall()
        return rows
    finally:
        cursor.close()
        conn.close()


def execute(sql, params=None):
    """Execute an INSERT/UPDATE/DELETE and return lastrowid."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params or ())
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()
