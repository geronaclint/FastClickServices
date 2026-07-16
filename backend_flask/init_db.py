"""Initialize the database by running init.sql against MySQL."""

import mysql.connector
import config
import os


def init_db():
    conn = mysql.connector.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
    )
    cursor = conn.cursor()

    sql_path = os.path.join(os.path.dirname(__file__), "init.sql")
    with open(sql_path, "r", encoding="utf-8") as f:
        sql = f.read()

    for statement in sql.split(";"):
        statement = statement.strip()
        if statement:
            try:
                cursor.execute(statement)
            except mysql.connector.Error as e:
                print(f"Warning: {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized successfully from init.sql!")


if __name__ == "__main__":
    init_db()
