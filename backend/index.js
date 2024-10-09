require("dotenv").config();

const config = require('./config.json');
const mongoose = require('mongoose');

mongoose.connect(config.connectionString)
   .then(() => console.log('Connected to MongoDB'));

const User = require ('./models/user.model')
const Notes = require ('./models/notes.model')
const mime = require('mime');

const express = require('express');
const cors = require('cors');
const app = express();

const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./utils")

app.use(express.json());

app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.setHeader('Content-Type', mime.getType('js'));
    }
    next();
});

app.use(cors({
    origin: ['http://localhost:5173', 'https://note-nest-lovat.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    })
);

app.get("/", (req,res) => {
    res.json({data: "hello"})
})


//Register Route
app.post('/register', async (req, res) => {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: true, message: "Please fill all required fields" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: true, message: "Password and Confirm Password do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: true, message: "User already exists!!" });
    }

    const user = new User({
        fullName,
        email,
        password,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
    });

   return res.json({accessToken, message: "Registration Successful!!" });
});

//Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if(!email){
        return res.status(400).json({error:true, message:"Please Enter Your Email!!"})
    }
    
    if(!password){
        return res.status(400).json({error:true, message:"Please Enter Your Password!!"})
    }

    const userInfo = await User.findOne({email: email});

    if(!userInfo){
      return res.status(400).json({message: "User Not Found!"})
    }

    if(userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo};
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d"
        })   

   return res.json({accessToken , message: "Login Successful!!"});

} else{
   return res.status(400).json({message: "Invalid Credentials"})
}
});

//Get User Profile Route
app.get("/getuser", authenticateToken, async (req, res) => {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            "_id": isUser._id,
            createdOn: isUser.createdOn
        },
        message: ""
    });
});


//Adding Notes Route
app.post("/addnote", authenticateToken, async(req,res) => {
    const { title, content, tags} = req.body;
    const { user } = req.user;

    if(!title) {
        return res.status(400).json({
            error: true,
            message: "Title is required"
        })
    }
    
    if(!content) {
        return res.status(400).json({
            error: true,
            message: "Content is required"
        })
    }
    
    try{
        const note = new Notes({
            title,
            content,
            tags: tags || [],
            userId: user._id
        })
    
        await note.save();
    
        return res.json({
            error: false,
            note,
            message: "Note added successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            error: true,
            message: "Failed to add note, Try after sometime."
        })
    }
});


// Edit Note Route
app.put("/editnote/:noteId", authenticateToken, async(req,res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned} = req.body;
    const { user } = req.user;

    if(!title && !content && !tags){
        return res.status(400)
        .json({error: true, message: "No Changes Provided"})
    }

    try {
        const updateNote = await Notes.findOne({ _id: noteId, userId: user._id });

        if (!updateNote) {
            return res.status(400).json({ error: true, message: "Note not found" });
        }
        if (title) updateNote.title = title;
        if (content) updateNote.content = content;
        if (tags) updateNote.tags = tags;
        if (isPinned !== undefined) updateNote.isPinned = isPinned;

        await updateNote.save();

        return res.json({
            error: false,
            note: updateNote,
            message: "Note updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Failed to update note, Try after sometime."
        });
    }
});


// Get all Notes Route
app.get("/allnotes" , authenticateToken, async(req,res) => {
    const { user } = req.user;

    try{
        const notes = await Notes.find({userId:user._id})
            .sort({
                isPinned: -1
            });

            return res.json({
                error: false,
                notes,
                message: "All notes fetched successfully"
            })
    } catch(error){
        return res.status(500).json({
            error: true,
            message: "Failed to fetch notes, Try after sometime."
        })
    }
})

// Delete Note Route
app.delete("/deletenote/:noteId", authenticateToken, async(req,res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try{
        const note = await Notes.findOne({_id: noteId, userId: user._id});

        if (!note){
            return res.status(404).json({error: true, message:"Note Not found"})
        }

        await Notes.deleteOne({ _id: noteId, userId: user._id});

        return res.json({
            error: false,
            message: "Note deleted successfully"
        })

    } catch(error){
        return res.status(500).json({
            error: true,
            message: "Failed to delete note, Try after sometime."
        })
    }
});

//Update Pinned note Route
app.put("/pinnednotes/:noteId", authenticateToken, async(req,res) => {
    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const { user } = req.user;


    try {
        const updateNote = await Notes.findOne({ _id: noteId, userId: user._id });

        if (!updateNote) {
            return res.status(400).json({ error: true, message: "Note not found" });
        }
        if (isPinned !== undefined) updateNote.isPinned = isPinned;

        await updateNote.save();

        return res.json({
            error: false,
            note: updateNote,
            message: "Note updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Failed to update note, Try after sometime."
        });
    }

})

// Search notes

app.get("/searchnotes", authenticateToken, async(req,res) => {
    const { query } = req.query;
    const { user } = req.user;

    if(!query) {
        return res
        .status(400)
        .json({error: true, message:'Search Query is Required'})
    }
    try{
        const matchingNotes = await Notes.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, 'i') } },
                { content: { $regex: new RegExp(query, 'i')  } },
                { tags: { $in: [query] } }
            ]
        })

        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message: "Internal Server ERROR"
        })
    }
})


app.listen(8000, ()=> {
    console.log('Server is running on PORT 8000')
})

module.exports = app;