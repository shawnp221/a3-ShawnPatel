const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.json());

// ---------------- MongoDB Setup ----------------
const uri = `mongodb+srv://${process.env.USERNM}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let usersCollection;
let todosCollection;

// ---------------- Passport & Session ----------------
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ---------------- Passport GitHub Strategy ----------------
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // callbackURL: "http://localhost:3000/auth/github/callback"
        callbackURL: "https://a3-shawn-patel.vercel.app/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await usersCollection.findOne({ githubId: profile.id });

            if (!user) {
                // Save username + avatarUrl
                const newUser = {
                    githubId: profile.id,
                    username: profile.username,
                    avatarUrl: profile.photos[0].value // <-- HERE
                };

                const result = await usersCollection.insertOne(newUser);
                user = { ...newUser, _id: result.insertedId };
            } else {
                // Optional: update avatarUrl in case user changed it
                if (user.avatarUrl !== profile.photos[0].value) {
                    await usersCollection.updateOne(
                        { _id: user._id },
                        { $set: { avatarUrl: profile.photos[0].value } } // <-- HERE
                    );
                    user.avatarUrl = profile.photos[0].value;
                }
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// ---------------- Middleware to Protect Routes ----------------
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// ---------------- Routes ----------------

// Serve static assets (CSS/JS/images)

app.use(express.static(path.join(__dirname, 'public'))); // serve 'public' folder

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected index page
app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// GitHub login
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback
app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/')
);

// Endpoint to get the logged-in user's GitHub username
app.get('/api/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            username: req.user.username,
            avatarUrl: req.user.avatarUrl // make sure you save this in DB when user logs in
        });
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/login'));
});

// ---------------- Todo API ----------------
function calculatePriority(todo) {
    const d1 = new Date(todo.deadlineDate);
    const d2 = new Date(todo.creationDate);
    const diffDays = Math.ceil(Math.abs(d1 - d2) / (1000*60*60*24));

    if (todo.creationDate > todo.deadlineDate) return "Overdue";
    if (diffDays >= 6) return "Low";
    if (diffDays >= 3) return "Medium";
    if (diffDays >= 1) return "High";
    return "Urgent";
}

async function run() {
    try {
        await client.connect();
        todosCollection = client.db("assignment3").collection("assignment3");
        usersCollection = client.db("assignment3").collection("users");
        console.log("Connected to MongoDB");

        // GET all todos for logged-in user
        app.get("/docs", ensureAuthenticated, async (req, res) => {
            const docs = await todosCollection.find({ userId: req.user._id }).toArray();
            res.json(docs);
        });

        // POST new todo for logged-in user
        app.post("/submit", ensureAuthenticated, async (req, res) => {
            const todo = req.body;
            todo.priority = calculatePriority(todo);
            todo.userId = req.user._id; // associate todo with user
            await todosCollection.insertOne(todo);
            const allDocs = await todosCollection.find({ userId: req.user._id }).toArray();
            res.json(allDocs);
        });

        // DELETE todo
        app.delete("/delete", ensureAuthenticated, async (req, res) => {
            const id = req.body._id;
            if (!id) return res.status(400).json({ error: "Missing id" });

            const result = await todosCollection.deleteOne({ _id: new ObjectId(id), userId: req.user._id });
            if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });

            const allDocs = await todosCollection.find({ userId: req.user._id }).toArray();
            res.json(allDocs);
        });

        // UPDATE todo
        app.put("/update", ensureAuthenticated, async (req, res) => {
            const { original, updated } = req.body;
            if (!original || !updated || !original._id) return res.status(400).json({ error: "Missing data" });

            updated.priority = calculatePriority(updated);

            await todosCollection.updateOne(
                { _id: new ObjectId(original._id), userId: req.user._id },
                { $set: updated }
            );

            const allDocs = await todosCollection.find({ userId: req.user._id }).toArray();
            res.json(allDocs);
        });

    } catch (err) {
        console.error("Mongo error:", err);
    }
}

run().catch(console.dir);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
