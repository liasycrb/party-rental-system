# Project Context — Party Rental System

## Overview
We are building a modern rental platform for a party rental business.

There are TWO brands:
- Lias Party Rentals
- CRB Jumpers

Both brands:
- Have separate websites and branding
- Share the SAME inventory
- Share the SAME booking system
- Share the SAME CRM and backend

## Goal
Create a system that:
- Automates bookings and reservations
- Reduces manual communication
- Handles online payments (Zelle primary, Stripe secondary)
- Uses SMS automation
- Manages inventory and availability
- Allows customers to “Build Their Event” (like an ecommerce configurator)

## Key Features
- Shared inventory across both brands
- Booking system with availability by date
- Customer intake questions (space, surface, access, dogs, etc.)
- Digital agreement / terms acceptance
- CRM with SMS automation
- Mobile-friendly dashboard for operators
- SEO-optimized pages for local ranking (Moreno Valley)

## UX Concept
“Build Your Event” flow:
- Select product
- Select date
- Validate availability
- Answer setup questions
- Add upsells (tables, chairs, time extensions, etc.)
- Accept terms
- Pay deposit

## Tech Stack
- Next.js (Vercel)
- Supabase (database + auth)
- Tailwind
- SMS provider (TBD later)

## Constraints
- Must be client-owned infrastructure
- Must be scalable
- Must support two brands with one backend

See `docs/architecture.md` for the full architecture and implementation plan.