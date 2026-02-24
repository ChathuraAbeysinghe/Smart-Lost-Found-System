import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema({
    // Basic item information
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        // e.g. "Electronics", "Books", "Clothing", "Keys", "ID Card", "Other"
    },

    // Is this item Lost or Found?
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true,
    },

    // Where and when
    location: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },

    // Contact info of the person who posted
    postedBy: {
        type: String, // user email or name
        required: true,
    },

    // Item status
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open',
    },

    // Optional image URL
    imageUrl: {
        type: String,
        default: '',
    },
}, {
    timestamps: true, // adds createdAt and updatedAt automatically
})

// Avoid duplicate model error in development (Next.js hot reload)
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema)

export default Item
