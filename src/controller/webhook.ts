import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cors());

app.post('/webhook', (req) => {
    const data = req.body;
    console.log(data);
    if(data.type == 'POOL_CREATE'){
        
    }
})

export const appInstance = app;