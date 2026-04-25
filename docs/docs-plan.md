I need you to create a complete implementation plan for an internal documentation/help center for the OMZONE administrative panel.

You are working as the Documentation Platform mode.

Context:
OMZONE is a premium wellness/yoga/stays/immersions/retreats platform. The admin panel manages editorial content, operational offerings, pricing tiers, availability/events, media, orders, reservations, users, and future ticket/QR workflows.

The goal is to create a full administrative manual inside the app, preferably available at:

/help/docs

This documentation should be useful for administrators, operators, and internal team members. It should explain how to use the admin panel, how the main entities relate to each other, and what each screen/form/field means.

Important:
Do not implement code yet.
First create a complete plan and documentation architecture.
Inspect the current project structure before proposing the final plan.
Base your plan on the real files, routes, components, forms, Appwrite collections, services, hooks, and admin flows that exist in this project.
Do not invent sections that are not supported by the current project unless clearly marked as “future”.
Do not rewrite the application.
Design the documentation system as an incremental feature.

Main objective:
Create a documentation/help center similar in spirit to professional documentation sites like Appwrite Docs, Stripe Docs, or Tailwind Docs, but adapted to the OMZONE admin panel.

The documentation system should support:

- Markdown or MDX-like content if possible
- A React-based documentation viewer
- Sidebar navigation
- Categorized documentation sections
- Search
- Page table of contents
- Previous/next navigation
- Breadcrumbs
- Copy full page content button
- Copy code/example blocks button if code blocks exist
- Responsive mobile layout
- Clean typography
- Calm premium OMZONE styling
- Future support for English translation
- Easy content updates without touching too much UI code

Preferred route:
Use /help/docs unless the current router structure suggests a better route.

Documentation content should cover at least:

1. Introduction to the admin panel
2. Admin roles and access levels
3. Dashboard overview
4. Publications management
5. Offerings management
6. Pricing tiers / offering prices
7. Offering events / availability
8. Media and images
9. Orders or reservations, if already present
10. Users / customers / admins, if already present
11. SEO fields and publishing flow
12. Content status, enabled fields, drafts, published content
13. Recommended workflow for creating a complete experience
14. Troubleshooting/common mistakes
15. Glossary of OMZONE concepts

Important OMZONE domain rules:

- Publications are the editorial/SEO layer.
- Offerings are the operational/commercial layer.
- Pricing tiers belong to offerings, not publications.
- Availability/events belong to offerings.
- Avoid duplicated relationships.
- The documentation should clearly explain the correct workflow:
  1. Create or update an offering.
  2. Add pricing tiers to the offering.
  3. Add events/availability if needed.
  4. Create a publication only when editorial/landing/SEO content is needed.
  5. Link the publication to the offering when appropriate.

The documentation should help prevent admin mistakes, especially:

- Creating pricing in the wrong place
- Linking publications and offerings redundantly
- Confusing publications with sellable offerings
- Publishing incomplete offerings
- Forgetting SEO metadata
- Forgetting images/content/agenda/prices
- Creating events without capacity or dates

Please produce a detailed plan with the following sections:

1. Current project audit plan
   Explain exactly what files/folders should be inspected first:

- routes
- admin pages
- layout components
- forms
- services/API files
- hooks
- Appwrite config/schema files
- existing markdown/docs files
- env/config files

2. Recommended documentation architecture
   Propose the folder structure, for example:
   src/docs/
   src/docs/content/
   src/docs/config/
   src/docs/components/
   src/pages/help/
   or whatever best matches the current project.

Include whether content should be markdown files, JS objects, JSON metadata, or React pages.
Explain the recommended option and why.

3. Recommended route structure
   Define the route, nested routes, and URL pattern.
   Example:
   /help/docs
   /help/docs/getting-started
   /help/docs/publications
   /help/docs/offerings
   /help/docs/offerings/pricing
   /help/docs/offerings/events

4. Documentation IA/navigation map
   Create a complete sidebar structure with categories and pages.
   Keep it practical and admin-focused.

5. Page template standard
   Define the required structure for every documentation page:

- title
- description
- audience
- related admin screen
- when to use
- step-by-step usage
- fields explained
- common mistakes
- related pages
- last updated
- copy page content support

6. Content metadata standard
   Define the metadata/frontmatter or JS metadata needed for each page:

- title
- slug
- section
- order
- description
- keywords
- relatedRoutes
- relatedCollections
- lastUpdated
- status

7. UI component plan
   Plan the required components:

- DocsLayout
- DocsSidebar
- DocsTopbar
- DocsBreadcrumbs
- DocsSearch
- DocsPage
- DocsTableOfContents
- DocsCopyPageButton
- DocsCopyCodeButton
- DocsPrevNext
- DocsMobileDrawer
- DocsEmptyState
- DocsNotFound

8. Search strategy
   Recommend a first version with local/static search.
   Also define a future upgrade path for AI/semantic search with MiniMax if API keys are available.
   Do not implement AI search yet unless explicitly asked.
   The first version should work offline/static without external services.

9. Copy page behavior
   Define how the “copy full page” button should work.
   It should copy the clean markdown/plain text content of the current documentation page, not the raw HTML.
   Also define copy behavior for code blocks/examples.

10. Styling and UX guidelines
    Use OMZONE’s visual direction:

- calm
- premium
- zen
- editorial
- spacious
- mobile-first
- admin-friendly
- not generic SaaS
- no emojis unless the project already uses them

11. Implementation phases
    Break the work into safe phases:
    Phase 1: audit and architecture
    Phase 2: docs data model/content structure
    Phase 3: documentation layout and routing
    Phase 4: markdown/rendering support
    Phase 5: initial manual pages
    Phase 6: search and copy features
    Phase 7: responsive polish
    Phase 8: review and validation

For each phase include:

- objective
- files likely touched
- acceptance criteria
- test steps
- mode handoff recommendation

12. Mode handoff plan
    Explain when to use:

- Documentation Platform mode
- Documentation Writer mode
- Code mode
- UI/UX mode if available
- QA/Reviewer mode if available

13. Initial documentation page list
    Generate a complete list of proposed documentation pages, grouped by section.
    For each page include:

- slug
- title
- purpose
- priority: required / recommended / future
- source files that should be inspected before writing it

14. Risks and decisions
    Identify important decisions before implementation:

- Markdown vs React content
- static search vs AI search
- /help/docs vs /docs
- public vs protected route
- admin-only visibility
- i18n now vs later
- whether docs should be generated from code or manually curated

15. Final deliverable
    At the end, produce a recommended first implementation task prompt that can be handed to Code mode to start Phase 1 or Phase 2.

Output format:
Use clear markdown.
Be specific.
Do not be vague.
Do not write the full documentation content yet.
Do not implement files yet.
Create a professional plan that can be followed step by step.
