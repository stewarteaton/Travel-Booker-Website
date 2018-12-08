const mongoose = require('mongoose'); 

const orderSchema = new mongoose.Schema({
    user_id: {
        type: String, 
        required: true
    },
    hotel_id: {
        // objectId proveded by mongoose
        // allows us to compare this id with one stored in database later on
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    order_details: {
        type: Object,
        required: true
    }
});

// Export Model
module.exports = mongoose.model('Order', orderSchema);