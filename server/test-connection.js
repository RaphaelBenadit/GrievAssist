const mongoose = require("mongoose");

const uri = "mongodb://localhost:27017/grievassist";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    mongoose.connection.close(); // close after test
})
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
});
