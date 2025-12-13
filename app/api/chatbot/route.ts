import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful assistant for The Center for Depth and Complexity, an educational platform that provides professional development, courses, products, and resources related to the Depth and Complexity framework.

Your role is to help users learn about:
1. **Products**: Icon Magnets, Q3 Question Stems, Icon Cards, Graphic Organizers, TALK Cards, Differentiation Guide, and other teaching resources
2. **Courses**: Professional development courses including Introduction to Depth and Complexity, Advanced Techniques, and Administrator courses
3. **Webinars**: Upcoming and scheduled webinars on various topics
4. **The Depth and Complexity Framework**: The 11 icons, implementation strategies, content imperatives, and best practices
5. **General Information**: Announcements, registration, enrollment, and platform features

When answering questions:
- Be friendly, professional, and educational
- Provide specific information when available
- If you don't know something, suggest where they can find more information (shop, courses, webinars pages)
- Encourage exploration of products and courses
- Use the context provided about available products, courses, and webinars

Current statistics:
- 9 Countries
- 45 States
- 102,002 Classrooms
- 2,406,124 Students

Always be helpful and guide users to the most relevant resources on the platform.`;

async function getSiteContext() {
  // Fetch current products
  const productsResult = await db.execute(`
    SELECT name, description, price, category
    FROM products
    WHERE status = 'active'
    ORDER BY featured DESC, created_at DESC
    LIMIT 10
  `);

  // Fetch current courses
  const coursesResult = await db.execute(`
    SELECT title, description, price, status
    FROM courses
    WHERE status = 'published'
    ORDER BY created_at DESC
    LIMIT 10
  `);

  // Fetch upcoming webinars
  const webinarsResult = await db.execute(`
    SELECT title, description, date_time, duration
    FROM webinars
    WHERE status = 'scheduled' AND date_time > datetime('now')
    ORDER BY date_time ASC
    LIMIT 5
  `);

  return {
    products: productsResult.rows,
    courses: coursesResult.rows,
    webinars: webinarsResult.rows,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get current site context
    const context = await getSiteContext();

    // Build context string for the AI
    let contextString = `\n\nCurrent Site Information:\n\n`;
    
    if (context.products.length > 0) {
      contextString += `Available Products:\n`;
      context.products.forEach((p: any) => {
        contextString += `- ${p.name}: ${p.description || 'No description'} ($${parseFloat(p.price).toFixed(2)})\n`;
      });
      contextString += `\n`;
    }

    if (context.courses.length > 0) {
      contextString += `Available Courses:\n`;
      context.courses.forEach((c: any) => {
        const price = parseFloat(c.price) === 0 ? 'Free' : `$${parseFloat(c.price).toFixed(2)}`;
        contextString += `- ${c.title}: ${c.description || 'No description'} (${price})\n`;
      });
      contextString += `\n`;
    }

    if (context.webinars.length > 0) {
      contextString += `Upcoming Webinars:\n`;
      context.webinars.forEach((w: any) => {
        const date = new Date(w.date_time).toLocaleDateString();
        contextString += `- ${w.title}: ${w.description || 'No description'} (${date})\n`;
      });
      contextString += `\n`;
    }

    // Keyword-based response system (works without API key)
    const lowerMessage = message.toLowerCase();

    let response = '';

    if (lowerMessage.includes('product') || lowerMessage.includes('shop') || lowerMessage.includes('buy')) {
      response = `We offer several products to support Depth and Complexity implementation:\n\n`;
      context.products.slice(0, 5).forEach((p: any) => {
        response += `• **${p.name}** - $${parseFloat(p.price).toFixed(2)}\n`;
        if (p.description) {
          response += `  ${p.description.substring(0, 100)}...\n`;
        }
      });
      response += `\nYou can browse all products in our shop. Would you like to know more about any specific product?`;
    } else if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('training')) {
      response = `We offer professional development courses:\n\n`;
      context.courses.forEach((c: any) => {
        const price = parseFloat(c.price) === 0 ? 'Free' : `$${parseFloat(c.price).toFixed(2)}`;
        response += `• **${c.title}** - ${price}\n`;
        if (c.description) {
          response += `  ${c.description.substring(0, 100)}...\n`;
        }
      });
      response += `\nYou can explore all courses on our courses page. Would you like information about enrolling in a specific course?`;
    } else if (lowerMessage.includes('webinar') || lowerMessage.includes('event')) {
      if (context.webinars.length > 0) {
        response = `Here are our upcoming webinars:\n\n`;
        context.webinars.forEach((w: any) => {
          const date = new Date(w.date_time).toLocaleDateString();
          response += `• **${w.title}** - ${date}\n`;
          if (w.description) {
            response += `  ${w.description.substring(0, 100)}...\n`;
          }
        });
        response += `\nYou can register for these webinars on our webinars page.`;
      } else {
        response = `We don't have any upcoming webinars scheduled at the moment. Check back soon or visit our webinars page for updates!`;
      }
    } else if (lowerMessage.includes('depth') && lowerMessage.includes('complexity')) {
      response = `The Depth and Complexity framework is a powerful tool for developing critical thinking in students. It consists of 11 icons that represent different ways of thinking deeply about content:\n\n`;
      response += `• **Language of the Discipline** - Specialized vocabulary\n`;
      response += `• **Details** - Parts, factors, variables\n`;
      response += `• **Patterns** - Recurring elements\n`;
      response += `• **Rules** - Structure, order, hierarchy\n`;
      response += `• **Ethics** - Points of view, opinions\n`;
      response += `• **Trends** - Forces, direction\n`;
      response += `• **Unanswered Questions** - Ambiguities, missing information\n`;
      response += `• **Big Ideas** - Generalizations, principles\n`;
      response += `• **Across Disciplines** - Connections to other fields\n`;
      response += `• **Over Time** - Past, present, future\n`;
      response += `• **Multiple Perspectives** - Different viewpoints\n\n`;
      response += `Would you like to learn more about implementing these in your classroom, or explore our products and courses?`;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      response = `I can help you with:\n\n`;
      response += `• **Products** - Information about our teaching resources and materials\n`;
      response += `• **Courses** - Professional development courses and training\n`;
      response += `• **Webinars** - Upcoming events and registration\n`;
      response += `• **Depth and Complexity Framework** - The 11 icons and implementation strategies\n`;
      response += `• **General Questions** - About our platform and services\n\n`;
      response += `What would you like to know more about?`;
    } else {
      response = `I'd be happy to help! Could you tell me more about what you're looking for? I can help with:\n\n`;
      response += `• Information about our products\n`;
      response += `• Details about our courses\n`;
      response += `• Upcoming webinars\n`;
      response += `• The Depth and Complexity framework\n\n`;
      response += `Feel free to ask me anything specific!`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
