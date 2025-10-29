#!/usr/bin/env tsx

import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  const mongoUrl = process.env.MONGODB_URI;
  
  if (!mongoUrl) {
    console.error('❌ Error: MONGODB_URI environment variable is not set');
    console.log('\nPlease set your MongoDB connection string:');
    console.log('export MONGODB_URI="your-mongodb-connection-string"');
    process.exit(1);
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');

    console.log('\n📝 Create Admin User\n');
    
    // Get admin details
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    if (!name || !email || !password) {
      console.error('\n❌ Error: All fields are required');
      await client.close();
      rl.close();
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.error(`\n❌ Error: User with email "${email}" already exists`);
      await client.close();
      rl.close();
      process.exit(1);
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = {
      id: randomUUID(),
      name,
      email,
      role: 'admin',
      passwordHash,
      tokenBalance: 0,
      totalAssignments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Creating admin user...');
    await usersCollection.insertOne(adminUser);

    console.log('\n✅ Admin user created successfully!');
    console.log(`\nDetails:`);
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Role: admin`);
    console.log(`\nYou can now login to the admin dashboard at http://localhost:3000`);

    await client.close();
    rl.close();
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    rl.close();
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Script cancelled by user');
  rl.close();
  process.exit(0);
});

createAdmin();
