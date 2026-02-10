
# Homepage Redesign - Figma to Code

This is a comprehensive redesign of the homepage based on your Figma prototype. The changes cover the design system (colors, typography), navigation, and the entire homepage layout.

---

## 1. Design System Updates

### New Color Palette (HSL conversions)
| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| Primary Red | #E65C4F | 5 76% 60% | Buttons, accents |
| Dark Brown | #3A2F2B | 18 14% 20% | Dark sections, headings |
| Light Cream | #F8F4F0 | 30 33% 96% | Page background |
| Gray | #535353 | 0 0% 33% | Secondary text |
| Soft Beige | #F1E6DC | 24 38% 90% | Card backgrounds, secondary |
| Near Black | #231C1A | 14 17% 12% | Footer dark, deepest text |

### Typography
- **Headings**: "Degular Display" (display/serif font for hero titles and large headings)
- **Body**: "Helvetica" / system sans-serif stack for body text and UI elements
- Degular Display will be loaded via Google Fonts or a self-hosted @font-face

---

## 2. Files to Modify/Create

### `index.html`
- Add Degular Display font import (or self-hosted @font-face in CSS)

### `src/index.css`
- Update all CSS variables to match new color palette
- Add font-family definitions for Degular Display and Helvetica

### `tailwind.config.ts`
- Add `fontFamily` entries for "display" (Degular Display) and "body" (Helvetica)

### `src/components/Navigation.tsx`
- Redesign to match Figma: clean layout with "Guide Canada" text logo on left, "Tools", "Pricing", "Support" links on right, and a coral "Try for free" CTA button
- Dark brown top bar background (#3A2F2B)

### `src/pages/Index.tsx` (complete rewrite of homepage sections)
The page will have these sections in order:

#### Section 1: Hero
- Full-width background image (snow couple photo - to be uploaded to assets)
- Dark brown navigation bar at top
- Left-aligned headline: "Acelere o seu plano Canada" in large display font
- Subtitle: "Find the right immigration pathway, and track your progress toward permanent residency."
- Two buttons: "Comecar Agora" (coral filled) + "Calcular CRS" (outline coral)

#### Section 2: Services (Two alternating blocks)
- Light cream (#F8F4F0) background
- Block 1: Text left + image right (snow woman photo)
  - "Services" label, headline about 3-minute quiz, "Start Your Journey" coral button
- Block 2: Image left (passport photo) + text right
  - "Services" label, headline about Canadian PR, "Start here" coral button
- Images will be uploaded to `src/assets/`

#### Section 3: About / Comparison Table
- "About Guide Canada" label
- Large display headline: "We exist to simplify your Canada journey..."
- Comparison table: "Your Tasks" vs "Through Guide Canada" vs "On your own"
  - 7 rows comparing features
  - "Through Guide Canada" column values in coral/red text
  - Rounded border card containing the table

#### Section 4: Testimonials
- Cream background
- "Testimonial" label + "What they say about us" badge
- Navigation arrows (left/right)
- Large testimonial card with photo on left, quote with large quotation marks on right
- Author name in coral, role text, and dot pagination indicators

#### Section 5: FAQ
- "Frequently Asked Questions" label
- Large display heading: "Questions? Answers."
- Accordion items on the right side (expandable with chevron)

#### Section 6: CTA Banner
- Dark brown background (#3A2F2B)
- Italic display heading: "Ready to Escalator Your Canada Dream?"
- Two buttons: "Comecar Agora" (coral) + "Calcular CRS" (outline)

#### Section 7: Footer
- Cream/beige background (#F8F4F0)
- Three-column layout:
  - "Contact us" heading
  - General Enquiries, Recruitment, New Business emails
  - LinkedIn, Instagram, Accessibility, Terms, Privacy links
- Copyright: "(c) 2026 Guia Canada Inc"

### Assets to copy into the project
- `homepage_image3.png` (passport photo) -> `src/assets/homepage-passport.png`
- A hero background image and a snow woman image will need to be sourced/uploaded

---

## 3. Technical Details

### Font Loading Strategy
Degular Display is a commercial/premium font. Since it may not be on Google Fonts, we will:
- Use a similar free alternative like "DM Serif Display" or "Playfair Display" as a fallback
- Or add @font-face if you can provide the font files
- Helvetica is a system font and will use the system sans-serif stack

### Component Structure
The homepage will be rebuilt as a single page component with clearly separated sections. Each section will be its own semantic `<section>` element.

### Responsive Design
- All sections will be responsive (mobile-first)
- The comparison table will scroll horizontally on mobile
- The testimonial section will stack vertically on mobile
- Navigation will keep the mobile hamburger menu

### Images
- The passport image you uploaded will be used for the services section
- For the hero and snow woman images, we will use placeholder images that can be replaced later, unless you upload them separately

---

## 4. Implementation Order
1. Update design system (colors, fonts) in `index.css` and `tailwind.config.ts`
2. Copy uploaded images to project assets
3. Redesign Navigation component
4. Rebuild `Index.tsx` with all new sections
5. Clean up unused imports and assets

This is a large change focused only on the homepage - all other pages (Quiz, CRS Calculator, Dashboard, etc.) will remain unchanged for now, though they will inherit the updated color palette.
