import User from "./user.model";
import Role from "./roles.model";

Role.hasOne(User, {
    foreignKey: 'user_id',
    sourceKey: 'id'
});

User.belongsTo(Role, {
    foreignKey: 'user_id',
    targetKey: 'id'
});

// Role.sync({force: true});
// User.sync({force: true});


// Role.hasOne(User);
// User.belongsTo(Role, {
//     foreignKey: {
//         name: 'roleid',
//         allowNull: false
//     }
// });