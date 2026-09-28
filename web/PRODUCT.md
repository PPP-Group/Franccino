# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, served together (confirmed 2026-09-23):

- **Consumers furnishing a home**, indoor and outdoor, at the high end of the market. They browse on phone and
  desktop, compare pieces, want to understand what a product really looks like (materials, finishes, size) and then
  talk to someone or visit a store. Buying is not online: it happens through a quote, WhatsApp or a store.
- **Architects and interior designers** who specify Franccino pieces in residential and commercial projects. They
  need accurate dimensions, materials, finishes, technical sheets and 3D/2D blocks to download.

Secondary audiences confirmed by the current site structure: retailers who want to become partners ("Seja um
parceiro"), and corporate / hospitality clients (the "Corporativo" page, cases and client logos).

## Product Purpose

The institutional website and bilingual catalog of Franccino, replacing the current WordPress site. It exists so
people can **see the products better** and **reach a purchase more easily**: clear photography, finishes, dimensions
and a 3D viewer per product, with the next step (quote, WhatsApp, nearest store, technical download) always at hand.

Success, per the product owner: "a bit of everything" — better understanding of the products and an easier path to
buying, which shows up as quote requests, store visits, technical downloads and a stronger premium brand perception.

## Positioning

Brazilian authorial design furniture made in its own factory:

- founded in 2000; own factory in Cláudio (MG) with 100% in-house production since 2021 (joinery, upholstery and
  metalwork);
- two lines: **Franccino Casa** (indoor) and **Franccino Giardini** (outdoor);
- signed collaborations with Brazilian and international designers (16 designers on the current site, e.g. Sérgio J.
  Matos, La Mamba, Andrea Zanocchi, Marina Linhares);
- made to order, with measures, woods and upholstery adjustable to the project;
- contract/hospitality track record (Clara Arte Resort in Inhotim, JHSF Fazenda Boa Vista, Kûara Hotel).

## Operating Context

- No e-commerce, cart or public prices. Conversion is a conversation: quote form, WhatsApp for quotes, WhatsApp for
  technical assistance, or a visit to one of the exclusive stores or resellers (São Paulo, Campinas, Belo Horizonte,
  Rio de Janeiro, Brasília, Curitiba, Londrina, Ribeirão Preto and others).
- Architects use the site as a specification tool during project work (downloads, dimensions, finishes).
- The Franccino team edits all content in the Filament admin panel, in Portuguese, with English fields beside it.
- Portuguese is the primary language; English serves international visitors (exports began in 2023) and may launch
  later than Portuguese.

## Capabilities and Constraints

- Catalog: ~400 products grouped by area (Casa / Giardini), category (sofás, poltronas, cadeiras, mesas, aparadores,
  balanços, puffs...), line (product family with variants), collection (e.g. Tempo, Traço, ARP, Gerais) and designer.
- Product page: gallery, dimensions per variant, materials, finishes, designer, related pieces, technical downloads
  and an optional 3D viewer (GLB only; the 3D can be switched off per product).
- Other pages: launches, collections, designers, projects, corporate/contract, factory (history), finishes, 3D blocks
  and technical sheets, stores with filters by state and type, contact with FAQ, search, privacy, terms.
- Bilingual pt/en with translated URLs; every interface string lives in translation files.
- Technical constraints: data only through the Laravel API; images come in fixed WebP widths (480–2560 px);
  performance target LCP < 2.5 s and CLS < 0.1 on 4G.
- Open decisions: brand manual and font licensing (client deliverable, pending); final list of finishes (the current
  site has none structured); whether downloads require a sign-up.

## Brand Commitments

- Name **Franccino**; sub-brands **Franccino Casa** and **Franccino Giardini**.
- The current logo stays.
- A brand manual and font license are expected from the client (roadmap week 1). The visual direction is free until
  then and must stay adjustable to what the manual defines. Fonts, logo files and final imagery arrive later from
  the company; everything visual lives in tokens so they can be swapped.
- Visual standard (confirmed 2026-09-23): **serious, category-grade craft** at the level of established furniture
  brands' identities — never looking AI-generated or templated. Reference sites were judged "too simple": borrow small
  details only. The company's own preview (https://franccino-preview.vercel.app/pt) is a content and structure
  reference (home sections, product page anatomy), not a visual target.
- Differentiators the product owner wants built as real features: a **room planner** ("Sala para montar": 2D floor
  plan to scale using real product dimensions, sent as a quote; 3D later when GLB models exist), a **quote list**
  (collect pieces and finishes, send once by form or WhatsApp), the per-product 3D viewer, finish selection, and a
  professional/technical view of the catalog for architects. These extend the contracted scope and need the tech
  lead's approval before release.

## Evidence on Hand

- Real public content from the current site: 16 designer names and short bios, 12 store addresses and phones, 11
  collection names with years, 3 corporate cases, 8 client names, company timeline 2000–2025, contact channels, FAQ
  (source: `franccino-data.ts` in the Lovable prototype export and https://franccino.com.br/).
- Product photography from the current site (`/wp-content/uploads/`, mostly 1024 px WebP listing images and ambient
  photos); high-resolution originals may not exist and are a pending client deliverable.
- Inventory of the current site: `docs/content-inventory.md`.
- Absent, never fabricate: GLB 3D models (none exist), English copy, testimonials, press, awards, prices, delivery
  times, product specs beyond what the client provides.

## Product Principles

1. **The piece comes first.** Every page helps people see and understand the furniture — material, finish, scale,
   context — before anything else competes for attention.
2. **One step to a real conversation.** Quote, WhatsApp and the nearest store are always close; the sale happens with
   people, not in a cart.
3. **Home and project, side by side.** Consumer inspiration and architect specification live together without either
   diluting the other.
4. **Authorship and craft are the proof.** Designers, factory, materials and 25 years substantiate the premium
   position; no invented claims.
5. **Portuguese first, bilingual by design.** Everything works complete in Portuguese; English can arrive later
   without breaking the experience.

## Accessibility & Inclusion

WCAG 2.1 AA (project spec). Respect reduced-motion preferences. Forms usable by keyboard and screen readers, with
translated, specific error messages.
