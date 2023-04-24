const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const uri = process.env.MONGO_URI;
//connecting database--------->
const connectDB = async () => {
   const connection = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Perform database operations here...
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
}

module.exports = connectDB;
