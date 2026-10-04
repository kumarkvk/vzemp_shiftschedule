DROP TRIGGER IF EXISTS set_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS set_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS set_users_updated_at ON users;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

DROP FUNCTION IF EXISTS set_updated_at_timestamp;

DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS user_role;
