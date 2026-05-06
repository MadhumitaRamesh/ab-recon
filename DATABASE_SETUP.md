# Database Setup Guide: MySQL Integration

I have successfully integrated a professional MySQL backend into the Aditya Birla Reconciliation Platform. Follow these steps to activate the database layer.

## 1. MySQL Server Setup
1.  Open your MySQL terminal or a tool like MySQL Workbench.
2.  Locate the `backend/schema.sql` file in this project.
3.  Execute the entire script to create the `ab_recon_db` database and populate it with dummy data.

## 2. Backend Configuration
1.  Open `backend/.env`.
2.  Update `DB_PASSWORD` with your actual MySQL root password.
3.  Ensure `DB_USER` is correct (default is `root`).

## 3. Install Dependencies
Run the following commands in your terminal:

```bash
# Navigate to the backend directory
cd backend

# Install MySQL and Express dependencies
npm install
```

## 4. Launch the Platform
To run the system with the live database, you need to start **both** the backend and the frontend:

### Start Backend (Terminal 1)
```bash
cd backend
npm start
```

### Start Frontend (Terminal 2)
```bash
npm run dev
```

## 🔒 Security & Performance Features
- **Optimistic Updates**: The UI remains lightning-fast by updating locally first and then syncing with MySQL in the background.
- **Connection Pooling**: Uses `mysql2` pooling to handle multiple concurrent reconciliation requests without latency.
- **Forensic Compliance**: Every "Run Recon" and "Sign-In" event is now written directly to a persistent MySQL table for permanent auditability.
