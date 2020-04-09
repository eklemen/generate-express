export default function(sequelize, DataTypes) {
  const User = sequelize.define("User", {
    name: DataTypes.STRING
  });

  return User;
};
