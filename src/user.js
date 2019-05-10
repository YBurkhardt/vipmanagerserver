const ACCESS_ALL = 1;

let dbVipUser = [];
let lastID = 0;

let Admin = [
    {
        id: 1,
        email: 'york.burkhardt@4com.de',
        firstname: 'York',
        lastname: 'Burkhardt',
        access: ACCESS_ALL,
        password: '',
        language: 'de'
    }
];

const checkAdminAccess = () => {
};

const setUUID = (id) => {
    lastID = id;
};

const getUUID = () => {
    return ++lastID;
};

const getLastUUID=() => {
    return lastID;
};


module.exports.dbVipUser = dbVipUser;
module.exports.setUUID = setUUID;
module.exports.getUUID = getUUID;
module.exports.getLastUUID = getLastUUID;