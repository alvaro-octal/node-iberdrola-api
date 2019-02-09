An unofficial wrapper for Iberdrola API in NodeJS based on [zoilomora](https://github.com/zoilomora/iberdrola) version.
## Installation

```
npm install --save iberdrola-api
```

## Usage

Iberdrola API is based on cookie sessions, so before making any request, you have _wait_ until the request fisnishes.

```js
var iberdrola = require('iberdrola-api').login({
    email: '',
    password: ''
});

iberdrola.ready.then(() => {

    // Make requests

});
```

Alternativelly you can skip the `Select Contract` method by simply adding it to the credentials

```js
var iberdrola = require('iberdrola-api').login({
    email: '',
    password: '',
    contract: ''
});

iberdrola.ready.then(() => {

    // Login & Contract selected

}).catch((error) => {
    if (error === 'no-access') console.error('Unable to login');
    else if (error === 'no-contract') console.error('Unable to select contract');
    else console.error('Unexcepted error', error);
});
```

## Methods

Every method returns a `Promise`:

#### Get Contracts

An account may have 0 to N contracts, most method require to have a selected contract.

```js
iberdrola.getContracts().then((result) => {
    console.log({
        constracts: result
    })
}).catch(() => {
    console.error('Unable to list contracts')
});

// Output:

{
    direccion: 'False street 123',
    cups: 'ES0000000000000000XX',
    tipo: '',
    tipUsoEnergiaCorto: '',
    tipUsoEnergiaLargo: '',
    estContrato: 'Alta',
    codContrato: '0000000',
    esTelegestionado: true,
    presion: '0.00',
    fecUltActua: '01.01.2019',
    esTelemedido: false,
    tipSisLectura: 'TG',
    estadoAlta: true
}
```

#### Select Contract

Once you have selected to contract to operate, pick the `codContrato` value, this step is required in order to proceed with the following method.

```js
iberdrola.selectContract('<codContrato>').then(() => {

    console.log('Contract selected');
    
    // Execute the following methods

}).catch(() => {
    console.error('Unable to select contract')
});
```

#### Get Reading

This method obtains your actual consumption (may take a while).

```js

iberdrola.getReading().then((result) => {
    console.log({
        reading: result
    });
}).catch(() => {
    console.error('Unable to get reading');
});

// Output

{
    hour: 19,
    consumption: 238.95
}
```

#### Get Date Limits

This method gets the `min` and `max` (JS) dates in which you will be able to retreive data.

```js

iberdrola.getDateLimits().then((result) => {
    console.log({
        limits: result
    });
}).catch(() => {
    console.error('Unable to get date limits');
});

// Output

{
    min: 2018-06-20T00:00:00.000Z,
    max: 2019-01-01T00:00:00.000Z
}
```

#### Get Readings of Day

This method obtains the consuption (watts/hour) of every hour of a given day.

```js

iberdrola.getReadingsOfDay('2019-02-08').then((result) => {
    console.log({
        readings: result
    });
}).catch(() => {
    console.error('Unable to get readings of day');
});

// Output

[
     { hour: 0, consumption: 123 },
     { hour: 1, consumption: 213 },
     [...]
     { hour: 23, consumption: 253 }
]
```



## License

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.