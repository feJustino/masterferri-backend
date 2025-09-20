import cors from 'cors';

export const corsMiddleware = cors({

    origin: ['https://bling.com.br', 'http://localhost:3000', /\.bling\.com\.br$/, 'https://orgbling.s3.amazonaws.com'],
    credentials: true,
});