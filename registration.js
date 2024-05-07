import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173" }));

const dbSchema = new mongoose.Schema({
   firstName:{
    type:String,
   },
   lastName:{
    type:String,
   },
   email:{
    type:String,
    required:true,
   },
   password:{
    type:String,
    required:true,       
   }
});

const dbModel = mongoose.model("myDetails", dbSchema);

app.get("/getData", async (req, res) => {
    const data = await dbModel.find();
    res.json(data)
    res.send(data);
});

app.post("/register", async (req, res) => {
    
    const user = req.body;
    console.log(req.body);

    try {
        const salt= await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(user.password, salt); 
        user.password = hashedPassword;
        const registerUser = new dbModel(user);
        await registerUser.save();
    } catch (error) {
        console.log(error);
        return res.send(error);
    }


})

    app.post("/login", async (req, res) => {
    
    const { email, password } = req.body;
    console.log(req.body)
  

    try {
        const check = await dbModel.findOne({ email });
       
        if(!check){
            console.log("user not found")
        } 
        const data ={
            name : check.firstName + check.lastName
        }
        const passwordMatch = await   bcrypt.compare( password , check.password )
        if(!passwordMatch){
            return res.status(401).json({ message : "invalid password"})
        }
        console.log(passwordMatch , "74")
         console.log("user logged in")
         return res.status(200).json({ message : "user logged in sccesfully" ,data})
        // const registerUser = new dbModel(user);
        // await registerUser.save();
    } catch (error) {
        console.log(error);
        return res.send(error);
    }


})
app.put("/updatePassword/:id", async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    // console.log(oldPassword,newPassword);

    try {
        const user = await dbModel.findById(userId);
console.log(user.password)
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        console.log(passwordMatch);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect old password." });
        }

        const salt = await bcrypt.genSalt(2);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            console.log(hashedNewPassword);
        user.password = hashedNewPassword;
        await user.save();
        console.log(user);


        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});



app.put("/update/:id", async (req, res) => {
     const idToUpdate = req.params.id;
    try {
        const updatedData = req.body;
        const updatedItem = await dbModel.findByIdAndUpdate(idToUpdate, updatedData, { new: true });
       
        res.json(updatedItem);
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ error: error });
    }
});

app.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbModel.findByIdAndDelete(id);
      res.status(200).send("Successfully deleted.");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

mongoose.connect("mongodb://127.0.0.1:27017/resumeBuilder")

app.listen(port, () => {
    console.log("Server Is Running");
})