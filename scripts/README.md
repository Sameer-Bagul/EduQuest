# Admin User Creation Script

This script allows you to create an admin user for the EduQuest platform.

## Prerequisites

Make sure your MongoDB connection string is set in the environment:

```bash
export MONGODB_URI="your-mongodb-connection-string"
```

## Usage

### Interactive Mode (Recommended)

Run the script and follow the prompts:

```bash
npm run create-admin
```

You will be asked to enter:
- Admin name
- Admin email
- Admin password

The script will:
1. Connect to your MongoDB database
2. Hash the password securely using bcrypt
3. Create an admin user with the provided details
4. Display success message with the admin credentials

### Example

```bash
$ npm run create-admin

🔗 Connecting to MongoDB...

📝 Create Admin User

Enter admin name: John Doe
Enter admin email: admin@eduquest.com
Enter admin password: ********

🔐 Hashing password...
💾 Creating admin user...

✅ Admin user created successfully!

Details:
  Name: John Doe
  Email: admin@eduquest.com
  Role: admin

You can now login to the admin dashboard at http://localhost:3000
```

## Security Notes

- Passwords are hashed using bcrypt with 10 salt rounds before storage
- The script checks for existing users with the same email to prevent duplicates
- Admin users have full access to the platform including:
  - User management (create, edit, delete teachers/students/admins)
  - College management (create, edit, delete colleges)
  - Assignment management (view and delete assignments)
  - Platform analytics and revenue tracking

## Troubleshooting

### Error: MONGODB_URI environment variable is not set

Make sure you've exported your MongoDB connection string:

```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"
```

### Error: User with email already exists

The email address you're trying to use is already registered in the database. Choose a different email or delete the existing user first.

## Admin Dashboard Access

After creating an admin user, you can access the admin dashboard at:

**Local Development:** http://localhost:3000

Login with the email and password you just created.
