require('dotenv').config();
require('./src/config/db'); // init DB on startup
const app = require('./src/app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
