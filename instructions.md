📄 instructions.md

Project: QR-based Restaurant Ordering SaaS Platform - Qrave

💡 Purpose of This File

This document is a single source of truth that explains exactly how this project should be implemented.
It should be read by:

Full-stack developers

UI/UX designers

AI coding agents

Backend engineers

QA testers

This file does not try to be short.
It is intentionally verbose, rigid, and extremely explicit to eliminate ambiguity.

1. High-Level Concept

We are building a multi-tenant SaaS platform where:

Restaurants register and create digital menus.

Customers scan a QR code placed on the restaurant’s table.

The website shows the restaurant’s menu without login.

Users select items → add to cart → checkout → pay online (Razorpay).

Orders are tracked in real-time and assigned a unique order token.

Restaurants manage orders through an admin panel.

Platform owner manages restaurants through a super admin panel.

You can think of it as:
Swiggy + Dine-in + QR menus + SaaS admin dashboard, NOT a marketplace.

We are NOT:

A delivery service

A review platform

A food marketplace

A POS system (not initially)

We are strictly:
QR Digital Dine-In Menu + Ordering + Payment + Admin Panels

2. Primary Project Goals

Remove friction from restaurant ordering

Customer never needs to register.

Just scan QR → order → pay → track.

Empower restaurants

They control menu, availability, tables.

They receive orders in real-time.

Build a scalable SaaS

Multi-tenant

Secure

Future subscription features

Modern polished UI/UX

Looks like a billion-dollar SaaS

Smooth, minimal, clean

3. Core User Roles
3.1 Customer

Enters via QR URL

Views available items

Adds to cart

Checks out

Pays

Receives order token

Tracks order

Requirements:

❗ No authentication
❗ No profile
❗ No phone verification
❗ Smooth flow

3.2 Restaurant Admin

Must authenticate (email+password)

Sees only their own restaurant data

Manages:

Menu categories

Menu items

Availability toggles

Tables

QR codes

Orders

Invoice generation

Restaurant admin is the core stakeholder.

3.3 Super Admin (Platform owner)

System-level control

Create/disable restaurants

Manage tenant access

View global stats

Onboard new clients

This is where SaaS monetization lives.

4. Core Flows
4.1 Customer QR → Menu Flow

Restaurant prints QR per table.

QR directs to:

https://domain.com/r/[restaurantSlug]?table=[tableId]


Browser opens menu:

Restaurant branding

Organized menu

Available / unavailable items

Add/remove items to cart

User checks out

No account creation.

4.2 Checkout & Payment

User reviews order

User chooses:

Razorpay Online

Cash at counter

Payment processed

Order created

Order token generated (must be human readable)

Show Order Status page.

4.3 Order Tracking

Real-time progression:

RECEIVED → IN_KITCHEN → READY → SERVED → COMPLETED


Updates reflected to customer UI

Restaurant staff controls state

4.4 Admin Order Management

Live order list

Status actions

Search/filter by table, date, status

Printable invoice view

5. Status Model
5.1 Order Lifecycle
RECEIVED = default
IN_KITCHEN
READY
SERVED
COMPLETED
CANCELLED

5.2 Payment Lifecycle
PENDING
SUCCESS
FAILED
COD
REFUNDED (future)


Both status fields are separate.
NEVER mix payment and food workflow.

6. UI/UX Rules

This platform should feel like:

Notion

Vercel

Linear

Stripe dashboard

Simple, elegant, spacious UI.

6.1 Global UI guidelines

Lots of whitespace

Simple typography

Minimal gradients

Respect dark mode readiness

Avoid noisy colors

Avoid clutter

7. UI Structure (Mandatory)
Customer

Menu page

Cart drawer

Checkout

Order status

Invoice

Restaurant Admin

Sidebar shell

Menu management

Order dashboard

Table management (QR)

Settings

Super Admin

Restaurant list

Restaurant creation

Overview metrics

8. Technical Design Rules
8.1 Multi-Tenant Principle

Every resource is scoped to restaurantId

No shared tables without scoping

Data leakage between restaurants is forbidden

8.2 Restaurant URL Rules

Restaurant slug must be unique.
Example:

domain.com/r/mr-biryani
domain.com/r/pizza-express


Never expose numeric restaurant IDs in URLs.

8.3 Table QR Rules

Every table maps to a unique internal id

QR must encode /r/[slug]?table=[id]

Printable QR must be provided

Restaurant can re-generate at any time

Changing table name must not break QR

9. System Behavior
9.1 Availability

If menu item is marked unavailable:

Card shows dimmed state

Add button disabled

Tooltip “Not available”

Never hide items
Restaurants want users to see what normally exists.

9.2 Out-of-Stock Strategy

Restaurants toggle availability in 1 click.
No inventory system in MVP.

10. Token Generation
Requirements:

Short

Non-confusing

Machine-safe

Printed on bills

Spoken aloud easily

Example formats:

R-4213
MB-9281
TBL3-102


Avoid:

Random strings

UUIDs

Excessive noise

11. Invoice Rules

Invoice must show:

Restaurant identity

Table

Order token

Date/time

Item lines

Subtotal

Tax

Service

Total

Payment mode

Payment status

Razorpay payment reference

Print behavior:

Browser print works

PDF not mandatory initially

12. Design Philosophy
Assumptions:

Customers are impatient

Network conditions might be weak

Screens are small

People are eating, not shopping

Therefore:
Simplicity over complexity.

13. What to Avoid

❌ Signup flow
❌ Phone OTPs
❌ Coupons
❌ Ratings
❌ Loyalty system
❌ Search engine marketing
❌ Multi-restaurant browsing
❌ Delivery logistics
❌ Guest feedback ✘

This is not Swiggy / Zomato.

14. Requirements for AI Agents

These rules must be followed strictly:

DO

Generate typed components

Make UI responsive

Use strong semantic naming

Separate UI from business logic

Encapsulate styling

Make props-driven UI

Use zero backend assumptions unless provided

DON’T

Infer extra features

Auto-add sign-up

Modify domain model

Add analytics or marketing

Invent themes or branding

Mix cart logic with UI layer

15. Responsiveness Rules

Mobile-first

One-hand usability

Buttons at bottom

Avoid desktop-first grid

16. Performance Rules

Lazy-load heavy UI sections

Skeleton loading

Avoid blocking layouts

Cache menu

Avoid re-render storms in cart

17. Reliability Principles

Never lose cart due to refresh

Never erase order status

Never break QR links

UX must be deterministic

18. Accessibility

Large tap targets

High contrast badges

Icons + labels

Avoid color-only communication

19. Deploy Readiness Rules

A new restaurant must:

Register

Create menu

Add items

Create tables

Print QR

Open store

Without developer assistance.

20. Future Expansion (Not MVP)

Table reservations

Tips

PDF invoices

Loyalty programs

Restaurant analytics

Subscription billing

Kitchen device integration

These are intentionally deferred.

21. Summary Statement (Read Carefully)

This project must move one decision at a time.
First customer UI → then admin UI → then backend → then payments → then dashboards.
Do not jump ahead.
Do not add features not listed here.
Do not deviate from UX principles.
The experience should feel natural, obvious, and elegant.
