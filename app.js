const express = require('express');
const bodyParser  = require('body-parser');
const app = express();

const l = require('./src/log.js');
const serverState = require('./src/state.js')
const product = require('./src/product.js');
const user = require('./src/user.js');


const SaveState = () =>  {
    serverState.writeState(user.getLastUUID(), user.dbVipUser);
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
   res.json(user.dbVipUser);
});

//Purchase a product
app.post('/api/purchase/', function(req,res) {
    
    const { id, itemid } = req.body;

    const purchaseObject = {
       
        id: product.getReceiptID(),
        item: itemid,
        date: new Date(),
        value: product.getProductPrice(itemid)
    };

    user.dbVipUser.map(user => {
        if(user.id === id ) { 
            user.purchaseHistory = [...user.purchaseHistory,purchaseObject];
        }
        return user;
    });

    console.log('PURCHASE PRODUCT USER: '+id+' Purchase item: '+itemid);
    res.end(JSON.stringify(purchaseObject));

    SaveState();
    l.log(`User ${id} purchased item ${itemid}`);

});

//Receive an updated user object
//Receive a delete event and remove an user
app.post('/api/removeuser/', function(req,res) {

    const { id } = req.body;

    console.log('REMOVE USER '+id);

    Number.isNaN(id) ?  console.log('not deleted')  : user.dbVipUser =  user.dbVipUser.filter(v =>  v.id !== id )
    
    res.end(JSON.stringify({id: id}));
   
    SaveState();
    l.log(`User ${id} removed`);

});

//Receive a new user and save him
app.post('/api/adduser/', function(req,res) {
 
    const { firstname, lastname, country } = req.body;

    const newUser = {
        id: user.getUUID() ,
        firstname: firstname,
        lastname: lastname,
        country: country,
        purchaseHistory: []
    };

    user.dbVipUser = [...user.dbVipUser, newUser];

    res.end(String(newUser.id));

    SaveState();
    l.log(`User ${newUser.id} was created`);

});

app.post('/api/changeuser/',function(req, res) {
    
    const recUser = req.body;

    if(typeof recUser === 'object') {

        const getUserObject = user.dbVipUser.map(v => {
            if(v.id === recUser.id) {
                v.firstname = recUser.firstname;
                v.lastname = recUser.lastname;
            }
            return v; 
        });
    }

    res.end("y");

});

const server = app.listen(3001, function () {

    const host = server.address().address
    const port = server.address().port

    l.log(l.EVENT_SERVERSTART);
    
    //Read the current state => need a function
    serverState.readState((uuid,a)=>{
        user.setUUID(uuid);
        user.dbVipUser = a;
        console.log('LAST ID: '+uuid);
    });

    console.info('VipManager Server listening at '+`http://${host}:${port}`);
    
})