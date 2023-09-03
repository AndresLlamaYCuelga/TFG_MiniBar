//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Importar bibliotecas, en este caso están descargadas en el disco local pero pueden referenciarse de OpenZeppelin
import "../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

// Contrato inteligente para crear la funcionalidad de una web donde una empresa de comida puede vender menús a clientes 
contract MiniBar is ERC1155, Ownable {
    
    address payable private empresa_catering;
    address payable public proveedor = payable(0x7BFa68d89F6208c3fCb2Df23772f5eA8Db9a64E7);
    uint256 private contador_comensales = 1;
    uint public precioFabrica = 20000000000000000;
    uint public precioPublico = 60000000000000000;

    mapping(uint256 => string) public uri_menu;
    mapping(address => uint256) public comensales;
    mapping(address => mapping(uint256 => uint256)) private compra_de_cada_plato;
    mapping(uint256 => uint256) public menus_vendidos;
    mapping(uint256 => uint256) public menus_en_venta;

    uint256 public constant numero_1 = 1;
    uint256 public constant numero_2 = 2;
    uint256 public constant numero_3 = 3;
    uint256 public constant numero_4 = 4;
    uint256 public constant numero_5 = 5;

    constructor() payable ERC1155("https://ipfs.io/ipfs/bafybeie5vvf6w6t6bvvltv64orojini2cietpn2dqefe5sf2w2oo7a6moy/menu{id}.json") {
        
        empresa_catering = payable(msg.sender);
        uint precioApertura = precioFabrica * 25;
        require(msg.value >= precioApertura, "El proveedor de alimentos necesita mas dinero");
        proveedor.transfer(msg.value);
        for (uint256 menu = 1; menu < 6; menu++){
            _mint(empresa_catering, menu, 5, "");
            uri_menu[menu] = uri(menu);
            menus_vendidos[menu] = 0;
            menus_en_venta[menu] = balanceOf(empresa_catering, menu);
        }
        
    }

    function crear_menu(uint256 menu_a_crear, uint256 cantidad_a_crear) public payable onlyOwner{
        uint precioPedido = precioFabrica * cantidad_a_crear;
        require(msg.value >= precioPedido, "El proveedor de alimentos necesita mas dinero");
        proveedor.transfer(msg.value);
        _mint(empresa_catering, menu_a_crear, cantidad_a_crear, "");
        
    }

    function vender_menu(uint256 menu, uint256 cantidad) public payable{
        require(balanceOf(empresa_catering, menu) >= cantidad, "Cantidad no disponible de ese menu");
        uint precioPedido = precioPublico * cantidad;
        require(msg.value >= precioPedido, "El valor minimo para comprar tokens es mayor");
        
        confiar_en_cliente(msg.sender, true);
        safeTransferFrom(empresa_catering, msg.sender, menu, cantidad, "");       
        empresa_catering.transfer(msg.value); 

        asignar_id();
        compra_de_cada_plato[payable(msg.sender)][menu] += cantidad;
        menus_vendidos[menu] += cantidad;

    }

    function confiar_en_cliente(address operator, bool approved) public virtual {
        _setApprovalForAll(empresa_catering, operator, approved);
    }

    function asignar_id() public payable{
        uint256 id_existente = comensales[payable(msg.sender)];
        if (id_existente == 0) {
            comensales[payable(msg.sender)] = contador_comensales; contador_comensales++;
            for(uint256 menu = 1; menu < 6; menu++){
            compra_de_cada_plato[payable(msg.sender)][menu] = 0;
            }
        }        
    }

    //funciones para conseguir información

    function uri(uint256 id_menu) override public pure returns (string memory) {
        return string(
            abi.encodePacked(
                "https://ipfs.io/ipfs/bafybeib7ea7ibfsbi4ki2x5bynv5vpruxn757icmbm4qlskgdgve5q6hlm/numero_",
                Strings.toString(id_menu),".json"
            )
        );
    }

    function obtener_empresa_catering() external view returns (address) {
        return empresa_catering;
    }

    function listar_menus_en_venta() public view returns (uint256[] memory){
        uint256[] memory menus_de_empresa = new uint256[](5);
        for (uint256 i = 0; i < 5; i++){
            menus_de_empresa[i] = balanceOf(empresa_catering, i+1);
        }
        return menus_de_empresa;
    }

    function listar_menus_de_un_cliente() public view returns (uint256[] memory){
        uint256[] memory menus_de_cliente = new uint256[](5);
        for (uint256 i = 0; i < 5; i++){
            menus_de_cliente[i] = balanceOf(msg.sender, i+1);
        }
        return menus_de_cliente;
    }

    function listar_menus_vendidos() public view returns (uint256[] memory){
        uint256[] memory menus_vendidos_array = new uint256[](5);
        for (uint256 i = 0; i < 5; i++){
            menus_vendidos_array[i] = menus_vendidos[i+1];
        }
        return menus_vendidos_array;
    }

}