# TFG_MiniBar
dApp para compra-venta de menús. Escrita en Solidity, html y web3.

Necesaria intalación de :

- Instalar Node.js
  - Desde : https://nodejs.org/en 
- Instalar Truffle
  - Con la terminal, ejecutar el siguiente comando : *npm install -g truffle*
- Instalar Ganache
  - Desde : https://trufflesuite.com/ganache/ 
- Crear carpeta de nombre node-modules :
  - Con la terminal, ejecutar el siguiente comando : *npm install @openzeppelin/contracts*
- Cambiar la address de proveedor en el smart contract
  - *address payable public proveedor = payable(0x...);*
- Instalar la extensión de navegador de MetaMask
  - Desde : https://metamask.io/ 
- Agragar red de Ganache a MetaMask con la siguiente configuración :
  - Nueva dirección URL de RPC : *HTTP://127.0.0.1:7545*
  - Identificador de cadena : *1337*
  - Símbolo de moneda : *ETH*
  - Dirección URL del explorador de bloques (Opcional)
- Importar cuentas a MetaMask con la private key que da Ganache
