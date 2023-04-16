const express = require('express'); 
const app = express();              
const port = 5000;            


app.get('/', (req, res) => {       
    res.json({message: "All running"})     
                                                       
});

app.listen(port, () => {         
    console.log(`Now listening on port ${port}`); 
});


//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