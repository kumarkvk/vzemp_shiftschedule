import type { PaymentStatus, ShippingAddress, UserRole } from '../../types/entities';

export interface CategoryFixture {
  name: string;
  description: string;
  imageUrl: string;
}

export interface ProductFixture {
  name: string;
  description: string;
  price: string;
  categoryName: string;
  inventory: number;
  imageUrl: string;
  sku: string;
  isActive: boolean;
}

export interface UserFixture {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

export interface OrderFixture {
  email: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingAddress: ShippingAddress;
  notes?: string;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string | null;
  failureReason?: string | null;
  lines: Array<{ sku: string; quantity: number }>;
}

const shippingAddress = (fullName: string, line1: string, city: string, state: string, postalCode: string): ShippingAddress => ({
  fullName,
  line1,
  city,
  state,
  postalCode,
  country: 'US',
  phone: '+1-555-0110'
});

export const categoryFixtures: CategoryFixture[] = [
  { name: 'Electronics', description: 'Connected devices, smart accessories, and modern gadgets for home and work.', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
  { name: 'Clothing', description: 'Everyday apparel with premium materials and comfortable fits.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
  { name: 'Books', description: 'Bestselling fiction, business guides, and technical references.', imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f' },
  { name: 'Home', description: 'Functional home goods that balance utility, comfort, and style.', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85' },
  { name: 'Sports', description: 'Training gear and accessories for running, recovery, and team sports.', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b' }
];

export const productFixtures: ProductFixture[] = [
  { name: 'Noise Cancelling Headphones', description: 'Over-ear wireless headphones with 30-hour battery life and adaptive noise control.', price: '199.99', categoryName: 'Electronics', inventory: 48, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', sku: 'ELEC-HEADPHONE-001', isActive: true },
  { name: '4K Webcam', description: 'Ultra HD webcam with autofocus, dual microphones, and privacy shutter.', price: '129.99', categoryName: 'Electronics', inventory: 32, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', sku: 'ELEC-WEBCAM-002', isActive: true },
  { name: 'Mechanical Keyboard', description: 'Compact mechanical keyboard with hot-swappable switches and RGB backlight.', price: '149.00', categoryName: 'Electronics', inventory: 27, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', sku: 'ELEC-KEYBOARD-003', isActive: true },
  { name: 'Portable SSD 1TB', description: 'High-speed external solid-state drive with USB-C connectivity and metal enclosure.', price: '109.50', categoryName: 'Electronics', inventory: 41, imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', sku: 'ELEC-SSD-004', isActive: true },
  { name: 'Everyday Hoodie', description: 'Mid-weight fleece hoodie with brushed interior and relaxed fit.', price: '64.95', categoryName: 'Clothing', inventory: 60, imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2', sku: 'CLOTH-HOODIE-005', isActive: true },
  { name: 'Performance Joggers', description: 'Stretch joggers designed for travel, workouts, and all-day comfort.', price: '58.00', categoryName: 'Clothing', inventory: 74, imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', sku: 'CLOTH-JOGGER-006', isActive: true },
  { name: 'Classic Denim Jacket', description: 'Structured denim jacket with soft lining and durable wash finish.', price: '89.99', categoryName: 'Clothing', inventory: 28, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d', sku: 'CLOTH-JACKET-007', isActive: true },
  { name: 'Merino Crew Socks', description: 'Breathable merino wool socks in a three-pack for daily wear.', price: '24.50', categoryName: 'Clothing', inventory: 92, imageUrl: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82', sku: 'CLOTH-SOCK-008', isActive: true },
  { name: 'Modern JavaScript Patterns', description: 'Practical guide to scalable frontend architecture and component design.', price: '39.95', categoryName: 'Books', inventory: 35, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794', sku: 'BOOK-JS-009', isActive: true },
  { name: 'Product Strategy Handbook', description: 'Frameworks for product discovery, roadmapping, and customer research.', price: '31.00', categoryName: 'Books', inventory: 24, imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d', sku: 'BOOK-STRATEGY-010', isActive: true },
  { name: 'Mindful Leadership', description: 'Insights on building resilient teams and calm decision-making habits.', price: '22.99', categoryName: 'Books', inventory: 40, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', sku: 'BOOK-LEADERSHIP-011', isActive: true },
  { name: 'Healthy Weeknight Cooking', description: 'Fast recipe collection with ingredient prep tips for busy households.', price: '27.50', categoryName: 'Books', inventory: 29, imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353', sku: 'BOOK-COOKING-012', isActive: true },
  { name: 'Ceramic Dinnerware Set', description: 'Twelve-piece matte ceramic dinnerware set suitable for daily use.', price: '89.00', categoryName: 'Home', inventory: 18, imageUrl: 'https://images.unsplash.com/photo-1616627458709-8c9dbbe4cb6a', sku: 'HOME-DINNER-013', isActive: true },
  { name: 'Weighted Throw Blanket', description: 'Soft weighted blanket designed for relaxation and better sleep quality.', price: '79.95', categoryName: 'Home', inventory: 21, imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', sku: 'HOME-BLANKET-014', isActive: true },
  { name: 'Aroma Diffuser', description: 'Ultrasonic diffuser with timer modes, warm light, and whisper-quiet operation.', price: '45.25', categoryName: 'Home', inventory: 46, imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86', sku: 'HOME-DIFFUSER-015', isActive: true },
  { name: 'Standing Desk Lamp', description: 'LED task lamp with adjustable color temperature and wireless charging base.', price: '69.99', categoryName: 'Home', inventory: 33, imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f', sku: 'HOME-LAMP-016', isActive: true },
  { name: 'Training Resistance Bands', description: 'Set of five resistance bands with handles, anchors, and travel pouch.', price: '34.99', categoryName: 'Sports', inventory: 64, imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', sku: 'SPORT-BANDS-017', isActive: true },
  { name: 'Trail Running Shoes', description: 'All-terrain running shoes with cushioned midsole and grippy outsole.', price: '139.00', categoryName: 'Sports', inventory: 26, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', sku: 'SPORT-SHOE-018', isActive: true },
  { name: 'Insulated Water Bottle', description: 'Stainless steel bottle that keeps drinks cold for 24 hours.', price: '28.75', categoryName: 'Sports', inventory: 85, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8', sku: 'SPORT-BOTTLE-019', isActive: true },
  { name: 'Yoga Mat Pro', description: 'Non-slip yoga mat with alignment markers and high-density cushioning.', price: '72.40', categoryName: 'Sports', inventory: 31, imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a', sku: 'SPORT-YOGA-020', isActive: true }
];

export const userFixtures: UserFixture[] = [
  { email: 'user@example.com', password: 'Password123!', firstName: 'Taylor', lastName: 'Jordan', phone: '+1-555-0100', role: 'user', isActive: true },
  { email: 'admin@example.com', password: 'AdminPassword123!', firstName: 'Morgan', lastName: 'Reed', phone: '+1-555-0101', role: 'admin', isActive: true },
  { email: 'guest@example.com', password: 'GuestPassword123!', firstName: 'Casey', lastName: 'Blair', phone: '+1-555-0102', role: 'user', isActive: true }
];

export const orderFixtures: OrderFixture[] = [
  { email: 'user@example.com', status: 'completed', shippingAddress: shippingAddress('Taylor Jordan', '123 Market Street', 'Seattle', 'WA', '98101'), notes: 'Leave package at the front desk.', paymentStatus: 'succeeded', stripePaymentIntentId: 'pi_demo_user_001', lines: [{ sku: 'ELEC-HEADPHONE-001', quantity: 1 }, { sku: 'SPORT-BOTTLE-019', quantity: 2 }] },
  { email: 'admin@example.com', status: 'processing', shippingAddress: shippingAddress('Morgan Reed', '450 Pine Avenue', 'Seattle', 'WA', '98104'), notes: 'Bundle with office supplies order.', paymentStatus: 'pending', stripePaymentIntentId: 'pi_demo_admin_002', lines: [{ sku: 'HOME-LAMP-016', quantity: 1 }, { sku: 'BOOK-STRATEGY-010', quantity: 1 }, { sku: 'ELEC-WEBCAM-002', quantity: 1 }] },
  { email: 'guest@example.com', status: 'cancelled', shippingAddress: shippingAddress('Casey Blair', '890 Lake View', 'Portland', 'OR', '97204'), notes: 'Customer requested cancellation before shipment.', paymentStatus: 'failed', stripePaymentIntentId: 'pi_demo_guest_003', failureReason: 'Payment authorization expired before capture.', lines: [{ sku: 'SPORT-SHOE-018', quantity: 1 }] }
];
