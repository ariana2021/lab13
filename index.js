const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const path = require('path'); 

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const secretKey = 'tuClaveSecreta';
const verificationCodes = {};

const client = twilio('AC99a627e9444c969252886d1a390551eb', '046b7b2f0eb50e6801d794af61216a9a');

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'usuario' && password === '12345') {
    res.redirect('/dashboard');
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    verificationCodes[username] = verificationCode;

    // Cambia 'tuNumeroTwilio' con el número de teléfono real del usuario
    enviarCodigoPorSMS(username, '+51987873430', verificationCode);

    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }
});


app.post('/verify', (req, res) => {
  const { username, code } = req.body;

  if (verificationCodes[username] && parseInt(code) === verificationCodes[username]) {
    res.json({ mensaje: 'Código verificado correctamente' });
  } else {
    res.status(401).json({ mensaje: 'Código inválido' });
  }
});

function enviarCodigoPorSMS(username, userPhoneNumber, code) {
  client.messages
    .create({
      body: `Tu código de verificación es: ${code}`,
      from: '+13202272313',
      to: userPhoneNumber
    })
    .then(message => console.log('SMS enviado:', message.sid))
    .catch(error => console.error('Error al enviar SMS:', error));
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
