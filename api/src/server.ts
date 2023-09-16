import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index';

dotenv.config();

// Create an Express application
const app = express();

app.use(cors({
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

// Specify the port to listen on
const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '8000', 10);

const server = http.createServer(app);

// Start the server
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}\nPress Ctrl+C to stop`);
});
