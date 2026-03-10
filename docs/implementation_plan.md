# Phase 3: Project Catalog & Detail Pages - Implementation Plan

Complete project browsing experience with search, filters, pagination, and detailed project pages with tier-based pricing.

## User Review Required

> [!IMPORTANT]
> **Sample Projects & Images**
> For the catalog to look impressive, we need sample project data. I can:
> 1. **Create a seed script** with 20-30 realistic projects
> 2. **Use placeholder images** initially (can be replaced later)
> 
> Should I proceed with creating sample data?

> [!WARNING]
> **Image Hosting Strategy**
> Project images can be handled in two ways:
> 1. **Placeholder URLs** - Use placeholder image services initially
> 2. **Local public folder** - Store sample images in `/public/projects/`
> 
> Which approach do you prefer for now?

---

## Proposed Changes

### Database & Seeding

#### [NEW] [seed.ts](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/prisma/seed.ts)

Seed script to populate database with sample projects.

**Sample data includes**:
- 20-30 diverse projects across all categories
- Realistic pricing tiers (Basic, Standard, Premium)
- Multiple tech stacks (MERN, Django, Spring Boot, etc.)
- Features, modules, and viva questions
- Professional descriptions

**Categories covered**:
- E-Commerce & Marketplace
- Social Media & Networking
- Healthcare & Fitness
- Education & Learning
- Finance & Banking
- Travel & Hospitality
- Real Estate
- Entertainment & Media

---

### API Routes

#### [NEW] [projects/route.ts](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/app/api/projects/route.ts)

**Endpoint**: `GET /api/projects`

**Query Parameters**:
```typescript
{
  search?: string,          // Search in title/description
  category?: string,        // Filter by category
  techStack?: string[],     // Filter by tech stack
  minPrice?: number,        // Minimum price
  maxPrice?: number,        // Maximum price
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular',
  page?: number,            // Page number (default: 1)
  limit?: number            // Items per page (default: 12)
}
```

**Response**:
```typescript
{
  projects: Project[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  },
  filters: {
    categories: string[],
    techStacks: string[],
    priceRange: { min: number, max: number }
  }
}
```

---

#### [NEW] [[slug]/route.ts](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/app/api/projects/[slug]/route.ts)

**Endpoint**: `GET /api/projects/[slug]`

**Response**: Complete project details including:
- Basic info (title, description, slug)
- All three pricing tiers
- Features, modules, tech stack
- Requirements, installation steps
- Screenshots, demo URL
- Viva Q&A

---

### Project Catalog Page

#### [NEW] [projects/page.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/app/projects/page.tsx)

Main catalog page with modern layout.

**Features**:
- **Grid/List Toggle** - Switch between card grid and list view
- **Search Bar** - Real-time search with debouncing
- **Filter Sidebar** - Category, tech stack, price range filters
- **Sort Options** - Newest, price (low/high), popular
- **Pagination** - Load more or numbered pagination
- **Empty States** - Beautiful "no results" display

**Layout**:
```
┌─────────────────────────────────────┐
│  Header: Search + View Toggle      │
├─────────┬───────────────────────────┤
│ Filters │  Project Grid (3 cols)   │
│ Sidebar │                           │
│         │  [Card] [Card] [Card]     │
│ - Cat.  │  [Card] [Card] [Card]     │
│ - Tech  │  [Card] [Card] [Card]     │
│ - Price │                           │
│         │  Pagination               │
└─────────┴───────────────────────────┘
```

---

### Components

#### [NEW] [ProjectCard.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/ProjectCard.tsx)

Premium project card with hover effects.

**Features**:
- Project thumbnail with overlay
- Category badge
- Title and short description
- Tech stack icons
- Price range (starting from...)
- Hover: Quick view button
- Click: Navigate to detail page

**Design**: Glassmorphic with gradient accents

---

#### [NEW] [ProjectFilters.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/ProjectFilters.tsx)

Sidebar filter component.

**Filters**:
1. **Categories** - Checkboxes with counts
2. **Tech Stack** - Multi-select chips
3. **Price Range** - Dual-range slider
4. **Clear All** - Reset filters button

**State Management**: URL query parameters for shareable links

---

#### [NEW] [ProjectSearch.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/ProjectSearch.tsx)

Search bar with autocomplete suggestions.

**Features**:
- Debounced search (300ms)
- Search icon + clear button
- Loading indicator
- Popular searches suggestions

---

#### [NEW] [ProjectSort.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/ProjectSort.tsx)

Sort options dropdown.

**Options**:
- Newest First
- Price: Low to High
- Price: High to Low
- Most Popular

---

### Project Detail Page

#### [NEW] [projects/[slug]/page.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/app/projects/[slug]/page.tsx)

Comprehensive project detail page.

**Sections**:
1. **Hero Section** - Project title, category, screenshots
2. **Overview** - Description, key features
3. **Pricing Tiers** - 3 cards with tier comparison
4. **Tech Stack** - Technologies used with icons
5. **Features & Modules** - Detailed breakdown
6. **Requirements** - Prerequisites
7. **Installation Guide** - Step-by-step commands
8. **Viva Q&A** - Sample questions and answers
9. **Screenshots Gallery** - Lightbox viewer
10. **Related Projects** - Recommendations

**Layout**: Single column on mobile, sidebar on desktop

---

#### [NEW] [TierSelector.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/TierSelector.tsx)

Tier comparison and selection component.

**Features**:
- 3 pricing cards (Basic, Standard, Premium)
- Feature comparison table
- Highlight differences
- "Select Tier" buttons
- Popular tier badge

**Actions**:
- Add to cart (selected tier)
- Buy now (quick checkout)

---

#### [NEW] [ScreenshotGallery.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/ScreenshotGallery.tsx)

Image gallery with lightbox.

**Features**:
- Thumbnail grid (4 cols)
- Click to expand (fullscreen)
- Navigation arrows
- Close button
- Smooth transitions

---

#### [NEW] [RelatedProjects.tsx](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/components/projects/RelatedProjects.tsx)

Related projects carousel.

**Logic**: Show projects with:
- Same category (priority)
- Similar tech stack
- Similar price range
- Limit: 6 projects

---

### Utilities & Hooks

#### [NEW] [useProjects.ts](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/hooks/useProjects.ts)

Custom hook for fetching projects with filters.

**Features**:
- Fetches paginated projects
- Handles loading/error states
- Caches results
- Debounced search

---

#### [NEW] [useProjectDetail.ts](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/hooks/useProjectDetail.ts)

Custom hook for fetching single project.

**Features**:
- Fetches by slug
- Loading/error handling
- 404 handling

---

#### [MODIFY] [constants.ts](file:///d:/Rohit/Programming/WebDev2/ecommerse-project/src/lib/constants.ts)

Add project-specific constants.

**New constants**:
- `ITEMS_PER_PAGE` - Default 12
- `TECH_STACK_ICONS` - Icon mappings
- `CATEGORY_COLORS` - Color schemes per category

---

## Verification Plan

### Automated Tests

1. **API Routes**:
   - Test search functionality
   - Test filtering (category, tech stack, price)
   - Test sorting options
   - Test pagination
   - Test project detail fetch

2. **Components**:
   - Test filter interactions
   - Test search debouncing
   - Test tier selection
   - Test gallery navigation

### Manual Verification

1. **Catalog Page**:
   - Browse all projects
   - Test search with various queries
   - Apply single and multiple filters
   - Test price range slider
   - Verify pagination works
   - Check responsive design

2. **Project Detail**:
   - View project details
   - Click through tier options
   - Navigate screenshot gallery
   - Check related projects
   - Verify all sections render
   - Test "Add to Cart" (next phase)

3. **Performance**:
   - Page load times
   - Search responsiveness
   - Filter application speed
   - Image loading optimization

4. **SEO**:
   - Meta tags on catalog
   - Meta tags on detail pages
   - Structured data for projects

---

## Implementation Order

1. **Database Seeding** (1 hour):
   - Create seed script
   - Add 20-30 sample projects
   - Run seed command

2. **API Routes** (2 hours):
   - Build projects listing endpoint
   - Add search/filter logic
   - Build project detail endpoint
   - Test with Postman

3. **Core Components** (3 hours):
   - ProjectCard component
   - ProjectFilters component
   - ProjectSearch component
   - TierSelector component

4. **Catalog Page** (2 hours):
   - Build main layout
   - Integrate search/filters
   - Add pagination
   - Polish UI/UX

5. **Detail Page** (3 hours):
   - Build layout
   - Add all sections
   - Implement gallery
   - Add related projects

6. **Polish & Testing** (2 hours):
   - Mobile responsiveness
   - Loading states
   - Empty states
   - Error handling

**Total Estimated Time**: 13-15 hours (2-3 days)

---

## Database Schema Review

Current `Project` model is complete and includes:
- ✅ Title, description, slug
- ✅ Category, tech stack
- ✅ Three pricing tiers with features
- ✅ Screenshots, demo URL
- ✅ Requirements, installation steps
- ✅ Features, modules
- ✅ Viva Q&A

**No schema changes needed!**

---

## Sample Project Structure

Each seeded project will have:

```typescript
{
  title: "E-Commerce MERN App",
  slug: "ecommerce-mern-app",
  category: "E-Commerce & Marketplace",
  description: "Full-stack e-commerce platform...",
  techStack: ["MongoDB", "Express", "React", "Node.js"],
  
  // Pricing tiers
  basicPrice: 999,
  basicFeatures: ["Source code", "Documentation", "Basic support"],
  
  standardPrice: 1999,
  standardFeatures: ["Everything in Basic", "Installation guide", "Viva Q&A"],
  
  premiumPrice: 2999,
  premiumFeatures: ["Everything in Standard", "Deployment guide", "Priority support"],
  
  // Additional info
  features: ["User authentication", "Product catalog", "Shopping cart"],
  modules: ["Frontend", "Backend", "Admin panel", "Database"],
  screenshots: ["/projects/ecommerce/1.jpg", "/projects/ecommerce/2.jpg"],
  requirements: ["Node.js 16+", "MongoDB 5+"],
  installation: ["npm install", "npm run dev"],
  vivaQuestions: [
    {
      question: "Explain the MERN stack architecture",
      answer: "MERN stands for MongoDB, Express, React, Node.js..."
    }
  ]
}
```

---

## Next Steps After Approval

Once approved, I'll:

1. Create seed script with sample projects
2. Build API endpoints for listing and details
3. Create all UI components
4. Build catalog page with filters
5. Build detail page with tier selection
6. Test everything thoroughly
7. Add cart integration (Phase 4 preview)

---

**Ready to build an impressive project catalog!** 🚀

Please confirm:
1. Should I create sample projects data?
2. Image hosting preference (placeholder URLs or local public folder)?
3. Any specific categories or projects you want included?
