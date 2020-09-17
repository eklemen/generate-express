import mongoose, { Schema, Document } from 'mongoose';

export type UserDocument = Document & {
    name: string;
};

const UserSchema: Schema = new Schema({
    name: {
        type: String
    }
});

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
