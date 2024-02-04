import  express  from "express";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import { StreamChat } from "stream-chat";
import bcrypt from "bcrypt";
import cors from 'cors';

const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

const apiKey='p4wjk447e4zb';
const secretKey='8z2t3vur4gazmdvgg27eupj8nh842rk8hj7um8s9zt2bzq46mtybs34q24jpca54';

const StreamChatServer=StreamChat.getInstance(apiKey,secretKey);

app.post('/api/signup',async (req,res)=>
{
    try
    {
        const {fullname,username,password}=req.body;
        const { users } = await StreamChatServer.queryUsers({ username: username });
        console.log(users);
        if (users.length !== 0) throw new Error('Username already exits');

        const userId=uuidv4();
        console.log(req.body);
        
        const token=StreamChatServer.createToken(userId);
       
        const hashedPassword=await bcrypt.hash(password,10);
        res.json({token,userId,hashedPassword,fullname,username});
    }catch(err)
    {
        res.status(400).json({ error: err.message });
    }
});
app.post('/api/login',async (req,res)=>
{
    try 
    {
        const { username, password } = req.body;
        const { users } = await StreamChatServer.queryUsers({ username: username });
        console.log(users);
        if (users.length === 0) {
          console.log('User auth failed');
          return res.status(400).json({ Error: "Username not found" });
        }
    
        const token = StreamChatServer.createToken(users[0].id);
        const passwordMatch = await bcrypt.compare(
          password,
          users[0].hashedPassword
        );
    
        if (passwordMatch) {
          res.json({
            token,
            fullname: users[0].fullname,
            username,
            userId: users[0].id,
            hashedPassword:users[0].hashedPassword
          });
        }
        else
        {
          return res.status(400).json({Error: 'Password is invalid'});
        }
      }catch (error) 
      {
        res.json(error);
      }
}
);
app.listen(9000, () => console.log("Server is running on port 9000"));
