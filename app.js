const express = require('express')
var bodyParser  = require('body-parser');
const app = express()

let lastID = 0;
let lastReceiptID = 0;

let dbVipUser = [

//     {
//           id:1,
//           firstname: 'York',
//           lastname: 'Burkhardt',
//           kid: 125514,
//           purchases: 2,
//           sales: 300,
//           country: 'de',
//           purchaseHistory: [
//             {
//             id:1,
//             date: '10-12-2019 14:00',
//             item: 'Vollversion',
//             value: 10.88
//             },
//             {
//               id:2,
//               date: '10-12-2019 14:00',
//               item: 'Vollversion',
//               value: 9.99
//               }
//           ]
    
//     },
//     {
//         id:1,
//         firstname: 'Torsten',
//         lastname: 'Bur',
//         kid: 121544,
//         purchases: 2,
//         sales: 400,
//         country: 'de',
//         purchaseHistory: [
//           {
//           id:4,
//           date: '10-12-2019 14:00',
//           item: 'Vollversion',
//           value: 10.88
//           },
//           {
//             id:5,
//             date: '10-12-2019 14:00',
//             item: 'Vollversion',
//             value: 9.99
//             }
//         ]
  
//   }

];

const getUUID = () => {
    return ++lastID;
};

const getReceiptID = () =>{
    return ++lastReceiptID;
};

const getProductPrice = (productId) => {
    switch(productId) {
        case 1:
            return 10.99;
        case 2:
            return 20.99;
        case 3:
            return 99.99;
        case 4:
            return 199.99;
        case 5:
            return 299.99;
        default:
         return 0.0;
    }
    return 0.0;
};

// app.use(express.json());
// app.use(express.urlencoded);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/',(req,res) => {
    res.send('<h1>Hallo</h1>');
});

app.get('/api/requestuser/',(req,res) => {
   // res.send('<h1>Hallo</h1>');
   res.json(dbVipUser);
});

//Purchase a product
app.post('/api/purchase/', function(req,res) {
    
    const { id, itemid } = req.body;

    const purchaseObject = {
       
        id: getReceiptID(),
        item: itemid,
        date: new Date(),
        value: getProductPrice(itemid)
    };

    dbVipUser.map(user => {
        if(user.id === id ) { 
            user.purchaseHistory = [...user.purchaseHistory,purchaseObject];
        }
        return user;
    });

    console.log('PURCHASE PRODUCT USER: '+id+' Purchase item: '+itemid);
    res.end(JSON.stringify(purchaseObject));

});

//Receive an updated user object
//Receive a delete event and remove an user
app.post('/api/removeuser/', function(req,res) {

    const { id } = req.body;

    console.log('REMOVE USER '+id);

    Number.isNaN(id) ?  console.log('not deleted')  : dbVipUser =  dbVipUser.filter(v =>  v.id !== id )
    
    res.end(JSON.stringify({id: id}));
});

//Receive a new user and save him
app.post('/api/adduser/', function(req,res) {
 
    const { firstname, lastname, country } = req.body;

    const newUser = {
        id: getUUID() ,
        firstname: firstname,
        lastname: lastname,
        country: country,
        purchaseHistory: []
    };

    dbVipUser = [...dbVipUser, newUser];

    res.end(String(newUser.id));

});

const server = app.listen(3001, function () {
    const host = server.address().address
    const port = server.address().port
    console.info('Example app listening at '+`http://${host}:${port}`);
})