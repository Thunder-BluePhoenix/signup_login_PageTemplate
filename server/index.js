const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
    res.json({ message: "Hello world" });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// app.post("/api/register", (req, res) => {
//     const { email, password, tel, username } = req.body;
//     //👇🏻 Logs the credentials to the console
//     console.log({ email, password, tel, username });
// })

//👇🏻 An array containing all the users
const users = [];

//👇🏻 Generates a random string as the ID
const generateID = () => Math.random().toString(36).substring(2, 10);

app.post("/api/register", (req, res) => {
    //👇🏻 Get the user's credentials
    const { email, password, tel, username } = req.body;

    //👇🏻 Checks if there is an existing user with the same email or password
    let result = users.filter((user) => user.email === email || user.tel === tel);

    //👇🏻 if none
    if (result.length === 0) {
        //👇🏻 creates the structure for the user
        const newUser = { id: generateID(), email, password, username, tel };
        //👇🏻 Adds the user to the array of users
        users.push(newUser);
        //👇🏻 Returns a message
        return res.json({
            message: "Account created successfully!",
        });
    }
    //👇🏻 Runs if a user exists
    res.json({
        error_message: "User already exists",
    });
});


let code;

app.post("/api/login", (req, res) => {
    //👇🏻 Accepts the user's credentials
    const { email, password } = req.body;
    //👇🏻 Checks for user(s) with the same email and password
    let result = users.filter(
        (user) => user.email === email && user.password === password
    );

    //👇🏻 If no user exists, it returns an error message
    if (result.length !== 1) {
        return res.json({
            error_message: "Incorrect credentials",
        });
    }
    code = generateCode();
    //👇🏻 Send the SMS via Novu
    sendNovuNotification(result[0].tel, code);

    //👇🏻 Returns the username of the user after a successful login
    res.json({
        message: "Login successfully",
        data: {
            username: result[0].username,
        },
    });
});

const { Novu } = require("@novu/node");
const novu = new Novu("8d534cbb02f8fe05496d588f0dde732b");

//👇🏻 Generates the code to be sent via SMS
const generateCode = () => Math.random().toString(36).substring(2, 12);

const sendNovuNotification = async (recipient, verificationCode) => {
    try {
        let response = await novu.trigger("sendsms", {
            to: {
                subscriberId: recipient,
                phone: recipient,
            },
            payload: {
                code: verificationCode,
            },
        });
        console.log(response);
    } catch (err) {
        console.error(err);
    }
};


app.post("/api/verification", (req, res) => {
    if (code === req.body.code) {
        return res.json({ message: "You're verified successfully" });
    }
    res.json({
        error_message: "Incorrect credentials",
    });
});