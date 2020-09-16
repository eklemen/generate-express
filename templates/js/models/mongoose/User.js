import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String
  }
});

const User = model('User', UserSchema);

export default User;
