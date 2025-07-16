## Library Management System

A web application built for the Simple Library Management System Coding Challenge. It features a Frappe Framework 15 backend with a custom REST API and a standalone React + TypeScript frontend for managing books, members, and loans. The app implements all required user stories (US-01 to US-10) and one stretch goal (SS-03: CSV export) and SS -02 with approximately 80% feature completion, prioritizing core functionality within the time constraints.

## Demo

Watch the demo video to see all user stories (US-01 to US-10) and the CSV export (SS-03) in action:

All demo assets are available in this [Google Drive folder](https://drive.google.com/drive/folders/1-XshL3Vr4-RIz7L-V58SFpBQArsKBkfN?usp=drive_link).


## Features

Book CRUD (US-01): Create, view, edit, and delete books (Title, Author, Publish Date, ISBN) via a custom frontend.

Member CRUD (US-02): Manage member records (Name, Membership ID, Email, Phone).

Loan Creation (US-03): Record loans with Loan Date and Return Date.

Availability Check (US-04): Prevent loaning books that are already borrowed using server-side validation.

Reservation Queue (US-05): Allow members to reserve unavailable books.

Overdue Notifications (US-06): Send email reminders for overdue loans via Frappe’s email queue.

Reports (US-07): Generate reports for books on loan and overdue books.

REST API (US-08): Secure endpoints for books, members, and loans, accessible externally.

Authentication & Roles (US-09): Role-based access (admin, librarian, member) with registration, login, and logout.

Custom Frontend (US-10): Standalone React UI with validation and error handling, independent of Frappe Desk.

CSV Export (SS-03): Export a member’s loan history as a CSV file for analysis.
 
## Prerequisites
Python 3.10+
Node.js 18+
Frappe Framework 15
MariaDB 10.6+
Git

## Setup Instructions
Clone the repository:

git clone https://github.com/OgBek/library-management-system.git
cd library-management-system


## Set up the Frappe environment:

bench init frappe-env
cd frappe-env
source bin/activate
bench get-app library_management ../ library_management

## Create a new Frappe site:

bench new-site library.localhost --db-name library --admin-password admin
bench --site library.localhost install-app library_management



## Install frontend dependencies:

cd ../library-frontend
npm install



Configure environment variables (e.g., SMTP settings for email notifications) in frappe-env/sites/library.localhost/site_config.json.

Running the Application
## Start the Frappe backend:

cd frappe-env
source bin/activate
bench start



## Start the frontend:

cd ../library-frontend
npm start



Access the app at http://localhost:3000 (frontend) and http://library.localhost:8000 (backend API).

Testing
Backend Tests:

cd frappe-env
source bin/activate
bench --site library.localhost run-tests --app library_management



Frontend Tests (if implemented):

cd library-frontend
npm test



Status: Approximately 80% of features are implemented and partially tested. Core user stories (US-01 to US-10) and CSV export (SS-03) are functional, verified through manual testing. Some components (e.g., edge cases) lack automated tests due to time constraints.

## Architectural Decisions
Backend: Used Frappe Framework 15 for rapid DocType creation (Book, Member, Loan, Reservation) and REST API development. Secured endpoints with @frappe.whitelist() and role-based permissions.

Frontend: Chose React 18 + TypeScript for a type-safe, component-based UI. Initially considered Vite for faster development, but reverted to Create React App due to compatibility issues with Frappe’s API structure.

Database: MariaDB, integrated with Frappe’s ORM for efficient data management.

Notifications: Implemented overdue email notifications using Frappe’s scheduler and email queue.

Availability Check: Enforced via a before_save hook in the Loan DocType to check book availability.

CSV Export: Added a custom endpoint to generate and download a member’s loan history as a CSV file.

## Shortcuts and Trade-offs

UI/UX: Aimed for a clean, modern, and simple UI but prioritized functionality over polish due to time constraints. The frontend is functional but lacks advanced styling and responsiveness.

Additional Features: Planned to implement filtering, paging, user profiles, and settings but omitted them to meet the deadline.

Testing: Partial testing (manual and some automated tests) covers core functionality, but full system testing and 80% automated test coverage (SS-02) were not achieved due to time limits.


Vite: Avoided Vite due to compatibility issues with Frappe’s API integration, opting for a more stable Create React App setup.

## Discussion Points

Preventing Duplicate Loans: Used a server-side before_save hook in the Loan DocType to check if a book is already on loan.

Email Reminders: Configured Frappe’s scheduler to run daily, checking overdue loans and sending emails via the SMTP setup.

Custom Frontend: Built a React frontend with Axios for API calls, using components like BookList and LoanForm. Avoided Frappe Desk by creating custom routes and views.

Trade-offs: Sacrificed advanced UI/UX, additional features (filtering, paging,validation), and comprehensive testing to meet the July 16, 2025, deadline.

Production Improvements: Would enhance UI with a CSS framework (e.g., Tailwind), add filtering/paging, implement full test coverage, and include user profiles/settings.

Validation: Validated core functionality (US-01 to US-10, SS-03) through manual testing and API response checks, ensuring correctness for submission.

## Future Improvements

Enhance UI/UX with Tailwind CSS for a modern, responsive design.

Add filtering, paging, user profiles, and settings for a richer user experience.

Achieve ≥80% automated test coverage (SS-02) with unit and end-to-end tests.

Explore Vite compatibility with Frappe for faster frontend builds.

Implement auto-deployment (SS-01) using GitHub Actions and a cloud provider.


