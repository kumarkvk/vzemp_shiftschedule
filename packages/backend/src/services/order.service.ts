import { NotFoundError, ValidationAppError } from '../errors/AppError';
import type { AdminOrderListQuery, CreateOrderInput, OrderListQuery } from '../types/api';
import type { Database, Queryable } from '../types/database';
import type { OrderService } from '../types/services';
import { mapOrder, mapOrderItem, mapPayment, toNumber } from '../utils/mappers';
import { buildPagination } from '../utils/pagination';

interface OrderHeaderRow {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'paid' | 'completed' | 'cancelled';
  total_amount: string | number;
  shipping_address: CreateOrderInput['shippingAddress'];
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemDetailRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string | number;
  created_at: Date;
  product_name: string | null;
  product_description: string | null;
  product_category_id: string | null;
  product_inventory: number | null;
  product_image_url: string | null;
  product_sku: string | null;
  product_is_active: boolean | null;
  product_created_at: Date | null;
  product_updated_at: Date | null;
  category_name: string | null;
  category_description: string | null;
  category_image_url: string | null;
  category_created_at: Date | null;
  category_updated_at: Date | null;
}

interface PaymentRow {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string | null;
  amount: string | number;
  status: 'pending' | 'requires_confirmation' | 'succeeded' | 'failed' | 'cancelled';
  failure_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CartOrderRow {
  product_id: string;
  quantity: number;
  price: string | number;
  inventory: number;
}

export class DefaultOrderService implements OrderService {
  public constructor(private readonly database: Database) {}

  public async listUserOrders(userId: string, query: OrderListQuery) {
    return this.listOrders({ ...query, userId });
  }

  public async createOrder(userId: string, input: CreateOrderInput) {
    const orderId = await this.database.transaction(async (client) => {
      const cartItems = await client.query<CartOrderRow>(
        'SELECT ci.product_id, ci.quantity, p.price, p.inventory FROM cart_items ci INNER JOIN products p ON p.id = ci.product_id WHERE ci.user_id = $1 AND p.deleted_at IS NULL FOR UPDATE OF p',
        [userId],
      );

      if (cartItems.rowCount === 0) {
        throw new ValidationAppError('Cart is empty');
      }

      for (const item of cartItems.rows) {
        if (item.quantity > item.inventory) {
          throw new ValidationAppError('One or more cart items exceed available inventory');
        }
      }

      const totalAmount = cartItems.rows.reduce((sum, item) => sum + item.quantity * toNumber(item.price), 0);
      const orderResult = await client.query<{ id: string }>(
        "INSERT INTO orders (user_id, status, total_amount, shipping_address, notes) VALUES ($1, 'pending', $2, $3::jsonb, $4) RETURNING id",
        [userId, totalAmount, JSON.stringify(input.shippingAddress), input.notes ?? null],
      );
      const createdOrderId = orderResult.rows[0].id;

      for (const item of cartItems.rows) {
        await client.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [createdOrderId, item.product_id, item.quantity, item.price]);
        await client.query('UPDATE products SET inventory = inventory - $1, updated_at = NOW() WHERE id = $2', [item.quantity, item.product_id]);
      }

      await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
      return createdOrderId;
    });

    return this.getOrderById(orderId, userId, true);
  }

  public async getOrderById(orderId: string, userId: string, isAdmin = false) {
    const orderRow = await this.loadOrderHeader(this.database, orderId, userId, isAdmin);
    return this.assembleOrder(this.database, orderRow);
  }

  public async updateOrderStatus(orderId: string, status: OrderHeaderRow['status']) {
    const updateResult = await this.database.query<{ id: string }>('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id', [status, orderId]);
    if (updateResult.rowCount === 0) {
      throw new NotFoundError('Order not found');
    }
    return this.getOrderById(orderId, 'admin-system', true);
  }

  public async listAllOrders(query: AdminOrderListQuery) {
    return this.listOrders(query);
  }

  private async listOrders(query: OrderListQuery & { userId?: string; status?: OrderHeaderRow['status'] }) {
    const whereClauses = ['deleted_at IS NULL'];
    const values: unknown[] = [];
    if (query.userId) {
      values.push(query.userId);
      whereClauses.push(`user_id = $${values.length}`);
    }
    if (query.status) {
      values.push(query.status);
      whereClauses.push(`status = $${values.length}`);
    }
    const whereSql = whereClauses.join(' AND ');
    const totalResult = await this.database.query<{ total: string }>(`SELECT COUNT(*) AS total FROM orders WHERE ${whereSql}`, values);
    const offset = (query.page - 1) * query.limit;
    values.push(query.limit, offset);
    const orders = await this.database.query<OrderHeaderRow>(
      `SELECT id, user_id, status, total_amount, shipping_address, notes, created_at, updated_at FROM orders WHERE ${whereSql} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    return { items: await Promise.all(orders.rows.map((row) => this.assembleOrder(this.database, row))), pagination: buildPagination(query.page, query.limit, Number(totalResult.rows[0]?.total ?? 0)) };
  }

  private async loadOrderHeader(client: Queryable, orderId: string, userId: string, isAdmin: boolean): Promise<OrderHeaderRow> {
    const values: unknown[] = [orderId];
    const accessClause = isAdmin ? '' : ' AND user_id = $2';
    if (!isAdmin) {
      values.push(userId);
    }
    const result = await client.query<OrderHeaderRow>(`SELECT id, user_id, status, total_amount, shipping_address, notes, created_at, updated_at FROM orders WHERE id = $1 AND deleted_at IS NULL${accessClause}`, values);
    if (result.rowCount === 0) {
      throw new NotFoundError('Order not found');
    }
    return result.rows[0];
  }

  private async assembleOrder(client: Queryable, orderRow: OrderHeaderRow) {
    const itemsResult = await client.query<OrderItemDetailRow>(
      'SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.created_at, p.name AS product_name, p.description AS product_description, p.category_id AS product_category_id, p.inventory AS product_inventory, p.image_url AS product_image_url, p.sku AS product_sku, p.is_active AS product_is_active, p.created_at AS product_created_at, p.updated_at AS product_updated_at, c.name AS category_name, c.description AS category_description, c.image_url AS category_image_url, c.created_at AS category_created_at, c.updated_at AS category_updated_at FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id LEFT JOIN categories c ON c.id = p.category_id WHERE oi.order_id = $1 ORDER BY oi.created_at ASC',
      [orderRow.id],
    );
    const paymentResult = await client.query<PaymentRow>('SELECT id, order_id, stripe_payment_intent_id, amount, status, failure_reason, created_at, updated_at FROM payments WHERE order_id = $1', [orderRow.id]);
    return mapOrder(orderRow, itemsResult.rows.map(mapOrderItem), paymentResult.rowCount > 0 ? mapPayment(paymentResult.rows[0]) : null);
  }
}
