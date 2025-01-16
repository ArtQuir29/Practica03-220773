const express = require('express')
const session = require('express-session');
const req = require('express/lib/request');
const moment = require('moment-timezone')

const app = express();

// Configuración de la sesión
app.use(session({
    secret: 'p3-AAQ#asada-sesionespersistentes', // Secreto para firmar la cookie de sesión
    resave: false,              // No resguarda la sesión si no ha sido modificado
    saveUninitialized: true,    // Guarda la sesión si no ha
    cookie: { secure: false, maxAge: 24 * 60 * 60 *1000}  // Usar secure: true solo si usas HTTPS, Maxage permite definir la duracion maxima de ka sesion 
}));

// Ruta para inicializar la sesion 

app.get('/login', (req, res) => {
    if (req.session.createdAt){
        req.session.createdAt = new Date();
        req.session.lastAccess = new Date();
        res.send('La sesion ah sido iniciada');
     } else {
            res.send('ya existe la sesion');
        }
    });

    // Ruta para actualizar la fecha de la ultima consulta
   app.get('/update',(req,res) => {
    if (req.session.createdAt){
        req.session.lastAccess = new Date();
        res.send('La fecha del ultimo acceso ah sido actualizada');
     } else {
            res.send('No hay sesion activa');
        }
    });

   //Ruta para obtener el estado de la sesion 
app.get('/status',(req,res) => {
    if(req.session.createdAt){
        const now = new Date();
        const started = new Date(req.session.createdAt)
        const lastUpdate = new Date(req.session.lastAccess)

        //Calcular la antiguedad de la sesion 
        const sesionAgeMS= now - started;
        const hours = Math.floor(sesionAgeMS/ (100*60*60))
        const minutes = Math.floor((sesionAgeMS % (1000*60*60))/(1000*60))
        const seconds=Math.floor((sesionAgeMS % (1000*60))/1000)

        const createAD_CDMX = moment(started).tz('America/Mexico_Ciry').format('YYY-MM-DD HH:mm:ss')
        const lastAccess = moment(lastUpdate).tz('America/Mexico_Ciry').format('YYY-MM-DD HH:mm:ss')
res.json({
    message : 'Estado de la sesion',
    sessionId : req.sessionID,
    inicio:createAD_CDMX,
    ultimoAcceso: lastAccess,
    antiguedad:`${hours} horas ,${minutes} minutos y ${seconds} segundos `
})

    }else{
        res.send('No existe una cuenta para el status')
    }
})

// Ruta para cerrar la sesion 

app.get('/lagout',(req,res)=>{
    if(req.session.createdAt){
        req.session.destroy((err)=>{
            if(err){
                return res.status(500).send('Error al cerrar sesion ')
            }
            res.send('sesion cerrada correctamente ')
        })
    }else{
        res.send('No hay una sesion activa para cerrar')
    }
})





//Middleware para mostrar detalles de la sesión
app.use((req, res, next)=>{
    if(req.session) {
        if(!req.session.createdAt) {
            req.session.createdAt = new Date(); // Asignamos la fecha de creación de la sesión 
        }
        req.session.lastAccess = new Date(); //Asignamos la última vez que se accedió a la sesión
    }
    next();
});

// Ruta para mostrar la información de la sesión
app.get('/session', (req, res)=>{
    if(req.session) {
        const sessionId = req.session.id;
        const createdAt = req.session.createdAt;
        const lastAccess = req.session.lastAccess;
        const sessionDuration = (new Date() - createdAt) / 1000; // Duración de la sesión en segundos
        
    res.send(`
    <h1>Detalles de la sesión</h1>
    <p><strong>ID sesión:</strong> ${sessionId}</p>
    <p><strong>Fecha de creación de la sesión:</strong>${createdAt}</p>
    <p><strong>Último acceso: </strong> ${lastAccess}</p>
    <p><strong>Duración de la sesión (en segundos):</strong>${sessionDuration}</p>
    `);
    } else{
        res.send(`<h1>Sesión cerrada exitosamente.</h1>`)
    }
});


//Iniciar el servidor en el puerto 3000
app.listen(3000,()=>{
    console.log(`Servidor corriendo en el puerto 3000`);
});

