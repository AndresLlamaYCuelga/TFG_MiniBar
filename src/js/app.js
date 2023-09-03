App = {
    web3Provider: null,
    contracts: {},
  
    init: async function() {
        
      var menusRow = $('#menusRow');
      var menuTemplate = $('#menuTemplate');

      for (var i = 1; i <= 5; i++) {
        (function(index) {
          var url = `https://ipfs.io/ipfs/bafybeie5vvf6w6t6bvvltv64orojini2cietpn2dqefe5sf2w2oo7a6moy/menu${index}.json`;

          $.getJSON(url, function(data) {
            menuTemplate.find('.form-control').attr('data-id', index);
            menuTemplate.find('.btn-comprar').attr('data-id', index);
            menuTemplate.find('.btn-cocinar').attr('data-id', index);
            menuTemplate.find('.panel-combination').text(data.combinado);
            menuTemplate.find('.panel-title').text(data.nombre);
            menuTemplate.find('.menu-description').text(data.description);
            menuTemplate.find('img').attr('src', data.image);

            menusRow.append(menuTemplate.html());
          });
        })(i);
      }
    return await App.initWeb3();
  },

  initWeb3: async function() {
      
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
      // Request account access
      await window.ethereum.enable();
      } catch (error) {
      // User denied account access...
      console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('MiniBar.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var MiniBarArtifact = data;
      App.contracts.MiniBar = TruffleContract(MiniBarArtifact);
    
      // Set the provider for our contract
      App.contracts.MiniBar.setProvider(App.web3Provider);
    
    });
    

    return App.bindEvents();
  },

  bindEvents: async function() {

    // Inicio : index.html
    //$(document).on('click', '.btn-idempresa', App.esEmpresa);
    $(document).on('click', '.btn-idempresa', App.esEmpresa);
    $(document).on('click', '.btn-venta', setTimeout(function() {App.actualizarCo();}, 1000));
    $(document).on('click', '.btn-idcliente', App.esCliente);

    // Empresa : empresa.html
    $(document).on('click', '.btn-cocinar', App.botonCocinar);

    // Cliente : Tienda : venta.html
    $(document).on('click', '.btn-venta', setTimeout(function() {App.actualizarVe();}, 1000));    
    $(document).on('click', '.btn-comprar', App.botonComprar);
    
    // Cliente : Mis menus : perfil.html
    setTimeout(function() {App.perfil();}, 200);

    // Cliente : Sobre nosotros
    $(document).on('click', '.btn-empresa', App.botonEmpresa);

    // Varios de soporte
    ethereum.on('accountsChanged', function(accounts) {window.location.href = "index.html";});
    window.addEventListener('scroll', function() {var cerrarSesionBtn = document.getElementById('cerrarSesionBtn');cerrarSesionBtn.style.bottom = (10 - window.scrollY) + 'px';});
    setTimeout(function() {App.paneles();}, 1000); 
    window.addEventListener('resize', function() { App.paneles();});  

  }, 

  esEmpresa: function(event) {
    event.preventDefault();
    var empresa_catering_pri;
    var cuenta;
  
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      cuenta = accounts[0];
      var MiniBarInstance;
      App.contracts.MiniBar.deployed().then(function(instance) {
        MiniBarInstance = instance;
        return MiniBarInstance.obtener_empresa_catering.call();
      }).then(function(empresa_catering) {
        empresa_catering_pri = empresa_catering;
        
        if (empresa_catering_pri === cuenta) {
          window.location.href = "empresa.html";
        } else {
          window.alert("No eres una empresa de catering.");
          window.location.href = "index.html";
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
    return App.actualizarCo();
  },

  esCliente: function() {
    
    var empresa_catering_pri;
    var cuenta;
  
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      cuenta = accounts[0];
  
      var MiniBarInstance;
      App.contracts.MiniBar.deployed().then(function(instance) {
        MiniBarInstance = instance;
        return MiniBarInstance.obtener_empresa_catering.call();
      }).then(function(empresa_catering) {
        empresa_catering_pri = empresa_catering;
        
        if (empresa_catering_pri === cuenta) {
          window.alert("Eres una empresa de catering.");
          window.location.href = "index.html";
        } else {
          window.location.href = "cliente.html";
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  actualizarCo: function() {
    
    App.contracts.MiniBar.deployed().then(function(instance) {
      MiniBarInstance = instance;
      return MiniBarInstance.listar_menus_en_venta.call();
    }).then(function(menus_de_empresa) {
      
        for (i = 0; i < 5; i ++) {
          $('.panel-almacen').eq(i).find('h2').next().text("Hay: " + menus_de_empresa[i]);
          
        };
      
    }).catch(function(err) {
        console.log(err.message);
      });
  },
  
  botonCocinar: function(event) {
    event.preventDefault();
    
    var num_boton = parseInt($(event.target).data('id'));
    var cantidad = $('input[data-id="' + num_boton + '"]').val();
    
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
      var empresa = accounts[0];
      var MiniBarInstance;

      App.contracts.MiniBar.deployed().then(function(instance) {
        MiniBarInstance = instance;
        return MiniBarInstance.precioFabrica.call();
      
      }).then(function(result) {
        precioFinal = result * cantidad;
        window.alert("Por " +  precioFinal/1000000000000000000 + " ether pondrás a la venta " + cantidad + " del nº " + num_boton);
        return MiniBarInstance.crear_menu(num_boton, cantidad, {from: empresa, value: precioFinal});

      }).then(function() {
        return App.actualizarCo();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
     
  },

  actualizarVe: function() {
    
    App.contracts.MiniBar.deployed().then(function(instance) {
      MiniBarInstance = instance;
      return MiniBarInstance.listar_menus_en_venta.call();
    }).then(function(menus_de_empresa) {
      
        for (i = 0; i < 5; i ++) {
          $('.panel-menu').eq(i).find('h2').next().text("Quedan: " + menus_de_empresa[i]);
          if(menus_de_empresa[i]==0){
            $('.panel-menu').eq(i).find('button').text('Sin stock').attr('disabled', true);
            $('.panel-menu').eq(i).find('.form-control').attr('disabled', true);
          }
          
        };
      
    }).catch(function(err) {
        console.log(err.message);
      });
    return App.perfil;
  },

  botonComprar: function(event) {
    event.preventDefault();
    
    var num_boton = parseInt($(event.target).data('id'));
    var cantidad = $('input[data-id="' + num_boton + '"]').val();
    
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
      var cliente = accounts[0];
      var MiniBarInstance;

      App.contracts.MiniBar.deployed().then(function(instance) {
        MiniBarInstance = instance;
        return MiniBarInstance.precioPublico.call();
      
      }).then(function(result) {
        precioFinal = result * cantidad;
        window.alert("Por " +  precioFinal/1000000000000000000 + " ether comprarás " + cantidad + " del nº " + num_boton);
        return MiniBarInstance.vender_menu(num_boton, cantidad, {from: cliente, value: precioFinal});

      }).then(function() {
        return App.actualizarVe();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
     
  },

  perfil: async function() {
  
    var MiniBarInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    var cliente = accounts[0];
    
    App.contracts.MiniBar.deployed().then(function(instance) {
      MiniBarInstance = instance;
      return MiniBarInstance.listar_menus_de_un_cliente({from: cliente});

      }).then(function(menus_de_cliente) {
        var datos = menus_de_cliente;
    
        var perfilRow = $('#perfilRow');
        var perfilTemplate = $('#perfilTemplate');
  
        for (i = 1; i <= datos.length; i ++) {
          if(datos[i-1]>0){
            (function(index) {
              var url = `https://ipfs.io/ipfs/bafybeie5vvf6w6t6bvvltv64orojini2cietpn2dqefe5sf2w2oo7a6moy/menu${index}.json`;
        
              $.getJSON(url, function(data) {
                perfilTemplate.find('.cantidad').text(datos[index-1]);
                perfilTemplate.find('.panel-combination').text(data.combinado);
                perfilTemplate.find('.panel-title').text(data.nombre);
                perfilTemplate.find('.menu-description').text(data.description);
                perfilTemplate.find('img').attr('src', data.image);
        
                perfilRow.append(perfilTemplate.html());
              });
            })(i);
          };
      };
      }).catch(function(err) {
      console.log(err.message);
      })
    });
    
  },

  botonEmpresa: async function() {

    if($('.btn-empresa').attr('aria-expanded') == 'true'){
      var MiniBarInstance;
      App.contracts.MiniBar.deployed().then(function(instance) {
        MiniBarInstance = instance;
        return MiniBarInstance.obtener_empresa_catering.call();
      }).then(function(empresa_catering) {
        $('.btn-empresa').text("Empresa: " + JSON.stringify(empresa_catering));
      }).catch(function(err) {
        console.log(err.message);
      });
    }
    else {
      $('.btn-empresa').text("Sobre nosotros");
    }
    
  },

  paneles: function() {
    var pathname = window.location.pathname;

    if (pathname.includes('empresa.html')) {
      var panelmenu = $('.panel-almacen');
      var panelPairs = [];
  
      // Agrupar los paneles de dos en dos
      for (var i = 0; i < panelmenu.length; i += 2) {
        var pair = [panelmenu[i], panelmenu[i + 1]];
        panelPairs.push(pair);
      }

      // Escalar los paneles de dos en dos
      panelPairs.forEach(function(pair) {
        var maxHeightMenu = 0;

        // Calcular la altura máxima dentro del par de paneles
        pair.forEach(function(panel) {
          var panelHeight = $(panel).height();
          if (panelHeight > maxHeightMenu) {
            maxHeightMenu = panelHeight;
          }
        });

        // Establecer la altura máxima en los paneles del par
        pair.forEach(function(panel) {
          $(panel).height(maxHeightMenu);
        });
      });
    }
  
    if (pathname.includes('venta.html')) {
      var panelmenu = $('.panel-menu');
      var panelPairs = [];
     
      // Agrupar los paneles de dos en dos
      for (var i = 0; i < panelmenu.length; i += 2) {
        var pair = [panelmenu[i], panelmenu[i + 1]];
        panelPairs.push(pair);
      }

      // Escalar los paneles de dos en dos
      panelPairs.forEach(function(pair) {
        var maxHeightMenu = 0;

        // Calcular la altura máxima dentro del par de paneles
        pair.forEach(function(panel) {
          var panelHeight = $(panel).height();
          if (panelHeight > maxHeightMenu) {
            maxHeightMenu = panelHeight;
          }
        });

        // Establecer la altura máxima en los paneles del par
        pair.forEach(function(panel) {
          $(panel).height(maxHeightMenu);
        });
      });
    }
  
    if (pathname.includes('perfil.html')) {
      var panelperfil = $('.panel-perfil');
      var panelPairs = [];

      // Agrupar los paneles de dos en dos
      for (var i = 0; i < panelperfil.length; i += 2) {
        var pair = [panelperfil[i], panelperfil[i + 1]];
        panelPairs.push(pair);
      }

      // Escalar los paneles de dos en dos
      panelPairs.forEach(function(pair) {
        var maxHeightMenu = 0;

        // Calcular la altura máxima dentro del par de paneles
        pair.forEach(function(panel) {
          var panelHeight = $(panel).height();
          if (panelHeight > maxHeightMenu) {
            maxHeightMenu = panelHeight;
          }
        });

        // Establecer la altura máxima en los paneles del par
        pair.forEach(function(panel) {
          $(panel).height(maxHeightMenu);
        });
      });
    }
  },  
  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

  