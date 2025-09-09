import mongoose from 'mongoose';

let isConnected = false;

export const connectMongoDB = async () => {
  try {
    if (isConnected) {
      console.log('✅ MongoDB already connected');
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindflow';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectMongoDB = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
};

export default mongoose;
