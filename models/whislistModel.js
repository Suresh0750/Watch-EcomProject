const mongoose = require('mongoose');

const whishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'user' },
    whishlist: [
        {
            productId: { type: mongoose.Types.ObjectId, required: true, ref: 'products' }
        }
    ],
}, { strict: false });


module.exports = mongoose.model("whishlist", whishlistSchema);