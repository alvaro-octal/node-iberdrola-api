var request = require('request-json');
var client = request.createClient('https://www.iberdroladistribucionelectrica.com/consumidores/rest/', { jar: true });

var api;
var iberdrola = function(credentials, callback) {

  api = this;

  this.loggedIn = false;
  this.credentials = {
    email: credentials.email,
    password: credentials.password
  };

  client.headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77',
    'Content-Type': 'application/json',
    'movilAPP': 'si',
    'tipoAPP': 'IOS',
    'esVersionNueva': '1',
    'idioma': 'es'
  }

  this.ready = !credentials.contract ? this.login() : new Promise((resolve, reject) => {
    this.login().then(() => {
      this.selectContract(credentials.contract).then(() => {
        resolve()
      }).catch(() => {
        reject('no-contract')
      });
    }).catch(() => {
      reject('no-access')
    });
  });
}

/**
 * Factory
 **/
module.exports.login = function(email, password) {
  return new iberdrola(email, password);
}

/**
 * Login method
 **/
iberdrola.prototype.login = function() {

  return new Promise((resolve, reject) => {

    client.post('loginNew/login', [
      api.credentials.email,
      api.credentials.password,
      null,
      'iOS 11.4.1',
      'Movil',
      'Aplicación móvil V. 15',
      '0',
      '0',
      '0',
      null,
      'n',
    ], (error, response, body) => {
      if (!error && response.statusCode === 200 && body.success.toString() === 'true') {
        api.loggedIn = true;
        resolve();
      } else reject();
    });
  });
}

/**
 * Get Contracts Method
 **/
iberdrola.prototype.getContracts = function() {

  return new Promise((resolve, reject) => {

    client.get('cto/listaCtos/', (error, response, body) => {
      if (!error && response.statusCode === 200 && body.success.toString() === 'true') {
        resolve(body['contratos']);
      } else {
        console.debug({
          error: error,
          response: response,
          body: body
        });
        reject('no-access');
      }
    });
  });
}

/**
 * Select Contract Method
 **/
iberdrola.prototype.selectContract = function(contract) {

  return new Promise((resolve, reject) => {

    client.get('cto/seleccion/' + contract, (error, response, body) => {

      if (!error && response.statusCode === 200 && body.success.toString() === 'true') resolve();
      else {
        console.debug({
          error: error,
          response: response,
          body: body
        });
        reject();
      }
    });
  });
}

/**
 * Get Reading Method
 **/
iberdrola.prototype.getReading = function() {

  return new Promise((resolve, reject) => {

    client.get('escenarioNew/obtenerMedicionOnline/12', (error, response, body) => {

      if (!error && response.statusCode === 200) {
        resolve({
          hour: (new Date()).getHours(),
          consumption: body && body.valMagnitud ? parseFloat(body.valMagnitud) : null
        });
      } else {
        console.debug({
          error: error,
          response: response,
          body: body
        });
        reject();
      }
    });
  });
}

/**
 * Get Date Limits Method
 **/
iberdrola.prototype.getDateLimits = function() {

  return new Promise((resolve, reject) => {

    client.get('consumoNew/obtenerLimiteFechasConsumo', (error, response, body) => {

      if (!error && response.statusCode === 200) {
        resolve({
          min: new Date(body.fechaMinima.substring(0, 10).split('-').reverse().join('-')),
          max: new Date(body.fechaMaxima.substring(0, 10).split('-').reverse().join('-'))
        });
      } else {
        console.debug({
          error: error,
          response: response,
          body: body
        });
        reject();
      }
    });
  });
}

/**
 * Get Reading Method
 **/
iberdrola.prototype.getReadingsOfDay = function(date) {

  return new Promise((resolve, reject) => {

    const day = (new Date(date)).toISOString().substring(0, 10).split('-').reverse().join('-').concat('00:00:00');

    client.get('consumoNew/obtenerDatosConsumo/fechaInicio/' + day + '/colectivo/USU/frecuencia/horas/acumular/false', (error, response, body) => {
      if (!error && response.statusCode === 200) {

        const data = body.y.data[0] || [];
        resolve(data.map((entry, index) => {
          return {
            hour: index,
            consumption: entry ? parseFloat(entry.valor) : null
          }
        }));
      } else {
        console.debug({
          error: error,
          response: response,
          body: body
        });
        reject();
      }
    });
  });
}
