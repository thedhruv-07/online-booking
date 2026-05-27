const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'factorytester@example.com' });
    if (!user) {
      console.error('Test user not found');
      process.exit(1);
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    console.log('TOKEN::', token);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
})();
