require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./app/Models/User');
const Provider = require('./app/Models/Provider');
const Menu = require('./app/Models/Menu');
const Order = require('./app/Models/Order');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const adminData = {
  name: 'Super Admin',
  email: 'admin@caterease.com',
  password: 'Admin@1234',
  phone: '9999999999',
  role: 'admin',
};

const providersData = [
  { name: 'Ravi Sharma',    email: 'ravi@caterease.com',    password: 'Provider@1', phone: '9810001001', business_name: 'Sharma Grand Caterers',   address: 'Connaught Place, New Delhi' },
  { name: 'Priya Mehta',    email: 'priya@caterease.com',   password: 'Provider@2', phone: '9820002002', business_name: 'Mehta Royal Feast',        address: 'Bandra West, Mumbai' },
  { name: 'Arjun Nair',     email: 'arjun@caterease.com',   password: 'Provider@3', phone: '9830003003', business_name: 'Nair Spice Kitchen',       address: 'Koramangala, Bangalore' },
  { name: 'Sunita Patel',   email: 'sunita@caterease.com',  password: 'Provider@4', phone: '9840004004', business_name: 'Patel Heritage Catering',  address: 'CG Road, Ahmedabad' },
  { name: 'Vikram Singh',   email: 'vikram@caterease.com',  password: 'Provider@5', phone: '9850005005', business_name: 'Singh Punjabi Dhaba',      address: 'Sector 17, Chandigarh' },
  { name: 'Deepa Iyer',     email: 'deepa@caterease.com',   password: 'Provider@6', phone: '9860006006', business_name: 'Iyer South Delights',      address: 'T. Nagar, Chennai' },
  { name: 'Mohit Gupta',    email: 'mohit@caterease.com',   password: 'Provider@7', phone: '9870007007', business_name: 'Gupta Sweets & Catering',  address: 'Hazratganj, Lucknow' },
  { name: 'Anita Joshi',    email: 'anita@caterease.com',   password: 'Provider@8', phone: '9880008008', business_name: 'Joshi Maharashtrian Bhojan', address: 'FC Road, Pune' },
  { name: 'Karan Malhotra', email: 'karan@caterease.com',   password: 'Provider@9', phone: '9890009009', business_name: 'Malhotra Fusion Catering', address: 'Park Street, Kolkata' },
  { name: 'Neha Reddy',     email: 'neha@caterease.com',    password: 'Provider@10', phone: '9900010010', business_name: 'Reddy Andhra Caterers',   address: 'Jubilee Hills, Hyderabad' },
];

const customersData = [
  { name: 'Amit Kumar',     email: 'amit@example.com',    password: 'Customer@1', phone: '9876543210' },
  { name: 'Sneha Verma',    email: 'sneha@example.com',   password: 'Customer@2', phone: '9876543211' },
  { name: 'Rahul Das',      email: 'rahul@example.com',   password: 'Customer@3', phone: '9876543212' },
  { name: 'Pooja Tiwari',   email: 'pooja@example.com',   password: 'Customer@4', phone: '9876543213' },
  { name: 'Suresh Yadav',   email: 'suresh@example.com',  password: 'Customer@5', phone: '9876543214' },
  { name: 'Kavita Bose',    email: 'kavita@example.com',  password: 'Customer@6', phone: '9876543215' },
  { name: 'Nikhil Saxena',  email: 'nikhil@example.com',  password: 'Customer@7', phone: '9876543216' },
  { name: 'Meera Pillai',   email: 'meera@example.com',   password: 'Customer@8', phone: '9876543217' },
  { name: 'Arun Chopra',    email: 'arun@example.com',    password: 'Customer@9', phone: '9876543218' },
  { name: 'Divya Sinha',    email: 'divya@example.com',   password: 'Customer@10', phone: '9876543219' },
];

// Rich menu data per provider (5-6 items each with descriptions)
const menuTemplates = [
  [
    { name: 'Paneer Tikka', category: 'Starters', price: 250, description: 'Marinated cottage cheese grilled to perfection' },
    { name: 'Dal Makhani', category: 'Main Course', price: 180, description: 'Creamy black lentils slow-cooked overnight' },
    { name: 'Butter Naan', category: 'Breads', price: 40, description: 'Soft tandoor-baked flatbread with butter' },
    { name: 'Veg Biryani', category: 'Rice', price: 220, description: 'Fragrant basmati rice with mixed vegetables' },
    { name: 'Gulab Jamun', category: 'Desserts', price: 80, description: 'Soft milk dumplings in rose-flavored syrup' },
    { name: 'Masala Chai', category: 'Beverages', price: 30, description: 'Traditional Indian spiced tea' },
  ],
  [
    { name: 'Chicken Malai Tikka', category: 'Starters', price: 320, description: 'Creamy chicken kebabs with cashew paste' },
    { name: 'Butter Chicken', category: 'Main Course', price: 280, description: 'Tender chicken in rich tomato gravy' },
    { name: 'Garlic Naan', category: 'Breads', price: 50, description: 'Naan topped with fresh garlic and coriander' },
    { name: 'Chicken Biryani', category: 'Rice', price: 300, description: 'Aromatic rice layered with spiced chicken' },
    { name: 'Rasgulla', category: 'Desserts', price: 70, description: 'Spongy cottage cheese balls in sugar syrup' },
  ],
  [
    { name: 'Fish Fry', category: 'Starters', price: 300, description: 'Crispy fried fish with Kerala spices' },
    { name: 'Kerala Fish Curry', category: 'Main Course', price: 260, description: 'Tangy fish curry with coconut milk' },
    { name: 'Appam', category: 'Breads', price: 35, description: 'Soft rice pancakes with crispy edges' },
    { name: 'Prawn Biryani', category: 'Rice', price: 350, description: 'Coastal-style biryani with fresh prawns' },
    { name: 'Payasam', category: 'Desserts', price: 90, description: 'Traditional South Indian rice pudding' },
    { name: 'Filter Coffee', category: 'Beverages', price: 40, description: 'Strong South Indian filter coffee' },
  ],
  [
    { name: 'Dhokla', category: 'Starters', price: 120, description: 'Steamed gram flour cakes, light and fluffy' },
    { name: 'Undhiyu', category: 'Main Course', price: 200, description: 'Mixed vegetable curry, Gujarati specialty' },
    { name: 'Thepla', category: 'Breads', price: 30, description: 'Spiced flatbread made with fenugreek' },
    { name: 'Gujarati Kadhi', category: 'Main Course', price: 150, description: 'Sweet and tangy yogurt curry' },
    { name: 'Shrikhand', category: 'Desserts', price: 100, description: 'Sweetened strained yogurt with saffron' },
  ],
  [
    { name: 'Amritsari Kulcha', category: 'Starters', price: 150, description: 'Stuffed bread with spiced potatoes' },
    { name: 'Sarson da Saag', category: 'Main Course', price: 170, description: 'Mustard greens curry with butter' },
    { name: 'Makki di Roti', category: 'Breads', price: 40, description: 'Corn flour flatbread, Punjabi style' },
    { name: 'Chole Bhature', category: 'Main Course', price: 180, description: 'Spicy chickpeas with fried bread' },
    { name: 'Kheer', category: 'Desserts', price: 85, description: 'Rice pudding with cardamom and nuts' },
    { name: 'Lassi', category: 'Beverages', price: 60, description: 'Creamy yogurt drink, sweet or salted' },
  ],
  [
    { name: 'Medu Vada', category: 'Starters', price: 100, description: 'Crispy lentil donuts with chutney' },
    { name: 'Sambar Rice', category: 'Main Course', price: 140, description: 'Rice mixed with lentil vegetable stew' },
    { name: 'Dosa', category: 'Breads', price: 80, description: 'Crispy rice crepe with potato filling' },
    { name: 'Curd Rice', category: 'Rice', price: 120, description: 'Cooling yogurt rice with tempering' },
    { name: 'Pongal', category: 'Desserts', price: 110, description: 'Sweet rice and lentil pudding' },
  ],
  [
    { name: 'Aloo Tikki', category: 'Starters', price: 90, description: 'Crispy potato patties with chutneys' },
    { name: 'Dum Biryani', category: 'Main Course', price: 220, description: 'Slow-cooked aromatic rice with spices' },
    { name: 'Roomali Roti', category: 'Breads', price: 35, description: 'Thin handkerchief-style flatbread' },
    { name: 'Shahi Paneer', category: 'Main Course', price: 240, description: 'Cottage cheese in royal cashew gravy' },
    { name: 'Jalebi', category: 'Desserts', price: 75, description: 'Crispy sweet spirals in sugar syrup' },
  ],
  [
    { name: 'Batata Vada', category: 'Starters', price: 80, description: 'Spiced potato fritters, Mumbai style' },
    { name: 'Puran Poli', category: 'Main Course', price: 130, description: 'Sweet flatbread with lentil filling' },
    { name: 'Bhakri', category: 'Breads', price: 30, description: 'Thick millet flatbread' },
    { name: 'Varan Bhaat', category: 'Rice', price: 160, description: 'Simple dal and rice, comfort food' },
    { name: 'Modak', category: 'Desserts', price: 95, description: 'Steamed dumplings with coconut jaggery' },
  ],
  [
    { name: 'Jhalmuri', category: 'Starters', price: 70, description: 'Spicy puffed rice snack, Kolkata style' },
    { name: 'Kosha Mangsho', category: 'Main Course', price: 290, description: 'Slow-cooked spicy mutton curry' },
    { name: 'Luchi', category: 'Breads', price: 40, description: 'Deep-fried puffed bread, Bengali style' },
    { name: 'Mishti Pulao', category: 'Rice', price: 180, description: 'Lightly sweetened aromatic rice' },
    { name: 'Mishti Doi', category: 'Desserts', price: 85, description: 'Sweet yogurt, Bengali delicacy' },
    { name: 'Cha', category: 'Beverages', price: 25, description: 'Bengali-style milk tea' },
  ],
  [
    { name: 'Pesarattu', category: 'Starters', price: 110, description: 'Green gram dosa with ginger chutney' },
    { name: 'Gongura Mutton', category: 'Main Course', price: 310, description: 'Mutton curry with sorrel leaves' },
    { name: 'Ragi Roti', category: 'Breads', price: 35, description: 'Finger millet flatbread, healthy choice' },
    { name: 'Hyderabadi Biryani', category: 'Rice', price: 280, description: 'Authentic dum biryani with aromatic spices' },
    { name: 'Double Ka Meetha', category: 'Desserts', price: 95, description: 'Bread pudding with saffron and nuts' },
  ],
];

// Sample orders data (mix of statuses and payment methods)
const sampleOrders = [
  {
    customerIndex: 0, providerIndex: 0,
    event_date: new Date('2026-05-15'),
    event_location: 'The Grand Ballroom, Taj Palace, New Delhi',
    guest_count: 150,
    notes: 'Please arrange vegetarian options only. Event starts at 7 PM.',
    status: 'accepted',
    itemIndices: [0, 1, 3, 4],
    quantities: [150, 150, 150, 150],
    payments: [{ amount: 15000, payment_method: 'online', status: 'paid', transaction_id: 'TXN123456789' }],
  },
  {
    customerIndex: 1, providerIndex: 1,
    event_date: new Date('2026-05-20'),
    event_location: 'Mehta Banquet Hall, Andheri, Mumbai',
    guest_count: 200,
    notes: 'Wedding reception. Need both veg and non-veg options.',
    status: 'in_progress',
    itemIndices: [0, 1, 3, 4],
    quantities: [200, 200, 200, 200],
    payments: [
      { amount: 50000, payment_method: 'online', status: 'paid', transaction_id: 'TXN987654321' }, 
      { amount: 30000, payment_method: 'cash_in_hand', status: 'paid' }
    ],
  },
  {
    customerIndex: 2, providerIndex: 2,
    event_date: new Date('2026-06-01'),
    event_location: 'Leela Palace, Bangalore',
    guest_count: 100,
    notes: 'Corporate lunch. Prefer South Indian cuisine.',
    status: 'pending',
    itemIndices: [0, 1, 3, 4],
    quantities: [100, 100, 100, 100],
    payments: [{ amount: 10000, payment_method: 'online', status: 'pending' }],
  },
  {
    customerIndex: 3, providerIndex: 3,
    event_date: new Date('2026-05-10'),
    event_location: 'Patel Community Hall, Ahmedabad',
    guest_count: 80,
    notes: 'Birthday party. All vegetarian, Gujarati style.',
    status: 'completed',
    itemIndices: [0, 1, 3, 4],
    quantities: [80, 80, 80, 80],
    payments: [{ amount: 22000, payment_method: 'cash_in_hand', status: 'paid' }],
  },
  {
    customerIndex: 4, providerIndex: 4,
    event_date: new Date('2026-05-25'),
    event_location: 'Rose Garden, Sector 16, Chandigarh',
    guest_count: 120,
    notes: 'Engagement ceremony. Traditional Punjabi food required.',
    status: 'accepted',
    itemIndices: [0, 1, 3, 4, 5],
    quantities: [120, 120, 120, 120, 120],
    payments: [{ amount: 20000, payment_method: 'online', status: 'paid', transaction_id: 'TXN555666777' }],
  },
  {
    customerIndex: 5, providerIndex: 5,
    event_date: new Date('2026-06-10'),
    event_location: 'Hotel Savera, T. Nagar, Chennai',
    guest_count: 60,
    notes: 'Small family gathering. Traditional South Indian breakfast.',
    status: 'pending',
    itemIndices: [0, 1, 2, 4],
    quantities: [60, 60, 60, 60],
    payments: [],
  },
  {
    customerIndex: 6, providerIndex: 6,
    event_date: new Date('2026-05-05'),
    event_location: 'Clarks Avadh, Lucknow',
    guest_count: 180,
    notes: 'Office annual day. Mix of North Indian dishes.',
    status: 'completed',
    itemIndices: [0, 1, 3, 4],
    quantities: [180, 180, 180, 180],
    payments: [{ amount: 55000, payment_method: 'online', status: 'paid', transaction_id: 'TXN111222333' }],
  },
  {
    customerIndex: 7, providerIndex: 7,
    event_date: new Date('2026-05-18'),
    event_location: 'Shivaji Park Community Hall, Pune',
    guest_count: 90,
    notes: 'Traditional Maharashtrian wedding lunch.',
    status: 'in_progress',
    itemIndices: [0, 1, 3, 4],
    quantities: [90, 90, 90, 90],
    payments: [{ amount: 18000, payment_method: 'cash_in_hand', status: 'pending' }],
  },
  {
    customerIndex: 8, providerIndex: 8,
    event_date: new Date('2026-06-05'),
    event_location: 'ITC Sonar, Kolkata',
    guest_count: 140,
    notes: 'Product launch event. Need fusion menu with Bengali touch.',
    status: 'accepted',
    itemIndices: [0, 1, 3, 4],
    quantities: [140, 140, 140, 140],
    payments: [{ amount: 35000, payment_method: 'online', status: 'paid', transaction_id: 'TXN444555666' }],
  },
  {
    customerIndex: 9, providerIndex: 9,
    event_date: new Date('2026-05-28'),
    event_location: 'Taj Falaknuma Palace, Hyderabad',
    guest_count: 250,
    notes: 'Grand wedding reception. Authentic Hyderabadi cuisine.',
    status: 'pending',
    itemIndices: [0, 1, 3, 4],
    quantities: [250, 250, 250, 250],
    payments: [{ amount: 50000, payment_method: 'cash_in_hand', status: 'pending' }],
  },
];

// ─── Seeder ───────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Provider.deleteMany({});
    await Menu.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Admin ──
    const admin = new User(adminData);
    await admin.save();
    console.log('👑 Admin created');

    // ── Providers ──
    const providerProfiles = [];
    for (let i = 0; i < providersData.length; i++) {
      const p = providersData[i];
      
      const providerUser = new User({
        name: p.name,
        email: p.email,
        password: p.password,
        phone: p.phone,
        role: 'provider',
      });
      await providerUser.save();

      const provider = new Provider({
        user_id: providerUser._id,
        business_name: p.business_name,
        phone: p.phone,
        address: p.address,
        approval_status: 'approved',
        payment_details: {
          upi_id: `${p.email.split('@')[0]}@paytm`,
          qr_code: null, // caterers can upload their QR via Payment Settings
          bank_name: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra'][i % 5],
          account_holder_name: p.name,
        },
      });
      await provider.save();
      providerProfiles.push(provider);

      // Seed menus for this provider
      const menus = menuTemplates[i].map((m) => ({ ...m, provider_id: provider._id }));
      await Menu.insertMany(menus);
    }
    console.log('🍽️  10 Providers + menus created');

    // ── Customers ──
    const customerUsers = [];
    for (const c of customersData) {
      const customer = new User({
        name: c.name,
        email: c.email,
        password: c.password,
        phone: c.phone,
        role: 'customer',
      });
      await customer.save();
      customerUsers.push(customer);
    }
    console.log('👤 10 Customers created');

    // ── Sample Orders ──
    for (const orderData of sampleOrders) {
      const customer = customerUsers[orderData.customerIndex];
      const provider = providerProfiles[orderData.providerIndex];
      const providerMenus = await Menu.find({ provider_id: provider._id });

      const items = orderData.itemIndices.map((idx, i) => {
        const menu = providerMenus[idx];
        return {
          menu_id: menu._id,
          name: menu.name,
          price: menu.price,
          quantity: orderData.quantities[i],
        };
      });

      const total_amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = new Order({
        customer_id: customer._id,
        provider_id: provider._id,
        event_date: orderData.event_date,
        event_location: orderData.event_location,
        customer_phone: customersData[orderData.customerIndex].phone,
        guest_count: orderData.guest_count,
        notes: orderData.notes,
        status: orderData.status,
        items,
        total_amount,
        payments: orderData.payments,
      });
      
      await order.save();
    }
    console.log('📦 10 Sample orders created');

    console.log('\n🎉 Seeding complete!');
    console.log('   - 1 Admin');
    console.log('   - 10 Providers (approved, with payment details & 5-6 menu items each)');
    console.log('   - 10 Customers');
    console.log('   - 10 Sample orders (various statuses & payment methods)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
