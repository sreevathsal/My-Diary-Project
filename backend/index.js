const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// DB Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sree@1802',
  database: 'myDiary'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the MySql database!');
});

// Register User
app.post('/registerUser', async (req, res) => {
  const { emailInput, PasswordInput } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(PasswordInput, 5);
    console.log('Email:', emailInput);
    console.log('Hashed Password:', hashedPassword);

    // Use parameterized query to prevent SQL injection
    connection.query(
      'INSERT INTO Users (EmailID, HashedPassword) VALUES (?, ?)',
      [emailInput, hashedPassword],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error saving to database');
        }
        res.status(200).send('Registration successful!');
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Error while hashing password');
  }
});

// Login User
app.post('/userLogin', async (req, res) => {
  const { email, password } = req.body;

  connection.query(
    'SELECT ID, HashedPassword FROM Users WHERE EmailID = ?',
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }

      if (results.length === 0) {
        return res.status(401).send('User not found');
      }

      const { ID: userID, HashedPassword: storedHashedPassword } = results[0];
      const isMatch = await bcrypt.compare(password, storedHashedPassword);

      if (isMatch) {
        res.status(200).json({ userID });
      } else {
        res.status(401).send('Invalid credentials');
      }
    }
  );
});


// Placeholder for new posts
app.post('/newPost', async (req, res) => {
  const { postTitle, postDescription, userID } = req.body;

  const query = 'INSERT INTO Posts (UserID, postTitle, postDescription) VALUES (?, ?, ?)';

  connection.query(query, [userID, postTitle, postDescription], (err, results) => {
    if (err) {
      console.error('Error inserting post:', err);
      return res.status(500).send('Error saving post');
    }

    console.log('New Post:', req.body);
    res.status(200).send('Post added successfully!');
  });
});


app.listen(3000, () => {
  console.log('Server Started on port 3000');
});
