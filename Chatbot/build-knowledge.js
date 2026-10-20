import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://universalcode.site';

// Discovery list of 20 authoritative pages
const PAGE_SPECS = [
  { file: 'index.html', url: `${BASE_URL}/`, title: 'UCODE | Web Design & Digital Marketing Agency in Sri Lanka', category: 'home' },
  { file: 'about.html', url: `${BASE_URL}/about.html`, title: 'About UCODE | Web Design & Digital Agency in Sri Lanka', category: 'about' },
  { file: 'services.html', url: `${BASE_URL}/services.html`, title: 'Web Design, Development & Social Media Services Sri Lanka | UCODE', category: 'services' },
  { file: 'work.html', url: `${BASE_URL}/work.html`, title: 'Work & Portfolio | Web Design & Development Sri Lanka | UCODE', category: 'work' },
  { file: 'pricing.html', url: `${BASE_URL}/pricing.html`, title: 'Website Design Pricing & Packages Sri Lanka | UCODE', category: 'pricing' },
  { file: 'process.html', url: `${BASE_URL}/process.html`, title: 'Our Web Design & Development Process | UCODE Sri Lanka', category: 'process' },
  { file: 'contact.html', url: `${BASE_URL}/contact.html`, title: 'Contact UCODE | Web Design & Digital Agency in Sri Lanka', category: 'contact' },
  { file: 'privacy.html', url: `${BASE_URL}/privacy.html`, title: 'Privacy Policy | UCODE', category: 'policy' },
  { file: 'terms.html', url: `${BASE_URL}/terms.html`, title: 'Terms & Conditions | UCODE Web & Digital Agency', category: 'policy' },
  { file: 'blog.html', url: `${BASE_URL}/blog.html`, title: 'UCODE Blog & Digital Insights', category: 'blog_index' },
  { file: 'blog/natures-treasure-case-study.html', url: `${BASE_URL}/blog/natures-treasure-case-study.html`, title: "Nature's Treasure Case Study | UCODE", category: 'case_study' },
  { file: 'blog/how-to-choose-a-web-design-agency-sri-lanka.html', url: `${BASE_URL}/blog/how-to-choose-a-web-design-agency-sri-lanka.html`, title: 'How to Choose a Web Design Agency in Sri Lanka | UCODE', category: 'blog' },
  { file: 'blog/website-cost-guide-sri-lanka.html', url: `${BASE_URL}/blog/website-cost-guide-sri-lanka.html`, title: 'Website Cost Guide Sri Lanka | How Much Should a Website Cost? | UCODE', category: 'blog' },
  { file: 'blog/template-vs-custom-website.html', url: `${BASE_URL}/blog/template-vs-custom-website.html`, title: 'Template vs Custom Website Sri Lanka | UCODE', category: 'blog' },
  { file: 'blog/why-your-website-is-slow.html', url: `${BASE_URL}/blog/why-your-website-is-slow.html`, title: 'Why Your Website Is Slow and How to Fix It | UCODE', category: 'blog' },
  { file: 'blog/what-is-a-cms.html', url: `${BASE_URL}/blog/what-is-a-cms.html`, title: 'What Is a CMS and Does Your Business Need One? | UCODE', category: 'blog' },
  { file: 'blog/signs-your-website-is-costing-customers.html', url: `${BASE_URL}/blog/signs-your-website-is-costing-customers.html`, title: '7 Signs Your Website Is Costing You Customers | UCODE', category: 'blog' },
  { file: 'blog/seo-basics-for-small-business.html', url: `${BASE_URL}/blog/seo-basics-for-small-business.html`, title: 'SEO Basics for Small Business in Sri Lanka | UCODE', category: 'blog' },
  { file: 'blog/website-maintenance-after-launch.html', url: `${BASE_URL}/blog/website-maintenance-after-launch.html`, title: 'Website Maintenance After Launch: What You Need to Know | UCODE', category: 'blog' },
  { file: 'blog/ecommerce-vs-business-website.html', url: `${BASE_URL}/blog/ecommerce-vs-business-website.html`, title: 'E-commerce vs Business Website: Which One Does Your Business Need? | UCODE', category: 'blog' },
];

function cleanHtmlText(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&bull;/g, '•')
    .replace(/&rarr;/g, '→')
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(content) {
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                    content.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  return {
    title: titleMatch ? cleanHtmlText(titleMatch[1]) : '',
    description: descMatch ? cleanHtmlText(descMatch[1]) : ''
  };
}

function extractJsonLd(content) {
  const matches = content.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  const items = [];
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      items.push(parsed);
    } catch (e) {
      // Ignore invalid JSON-LD
    }
  }
  return items;
}

function extractKeywords(text) {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
    'as', 'of', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'us',
    'you', 'your', 'he', 'him', 'his', 'she', 'her', 'which', 'who', 'whom', 'what', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't',
    'just', 'don', 'now'
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0]);
}

function buildKnowledgeBase() {
  const chunks = [];
  const crawlReport = {
    crawlDate: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalDiscovered: PAGE_SPECS.length,
    processed: 0,
    failed: 0,
    skipped: 0,
    pages: [],
    categoryBreakdown: {}
  };

  for (const spec of PAGE_SPECS) {
    const filePath = path.join(rootDir, spec.file);
    if (!fs.existsSync(filePath)) {
      crawlReport.failed++;
      crawlReport.pages.push({ file: spec.file, url: spec.url, status: 'FAILED_MISSING' });
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf8');
    const meta = extractMeta(html);
    const jsonLd = extractJsonLd(html);

    crawlReport.processed++;
    crawlReport.pages.push({
      file: spec.file,
      url: spec.url,
      title: meta.title || spec.title,
      description: meta.description,
      status: 'SUCCESS',
      bytes: Buffer.byteLength(html, 'utf8'),
      jsonLdCount: jsonLd.length
    });

    const category = spec.category;
    crawlReport.categoryBreakdown[category] = (crawlReport.categoryBreakdown[category] || 0) + 1;

    // 1. Page Overview Chunk
    const heroMatch = html.match(/<section[^>]*class=["'][^"']*hero[^"']*["'][\s\S]*?<\/section>/i);
    const heroText = heroMatch ? cleanHtmlText(heroMatch[0]) : '';
    chunks.push({
      id: `${path.basename(spec.file, '.html')}_overview`,
      page_url: spec.url,
      page_title: meta.title || spec.title,
      section_heading: 'Page Overview & Purpose',
      content_type: category === 'blog' ? 'blog' : (category === 'case_study' ? 'case_study' : 'agency_overview'),
      content_text: `${meta.title}. ${meta.description} ${heroText}`,
      relevant_keywords: extractKeywords(`${meta.title} ${meta.description} ${heroText}`)
    });

    // 2. Extract FAQs from Schema JSON-LD and HTML
    for (const ld of jsonLd) {
      if (Array.isArray(ld)) {
        for (const sub of ld) {
          processJsonLdItem(sub, spec, chunks);
        }
      } else {
        processJsonLdItem(ld, spec, chunks);
      }
    }

    // 3. Page specific detailed deep chunking
    if (spec.file === 'about.html') {
      // Leadership & Founders
      chunks.push({
        id: 'about_founders_leadership',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Leadership & Founders',
        content_type: 'team',
        content_text: `UCODE Leadership Team:
1. Abdullah Arshad - Co-Founder & CEO at UCODE. Creative Developer who leads agency vision, strategic growth, visual direction, and creative development, ensuring every digital experience is built with purpose and clarity.
2. Umar Hunais - Co-Founder & COO at UCODE. Manages agency operations, project delivery workflows, client execution, and technical architecture.
CEO Note by Abdullah Arshad: UCODE believes a website should be more than just a digital presence—it should be a clear reflection of a business, its values, and create trust. UCODE standard: build with purpose, design with intention, and deliver with confidence.`,
        relevant_keywords: ['abdullah', 'arshad', 'umar', 'hunais', 'founder', 'founders', 'ceo', 'coo', 'leadership', 'team', 'who', 'runs', 'owners']
      });

      // Agency Philosophy & Values
      chunks.push({
        id: 'about_philosophy_values',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Philosophy & Core Values',
        content_type: 'agency_overview',
        content_text: `UCODE Philosophy and Approach:
- Philosophy: Websites should not simply look good. They should clarify the offer, guide the visitor and create trust before a conversation begins.
- Approach: Design and engineering move together. Structure, interface decisions, and front-end execution are treated as one connected product experience.
- Values:
  1. Craft: Every detail intentional from typography to interaction states.
  2. Clarity: Strong websites make the business easier to understand and choose.
  3. Performance: Fast, accessible pages are part of the core experience.
  4. Innovation: Modern ideas used when they improve the outcome, not as decoration.
  5. Partnership: Direct collaboration and clear decisions.`,
        relevant_keywords: ['philosophy', 'values', 'craft', 'clarity', 'performance', 'innovation', 'partnership', 'standards', 'mission']
      });
    }

    if (spec.file === 'pricing.html') {
      // Pricing Packages
      chunks.push({
        id: 'pricing_packages_core',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Website Packages & Exact Prices',
        content_type: 'pricing',
        content_text: `Official UCODE Website Packages & Pricing (Sri Lanka & Global):
1. Basic Package - LKR 20,000:
   - Target Scope: Informational website for businesses wanting a clear online presence.
   - Core Page Limit: Up to 5 pages.
   - Design: Clean, attractive UI, basic interactions.
   - Deliverables: 1 simple contact form.
   - Revisions: 1 round included.
   - Delivery Timeline: 2 to 3 weeks.
   - Exclusions: No performance tuning, no SEO readiness, no CMS/editable content, no post-launch support.
   - Maintenance: Starts from 5,000 LKR / month.

2. Premium Package - LKR 30,000 (Most Popular / Featured):
   - Target Scope: Small businesses selling online with a polished catalog experience.
   - Core Page Limit: Up to 10 pages.
   - Features: WhatsApp integration, product catalogue / display, modern product interactions.
   - Performance: Mobile responsive + product catalogue.
   - SEO: Advanced SEO & analytics readiness included.
   - Forms: Up to 3 custom contact forms.
   - CMS: Optional CMS integration.
   - Revisions: 2 rounds included.
   - Post-launch Support: 30 days included.
   - Delivery Timeline: 2 to 3 weeks.
   - Maintenance: Starts from 5,000 LKR / month.

3. Custom Package - "Let's talk" (Custom Quote):
   - Target Scope: Tailored digital solutions, complex web apps, and full e-commerce systems.
   - Core Page Limit: Unlimited pages & features.
   - Features: Full e-commerce (cart + checkout), custom integrations & CRM, advanced SEO & analytics, fully integrated custom CMS, custom forms & integrations setup.
   - Revisions: Multiple / flexible stages.
   - Support: Ongoing retainer options and maintenance.
   - Timeline: Custom timeline based on milestones.

Important Billing Notes:
- Domain (.lk, .com) and database hosting are billed separately.
- Monthly maintenance starts from 5,000 LKR/month and varies by website.
- Standard project payment terms: 50% upfront deposit before design/development, remaining 50% upon final project approval prior to launch.`,
        relevant_keywords: ['pricing', 'price', 'cost', 'packages', 'basic', 'premium', 'custom', '20000', '30000', 'lkr', 'revisions', 'timeline', 'deposit', 'fee', 'rates', 'maintenance', '5000']
      });

      // Side-by-side comparison table
      chunks.push({
        id: 'pricing_comparison_table',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Detailed Package Comparison Table',
        content_type: 'pricing_comparison',
        content_text: `Side-by-Side Comparison of UCODE Packages (Basic vs Premium vs Custom):
- Target Scope: Basic (Informational website) | Premium (Product catalogue / display) | Custom (Tailored digital solution).
- Core Page Limit: Basic (Up to 5 pages) | Premium (Up to 10 pages) | Custom (Unlimited pages & features).
- Design Complexity: Basic (Clean, attractive UI) | Premium (Product catalogue / display) | Custom (Tailored custom experience).
- Performance Tuning: Basic (No) | Premium (Mobile responsive + product catalogue) | Custom (E-commerce + analytics).
- Interactive Animations: Basic (Basic website interactions) | Premium (Modern product interactions) | Custom (Custom dynamic features).
- SEO Readiness: Basic (No) | Premium (Advanced SEO & analytics) | Custom (Advanced SEO & analytics).
- Revisions Allowed: Basic (1 round) | Premium (2 rounds) | Custom (Multiple / Flexible stages).
- Post-launch Support: Basic (None) | Premium (30 days included) | Custom (Ongoing retainer option).
- CMS / Editable Content: Basic (No) | Premium (Optional integration) | Custom (Fully integrated custom CMS).
- Contact Forms: Basic (1 Simple Form) | Premium (Up to 3 Custom Forms) | Custom (Custom forms & integrations setup).
- Average Timeline: Basic (2 to 3 weeks) | Premium (2 to 3 weeks) | Custom (Custom timeline).
- Monthly Maintenance: Basic (From 5,000 LKR / month) | Premium (From 5,000 LKR / month) | Custom (From 5,000 LKR / month).`,
        relevant_keywords: ['compare', 'comparison', 'differences', 'basic vs premium', 'revisions', 'cms', 'seo', 'pages', 'forms', 'support', 'table']
      });
    }

    if (spec.file === 'services.html') {
      // 9 Web Services
      chunks.push({
        id: 'services_web_development_list',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Complete Web Design & Development Services',
        content_type: 'service',
        content_text: `UCODE Full Suite of Digital & Web Engineering Services:
01. Website Design: Original page systems, visual direction, responsive layouts, content hierarchy, interaction states for new brands and refreshes.
02. Website Development: Clean, semantic front-end builds using HTML, modern CSS, and vanilla JavaScript without heavy frameworks, guaranteeing sub-second speed.
03. UI/UX Design: Wireframes, user flow planning, interface systems, dashboards, and conversion-focused web apps.
04. Landing Pages: High-converting single pages built for product launches, ad campaigns, and waitlists.
05. Website Redesign: Comprehensive audit, content restructuring, visual redesign, and front-end rebuild for outdated sites.
06. Performance Optimization: Asset review, CSS cleanup, layout shift reduction, and speed fixes for slow sites.
07. SEO Services & Search Optimization: Semantic HTML structure, OpenGraph/Twitter metadata, heading hierarchy, alt text, and schema markup foundations.
08. Website Maintenance: Post-launch updates, security checks, bug fixes, and continuous technical refinements starting from 5,000 LKR/mo.
09. Customer Tracking & CMS Backend: Custom backend architectures, database integration, custom admin dashboards, order tracking workflows, and client portals.`,
        relevant_keywords: ['services', 'web design', 'web development', 'ui/ux', 'landing pages', 'redesign', 'speed', 'optimization', 'seo', 'maintenance', 'cms', 'backend', 'tracking']
      });

      // Social Media Management
      chunks.push({
        id: 'services_social_media_handling',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Social Media Handling & Creative Brand Management',
        content_type: 'service',
        content_text: `UCODE Social Media Handling Service:
End-to-end creative direction, planned and published with discipline:
1. Strategy & Planning: Content calendars, audience analysis, and platform strategy.
2. Content Creation: Branded posts, educational carousels, stories, short-form reels, campaign graphics.
3. Copy & Captions: Authentic brand voice, engaging copywriting without fluff.
4. Scheduling & Publishing: Reliable publishing during peak visitor engagement windows.
5. Community Management: Monitoring comments, direct inquiries, and audience interaction.
6. Performance & Insights: Reviewing interaction metrics to elevate future creatives.
Featured Social Media Work:
- Oh Donuts Kandy: Client social media direction, content creation, and brand storytelling.
- UCODE Agency: Social media creative systems, carousel architecture, and interface showcases on Instagram (@ucodelk).`,
        relevant_keywords: ['social media', 'instagram', 'content creation', 'carousels', 'reels', 'captions', 'scheduling', 'community', 'oh donuts', 'kandy', 'marketing']
      });
    }

    if (spec.file === 'work.html') {
      // Case Studies & Conceptual Sandbox
      chunks.push({
        id: 'work_portfolio_case_studies',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Client Projects & Case Studies',
        content_type: 'portfolio',
        content_text: `UCODE Verified Client Projects & Case Studies:
1. Nature's Treasure (naturestreasurelk.com):
   - Industry: E-commerce, Natural Organic Products & Backend Engineering (Ceylon spices, herbal remedies).
   - Challenge: Needed a high-speed online storefront backed by robust backend architecture for catalog, inventory, and order management for global buyers.
   - Solution: Bespoke storefront with smooth product filtering, natural aesthetic, custom backend API, speed optimization, and mobile shopping funnel.
   - Outcome: Sub-second load times, streamlined global conversions. Full case study at universalcode.site/blog/natures-treasure-case-study.html.

2. UCODE Agency (universalcode.site):
   - Industry: Digital Agency, Web Systems & Brand Positioning.
   - Solution: Modern ultra-fast agency portal, bespoke visual hierarchy, dark/light theme toggle, interactive pricing comparison, and conversion inquiry funnels.

3. Wakanda FC (umarhunais.github.io/Wakanda-FC/):
   - Industry: Sports Club, Futsal & Brand Media in Sri Lanka.
   - Solution: Immersive dark-aesthetic sports web hub showcasing futsal squad rosters, championship trophies, player profiles, and club legacy.`,
        relevant_keywords: ['portfolio', 'work', 'projects', 'natures treasure', 'naturestreasurelk.com', 'wakanda fc', 'futsal', 'case study', 'ecommerce', 'examples']
      });

      chunks.push({
        id: 'work_conceptual_sandbox',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Creative Sandbox & Conceptual Prototypes',
        content_type: 'portfolio',
        content_text: `UCODE Conceptual Design Prototypes across Industries:
1. My Fitness (Gym): High-energy, dark-themed fitness club landing page with high-contrast accents (umarhunais.github.io/myfitness/).
2. Frames LK (Photography): Clean, editorial photography portfolio showcasing Sri Lanka's premier photography studio (umarhunais.github.io/frameslk/).
3. Aroma (Perfume / E-Commerce): Dark luxury e-commerce experience for high-end fragrance with gold accents and dramatic staging.
4. Ceylon Crown / Salon (Colombo Grooming): Dark editorial booking landing page styled for modern gentlemen (umarhunais.github.io/Salon1/).
5. Al Noor Grand Mosque (Community & Faith): Serene cultural community portal featuring automated daily prayer timetables, community events, schedules, and donation channels (ucodelk.github.io/Mosque/).`,
        relevant_keywords: ['concepts', 'prototypes', 'gym', 'my fitness', 'frames lk', 'photography', 'aroma', 'perfume', 'salon', 'ceylon crown', 'mosque', 'al noor']
      });
    }

    if (spec.file === 'process.html') {
      chunks.push({
        id: 'process_7_stages',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'UCODE 7-Stage Engineering Methodology',
        content_type: 'process',
        content_text: `How UCODE Builds High-Performance Websites (7 Stages):
Stage 01: Discovery - Understand business goals, target audience, competitors, existing website, and technical requirements.
Stage 02: Strategy - Define site architecture, content positioning, conversion pathways, and user journey.
Stage 03: Design - Create bespoke visual design system, typography, key responsive page layouts, and interaction direction.
Stage 04: Development - Clean, semantic front-end coding using HTML, modern CSS, and vanilla JavaScript (no heavy bloated frameworks).
Stage 05: Testing - Rigorous testing of mobile responsiveness across devices, cross-browser compatibility, form submissions, accessibility, and Core Web Vitals speed.
Stage 06: Launch - Final asset optimization, search schema integration, OpenGraph setup, domain connection, and public deployment.
Stage 07: Support - Ongoing refinement, minor content updates, security checks, and monthly maintenance.`,
        relevant_keywords: ['process', 'how it works', 'steps', 'stages', 'methodology', 'discovery', 'strategy', 'design', 'development', 'testing', 'launch', 'support', 'workflow']
      });
    }

    if (spec.file === 'contact.html') {
      chunks.push({
        id: 'contact_official_details',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Official Contact Channels & Inquiries',
        content_type: 'contact',
        content_text: `UCODE Official Contact Information & Links:
- Website: https://universalcode.site
- Direct WhatsApp: +94 76 059 5115 (Clickable link: https://wa.me/94760595115)
- Official Email: ucodelk26@gmail.com (mailto:ucodelk26@gmail.com)
- Instagram: https://www.instagram.com/ucodelk/ (@ucodelk)
- Project Inquiry Form: Available directly on https://universalcode.site/contact.html
- Leadership: Abdullah Arshad (Co-Founder & CEO) and Umar Hunais (Co-Founder & COO)
- Typical Initial Response Time: Within 24 hours for project inquiries and scope estimates.`,
        relevant_keywords: ['contact', 'whatsapp', 'phone', 'number', 'email', 'reach', 'instagram', 'address', 'message', 'inquiry', 'quote', 'talk', '+94760595115']
      });
    }

    if (spec.file === 'terms.html') {
      chunks.push({
        id: 'terms_legal_policies',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Terms of Service, Revisions & Payment Terms',
        content_type: 'policy',
        content_text: `UCODE Terms & Conditions Summary:
- Effective Date: August 17, 2026. Governed by the laws of Sri Lanka.
- Payment Structure: 50% upfront deposit before design & development commencement; remaining 50% balance due upon final project approval prior to domain launch or code handoff.
- Domain & Hosting Exclusions: Domain registration (.lk, .com) and cloud hosting are billed separately unless explicitly included.
- Revision Rounds: Basic package includes 1 round; Premium package includes 2 rounds; Custom package specifies revision stages in scope agreement. Client has 5 business days to provide consolidated feedback.
- Intellectual Property: Upon final payment in full, the Client owns all custom design files, front-end code, assets, and unique content created specifically for the project. UCODE retains the right to display the work in its agency portfolio.
- Maintenance: Starts from 5,000 LKR/month covering server monitoring, minor updates, and security checks.
- Cancellation / Termination: Deposits are non-refundable to cover allocated design and engineering hours; client is billed for work completed up to termination date.`,
        relevant_keywords: ['terms', 'conditions', 'legal', 'payment', 'deposit', '50%', 'revisions', 'ownership', 'intellectual property', 'refund', 'cancellation', 'sri lanka']
      });
    }

    if (spec.file === 'privacy.html') {
      chunks.push({
        id: 'privacy_policy_data',
        page_url: spec.url,
        page_title: meta.title,
        section_heading: 'Privacy Policy & Data Handling',
        content_type: 'policy',
        content_text: `UCODE Privacy Policy Summary:
- Data Collection: We collect contact info (name, email, company, project requirements) submitted voluntarily via contact forms.
- Usage: Information is used solely for preparing project proposals, responding to inquiries, and delivering services.
- Data Protection: We do not sell, rent, or trade client or visitor personal information to third parties.
- Analytics: Standard privacy-compliant analytics (e.g. Google Tag Manager) used to measure aggregate site performance and traffic without identifying individuals.
- Inquiries: For privacy inquiries, email ucodelk26@gmail.com.`,
        relevant_keywords: ['privacy', 'policy', 'data', 'security', 'cookies', 'tracking', 'information', 'gdpr']
      });
    }

    // Blog articles detailed knowledge
    if (spec.file.startsWith('blog/')) {
      const articleMatch = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
      const articleText = articleMatch ? cleanHtmlText(articleMatch[0]) : '';
      
      // Store comprehensive blog chunk
      chunks.push({
        id: `${path.basename(spec.file, '.html')}_deep`,
        page_url: spec.url,
        page_title: meta.title,
        section_heading: `Article Insights: ${meta.title}`,
        content_type: spec.file.includes('case-study') ? 'case_study' : 'blog',
        content_text: `${meta.title}\n\nSummary: ${meta.description}\n\nKey Concepts & Analysis:\n${articleText.substring(0, 3200)}`,
        relevant_keywords: extractKeywords(`${meta.title} ${meta.description} ${articleText.substring(0, 1000)}`)
      });
    }
  }

  // Deduplicate chunks by ID
  const seenIds = new Set();
  const uniqueChunks = [];
  for (const c of chunks) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      uniqueChunks.push(c);
    }
  }

  console.log(`Extracted ${uniqueChunks.length} unique knowledge chunks across ${PAGE_SPECS.length} pages.`);

  // Write knowledge-base.json
  const jsonPath = path.join(__dirname, 'knowledge-base.json');
  fs.writeFileSync(jsonPath, JSON.stringify(uniqueChunks, null, 2), 'utf8');

  // Write knowledge-base.js (ES module)
  const jsPath = path.join(__dirname, 'knowledge-base.js');
  const jsContent = `// Auto-generated UCODE Website Knowledge Base
// Generated on: ${new Date().toISOString()}
// Total authoritative chunks: ${uniqueChunks.length}

export const KNOWLEDGE_BASE = ${JSON.stringify(uniqueChunks, null, 2)};
`;
  fs.writeFileSync(jsPath, jsContent, 'utf8');

  // Write crawl-report.json
  const reportPath = path.join(__dirname, 'crawl-report.json');
  crawlReport.totalChunksGenerated = uniqueChunks.length;
  fs.writeFileSync(reportPath, JSON.stringify(crawlReport, null, 2), 'utf8');

  console.log(`Files generated successfully:
- ${jsonPath}
- ${jsPath}
- ${reportPath}`);
}

function processJsonLdItem(item, spec, chunks) {
  if (!item || typeof item !== 'object') return;

  if (item['@type'] === 'FAQPage' && Array.isArray(item.mainEntity)) {
    for (const q of item.mainEntity) {
      if (q['@type'] === 'Question' && q.name && q.acceptedAnswer?.text) {
        const questionText = cleanHtmlText(q.name);
        const answerText = cleanHtmlText(q.acceptedAnswer.text);
        const chunkId = `faq_${spec.file.replace(/[\/\.]/g, '_')}_${questionText.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)}`;
        chunks.push({
          id: chunkId,
          page_url: spec.url,
          page_title: spec.title,
          section_heading: `FAQ: ${questionText}`,
          content_type: 'faq',
          content_text: `Frequently Asked Question:
Q: ${questionText}
A: ${answerText}`,
          relevant_keywords: extractKeywords(`${questionText} ${answerText}`)
        });
      }
    }
  }
}

buildKnowledgeBase();
