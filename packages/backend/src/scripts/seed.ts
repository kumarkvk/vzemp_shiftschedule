import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { hashPassword } from '../utils/password';

const database = getDatabase();

export const seedDatabase = async (): Promise<void> => {
  const passwordHash = await hashPassword('Password123!');

  await database.transaction(async (client) => {
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM users');

    const categoryRows = await client.query<{ id: string; name: string }>(
      "INSERT INTO categories (name, description, image_url) VALUES ('Electronics', 'Devices and gadgets', 'https://example.com/electronics.jpg'), ('Apparel', 'Fashion and clothing', 'https://example.com/apparel.jpg'), ('Home', 'Home essentials', 'https://example.com/home.jpg'), ('Fitness', 'Workout accessories', 'https://example.com/fitness.jpg'), ('Books', 'Learning resources', 'https://example.com/books.jpg') RETURNING id, name",
    );
    const categoryMap = new Map(categoryRows.rows.map((row) => [row.name, row.id]));

    await client.query(
      'INSERT INTO products (name, description, price, category_id, inventory, image_url, sku, is_active) VALUES ($1, $2, 199.99, $3, 25, $4, $5, TRUE), ($6, $7, 349.00, $3, 12, $8, $9, TRUE), ($10, $11, 59.50, $12, 40, $13, $14, TRUE), ($15, $16, 35.00, $17, 60, $18, $19, TRUE), ($20, $21, 45.00, $22, 30, $23, $24, TRUE), ($25, $26, 29.99, $27, 100, $28, $29, TRUE)',
      ['Wireless Headphones', 'Noise-cancelling over-ear headphones', categoryMap.get('Electronics'), 'https://example.com/headphones.jpg', 'ELEC-001', '4K Monitor', '27 inch productivity monitor', 'https://example.com/monitor.jpg', 'ELEC-002', 'Cotton Hoodie', 'Comfortable everyday hoodie', categoryMap.get('Apparel'), 'https://example.com/hoodie.jpg', 'APP-001', 'Yoga Mat', 'Non-slip yoga mat', categoryMap.get('Fitness'), 'https://example.com/yoga-mat.jpg', 'FIT-001', 'Desk Lamp', 'Dimmable LED desk lamp', categoryMap.get('Home'), 'https://example.com/lamp.jpg', 'HOME-001', 'TypeScript Handbook', 'Advanced TypeScript reference', categoryMap.get('Books'), 'https://example.com/typescript-book.jpg', 'BOOK-001'],
    );

    const userRows = await client.query<{ id: string; email: string }>(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6), ($7, $2, $8, $9, $10, $11), ($12, $2, $13, $14, $15, $16) RETURNING id, email',
      ['admin@example.com', passwordHash, 'Admin', 'User', '1112223333', 'admin', 'customer@example.com', 'Casey', 'Customer', '2223334444', 'user', 'shopper@example.com', 'Sam', 'Shopper', '3334445555', 'user'],
    );
    const userMap = new Map(userRows.rows.map((row) => [row.email, row.id]));

    const headphone = await client.query<{ id: string; price: string }>('SELECT id, price FROM products WHERE sku = $1', ['ELEC-001']);
    const hoodie = await client.query<{ id: string; price: string }>('SELECT id, price FROM products WHERE sku = $1', ['APP-001']);

    await client.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, 1), ($1, $3, 2)', [userMap.get('customer@example.com'), headphone.rows[0].id, hoodie.rows[0].id]);

    const total = Number(headphone.rows[0].price) + Number(hoodie.rows[0].price) * 2;
    const orderRows = await client.query<{ id: string }>(
      "INSERT INTO orders (user_id, status, total_amount, shipping_address, notes) VALUES ($1, 'paid', $2, $3::jsonb, 'Seeded sample order') RETURNING id",
      [userMap.get('shopper@example.com'), total, JSON.stringify({ street: '123 Demo Street', city: 'Seattle', state: 'WA', zip: '98101', country: 'US' })],
    );

    await client.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, 1, $3), ($1, $4, 2, $5)', [orderRows.rows[0].id, headphone.rows[0].id, Number(headphone.rows[0].price), hoodie.rows[0].id, Number(hoodie.rows[0].price)]);
    await client.query('INSERT INTO payments (order_id, stripe_payment_intent_id, amount, status) VALUES ($1, $2, $3, $4)', [orderRows.rows[0].id, 'pi_seeded_sample', total, 'succeeded']);
  });
};

export const runSeed = async (): Promise<void> => {
  try {
    await seedDatabase();
    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Database seed failed', { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  } finally {
    await database.close();
  }
};

if (require.main === module) {
  void runSeed();
}
