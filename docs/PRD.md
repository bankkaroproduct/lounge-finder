# Product Requirements Document (PRD): Indian Airport Lounge Finder

## 1. Introduction

**Project Name:** Indian Airport Lounge Finder  
**Platform:** Web (React, TailwindCSS, Supabase/Postgres backend)  
**Context:**  
A mobile-first web application that enables users to discover which airport lounges in India they can access based on their credit card or by searching for a city/airport. The frontend was initially built with Lovable, versioned in Git, and is now being further developed using Cursor.

## 2. Problem Statement

Travelers in India often struggle to determine which airport lounges they can access with their credit cards or which cards unlock lounges at a specific airport. There is a need for a seamless, up-to-date, and visually engaging tool that solves this problem.

## 3. Product Vision

- Empower travelers to instantly check lounge eligibility by card or airport.
- Drive card applications by showcasing cards that unlock more lounges.
- Deliver a delightful, mobile-first experience with clear, actionable results.

## 4. Target Users

- Indian frequent flyers and travelers
- Credit card holders seeking lounge access
- Prospective credit card customers

## 5. Core User Stories

- As a traveler, I want to know which airport lounges I can access with my credit card, so I can plan my trip better.
- As a user, I want to search lounges by city/airport and see which cards unlock them, so I can apply for the right card.
- As a prospective cardholder, I want to see which cards offer lounge access at my airport, so I can apply instantly.

## 6. Main Features & Functional Requirements

### 6.1. Search & Input

- Card Input: Autocomplete/search for credit card names.
- City/Airport Input: Autocomplete for city names and airport codes.
- Search Action: "Check Lounge Access" button (large, sticky on mobile).
- Accessibility: Large tap targets, clear focus states, voice input option.

### 6.2. Results Page

- If searched by card:  
  - List of accessible lounges (photo, name, airport, city, state, amenities, hours, rating).
  - "View Details" button for each lounge.
- If searched by city/airport:  
  - List of lounges at that location.
  - For each lounge, show eligible cards (image, name, "Apply Now" button).
- If no lounges available:  
  - Show "No Lounges Available" screen with eligible cards for that airport/city.

### 6.3. Lounge Details Page

- Lounge photo, name, airport, city, state, operator
- Location (terminal, floor, gate, map/wayfinding info)
- Opening hours
- Amenities (Wi-Fi, food, showers, business, nap areas, kids' play area, etc.)
- Access eligibility (cards, paid, airline, etc.)
- Guest policy, paid access fee
- Photos, video walkthrough, user ratings
- "Get directions" button (to be implemented)

### 6.4. Data Integration

- Replace hard-coded sample data with live data from Supabase/Postgres.
- Normalize schema for cards, lounges, and card-to-lounge mappings.
- Ensure all data fetching uses secure, efficient queries.

### 6.5. UI/UX

- Material UI patterns for consistency and clarity.
- Responsive, mobile-first design.
- Subtle animations (fade-in, slide-up, card flip, amenities icons).
- Minimalist, focused interface with clear CTAs.

## 7. Technical Requirements

- **Frontend:**  
  - React (functional components, TypeScript)
  - TailwindCSS for styling
  - Component library for UI consistency
- **Backend:**  
  - Supabase/Postgres for data storage
  - Secure API integration for fetching lounges/cards
- **Project Structure:**  
  - Modular, maintainable codebase
  - All business logic separated from UI components
- **Testing:**  
  - Unit and integration tests for core logic and UI flows
- **Accessibility:**  
  - WCAG-compliant color contrast, alt text, keyboard navigation

## 8. Acceptance Criteria

- Users can search by card or city/airport and receive accurate lounge results.
- Lounge details page displays all required information and amenities.
- "Apply Now" buttons for cards are functional and visually prominent.
- Data is fetched live from Supabase, not from sampleData.ts.
- All UI is responsive and accessible on mobile and desktop.
- Error states and loading indicators are clear and user-friendly.

## 9. Project Rules & Cursor Best Practices

- **PRD Location:**  
  - Store this PRD in `docs/PRD.md` or similar, and ensure it is not excluded by `.cursorignore`.
- **Cursor Rules:**  
  - Use `.cursor/rules/` directory for project-specific rules in `.mdc` format.
  - Example rule for React components:
    ```
    ---
    description: React component creation
    globs: ["**/components/**", "**/pages/**"]
    alwaysApply: false
    ---
    - Use functional components with TypeScript
    - Define props interface above component
    - Include default export at bottom
    - Add JSDoc comments for complex props
    ```
- **Rule Inheritance:**  
  - Use base rules for common patterns, reference them in specific rules for consistency.
- **PRD Structure:**  
  - Use clear sections: Introduction, Problem Statement, Solution/Feature Overview, User Stories, Technical Requirements, Acceptance Criteria, Constraints.
  - Write sharp, isolated user stories and explicit acceptance criteria as bullet points.
- **Documentation:**  
  - Keep PRD and relevant docs version-controlled and accessible to Cursor.
- **Iterative Development:**  
  - Implement one user story or module at a time, review against PRD, and refine as needed.
- **Context Awareness:**  
  - Reference PRD and rules in Cursor chat when generating or reviewing code.

## 10. Pending Tasks

Below is a list of features and improvements that are **pending** and should be prioritized in the next development cycles:

| Pending Item                                             | Description                                                                                 |
|----------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Live Data Integration                                    | Replace all hard-coded sample data with live data from Supabase/Postgres.                   |
| API Query Implementation                                 | Implement secure, efficient API calls for fetching lounges, cards, and mappings.            |
| User Authentication                                      | Add sign-in/user account functionality (optional for MVP).                                  |
| "Get Directions" Button                                  | Implement functional map/directions link for each lounge.                                   |
| Mobile App Version                                       | Extend the web app to a native or PWA mobile app (future).                                  |
| Analytics & Tracking                                     | Track searches, "Apply Now" clicks, and user engagement for insights and optimization.      |
| Error Handling & Loading States                          | Improve user feedback for loading, errors, and empty results.                               |
| Accessibility Enhancements                               | Ensure full WCAG compliance (color contrast, alt text, keyboard navigation, etc.).          |
| Testing                                                  | Add comprehensive unit and integration tests for all major flows and components.            |
| Documentation                                            | Update and maintain technical and user documentation, including PRD and rules.              |
| Lounge Data Expansion                                    | Expand lounge and card database to cover all major Indian airports and cards.               |
| Guest Policy & Paid Access Info                          | Ensure all lounges display up-to-date guest policy and paid access fee information.         |
| Maps/Wayfinding                                          | Integrate embedded maps or wayfinding for lounge locations inside terminals.                |
| User Ratings & Reviews                                   | Allow users to rate and review lounges (future enhancement).                                |
| Performance Optimization                                 | Optimize for fast load times and smooth animations, especially on mobile.                   |

## 11. Future Enhancements

- User authentication and account management
- Maps/directions integration for lounges
- Mobile app version
- Analytics for user searches and card applications

## 12. References

- Cursor PRD and rules best practices
- Supabase integration with React

**Tip:**  
Keep PRD and rules modular, actionable, and always accessible to Cursor for best results. Use explicit, testable acceptance criteria and update documentation as the project evolves. 