const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


app.use(
  '/',
  createProxyMiddleware({
    target: 'http://0.0.0.0:4001',
    changeOrigin: true,
  })
);

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Wrapper server listening on port ${port}`);
});
