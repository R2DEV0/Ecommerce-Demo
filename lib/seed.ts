import db, { initDatabase } from './db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('Seeding database...');

  // Initialize database tables first
  await initDatabase();

  // Clear existing seed data (but keep users and settings)
  console.log('Clearing existing seed data...');
  await db.execute('DELETE FROM product_tags');
  await db.execute('DELETE FROM product_versions');
  await db.execute('DELETE FROM products');
  await db.execute('DELETE FROM lesson_progress');
  await db.execute('DELETE FROM course_enrollments');
  await db.execute('DELETE FROM lessons');
  await db.execute('DELETE FROM courses');
  await db.execute('DELETE FROM webinar_registrations');
  await db.execute('DELETE FROM webinars');
  await db.execute('DELETE FROM announcements');
  await db.execute('DELETE FROM tags');
  console.log('Existing seed data cleared.');

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

  // Create tags first
  const tagNames = [
    'Icons', 'Classroom Tools', 'Teaching Resources', 'Digital', 'Physical', 
    'Beginner', 'Advanced', 'Elementary', 'Secondary', 'Professional Development',
    'Assessment', 'Differentiation', 'Critical Thinking', 'Visual Learning', 'Interactive'
  ];
  
  const tagMap: { [key: string]: number } = {};
  for (const tagName of tagNames) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-');
    const result = await db.execute({
      sql: 'INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)',
      args: [tagName, slug]
    });
    const tagResult = await db.execute({
      sql: 'SELECT id FROM tags WHERE slug = ?',
      args: [slug]
    });
    tagMap[tagName] = Number((tagResult.rows[0] as any).id);
  }
  console.log(`Created ${tagNames.length} tags`);

  // Seed Products
  const products = [
    {
      name: 'Icon Magnets',
      description: 'High-quality magnetic Depth and Complexity icons for your classroom whiteboard. Perfect for visual learners and interactive teaching.',
      price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      category: 'Classroom Tools',
      featured: 1,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Visual Learning', 'Interactive'],
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
      tags: ['Teaching Resources', 'Critical Thinking', 'Assessment'],
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
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Elementary', 'Secondary'],
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
      tags: ['Teaching Resources', 'Icons', 'Assessment', 'Differentiation'],
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
      tags: ['Teaching Resources', 'Critical Thinking', 'Elementary', 'Secondary'],
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
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Visual Learning'],
      variations: [
        { name: 'Small (18x24)', variation_type: 'size', price_modifier: 0, stock: 45 },
        { name: 'Large (24x36)', variation_type: 'size', price_modifier: 15, stock: 30 },
      ]
    },
    {
      name: 'Digital Icon Library',
      description: 'Complete digital collection of all Depth and Complexity icons in multiple formats. Perfect for creating digital resources.',
      price: 19.99,
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Icons', 'Digital', 'Teaching Resources', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Standard License', variation_type: 'general', price_modifier: 0, stock: null },
        { name: 'Extended License', variation_type: 'general', price_modifier: 15, stock: null },
      ]
    },
    {
      name: 'Icon Stickers',
      description: 'Colorful adhesive stickers featuring each Depth and Complexity icon. Great for student work and notebooks.',
      price: 12.99,
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Elementary'],
      variations: [
        { name: 'Single Sheet', variation_type: 'quantity', price_modifier: 0, stock: 75 },
        { name: '5-Pack', variation_type: 'quantity', price_modifier: 40, stock: 50 },
      ]
    },
    {
      name: 'Depth Icons Workbook',
      description: 'Comprehensive workbook exploring all seven Depth icons with activities, examples, and practice exercises.',
      price: 32.99,
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Teaching Resources', 'Icons', 'Beginner', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Print Edition', variation_type: 'general', price_modifier: 0, stock: 90 },
        { name: 'Digital PDF', variation_type: 'general', price_modifier: -8, stock: null },
      ]
    },
    {
      name: 'Complexity Icons Workbook',
      description: 'In-depth workbook covering the four Complexity icons with engaging activities and real-world applications.',
      price: 32.99,
      image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Teaching Resources', 'Icons', 'Beginner', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Print Edition', variation_type: 'general', price_modifier: 0, stock: 85 },
        { name: 'Digital PDF', variation_type: 'general', price_modifier: -8, stock: null },
      ]
    },
    {
      name: 'Icon Bingo Game',
      description: 'Fun and educational bingo game featuring Depth and Complexity icons. Perfect for review and reinforcement.',
      price: 22.99,
      image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Classroom Tools', 'Icons', 'Interactive', 'Elementary'],
      variations: [
        { name: 'Standard Game', variation_type: 'general', price_modifier: 0, stock: 55 },
      ]
    },
    {
      name: 'Assessment Rubrics',
      description: 'Ready-to-use rubrics for assessing student work using Depth and Complexity icons. Save time with pre-made templates.',
      price: 18.99,
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      category: 'Teaching Resources',
      featured: 0,
      tags: ['Teaching Resources', 'Assessment', 'Digital', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Digital Download', variation_type: 'general', price_modifier: 0, stock: null },
      ]
    },
    {
      name: 'Icon Flip Book',
      description: 'Interactive flip book with all 11 icons, definitions, and question stems. Perfect for student reference.',
      price: 15.99,
      image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Single', variation_type: 'quantity', price_modifier: 0, stock: 70 },
        { name: 'Class Set (30)', variation_type: 'quantity', price_modifier: 300, stock: 20 },
      ]
    },
    {
      name: 'Differentiation Toolkit',
      description: 'Complete toolkit for using Depth and Complexity to differentiate instruction. Includes templates and strategies.',
      price: 44.99,
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Teaching Resources', 'Differentiation', 'Advanced', 'Professional Development'],
      variations: [
        { name: 'Print + Digital', variation_type: 'general', price_modifier: 0, stock: 40 },
        { name: 'Digital Only', variation_type: 'general', price_modifier: -10, stock: null },
      ]
    },
    {
      name: 'Icon Bookmarks',
      description: 'Set of 11 bookmarks, each featuring a different Depth and Complexity icon with definition and question stems.',
      price: 8.99,
      image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Elementary'],
      variations: [
        { name: 'Single Set', variation_type: 'quantity', price_modifier: 0, stock: 100 },
        { name: '10-Pack', variation_type: 'quantity', price_modifier: 60, stock: 60 },
      ]
    },
    {
      name: 'Advanced Icon Combinations Guide',
      description: 'Expert guide to layering and combining multiple icons for advanced learning experiences. Includes 50+ examples.',
      price: 37.99,
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Teaching Resources', 'Icons', 'Advanced', 'Professional Development', 'Secondary'],
      variations: [
        { name: 'Print Edition', variation_type: 'general', price_modifier: 0, stock: 45 },
        { name: 'Digital PDF', variation_type: 'general', price_modifier: -10, stock: null },
      ]
    },
    {
      name: 'Student Reflection Journals',
      description: 'Structured journals for students to reflect on learning using Depth and Complexity icons. Pack of 25.',
      price: 28.99,
      image_url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Classroom Tools', 'Assessment', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Elementary Version', variation_type: 'general', price_modifier: 0, stock: 50 },
        { name: 'Secondary Version', variation_type: 'general', price_modifier: 0, stock: 50 },
      ]
    },
    {
      name: 'Icon Matching Game',
      description: 'Memory and matching game featuring Depth and Complexity icons. Great for centers and small groups.',
      price: 16.99,
      image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Interactive', 'Elementary'],
      variations: [
        { name: 'Standard Game', variation_type: 'general', price_modifier: 0, stock: 65 },
      ]
    },
    {
      name: 'Content Imperatives Bundle',
      description: 'Complete bundle covering Content Imperatives: Origin, Contribution, Parallel, Paradox, and Convergence.',
      price: 41.99,
      image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Teaching Resources', 'Advanced', 'Professional Development', 'Secondary'],
      variations: [
        { name: 'Print + Digital', variation_type: 'general', price_modifier: 0, stock: 35 },
      ]
    },
    {
      name: 'Icon Anchor Charts',
      description: 'Large format anchor charts (24x36) for each icon with definitions, examples, and question stems.',
      price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Visual Learning', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Full Set (11 charts)', variation_type: 'general', price_modifier: 0, stock: 25 },
        { name: 'Depth Icons Only (7)', variation_type: 'general', price_modifier: -20, stock: 30 },
        { name: 'Complexity Icons Only (4)', variation_type: 'general', price_modifier: -15, stock: 30 },
      ]
    },
    {
      name: 'Quick Reference Cards',
      description: 'Laminated quick reference cards with all icons, definitions, and question stems. Perfect for teacher desks.',
      price: 14.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      category: 'Teaching Resources',
      featured: 0,
      tags: ['Icons', 'Teaching Resources', 'Physical', 'Professional Development'],
      variations: [
        { name: 'Single Set', variation_type: 'quantity', price_modifier: 0, stock: 80 },
        { name: '5-Pack', variation_type: 'quantity', price_modifier: 50, stock: 40 },
      ]
    },
    {
      name: 'Digital Interactive Notebook',
      description: 'Editable digital interactive notebook templates for all 11 icons. Compatible with Google Slides and PowerPoint.',
      price: 26.99,
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Digital', 'Teaching Resources', 'Icons', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Standard License', variation_type: 'general', price_modifier: 0, stock: null },
      ]
    },
    {
      name: 'Icon Dice Set',
      description: 'Custom dice featuring Depth and Complexity icons. Roll to randomly select icons for activities and discussions.',
      price: 18.99,
      image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Interactive', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Single Set (11 dice)', variation_type: 'general', price_modifier: 0, stock: 60 },
      ]
    },
    {
      name: 'Professional Development Package',
      description: 'Complete PD package including workbooks, posters, cards, and digital resources. Perfect for schools and districts.',
      price: 299.99,
      image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Professional Development', 'Teaching Resources', 'Advanced', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Standard Package', variation_type: 'general', price_modifier: 0, stock: 15 },
        { name: 'Deluxe Package', variation_type: 'general', price_modifier: 100, stock: 10 },
      ]
    },
    {
      name: 'Icon Wall Decals',
      description: 'Removable wall decals featuring all 11 icons. Perfect for creating an immersive learning environment.',
      price: 89.99,
      image_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800',
      category: 'Classroom Tools',
      featured: 0,
      tags: ['Icons', 'Classroom Tools', 'Physical', 'Visual Learning', 'Elementary', 'Secondary'],
      variations: [
        { name: 'Small Set', variation_type: 'size', price_modifier: 0, stock: 20 },
        { name: 'Large Set', variation_type: 'size', price_modifier: 40, stock: 15 },
      ]
    },
    {
      name: 'Video Tutorial Series',
      description: 'Comprehensive video series walking through each icon with classroom examples and implementation strategies.',
      price: 79.99,
      image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      category: 'Teaching Resources',
      featured: 1,
      tags: ['Digital', 'Teaching Resources', 'Professional Development', 'Beginner', 'Advanced'],
      variations: [
        { name: 'Digital Access', variation_type: 'general', price_modifier: 0, stock: null },
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
    const productId = Number(result.lastInsertRowid);

    // Add tags
    for (const tagName of (product as any).tags || []) {
      if (tagMap[tagName]) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO product_tags (product_id, tag_id) VALUES (?, ?)',
          args: [productId, tagMap[tagName]]
        });
      }
    }

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
        { title: 'Getting Started', content: 'Practical first steps for implementing D&C in your teaching.', order_index: 4 },
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
        { title: 'Putting It All Together', content: 'Synthesizing all Depth icons in practice.', order_index: 8 },
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
        { title: 'Complexity in Action', content: 'Real-world examples of Complexity icons in use.', order_index: 5 },
      ]
    },
    {
      title: 'Advanced Implementation Strategies',
      description: 'Take your Depth and Complexity teaching to the next level with advanced implementation strategies.',
      price: 79.99,
      image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      status: 'published',
      lessons: [
        { title: 'Layering Multiple Icons', content: 'How to effectively combine multiple icons in lessons.', order_index: 1 },
        { title: 'Differentiation Strategies', content: 'Using D&C for differentiated instruction.', order_index: 2 },
        { title: 'Assessment with D&C', content: 'Creating assessments that leverage the framework.', order_index: 3 },
        { title: 'Advanced Questioning Techniques', content: 'Developing sophisticated questions using the icons.', order_index: 4 },
        { title: 'Cross-Curricular Applications', content: 'Applying D&C across all subject areas.', order_index: 5 },
      ]
    },
    {
      title: 'Elementary Implementation',
      description: 'Tailored strategies for implementing Depth and Complexity in elementary classrooms. Age-appropriate activities and resources.',
      price: 59.99,
      image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      status: 'published',
      lessons: [
        { title: 'Introduction to Elementary D&C', content: 'Overview of D&C for elementary educators.', order_index: 1 },
        { title: 'Age-Appropriate Icon Introduction', content: 'How to introduce icons to young learners.', order_index: 2 },
        { title: 'Hands-On Activities', content: 'Engaging activities for elementary students.', order_index: 3 },
        { title: 'Reading and Writing Integration', content: 'Using D&C in literacy instruction.', order_index: 4 },
        { title: 'Math and Science Applications', content: 'Applying icons to STEM subjects.', order_index: 5 },
      ]
    },
    {
      title: 'Secondary Implementation',
      description: 'Advanced strategies for middle and high school classrooms. Deepening student thinking and analysis.',
      price: 59.99,
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      status: 'published',
      lessons: [
        { title: 'Introduction to Secondary D&C', content: 'Overview of D&C for secondary educators.', order_index: 1 },
        { title: 'Critical Analysis with Icons', content: 'Using icons for deeper analysis and evaluation.', order_index: 2 },
        { title: 'Research and Inquiry Projects', content: 'Incorporating D&C into research projects.', order_index: 3 },
        { title: 'Literature and Social Studies', content: 'Advanced applications in humanities.', order_index: 4 },
        { title: 'STEM Deep Dives', content: 'Complex applications in science and math.', order_index: 5 },
      ]
    },
    {
      title: 'Content Imperatives Mastery',
      description: 'Master the Content Imperatives: Origin, Contribution, Parallel, Paradox, and Convergence. Advanced framework extension.',
      price: 69.99,
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      status: 'published',
      lessons: [
        { title: 'Introduction to Content Imperatives', content: 'Understanding the five Content Imperatives.', order_index: 1 },
        { title: 'Origin', content: 'Exploring the beginning and source of ideas.', order_index: 2 },
        { title: 'Contribution', content: 'Understanding impact and significance.', order_index: 3 },
        { title: 'Parallel', content: 'Identifying similarities and connections.', order_index: 4 },
        { title: 'Paradox', content: 'Exploring contradictions and tensions.', order_index: 5 },
        { title: 'Convergence', content: 'Understanding how ideas come together.', order_index: 6 },
        { title: 'Integrating Imperatives with Icons', content: 'Combining Content Imperatives with Depth and Complexity icons.', order_index: 7 },
      ]
    },
    {
      title: 'Assessment and Evaluation',
      description: 'Learn to create effective assessments using Depth and Complexity. Rubrics, projects, and authentic evaluation methods.',
      price: 54.99,
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      status: 'published',
      lessons: [
        { title: 'Assessment Philosophy', content: 'Understanding assessment through the D&C lens.', order_index: 1 },
        { title: 'Creating Icon-Based Rubrics', content: 'Designing rubrics that incorporate icons.', order_index: 2 },
        { title: 'Project-Based Assessments', content: 'Developing meaningful project assessments.', order_index: 3 },
        { title: 'Portfolio Evaluation', content: 'Using portfolios to track D&C growth.', order_index: 4 },
        { title: 'Student Self-Assessment', content: 'Teaching students to self-evaluate with icons.', order_index: 5 },
      ]
    },
    {
      title: 'Differentiation Mastery',
      description: 'Master the art of differentiation using Depth and Complexity. Strategies for meeting all learners where they are.',
      price: 64.99,
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      status: 'published',
      lessons: [
        { title: 'Differentiation Foundations', content: 'Core principles of differentiation with D&C.', order_index: 1 },
        { title: 'Tiered Activities', content: 'Creating tiered activities using icons.', order_index: 2 },
        { title: 'Flexible Grouping', content: 'Using D&C for strategic grouping.', order_index: 3 },
        { title: 'Choice Boards and Menus', content: 'Designing choice-based learning experiences.', order_index: 4 },
        { title: 'Accommodations and Modifications', content: 'Adapting D&C for diverse learners.', order_index: 5 },
      ]
    },
    {
      title: 'Questioning Strategies',
      description: 'Develop powerful questioning techniques using Depth and Complexity. Move beyond surface-level questions.',
      price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      status: 'published',
      lessons: [
        { title: 'The Power of Questions', content: 'Understanding how questions drive learning.', order_index: 1 },
        { title: 'Icon-Based Question Stems', content: 'Creating questions for each icon.', order_index: 2 },
        { title: 'Socratic Method with D&C', content: 'Using Socratic questioning with icons.', order_index: 3 },
        { title: 'Student-Generated Questions', content: 'Teaching students to ask deep questions.', order_index: 4 },
        { title: 'Questioning in Practice', content: 'Real classroom examples and scenarios.', order_index: 5 },
      ]
    },
    {
      title: 'Cross-Curricular Connections',
      description: 'Learn to seamlessly integrate Depth and Complexity across all subject areas. Breaking down silos.',
      price: 59.99,
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      status: 'published',
      lessons: [
        { title: 'The Power of Integration', content: 'Why cross-curricular learning matters.', order_index: 1 },
        { title: 'Literacy Across Content', content: 'Using D&C in reading and writing across subjects.', order_index: 2 },
        { title: 'STEM Integration', content: 'Connecting science, technology, engineering, and math.', order_index: 3 },
        { title: 'Arts Integration', content: 'Incorporating visual and performing arts.', order_index: 4 },
        { title: 'Thematic Units', content: 'Designing integrated thematic units with D&C.', order_index: 5 },
      ]
    },
    {
      title: 'Technology Integration',
      description: 'Harness technology to enhance Depth and Complexity instruction. Digital tools, apps, and online resources.',
      price: 54.99,
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      status: 'published',
      lessons: [
        { title: 'Digital Tools Overview', content: 'Introduction to technology tools for D&C.', order_index: 1 },
        { title: 'Interactive Whiteboards', content: 'Using interactive displays with icons.', order_index: 2 },
        { title: 'Digital Portfolios', content: 'Creating digital portfolios with D&C.', order_index: 3 },
        { title: 'Collaboration Tools', content: 'Using online collaboration with icon-based activities.', order_index: 4 },
        { title: 'Assessment Technology', content: 'Digital assessment tools and platforms.', order_index: 5 },
      ]
    },
    {
      title: 'Professional Learning Communities',
      description: 'Build effective PLCs around Depth and Complexity. Collaborative planning and shared practice.',
      price: 44.99,
      image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      status: 'published',
      lessons: [
        { title: 'PLC Foundations', content: 'Understanding effective PLC structures.', order_index: 1 },
        { title: 'Shared Planning with D&C', content: 'Collaborative lesson planning using icons.', order_index: 2 },
        { title: 'Data Analysis', content: 'Using student data to inform D&C instruction.', order_index: 3 },
        { title: 'Peer Observation', content: 'Observing and learning from colleagues.', order_index: 4 },
        { title: 'Sustaining PLCs', content: 'Maintaining momentum in professional learning.', order_index: 5 },
      ]
    },
    {
      title: 'Leadership and Coaching',
      description: 'For instructional coaches and leaders. Supporting teachers in implementing Depth and Complexity.',
      price: 79.99,
      image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      status: 'published',
      lessons: [
        { title: 'Coaching Philosophy', content: 'Coaching approaches for D&C implementation.', order_index: 1 },
        { title: 'Supporting New Teachers', content: 'Helping new educators get started.', order_index: 2 },
        { title: 'Advanced Teacher Support', content: 'Supporting experienced teachers in growth.', order_index: 3 },
        { title: 'School-Wide Implementation', content: 'Leading school-wide D&C initiatives.', order_index: 4 },
        { title: 'District-Level Support', content: 'Scaling D&C across multiple schools.', order_index: 5 },
      ]
    },
    {
      title: 'Special Populations',
      description: 'Adapting Depth and Complexity for English learners, special education, and gifted students.',
      price: 64.99,
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      status: 'published',
      lessons: [
        { title: 'English Language Learners', content: 'Supporting ELLs with D&C strategies.', order_index: 1 },
        { title: 'Special Education', content: 'Adaptations for students with special needs.', order_index: 2 },
        { title: 'Gifted and Talented', content: 'Extending learning for advanced students.', order_index: 3 },
        { title: 'Universal Design', content: 'Creating accessible learning for all.', order_index: 4 },
        { title: 'Cultural Responsiveness', content: 'Making D&C culturally relevant and responsive.', order_index: 5 },
      ]
    },
  ];

  for (const course of courses) {
    const result = await db.execute({
      sql: `INSERT INTO courses (title, description, price, image_url, status)
            VALUES (?, ?, ?, ?, ?)`,
      args: [course.title, course.description, course.price, course.image_url, course.status]
    });
    const courseId = Number(result.lastInsertRowid);

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
  const baseDate = Date.now();
  const webinars = [
    {
      title: 'Getting Started with Depth and Complexity',
      description: 'A beginner-friendly webinar introducing the framework and its classroom applications. Perfect for educators new to D&C.',
      date_time: new Date(baseDate + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example1',
      status: 'scheduled'
    },
    {
      title: 'Advanced Icon Combinations',
      description: 'Learn how to layer multiple icons for deeper learning experiences. Explore sophisticated implementation strategies.',
      date_time: new Date(baseDate + 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      meeting_url: 'https://zoom.us/j/example2',
      status: 'scheduled'
    },
    {
      title: 'Q&A Session: Your D&C Questions Answered',
      description: 'An open Q&A session where we answer your Depth and Complexity questions. Bring your challenges and successes!',
      date_time: new Date(baseDate + 21 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      meeting_url: 'https://zoom.us/j/example3',
      status: 'scheduled'
    },
    {
      title: 'Elementary Implementation Strategies',
      description: 'Tailored strategies for implementing Depth and Complexity in elementary classrooms. Age-appropriate activities and resources.',
      date_time: new Date(baseDate + 28 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      meeting_url: 'https://zoom.us/j/example4',
      status: 'scheduled'
    },
    {
      title: 'Secondary Implementation Deep Dive',
      description: 'Advanced strategies for middle and high school classrooms. Deepening student thinking and analysis with D&C.',
      date_time: new Date(baseDate + 35 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      meeting_url: 'https://zoom.us/j/example5',
      status: 'scheduled'
    },
    {
      title: 'Content Imperatives Workshop',
      description: 'Master the Content Imperatives: Origin, Contribution, Parallel, Paradox, and Convergence. Advanced framework extension.',
      date_time: new Date(baseDate + 42 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      meeting_url: 'https://zoom.us/j/example6',
      status: 'scheduled'
    },
    {
      title: 'Assessment and Evaluation with D&C',
      description: 'Learn to create effective assessments using Depth and Complexity. Rubrics, projects, and authentic evaluation methods.',
      date_time: new Date(baseDate + 49 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example7',
      status: 'scheduled'
    },
    {
      title: 'Differentiation Mastery Session',
      description: 'Master the art of differentiation using Depth and Complexity. Strategies for meeting all learners where they are.',
      date_time: new Date(baseDate + 56 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      meeting_url: 'https://zoom.us/j/example8',
      status: 'scheduled'
    },
    {
      title: 'Questioning Strategies Workshop',
      description: 'Develop powerful questioning techniques using Depth and Complexity. Move beyond surface-level questions to deep inquiry.',
      date_time: new Date(baseDate + 63 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example9',
      status: 'scheduled'
    },
    {
      title: 'Cross-Curricular Connections',
      description: 'Learn to seamlessly integrate Depth and Complexity across all subject areas. Breaking down silos and building connections.',
      date_time: new Date(baseDate + 70 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      meeting_url: 'https://zoom.us/j/example10',
      status: 'scheduled'
    },
    {
      title: 'Technology Integration with D&C',
      description: 'Harness technology to enhance Depth and Complexity instruction. Digital tools, apps, and online resources for modern classrooms.',
      date_time: new Date(baseDate + 77 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example11',
      status: 'scheduled'
    },
    {
      title: 'Building Professional Learning Communities',
      description: 'Build effective PLCs around Depth and Complexity. Collaborative planning and shared practice for continuous improvement.',
      date_time: new Date(baseDate + 84 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example12',
      status: 'scheduled'
    },
    {
      title: 'Leadership and Coaching Strategies',
      description: 'For instructional coaches and leaders. Supporting teachers in implementing Depth and Complexity across your school or district.',
      date_time: new Date(baseDate + 91 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      meeting_url: 'https://zoom.us/j/example13',
      status: 'scheduled'
    },
    {
      title: 'Special Populations: Adapting D&C',
      description: 'Adapting Depth and Complexity for English learners, special education, and gifted students. Inclusive strategies for all.',
      date_time: new Date(baseDate + 98 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      meeting_url: 'https://zoom.us/j/example14',
      status: 'scheduled'
    },
    {
      title: 'Summer Planning Intensive',
      description: 'Plan your next school year with Depth and Complexity. Curriculum mapping, unit planning, and year-long implementation strategies.',
      date_time: new Date(baseDate + 105 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      meeting_url: 'https://zoom.us/j/example15',
      status: 'scheduled'
    },
    {
      title: 'Research and Best Practices',
      description: 'Explore the research behind Depth and Complexity. Evidence-based practices and outcomes from classrooms nationwide.',
      date_time: new Date(baseDate + 112 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      meeting_url: 'https://zoom.us/j/example16',
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
      content: 'We are excited to launch our new Depth and Complexity learning platform. Explore our courses, products, and upcoming webinars! This platform is designed to support educators at every stage of their D&C journey.',
      status: 'published'
    },
    {
      title: 'New Course: Advanced Implementation Strategies',
      content: 'We are thrilled to announce our new Advanced Implementation Strategies course. Perfect for educators ready to take their D&C practice to the next level. Learn to layer multiple icons, differentiate instruction, and create sophisticated assessments.',
      status: 'published'
    },
    {
      title: 'Spring Webinar Series Announced',
      content: 'Join us for our Spring Webinar Series featuring 16 live sessions covering everything from getting started to advanced strategies. All webinars are free for registered users. Check the webinars page for dates and registration.',
      status: 'published'
    },
    {
      title: 'New Product: Digital Icon Library',
      content: 'Introducing our new Digital Icon Library! Complete collection of all Depth and Complexity icons in multiple formats. Perfect for creating digital resources, presentations, and online learning materials. Available now in the shop.',
      status: 'published'
    },
    {
      title: 'Summer Professional Development Opportunities',
      content: 'Plan your summer learning with our comprehensive course catalog. From beginner introductions to advanced leadership strategies, we have courses for every educator. Early bird pricing available through May 1st.',
      status: 'published'
    },
    {
      title: 'Content Imperatives Course Now Available',
      content: 'Our highly anticipated Content Imperatives Mastery course is now live! Master Origin, Contribution, Parallel, Paradox, and Convergence. This advanced course extends the D&C framework for deeper learning experiences.',
      status: 'published'
    },
    {
      title: 'Elementary Educators: Special Resources',
      content: 'New resources specifically designed for elementary classrooms! Check out our Elementary Implementation course, age-appropriate activities, and classroom tools perfect for young learners. Special bundle pricing available.',
      status: 'published'
    },
    {
      title: 'Secondary Implementation Deep Dive',
      content: 'Secondary educators, we hear you! Our new Secondary Implementation course is designed specifically for middle and high school classrooms. Learn strategies for deepening student thinking and analysis at the secondary level.',
      status: 'published'
    },
    {
      title: 'Assessment Toolkit Now Available',
      content: 'Create effective assessments using Depth and Complexity with our new Assessment and Evaluation course. Learn to design rubrics, projects, and authentic evaluation methods that leverage the framework.',
      status: 'published'
    },
    {
      title: 'Differentiation Mastery Course Launch',
      content: 'Master the art of differentiation using Depth and Complexity. Our new Differentiation Mastery course provides strategies for meeting all learners where they are. Perfect for diverse classrooms.',
      status: 'published'
    },
    {
      title: 'Technology Integration Resources',
      content: 'New course available: Technology Integration with D&C! Learn to harness technology to enhance Depth and Complexity instruction. Explore digital tools, apps, and online resources for modern classrooms.',
      status: 'published'
    },
    {
      title: 'Professional Learning Communities Support',
      content: 'Build effective PLCs around Depth and Complexity with our new course. Learn collaborative planning strategies and shared practice methods for continuous improvement in your school.',
      status: 'published'
    },
    {
      title: 'Leadership and Coaching Course',
      content: 'Instructional coaches and leaders: Support teachers in implementing Depth and Complexity with our new Leadership and Coaching course. Learn coaching approaches and school-wide implementation strategies.',
      status: 'published'
    },
    {
      title: 'Special Populations: Inclusive Strategies',
      content: 'New course available: Adapting Depth and Complexity for English learners, special education, and gifted students. Learn inclusive strategies that make D&C accessible and meaningful for all learners.',
      status: 'published'
    },
    {
      title: 'Holiday Sale: 20% Off All Courses',
      content: 'Celebrate the season with 20% off all courses! Use code HOLIDAY2024 at checkout. Valid through December 31st. Perfect time to invest in your professional development or gift a course to a colleague.',
      status: 'published'
    },
    {
      title: 'New Year, New Learning Goals',
      content: 'Start the new year with Depth and Complexity! Set your professional learning goals and explore our course catalog. Special New Year pricing on all courses through January 15th. Let\'s make 2024 the year of deeper learning.',
      status: 'published'
    },
    {
      title: 'Community Spotlight: Success Stories',
      content: 'Read inspiring success stories from educators using Depth and Complexity in their classrooms. From elementary to high school, see how D&C is transforming teaching and learning. Share your story with us!',
      status: 'published'
    },
    {
      title: 'Research and Evidence Base',
      content: 'Explore the research behind Depth and Complexity. Our new Research and Best Practices webinar shares evidence-based practices and outcomes from classrooms nationwide. Register now for the next session.',
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
