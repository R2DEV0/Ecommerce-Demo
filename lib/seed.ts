import db, { initDatabase } from './db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('Seeding database...');

  // Initialize database tables first
  await initDatabase();

  // Check if already seeded
  const productCount = await db.execute('SELECT COUNT(*) as count FROM products');
  if (Number((productCount.rows[0] as any).count) > 0) {
    console.log('Database already seeded, skipping...');
    return { message: 'Database already seeded' };
  }

  // Create additional admin user
  const adminEmail = 'admin@depthcomplexity.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const result = await db.execute({
    sql: `INSERT OR IGNORE INTO users (email, password, name, role, can_add_users)
          VALUES (?, ?, ?, ?, ?)`,
    args: [adminEmail, hashedPassword, 'Admin User', 'admin', 1]
  });
  if (result.rowsAffected > 0) {
    console.log('Created admin user:', adminEmail);
  }

  // Seed Products
  const products = [
    {
      name: 'Icon Magnets',
      description: 'High-quality magnetic Depth and Complexity icons for your classroom whiteboard. Perfect for visual learners and interactive teaching.',
      price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      category: 'Classroom Tools',
      featured: 1,
      variations: [
        { name: 'Single Set', variation_type: 'quantity', price_modifier: 0, stock: 50 },
        { name: '2-Pack', variation_type: 'quantity', price_modifier: 15, stock: 30 },
        { name: '4-Pack', variation_type: 'quantity', price_modifier: 45, stock: 20 },
      ]
    },
    {
      name: 'Q3 Question Stems',
      description: 'Quick, Quality, Depth and Complexity Questioning Cards. Essential tool for developing critical thinking skills.',
      price: 24.99,
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      category: 'Teaching Resources',
      featured: 1,
      variations: [
        { name: 'Standard', variation_type: 'general', price_modifier: 0, stock: 100 },
        { name: 'Digital Download', variation_type: 'general', price_modifier: -5, stock: null },
      ]
    },
    {
      name: 'Icon Cards',
      description: 'Portable Depth and Complexity icon cards for individual student use. Perfect for small group activities.',
      price: 19.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      category: 'Classroom Tools',
      featured: 1,
      variations: [
        { name: 'Red', variation_type: 'color', attribute_value: '#ef4444', price_modifier: 0, stock: 40 },
        { name: 'Blue', variation_type: 'color', attribute_value: '#3b82f6', price_modifier: 0, stock: 40 },
        { name: 'Green', variation_type: 'color', attribute_value: '#10b981', price_modifier: 0, stock: 35 },
      ]
    },
    {
      name: 'Graphic Organizers',
      description: 'The highly anticipated Depth and Complexity Graphic Organizer product. Comprehensive templates for all 11 icons.',
      price: 34.99,
      image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      category: 'Teaching Resources',
      featured: 0,
      variations: [
        { name: 'Single', variation_type: 'quantity', price_modifier: 0, stock: 60 },
        { name: 'Classroom Set (25)', variation_type: 'quantity', price_modifier: 200, stock: 15 },
      ]
    },
    {
      name: 'TALK Cards',
      description: 'Depth and Complexity TALK Cards: Thinking with Academic Language & Knowledge. Enhance student discourse.',
      price: 27.99,
      image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
      category: 'Teaching Resources',
      featured: 0,
      variations: [
        { name: 'Standard Edition', variation_type: 'general', price_modifier: 0, stock: 80 },
      ]
    },
    {
      name: 'Poster Set',
      description: 'Beautiful, durable classroom posters featuring all 11 Depth and Complexity icons with definitions and examples.',
      price: 39.99,
      image_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800',
      category: 'Classroom Tools',
      featured: 1,
      variations: [
        { name: 'Small (18x24)', variation_type: 'size', price_modifier: 0, stock: 45 },
        { name: 'Large (24x36)', variation_type: 'size', price_modifier: 15, stock: 30 },
      ]
    },
  ];

  for (const product of products) {
    const result = await db.execute({
      sql: `INSERT INTO products (name, description, price, image_url, category, status, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.name,
        product.description,
        product.price,
        product.image_url,
        product.category,
        'active',
        product.featured
      ]
    });
    const productId = result.lastInsertRowid;

    for (const variation of product.variations || []) {
      await db.execute({
        sql: `INSERT INTO product_versions (product_id, name, variation_type, attribute_value, price_modifier, stock, sku)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          productId,
          variation.name,
          variation.variation_type,
          (variation as { attribute_value?: string }).attribute_value || null,
          variation.price_modifier,
          variation.stock,
          null
        ]
      });
    }
  }

  console.log(`Created ${products.length} products`);

  // Seed Courses
  const courses = [
    {
      title: 'Introduction to Depth and Complexity',
      description: 'Learn the fundamentals of the Depth and Complexity framework. Perfect for educators new to the concept.',
      price: 0,
      image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      status: 'published',
      lessons: [
        { title: 'Welcome to Depth and Complexity', content: 'An introduction to the course and what you will learn.', order_index: 1 },
        { title: 'The 11 Icons Overview', content: 'A brief overview of all 11 Depth and Complexity icons.', order_index: 2 },
        { title: 'Why Use Depth and Complexity?', content: 'Understanding the benefits of using this framework in your classroom.', order_index: 3 },
      ]
    },
    {
      title: 'Deep Dive: The Icons of Depth',
      description: 'An in-depth exploration of the Depth icons: Language of the Discipline, Details, Patterns, Rules, Trends, Unanswered Questions, and Ethics.',
      price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      status: 'published',
      lessons: [
        { title: 'Language of the Discipline', content: 'Understanding specialized vocabulary in different fields.', order_index: 1 },
        { title: 'Details', content: 'Learning to identify and analyze important details.', order_index: 2 },
        { title: 'Patterns', content: 'Recognizing recurring elements and structures.', order_index: 3 },
        { title: 'Rules', content: 'Understanding the rules that govern systems.', order_index: 4 },
        { title: 'Trends', content: 'Identifying trends and their implications.', order_index: 5 },
        { title: 'Unanswered Questions', content: 'Exploring the unknown and fostering curiosity.', order_index: 6 },
        { title: 'Ethics', content: 'Examining ethical considerations in any topic.', order_index: 7 },
      ]
    },
    {
      title: 'Complexity in Practice',
      description: 'Master the Complexity icons: Big Idea, Multiple Perspectives, Over Time, and Across Disciplines.',
      price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      status: 'published',
      lessons: [
        { title: 'Big Idea', content: 'Identifying the overarching concepts that connect learning.', order_index: 1 },
        { title: 'Multiple Perspectives', content: 'Seeing topics from different viewpoints.', order_index: 2 },
        { title: 'Over Time', content: 'Understanding how things change across time.', order_index: 3 },
        { title: 'Across Disciplines', content: 'Making connections between different subject areas.', order_index: 4 },
      ]
    },
    {
      title: 'Advanced Implementation Strategies',
      description: 'Take your Depth and Complexity teaching to the next level with advanced implementation strategies.',
      price: 79.99,
      image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      status: 'draft',
      lessons: [
        { title: 'Layering Multiple Icons', content: 'How to effectively combine multiple icons in lessons.', order_index: 1 },
        { title: 'Differentiation Strategies', content: 'Using D&C for differentiated instruction.', order_index: 2 },
        { title: 'Assessment with D&C', content: 'Creating assessments that leverage the framework.', order_index: 3 },
      ]
    },
  ];

  for (const course of courses) {
    const result = await db.execute({
      sql: `INSERT INTO courses (title, description, price, image_url, status)
            VALUES (?, ?, ?, ?, ?)`,
      args: [course.title, course.description, course.price, course.image_url, course.status]
    });
    const courseId = result.lastInsertRowid;

    for (const lesson of course.lessons) {
      await db.execute({
        sql: `INSERT INTO lessons (course_id, title, content, order_index)
              VALUES (?, ?, ?, ?)`,
        args: [courseId, lesson.title, lesson.content, lesson.order_index]
      });
    }
  }

  console.log(`Created ${courses.length} courses`);

  // Seed Webinars
  const webinars = [
    {
      title: 'Getting Started with Depth and Complexity',
      description: 'A beginner-friendly webinar introducing the framework and its classroom applications.',
      date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example1',
      status: 'scheduled'
    },
    {
      title: 'Advanced Icon Combinations',
      description: 'Learn how to layer multiple icons for deeper learning experiences.',
      date_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      meeting_url: 'https://zoom.us/j/example2',
      status: 'scheduled'
    },
    {
      title: 'Q&A Session: Your D&C Questions Answered',
      description: 'An open Q&A session where we answer your Depth and Complexity questions.',
      date_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      meeting_url: 'https://zoom.us/j/example3',
      status: 'scheduled'
    },
  ];

  for (const webinar of webinars) {
    await db.execute({
      sql: `INSERT INTO webinars (title, description, date_time, duration, meeting_url, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [webinar.title, webinar.description, webinar.date_time, webinar.duration, webinar.meeting_url, webinar.status]
    });
  }

  console.log(`Created ${webinars.length} webinars`);

  // Seed Announcements
  const announcements = [
    {
      title: 'Welcome to Our New Platform!',
      content: 'We are excited to launch our new Depth and Complexity learning platform. Explore our courses, products, and upcoming webinars!',
      status: 'published'
    },
    {
      title: 'New Course Coming Soon',
      content: 'Stay tuned for our upcoming Advanced Implementation Strategies course. Perfect for educators ready to take their D&C practice to the next level.',
      status: 'published'
    },
  ];

  // Get admin user id
  const adminUser = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: ['admin@example.com']
  });
  const adminId = adminUser.rows[0] ? Number((adminUser.rows[0] as any).id) : 1;

  for (const announcement of announcements) {
    await db.execute({
      sql: `INSERT INTO announcements (title, content, author_id, status)
            VALUES (?, ?, ?, ?)`,
      args: [announcement.title, announcement.content, adminId, announcement.status]
    });
  }

  console.log(`Created ${announcements.length} announcements`);

  console.log('Database seeding completed!');
  return { message: 'Database seeded successfully' };
}
