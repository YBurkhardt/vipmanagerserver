const express = require('express');
const bodyParser  = require('body-parser');
const app = express();
const fs = require('fs');

const l = require('./src/log.js');
const serverState = require('./src/state.js')
const product = require('./src/product.js');
const user = require('./src/user.js');

var firstNameList=[];
var lastNameList=[];

const initFirstNameList = async () => {
    await fs.readFile("./files/firstname.txt",(err,data) => {
        if(!err) {
           const buf = data.toString();
           if(buf) {
            firstNameList = buf.split(',')
           }
        }
    });
};

const initLastNameList = async () => {
    await fs.readFile("./files/lastname.txt",(err,data) => {
        if(!err) {
           const buf = data.toString();
           if(buf) {
            lastNameList = buf.split(',')
           }
        }
    });
};

(() => {
        initFirstNameList(); 
        initLastNameList(); 

     
})();

const getFirstName= () => {
    console.log(firstNameList.length);
    if(firstNameList.length > 0) {
        return firstNameList[Math.ceil(Math.random()*(firstNameList.length-1))];
    }
    return "";
};

const getLastName= () => {
    console.log(lastNameList.length);
    if(lastNameList.length > 0) {
        return lastNameList[Math.ceil(Math.random()*(lastNameList.length-1))];
    }
    return "";
};

const SaveState = () =>  {
    serverState.writeState(user.getLastUUID(), user.dbVipUser);
};

const sortObject = function(field, desc, primer){

    var key = primer ? 
        function(x) {return primer(x[field])} : 
        function(x) {return x[field]};
 
    desc = !desc ? 1 : -1;
 
    return function (a, b) {
        return a = key(a), b = key(b), desc * ((a > b) - (b > a));
    } 
 }

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

app.get('/api/requestuserdetail/',(req,res) => {
    const { userid } = req.query;

    const filteredUser = user.dbVipUser.filter(user => user.id === parseInt(userid));


    res.json(filteredUser);
});

app.get('/api/reset/',(req,res) => {
    user.dbVipUser=[];
    SaveState();
    res.json('true');
});

//Request user - and filter
app.get('/api/requestuser/',(req,res) => {
   
    const { userid, sort, sortid, search, page } = req.query;
    const pageSum = Math.ceil((user.dbVipUser.length+1)/10);

    let userList = [];

    if(parseInt(userid) !== -1) { 
        console.log(userid);
        userList = user.dbVipUser.filter(u => u.id === parseInt(userid));
        
        userList.map(u => {
            u.hash = (u.firstname.length + u.lastname.length*100) + u.country; 
            return u;
        });
    } else {

        userList = user.dbVipUser.map(user => {
            
            user.purchaseCount = user.purchaseHistory.length;
            user.purchaseValue = user.purchaseCount === 0 ? { value: 0 } : user.purchaseHistory.reduce( (p,v) => { return { value: p.value+v.value }});
            user.purchaseValue = user.purchaseValue.value; //unschön
            return user;
        });

        //should sort?
        if(sortid !== '') {
            switch(sortid) {
                case 'kid':
                    userList.sort(sortObject('id',parseInt(sort),parseInt));
                break;
                case 'name':
                    userList.sort(sortObject('lastname',parseInt(sort),function(a){return a.toUpperCase()}));
                break;
                case 'purchases':
                    userList.sort(sortObject('purchaseCount',parseInt(sort),parseInt));
                break;
                case 'sales':
                    userList.sort(sortObject('purchaseValue',parseInt(sort),parseInt));
                break;
                case 'created':
                break;
                default:
            }
        }
    }
    

   res.json(userList);

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
        if(user.id === parseInt(id) ) { 
            user.purchaseHistory = [...user.purchaseHistory,purchaseObject];
        }
        return user;
    });

    console.log('PURCHASE PRODUCT USER: '+id+' Purchase item: '+itemid);
    console.log(purchaseObject);
    res.end(JSON.stringify(purchaseObject));

    SaveState();
    l.log(`User ${id} purchased item ${itemid}`);

});

//Receive an updated user object
//Receive a delete event and remove an user
app.post('/api/removeuser/', function(req,res) {

    const { id } = req.body;

    console.log('REMOVE USER '+id);

    Number.isNaN(id) ?  console.log('not deleted')  :  user.dbVipUser =  user.dbVipUser.filter(v =>  v.id !== parseInt(id) )
    
    res.end(JSON.stringify({id: id}));


    SaveState();
    l.log(`User ${id} removed`);

});

app.post('/api/addtestuser/', function(req,res) {
    const { sum } = req.body;

    for(i=0;i<sum;i++) {

        const newUser = {
            id: user.getUUID() ,
            firstname: getFirstName(),
            lastname: getLastName(),
            country: 'de',
            purchaseHistory: []
        };

        user.dbVipUser = [...user.dbVipUser, newUser];
    }
    
    res.end("true");
    SaveState();

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