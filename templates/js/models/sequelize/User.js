export default function(sequelize, DataTypes) {
  const User = sequelize.define("User", {
    name: DataTypes.String
  });

  return User;
};
