const express=require('express');
const router=express.Router();
const users=require('../MOCK_DATA.json');
const fs =require('fs');


router.get('/',(req,res)=>{
const html=`
<ul>
    ${users.map((user)=>`<li>${user.first_name}</li>`)}
</ul>
`;
res.send(html);
});

router.get('/:id',(req,res)=>{
    const id=Number(req.params.id);
    // users=users.js
    if(id > users.length)
    {
        throw err;
    }
    userDetails=users.find(u=>u.id===id);
    console.log(userDetails);
    res.json(userDetails);
    // res.json(errorHandler);
});
router.post('/',(req,res)=>{
    const body=req.body;
    // console.log(body);
    users.push({...body, id: users.length+1});
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users),(err,data)=>{
        return res.json({status:"success",id:users.length});
    });
    // return res.json({status:"Pushed !!"});
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);

    // Handle user not found
    if (userIndex === -1) {
        return res.status(404).json({ status: "fail", message: "User not found" });
    }

    // Update user dynamically
    const updatedUser = { ...users[userIndex], ...req.body };
    users[userIndex] = updatedUser;

    // Save the updated data to file
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ status: "fail", message: "Failed to write to file" });
        }
        return res.json({ status: "success", data: updatedUser });
    });
});

// delete routes

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);

    const userIndex = users.findIndex(user => user.id === id);

    // Handle user not found
    if (userIndex === -1) {
        return res.status(404).json({ status: "fail", message: "User not found" });
    }

    // Remove user from array
    users.splice(userIndex, 1);

    // Save the updated array to the JSON file
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ status: "fail", message: "Error writing file" });
        }
        return res.json({ status: "success", message: `User with ID ${id} deleted` });
    });
});

module.exports=router;