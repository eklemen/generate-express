import { DataTypes, Model } from 'sequelize';
import sequelize from '.';

interface UserAttributes {
  id: number;
  name: string;
}

class User extends Model<UserAttributes> {}

User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
    },
    {
      tableName: 'Users',
      sequelize,
    }
);

export default User;
