import db from './db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('Seeding database...');

  // Check if already seeded
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  if (productCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return { message: 'Database already seeded' };
  }

  // Create additional admin user
  const adminEmail = 'admin@depthcomplexity.com';
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password, name, role, can_add_users)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminEmail, hashedPassword, 'Admin User', 'admin', 1);
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
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      category: 'Teaching Resources',
      featured: 0,
      variations: []
    },
    {
      name: 'Differentiation Guide',
      description: 'Differentiation Smart Reference Guide. Quick access to differentiation strategies and techniques.',
      price: 18.99,
      image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      category: 'Reference Materials',
      featured: 0,
      variations: [
        { name: 'Print', variation_type: 'general', price_modifier: 0, stock: 80 },
        { name: 'Digital', variation_type: 'general', price_modifier: -3, stock: null },
      ]
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, status, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVersion = db.prepare(`
    INSERT INTO product_versions (product_id, name, variation_type, attribute_value, price_modifier, stock, sku)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const product of products) {
    const result = insertProduct.run(
      product.name,
      product.description,
      product.price,
      product.image_url,
      product.category,
      'active',
      product.featured
    );
    const productId = result.lastInsertRowid as number;

    for (const variation of product.variations || []) {
      insertVersion.run(
        productId,
        variation.name,
        variation.variation_type,
        variation.attribute_value || null,
        variation.price_modifier,
        variation.stock,
        null
      );
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
        { title: 'Welcome and Overview', content: 'Introduction to the course and what you will learn.', order_index: 1, duration: 300 },
        { title: 'Understanding the 11 Icons', content: 'Deep dive into each of the 11 Depth and Complexity icons.', order_index: 2, duration: 1800 },
        { title: 'Implementation Strategies', content: 'Practical strategies for implementing Depth and Complexity in your classroom.', order_index: 3, duration: 2400 },
        { title: 'Assessment and Evaluation', content: 'How to assess student understanding using the framework.', order_index: 4, duration: 1800 },
      ]
    },
    {
      title: 'Advanced Depth and Complexity Techniques',
      description: 'Take your Depth and Complexity practice to the next level with advanced strategies and techniques.',
      price: 99.99,
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      status: 'published',
      lessons: [
        { title: 'Advanced Icon Combinations', content: 'Learn how to combine multiple icons for deeper thinking.', order_index: 1, duration: 2400 },
        { title: 'Content Imperatives Integration', content: 'Integrate Content Imperatives with Depth and Complexity.', order_index: 2, duration: 2100 },
        { title: 'Cross-Curricular Applications', content: 'Apply Depth and Complexity across all subject areas.', order_index: 3, duration: 2700 },
        { title: 'Student-Led Inquiry', content: 'Empower students to lead their own inquiry using the framework.', order_index: 4, duration: 2400 },
        { title: 'Portfolio Development', content: 'Help students create portfolios showcasing their thinking.', order_index: 5, duration: 1800 },
      ]
    },
    {
      title: 'Depth and Complexity for Administrators',
      description: 'Learn how to support and implement Depth and Complexity at the school and district level.',
      price: 149.99,
      image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
      status: 'published',
      lessons: [
        { title: 'Leadership Overview', content: 'Understanding Depth and Complexity from an administrative perspective.', order_index: 1, duration: 1800 },
        { title: 'Professional Development Planning', content: 'How to plan and deliver effective PD on Depth and Complexity.', order_index: 2, duration: 2400 },
        { title: 'School-Wide Implementation', content: 'Strategies for implementing the framework across your school.', order_index: 3, duration: 2700 },
        { title: 'Measuring Success', content: 'Metrics and methods for evaluating the impact of Depth and Complexity.', order_index: 4, duration: 2100 },
      ]
    },
  ];

  const insertCourse = db.prepare(`
    INSERT INTO courses (title, description, price, image_url, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (course_id, title, content, order_index, duration)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const course of courses) {
    const result = insertCourse.run(
      course.title,
      course.description,
      course.price,
      course.image_url,
      course.status
    );
    const courseId = result.lastInsertRowid as number;

    for (const lesson of course.lessons) {
      insertLesson.run(
        courseId,
        lesson.title,
        lesson.content,
        lesson.order_index,
        lesson.duration
      );
    }
  }

  console.log(`Created ${courses.length} courses`);

  // Seed Announcements
  const announcements = [
    {
      title: '2025-26 Online Trainer of Trainers (ToT) Cohort Now Open',
      content: `We're excited to announce that registration is now open for our 2025-26 Online Trainer of Trainers (ToT) Cohort. This comprehensive program will prepare you to train others in the Depth and Complexity framework.

Key features:
- 12-week intensive training program
- Live virtual sessions with expert facilitators
- Access to exclusive resources and materials
- Certification upon completion
- Ongoing support and community access

Spaces are limited, so register early to secure your spot!`,
      author_id: 1,
      status: 'published'
    },
    {
      title: 'New Graphic Organizers Product Available',
      content: `The highly anticipated Depth and Complexity Graphic Organizer product has arrived! This comprehensive collection includes templates for all 11 icons, designed to support student thinking and learning.

Features:
- Ready-to-use templates
- Digital and print versions
- Suitable for all grade levels
- Aligned with Depth and Complexity framework

Available now in our shop!`,
      author_id: 1,
      status: 'published'
    },
    {
      title: 'Upcoming Webinar: Implementing Depth and Complexity in Elementary Classrooms',
      content: `Join us for an interactive webinar on implementing Depth and Complexity in elementary classrooms. Our expert facilitators will share practical strategies, real-world examples, and answer your questions.

Date: Next month
Time: 4:00 PM EST
Duration: 60 minutes

Registration is free and open to all educators.`,
      author_id: 1,
      status: 'published'
    },
  ];

  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, content, author_id, status)
    VALUES (?, ?, ?, ?)
  `);

  for (const announcement of announcements) {
    insertAnnouncement.run(
      announcement.title,
      announcement.content,
      announcement.author_id,
      announcement.status
    );
  }

  console.log(`Created ${announcements.length} announcements`);

  // Seed Webinars
  const webinars = [
    {
      title: 'Introduction to Depth and Complexity Framework',
      description: 'Perfect for educators new to Depth and Complexity. Learn the basics and get started with implementation.',
      date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      duration: 60,
      meeting_url: 'https://zoom.us/j/example',
      status: 'scheduled'
    },
    {
      title: 'Advanced Strategies for Gifted Education',
      description: 'Explore advanced techniques for using Depth and Complexity with gifted and talented students.',
      date_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      duration: 90,
      meeting_url: 'https://zoom.us/j/example2',
      status: 'scheduled'
    },
    {
      title: 'Depth and Complexity in Math Instruction',
      description: 'Learn how to integrate Depth and Complexity into your math curriculum for deeper understanding.',
      date_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      duration: 75,
      meeting_url: 'https://zoom.us/j/example3',
      status: 'scheduled'
    },
  ];

  const insertWebinar = db.prepare(`
    INSERT INTO webinars (title, description, date_time, duration, meeting_url, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const webinar of webinars) {
    insertWebinar.run(
      webinar.title,
      webinar.description,
      webinar.date_time,
      webinar.duration,
      webinar.meeting_url,
      webinar.status
    );
  }

  console.log(`Created ${webinars.length} webinars`);
  console.log('Database seeding completed!');
  return { message: 'Database seeded successfully' };
}

