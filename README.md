# Aditya Birla Reconciliation Platform (AB Recon)

The Aditya Birla Reconciliation Platform is an enterprise-grade solution designed to automate and secure data reconciliation processes. It provides a robust framework for managing financial data integrity, user identities, and system-wide auditability.

## Core Modules

### Identity and Access Management
The platform utilizes a secure provisioning system for managing employee access. All user identities are stored in a MySQL database with industrial-grade security:
- Secure password hashing using the Bcrypt algorithm.
- Persistent session management.
- Granular administrative controls for user lifecycle management.

### Role-Based Access Control (RBAC)
A sophisticated security matrix allows administrators to define roles and set module-level permissions:
- Custom role definition (Admin, Maker, Checker, etc.).
- Real-time synchronization of the permission matrix with the application backend.
- Protection of sensitive system-level roles.

### Reconciliation Master Records
Administrators can define the parameters for data matching logic:
- Support for 1-way, 2-way, and 3-way reconciliation.
- Configurable processing frequencies (Daily, Weekly, Monthly).
- Dynamic data source mapping.

### Exception Intelligence Queue
Unmatched transactions are captured in an intelligent queue for manual intervention:
- Automated matching suggestions based on variance analysis.
- Prioritization and aging tracking for unresolved records.
- Full resolution lifecycle tracking.

### System Auditing
Every significant action within the platform is recorded for forensic purposes:
- Detailed audit logs including timestamps, user identities, and module details.
- Secure storage of system events to ensure compliance and accountability.

## Technical Architecture

### Frontend
- React.js with Context API for state management.
- Lucide React for professional iconography.
- Responsive CSS architecture.

### Backend
- Node.js and Express.js RESTful API.
- MySQL 9.5.0 database for persistent storage.
- Bcrypt for cryptographic security.

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Configure environment variables in a `.env` file (Database credentials).
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to the root directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Database Configuration
For detailed instructions on initializing the MySQL schema and seeding initial data, please refer to the `DATABASE_SETUP.md` file included in this repository.
