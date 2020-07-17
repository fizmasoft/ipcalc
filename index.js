const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const Joi = require("@hapi/joi");

app.use(cors());
app.use(bodyParser.json());

const CONFIG = require("./config/config");
const ipCalc = require("./models/ipCalc");

let schema = Joi.object({
  ipAddress: Joi.string().ip({version: ['ipv4'], cidr: 'forbidden'}).required(),
  netmask: Joi.number().min(0).max(32).required().integer(),
  // netmaskSubnet: Joi.number().min(Joi.ref('netmask')).max(32).optional().integer(),
  netmaskSubnet: Joi.number().min(0).max(32).optional().integer(),
});

app.get("/:ipAddress/:netmask/:netmaskSubnet?", (req, res) => {
    const { error, value } = schema.validate(req.params);
    if (error)
        return res.send({
            status: 400,
            message: "Bad request",
            error: error,
        });

    var respond = ipCalc.calculate(value.ipAddress, value.netmask, value.netmaskSubnet);
    res.send(respond);
});

app.use((req, res) => {
    res.status(404).send("Not found");
});


app.listen(CONFIG.APP.PORT, () =>
  console.log(`${CONFIG.ENV} server started on port: ${CONFIG.APP.PORT}`)
);
