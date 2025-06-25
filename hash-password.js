const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument: node hash-password.js <password>');
  process.exit(1);
}

// The salt round determines the complexity of the hash. 10 is a good default.
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Your hashed password is:');
  console.log(hash);
}); 