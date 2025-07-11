const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db');
// body parser
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate',candidateRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
