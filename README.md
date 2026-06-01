# Amal

A hackathon-ready blood donation matching platform with four user types:
- **Developer**: create and manage hospitals and hospital admin accounts.
- **Hospital Admin**: manage donors and recipients for the hospital.
- **Donor**: register, sign in, and find nearby blood requests.
- **Recipient**: register, sign in, and find available donors nearby.

## Setup

1. Install backend dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Start the backend server:

```bash
npm run dev
```

4. Start the frontend:

```bash
cd client
npm run dev
```

## Default developer login

- Email: `dev@admin.local`
- Password: `Dev@2026`

## Notes

- Developer users can create hospitals and generate hospital admin credentials.
- Hospital users can manage donors and recipients inside their hospital and create manual hospital records with urgency descriptions.
- Donors and recipients can self-register and use matching by `wilaya` and blood compatibility rules, not just exact blood group.
