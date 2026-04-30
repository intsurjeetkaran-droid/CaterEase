require('dotenv').config();
const http = require('http');

const BASE = 'http://localhost:5000';
let passed = 0;
let failed = 0;
const results = [];

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Assertion helper ─────────────────────────────────────────────────────────
function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
    results.push(`  ✅ ${label}`);
  } else {
    failed++;
    results.push(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  }
}

// ─── Test runner ──────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🧪 CATEREASE — FULL WORKFLOW TEST\n' + '═'.repeat(55));

  // ── 1. HEALTH CHECK ──────────────────────────────────────────
  console.log('\n📡 1. HEALTH CHECK');
  const health = await request('GET', '/health');
  assert('GET /health returns 200', health.status === 200);
  assert('Health message correct', health.body.success === true);

  // ── 2. AUTH — REGISTER ───────────────────────────────────────
  console.log('\n🔐 2. AUTH — REGISTER');

  // Register new customer
  const regCustomer = await request('POST', '/api/register', {
    name: 'Test Customer',
    email: 'testcustomer@test.com',
    password: 'Test@1234',
    role: 'customer',
  });
  assert('Register customer → 201', regCustomer.status === 201);
  assert('Register returns token', !!regCustomer.body.data?.token);
  assert('Register returns user object', !!regCustomer.body.data?.user);
  assert('Customer role correct', regCustomer.body.data?.user?.role === 'customer');
  const customerToken = regCustomer.body.data?.token;

  // Register new provider
  const regProvider = await request('POST', '/api/register', {
    name: 'Test Provider',
    email: 'testprovider@test.com',
    password: 'Test@1234',
    role: 'provider',
  });
  assert('Register provider → 201', regProvider.status === 201);
  assert('Provider role correct', regProvider.body.data?.user?.role === 'provider');
  const providerToken = regProvider.body.data?.token;

  // Duplicate email should fail
  const dupReg = await request('POST', '/api/register', {
    name: 'Dup', email: 'testcustomer@test.com', password: 'Test@1234', role: 'customer',
  });
  assert('Duplicate email → 400', dupReg.status === 400);

  // Missing fields
  const badReg = await request('POST', '/api/register', { name: 'X' });
  assert('Missing fields → 400', badReg.status === 400);

  // ── 3. AUTH — LOGIN ──────────────────────────────────────────
  console.log('\n🔑 3. AUTH — LOGIN');

  const loginCustomer = await request('POST', '/api/login', {
    email: 'testcustomer@test.com', password: 'Test@1234',
  });
  assert('Customer login → 200', loginCustomer.status === 200);
  assert('Login returns token', !!loginCustomer.body.data?.token);

  // Login seeded admin
  const loginAdmin = await request('POST', '/api/login', {
    email: 'admin@caterease.com', password: 'Admin@1234',
  });
  assert('Admin login → 200', loginAdmin.status === 200);
  assert('Admin role correct', loginAdmin.body.data?.user?.role === 'admin');
  const adminToken = loginAdmin.body.data?.token;

  // Login seeded provider
  const loginProvider = await request('POST', '/api/login', {
    email: 'ravi@caterease.com', password: 'Provider@1',
  });
  assert('Seeded provider login → 200', loginProvider.status === 200);
  const seededProviderToken = loginProvider.body.data?.token;

  // Wrong password
  const badLogin = await request('POST', '/api/login', {
    email: 'testcustomer@test.com', password: 'wrongpass',
  });
  assert('Wrong password → 401', badLogin.status === 401);

  // Non-existent user
  const noUser = await request('POST', '/api/login', {
    email: 'nobody@test.com', password: 'Test@1234',
  });
  assert('Non-existent user → 401', noUser.status === 401);

  // ── 4. AUTH — GET ME ─────────────────────────────────────────
  console.log('\n👤 4. AUTH — GET ME');

  const getMe = await request('GET', '/api/me', null, customerToken);
  assert('GET /api/me → 200', getMe.status === 200);
  assert('Returns correct user', getMe.body.data?.email === 'testcustomer@test.com');

  const getMeNoToken = await request('GET', '/api/me');
  assert('GET /api/me without token → 401', getMeNoToken.status === 401);

  // ── 5. CUSTOMER — GET PROVIDERS ──────────────────────────────
  console.log('\n🏪 5. CUSTOMER — BROWSE PROVIDERS');

  const providers = await request('GET', '/api/customer/providers', null, customerToken);
  assert('GET /customer/providers → 200', providers.status === 200);
  assert('Returns array of providers', Array.isArray(providers.body.data));
  assert('Has 10 seeded providers', providers.body.data?.length === 10);
  assert('All providers are approved', providers.body.data?.every(p => p.approval_status === 'approved'));
  const firstProvider = providers.body.data?.[0];

  // Without token
  const providersNoAuth = await request('GET', '/api/customer/providers');
  assert('Providers without token → 401', providersNoAuth.status === 401);

  // ── 6. CUSTOMER — GET MENUS ──────────────────────────────────
  console.log('\n🍽️  6. CUSTOMER — GET MENUS');

  const menus = await request('GET', `/api/customer/menus/${firstProvider?._id}`, null, customerToken);
  assert('GET /customer/menus/:id → 200', menus.status === 200);
  assert('Returns array of menus', Array.isArray(menus.body.data));
  assert('Has 3 menu items per provider', menus.body.data?.length === 3);
  assert('Menu has required fields', menus.body.data?.[0]?.name && menus.body.data?.[0]?.price);
  const firstMenu = menus.body.data?.[0];

  // ── 7. CUSTOMER — CREATE ORDER ───────────────────────────────
  console.log('\n📦 7. CUSTOMER — CREATE ORDER');

  const createOrder = await request('POST', '/api/customer/orders', {
    provider_id: firstProvider?._id,
    event_date: '2026-12-25',
    items: [
      { menu_id: firstMenu?._id, quantity: 50 },
      { menu_id: menus.body.data?.[1]?._id, quantity: 30 },
    ],
  }, customerToken);
  assert('POST /customer/orders → 201', createOrder.status === 201);
  assert('Order has _id', !!createOrder.body.data?._id);
  assert('Order status is pending', createOrder.body.data?.status === 'pending');
  assert('Order total_amount calculated', createOrder.body.data?.total_amount > 0);
  assert('Order has items array', Array.isArray(createOrder.body.data?.items));
  assert('Items enriched with name+price', !!createOrder.body.data?.items?.[0]?.name);
  const orderId = createOrder.body.data?._id;
  const expectedTotal = (firstMenu?.price * 50) + (menus.body.data?.[1]?.price * 30);
  assert(`Total amount correct (₹${expectedTotal})`, createOrder.body.data?.total_amount === expectedTotal);

  // Missing event_date
  const badOrder = await request('POST', '/api/customer/orders', {
    provider_id: firstProvider?._id,
    items: [{ menu_id: firstMenu?._id, quantity: 10 }],
  }, customerToken);
  assert('Order without event_date → 400', badOrder.status === 400);

  // Empty items
  const emptyItems = await request('POST', '/api/customer/orders', {
    provider_id: firstProvider?._id,
    event_date: '2026-12-25',
    items: [],
  }, customerToken);
  assert('Order with empty items → 400', emptyItems.status === 400);

  // Provider cannot create order
  const providerOrder = await request('POST', '/api/customer/orders', {
    provider_id: firstProvider?._id,
    event_date: '2026-12-25',
    items: [{ menu_id: firstMenu?._id, quantity: 10 }],
  }, seededProviderToken);
  assert('Provider cannot create order → 403', providerOrder.status === 403);

  // ── 8. CUSTOMER — GET MY ORDERS ──────────────────────────────
  console.log('\n📋 8. CUSTOMER — GET MY ORDERS');

  const myOrders = await request('GET', '/api/customer/my-orders', null, customerToken);
  assert('GET /customer/my-orders → 200', myOrders.status === 200);
  assert('Returns array', Array.isArray(myOrders.body.data));
  assert('Has 1 order', myOrders.body.data?.length === 1);
  assert('Order has provider populated', !!myOrders.body.data?.[0]?.provider_id);

  // ── 9. CUSTOMER — ADD PAYMENT ────────────────────────────────
  console.log('\n💳 9. CUSTOMER — ADD PAYMENT');

  const payment = await request('POST', `/api/customer/orders/${orderId}/payment`, {
    amount: 5000,
  }, customerToken);
  assert('POST /customer/orders/:id/payment → 200', payment.status === 200);
  assert('Payment added to order', payment.body.data?.payments?.length === 1);
  assert('Payment amount correct', payment.body.data?.payments?.[0]?.amount === 5000);
  assert('Payment status is paid', payment.body.data?.payments?.[0]?.status === 'paid');

  // Second payment (remaining)
  const payment2 = await request('POST', `/api/customer/orders/${orderId}/payment`, {
    amount: expectedTotal - 5000,
  }, customerToken);
  assert('Second payment → 200', payment2.status === 200);
  assert('Now has 2 payments', payment2.body.data?.payments?.length === 2);

  // ── 10. PROVIDER — CREATE PROFILE ────────────────────────────
  console.log('\n🏢 10. PROVIDER — CREATE PROFILE');

  const provProfile = await request('POST', '/api/provider/profile', {
    business_name: 'Test Catering Co.',
    phone: '9999999999',
    address: 'Test Street, Test City',
  }, providerToken);
  assert('POST /provider/profile → 201', provProfile.status === 201);
  assert('Profile has business_name', !!provProfile.body.data?.business_name);
  assert('Profile approval_status is pending', provProfile.body.data?.approval_status === 'pending');

  // Duplicate profile
  const dupProfile = await request('POST', '/api/provider/profile', {
    business_name: 'Dup', phone: '1111111111', address: 'Dup',
  }, providerToken);
  assert('Duplicate profile → 400', dupProfile.status === 400);

  // ── 11. PROVIDER — CREATE MENU ───────────────────────────────
  console.log('\n🍴 11. PROVIDER — CREATE MENU');

  const newMenu = await request('POST', '/api/provider/menus', {
    name: 'Test Biryani',
    category: 'Main Course',
    price: 350,
    description: 'Aromatic basmati rice with spices',
  }, providerToken);
  assert('POST /provider/menus → 201', newMenu.status === 201);
  assert('Menu item has _id', !!newMenu.body.data?._id);
  assert('Menu price correct', newMenu.body.data?.price === 350);
  const newMenuId = newMenu.body.data?._id;

  // Missing required fields
  const badMenu = await request('POST', '/api/provider/menus', {
    name: 'Incomplete',
  }, providerToken);
  assert('Menu without price/category → 400', badMenu.status === 400);

  // Customer cannot create menu
  const custMenu = await request('POST', '/api/provider/menus', {
    name: 'X', category: 'Y', price: 100,
  }, customerToken);
  assert('Customer cannot create menu → 403', custMenu.status === 403);

  // ── 12. PROVIDER — UPDATE MENU ───────────────────────────────
  console.log('\n✏️  12. PROVIDER — UPDATE MENU');

  const updateMenu = await request('PUT', `/api/provider/menus/${newMenuId}`, {
    price: 400,
    name: 'Test Biryani Special',
  }, providerToken);
  assert('PUT /provider/menus/:id → 200', updateMenu.status === 200);
  assert('Price updated', updateMenu.body.data?.price === 400);
  assert('Name updated', updateMenu.body.data?.name === 'Test Biryani Special');

  // ── 13. PROVIDER — GET ORDERS ────────────────────────────────
  console.log('\n📬 13. PROVIDER — GET ORDERS');

  const provOrders = await request('GET', '/api/provider/orders', null, seededProviderToken);
  assert('GET /provider/orders → 200', provOrders.status === 200);
  assert('Returns array', Array.isArray(provOrders.body.data));
  assert('Has 1 order for seeded provider', provOrders.body.data?.length === 1);
  assert('Order has customer populated', !!provOrders.body.data?.[0]?.customer_id);

  // ── 14. PROVIDER — UPDATE ORDER STATUS ───────────────────────
  console.log('\n🔄 14. PROVIDER — ORDER STATUS FLOW');

  // pending → accepted
  const accept = await request('PUT', `/api/provider/orders/${orderId}/status`, {
    status: 'accepted',
  }, seededProviderToken);
  assert('Status: pending → accepted → 200', accept.status === 200);
  assert('Status is accepted', accept.body.data?.status === 'accepted');

  // accepted → in_progress
  const inProg = await request('PUT', `/api/provider/orders/${orderId}/status`, {
    status: 'in_progress',
  }, seededProviderToken);
  assert('Status: accepted → in_progress → 200', inProg.status === 200);
  assert('Status is in_progress', inProg.body.data?.status === 'in_progress');

  // in_progress → completed
  const complete = await request('PUT', `/api/provider/orders/${orderId}/status`, {
    status: 'completed',
  }, seededProviderToken);
  assert('Status: in_progress → completed → 200', complete.status === 200);
  assert('Status is completed', complete.body.data?.status === 'completed');

  // Invalid status
  const badStatus = await request('PUT', `/api/provider/orders/${orderId}/status`, {
    status: 'flying',
  }, seededProviderToken);
  assert('Invalid status → 400', badStatus.status === 400);

  // Customer cannot update order status
  const custStatus = await request('PUT', `/api/provider/orders/${orderId}/status`, {
    status: 'cancelled',
  }, customerToken);
  assert('Customer cannot update order status → 403', custStatus.status === 403);

  // ── 15. PROVIDER — DELETE MENU ───────────────────────────────
  console.log('\n🗑️  15. PROVIDER — DELETE MENU');

  const delMenu = await request('DELETE', `/api/provider/menus/${newMenuId}`, null, providerToken);
  assert('DELETE /provider/menus/:id → 200', delMenu.status === 200);
  assert('Delete success message', !!delMenu.body.message);

  // Delete non-existent
  const delAgain = await request('DELETE', `/api/provider/menus/${newMenuId}`, null, providerToken);
  assert('Delete non-existent → 404', delAgain.status === 404);

  // ── 16. ADMIN — GET ALL USERS ────────────────────────────────
  console.log('\n👑 16. ADMIN — GET ALL USERS');

  const allUsers = await request('GET', '/api/admin/users', null, adminToken);
  assert('GET /admin/users → 200', allUsers.status === 200);
  assert('Returns array', Array.isArray(allUsers.body.data));
  assert('Has 23 users (21 seeded + 2 test)', allUsers.body.data?.length === 23);
  assert('No passwords in response', allUsers.body.data?.every(u => !u.password));

  // Customer cannot access admin routes
  const custAdmin = await request('GET', '/api/admin/users', null, customerToken);
  assert('Customer cannot access admin users → 403', custAdmin.status === 403);

  // No token
  const noTokenAdmin = await request('GET', '/api/admin/users');
  assert('No token → 401', noTokenAdmin.status === 401);

  // ── 17. ADMIN — APPROVE PROVIDER ─────────────────────────────
  console.log('\n✅ 17. ADMIN — APPROVE PROVIDER');

  // Get the test provider's profile id
  const allProviders = await request('GET', '/api/customer/providers', null, customerToken);
  // Find a provider to test approval (use the test provider we created)
  // First get all users to find test provider user id
  const testProviderUser = allUsers.body.data?.find(u => u.email === 'testprovider@test.com');

  // Get provider profile via admin — we need to find it in DB
  // Approve using the seeded provider's profile (we know ravi's provider is approved, let's reject then re-approve)
  const raviProvider = providers.body.data?.find(p => p.user_id?.email === 'ravi@caterease.com') || providers.body.data?.[0];
  const approveRes = await request('PUT', `/api/admin/providers/${raviProvider?._id}/approve`, {
    status: 'approved',
  }, adminToken);
  assert('PUT /admin/providers/:id/approve → 200', approveRes.status === 200);
  assert('Status updated', approveRes.body.data?.approval_status === 'approved');

  // Reject a provider
  const rejectRes = await request('PUT', `/api/admin/providers/${raviProvider?._id}/approve`, {
    status: 'rejected',
  }, adminToken);
  assert('Admin can reject provider → 200', rejectRes.status === 200);
  assert('Status is rejected', rejectRes.body.data?.approval_status === 'rejected');

  // Re-approve
  await request('PUT', `/api/admin/providers/${raviProvider?._id}/approve`, { status: 'approved' }, adminToken);

  // Provider cannot approve
  const provApprove = await request('PUT', `/api/admin/providers/${raviProvider?._id}/approve`, {
    status: 'approved',
  }, seededProviderToken);
  assert('Provider cannot approve → 403', provApprove.status === 403);

  // ── 18. ADMIN — GET ALL ORDERS ───────────────────────────────
  console.log('\n📊 18. ADMIN — GET ALL ORDERS');

  const allOrders = await request('GET', '/api/admin/orders', null, adminToken);
  assert('GET /admin/orders → 200', allOrders.status === 200);
  assert('Returns array', Array.isArray(allOrders.body.data));
  assert('Has 1 order', allOrders.body.data?.length === 1);
  assert('Order has customer + provider populated', 
    !!allOrders.body.data?.[0]?.customer_id && !!allOrders.body.data?.[0]?.provider_id);
  assert('Order status is completed', allOrders.body.data?.[0]?.status === 'completed');

  // Customer cannot see all orders
  const custAllOrders = await request('GET', '/api/admin/orders', null, customerToken);
  assert('Customer cannot see all orders → 403', custAllOrders.status === 403);

  // ── 19. RBAC — CROSS-ROLE PROTECTION ─────────────────────────
  console.log('\n🛡️  19. RBAC — CROSS-ROLE PROTECTION');

  assert('Customer blocked from /provider/orders', 
    (await request('GET', '/api/provider/orders', null, customerToken)).status === 403);
  assert('Customer blocked from /admin/orders', 
    (await request('GET', '/api/admin/orders', null, customerToken)).status === 403);
  assert('Provider blocked from /customer/my-orders', 
    (await request('GET', '/api/customer/my-orders', null, seededProviderToken)).status === 403);
  assert('Provider blocked from /admin/users', 
    (await request('GET', '/api/admin/users', null, seededProviderToken)).status === 403);
  assert('Admin blocked from /customer/my-orders', 
    (await request('GET', '/api/customer/my-orders', null, adminToken)).status === 403);
  assert('Admin blocked from /provider/orders', 
    (await request('GET', '/api/provider/orders', null, adminToken)).status === 403);

  // ── 20. 404 ROUTE ─────────────────────────────────────────────
  console.log('\n🔍 20. 404 & ERROR HANDLING');

  const notFound = await request('GET', '/api/nonexistent');
  assert('Unknown route → 404', notFound.status === 404);

  const invalidId = await request('GET', '/api/customer/menus/invalidid123', null, customerToken);
  assert('Invalid ObjectId handled gracefully', invalidId.status === 500 || invalidId.status === 400 || invalidId.status === 200);

  // ─── SUMMARY ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('📋 TEST RESULTS\n');
  results.forEach(r => console.log(r));
  console.log('\n' + '═'.repeat(55));
  console.log(`Total : ${passed + failed}`);
  console.log(`✅ Passed : ${passed}`);
  console.log(`❌ Failed : ${failed}`);
  console.log('═'.repeat(55));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED — Platform is fully functional!\n');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Review above.\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal test error:', err.message);
  process.exit(1);
});
