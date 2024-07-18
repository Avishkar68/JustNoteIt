const User = require("../models/user.model");
const Note = require("../models/notes.model");

exports.addNote = async (req, res) => {
    console.log("Received request to add note:", req.body);
    console.log("User object:", req.user); // Add this line to log the user object
    const { title, content, tags } = req.body;
    const userId = req.user._id; // Correctly access userId

    console.log("User ID:", userId); // Log the userId

    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }
    if (!content) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: userId
        });

        await note.save();

        return res.json({ error: false, note, message: "Note added successfully" });
    } catch (error) {
        console.error('Error adding note:', error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

exports.editNote = async (req, res) => {
    const noteId = req.params.noteId
    const {title , content , tags , isPinned} = req.body
    const user  = req.user._id

    if(!title && !content && !tags){
        return res.status(400).json({
            error:true,
            message: "No Changes Provided"
        })
    }

    try {
        const note = await Note.findOne({_id:noteId , userId: user})

        if(!note){
            return res.status(404).json({
                error:true,
                message:"Note not found"
            })
        }

        if(title) note.title = title
        if(content) note.content = content
        if(tags) note.tags = tags
        if(isPinned) note.isPinned = isPinned

        await note.save()

        return res.json({
            error: false,
            note,
            message: "Note updated successfully"
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
}

exports.getAllNotes = async (req,res) =>{
    const user = req.user._id
    try {
        const notes = await Note.find({userId: user}).sort({isPinned:-1})

        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfully"
        })

    } catch (error) {

        console.log(error.message)
        return res.status(500).json({
            error:false,
            message:"Internal server error"
        })
    }
}

exports.deleteNote = async (req,res)=>{
    const noteId = req.params.noteId
    const user = req.user._id  
    
    try {
        const note = await Note.findOne({_id: noteId , userId: user})
        if(!note){
            return res.status(200).json({
                error:true,
                message:"Note not found"
            })
        }

        await note.deleteOne()

        return res.json({
            error:false,
            message:"Note deleted successfully"
        })
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

exports.updateIsPinned = async (req, res) => {
    const noteId = req.params.noteId
    const { isPinned} = req.body
    const user  = req.user._id

    try {
        const note = await Note.findOne({_id:noteId , userId: user})

        if(!note){
            return res.status(404).json({
                error:true,
                message:"Note not found"
            })
        }

        note.isPinned = isPinned 

        await note.save()

        return res.json({
            error: false,
            note,
            message: "Note updated successfully"
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
}

exports.searchEngine = async (req,res) => {
    const user = req.user
    const {query} = req.query
    
    

    if(!query){
        return res.status(400).json({
            error:true,
            message:"Search query is required"
        })
    }
    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                {title:{$regex:new RegExp(query,"i")}},
                {title:{$regex:new RegExp(query , "i")}}
            ]
        })

        return res.json({
            error:false,
            notes: matchingNotes,
            message: "Notes matching the search query retrived successfully"
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
}