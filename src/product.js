let lastReceiptID = 0;

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
    }
    return 0.0;
};

const getReceiptID = () =>{
    return ++lastReceiptID;
};

module.exports.getProductPrice = getProductPrice;
module.exports.getReceiptID = getReceiptID;