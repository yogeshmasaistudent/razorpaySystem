const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(require("cors")());

const razorpay = new Razorpay({
    key_id: "rzp_test_YqGxBBZgaCX9qe",
    key_secret: "cWCe7jwqXYMnI0CeT35r8zVH",
});

// API to Create Order
app.post("/create-order", async (req, res) => {
    try {
        const { amount, teacherId } = req.body;

        const options = {
            amount: amount * 100, // Convert Rs to Paise
            currency: "INR",
            receipt: `order_${teacherId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment initiation failed" });
    }
});

// Verify Payment
app.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, teacherId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpay.key_secret)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment successful, create Google Meet Link
            const meetLink = `https://meet.google.com/cbm-kztt-tfk`; // Replace with real API logic
            res.json({ success: true, meetLink });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
