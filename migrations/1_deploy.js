var MiniBar = artifacts.require("MiniBar");

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
      if (network === 'development') {
          // Crear smart contract con 0.5 ether para representar el pago al poveedor de alimentos para hacer menús
          // y dar un ejemplo de pago en el deploy.
          await deployer.deploy(MiniBar, { from: accounts[0], value: "500000000000000000" });
          const miniBarInstance = await MiniBar.deployed();
          console.log('Contract address:', miniBarInstance.address);
          console.log('Contract owner:', accounts[0]);
      }
  });
};

